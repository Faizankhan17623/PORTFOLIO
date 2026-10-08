import { useCallback, useEffect, useMemo, useState } from 'react'
import { ErrorLine } from './shared'
import { formatDate } from './utils'

const FILTERS = [['all', 'All'], ['unread', 'Unread'], ['starred', 'Starred'], ['chat', 'From AI chat'], ['form', 'From form']]

// Spreadsheet apps run text that starts with = + - @ as a formula, so neutralise those cells.
const csvCell = (value) => {
  let text = String(value ?? '')
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

function exportCsv(messages) {
  const header = ['Date', 'Name', 'Email', 'Company', 'Source', 'Message', 'Read', 'Starred', 'Replied', 'Note']
  const rows = messages.map((m) => [new Date(m.createdAt).toISOString(), m.name, m.email, m.company, m.source, m.message, m.read, m.starred, m.replied, m.note])
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `messages-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export default function MessagesPanel({ api, refreshKey, onUnread }) {
  const [messages, setMessages] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmId, setConfirmId] = useState(null)
  const [noteFor, setNoteFor] = useState(null)
  const [noteText, setNoteText] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api('/messages')
      setMessages(data.messages)
      onUnread(data.messages.filter((m) => !m.read).length)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [api, onUnread])

  useEffect(() => { load() }, [load, refreshKey])

  const update = async (msg, changes) => {
    try {
      const { message } = await api(`/messages/${msg._id}`, { method: 'PATCH', body: JSON.stringify(changes) })
      setMessages((list) => {
        const next = list.map((m) => (m._id === message._id ? message : m))
        onUnread(next.filter((m) => !m.read).length)
        return next
      })
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  const remove = async (id) => {
    try {
      await api(`/messages/${id}`, { method: 'DELETE' })
      setMessages((list) => {
        const next = list.filter((m) => m._id !== id)
        onUnread(next.filter((m) => !m.read).length)
        return next
      })
      setConfirmId(null)
    } catch (err) { setError(err.message) }
  }

  const saveNote = async (msg) => {
    if (await update(msg, { note: noteText })) setNoteFor(null)
  }

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return messages.filter((m) => {
      if (filter === 'unread' && m.read) return false
      if (filter === 'starred' && !m.starred) return false
      if (filter === 'chat' && m.source !== 'ai-chat') return false
      if (filter === 'form' && m.source === 'ai-chat') return false
      if (!q) return true
      return [m.name, m.email, m.company, m.message, m.note].some((field) => (field || '').toLowerCase().includes(q))
    })
  }, [messages, filter, search])

  return (
    <>
      <div className="adm-toolbar">
        <input className="adm-search" type="search" placeholder="Search name, email, company, message or note…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="admin-btn" onClick={() => exportCsv(visible)} disabled={!visible.length}>Export CSV</button>
      </div>

      <div className="admin-filters">
        {FILTERS.map(([id, label]) => (
          <button key={id} className={filter === id ? 'on' : ''} onClick={() => setFilter(id)}>{label}</button>
        ))}
      </div>

      <ErrorLine error={error} />

      <div className="admin-list">
        {visible.length === 0 && !loading && <div className="admin-empty">{search ? 'No messages match your search.' : 'No messages here yet.'}</div>}
        {visible.map((m) => (
          <article key={m._id} className={`admin-msg${m.read ? '' : ' unread'}`}>
            <div className="admin-msg-head">
              <div>
                <span className="admin-msg-name">{m.name}</span>
                <span className={`admin-tag${m.source === 'ai-chat' ? ' chat' : ''}`}>{m.source === 'ai-chat' ? 'AI chat' : 'Form'}</span>
                {m.company && <span className="admin-tag">{m.company}</span>}
                {m.replied && <span className="admin-tag done">Replied</span>}
              </div>
              <div className="adm-head-right">
                <span className="admin-msg-meta">{formatDate(m.createdAt)}</span>
                <button className={`adm-star${m.starred ? ' on' : ''}`} onClick={() => update(m, { starred: !m.starred })} aria-label={m.starred ? 'Remove star' : 'Star this message'} title={m.starred ? 'Remove star' : 'Star this message'}>
                  {m.starred ? '★' : '☆'}
                </button>
              </div>
            </div>
            <div className="admin-msg-meta">{m.email}</div>
            <p>{m.message}</p>

            {noteFor === m._id ? (
              <div className="adm-note-edit">
                <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} maxLength={1000} rows={3} placeholder="Private note (only you can see this)…" autoFocus />
                <div className="admin-msg-actions">
                  <button className="admin-btn primary" onClick={() => saveNote(m)}>Save note</button>
                  <button className="admin-btn" onClick={() => setNoteFor(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              m.note && <div className="adm-note"><b>Note:</b> {m.note}</div>
            )}

            {m.emailStatus && <div className={`admin-email-status${m.emailStatus.startsWith('failed') ? ' bad' : ''}`}>Email to you: {m.emailStatus}</div>}
            <div className="admin-msg-actions">
              <a className="admin-btn primary" href={`mailto:${m.email}?subject=${encodeURIComponent('Re: your message on my portfolio')}`}>Reply</a>
              <button className="admin-btn" onClick={() => update(m, { read: !m.read })}>{m.read ? 'Mark unread' : 'Mark read'}</button>
              <button className="admin-btn" onClick={() => update(m, { replied: !m.replied })}>{m.replied ? 'Not replied' : 'Mark replied'}</button>
              <button className="admin-btn" onClick={() => { setNoteFor(m._id); setNoteText(m.note || '') }}>{m.note ? 'Edit note' : 'Add note'}</button>
              {confirmId === m._id ? (
                <>
                  <button className="admin-btn danger" onClick={() => remove(m._id)}>Confirm delete</button>
                  <button className="admin-btn" onClick={() => setConfirmId(null)}>Cancel</button>
                </>
              ) : (
                <button className="admin-btn danger" onClick={() => setConfirmId(m._id)}>Delete</button>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
