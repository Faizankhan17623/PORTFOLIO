import { useCallback, useEffect, useMemo, useState } from 'react'
import { API_URL } from '../lib/contactApi'
import '../admin.css'

const TOKEN_KEY = 'portfolio_admin_token'

const readToken = () => {
  try { return sessionStorage.getItem(TOKEN_KEY) || '' } catch { return '' }
}
const saveToken = (token) => {
  try { token ? sessionStorage.setItem(TOKEN_KEY, token) : sessionStorage.removeItem(TOKEN_KEY) } catch { /* private mode */ }
}

const formatDate = (iso) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

function Login({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Login failed.')
      onLogin(data.token)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="admin-login" onSubmit={submit}>
      <h1>Admin</h1>
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus autoComplete="current-password" />
      {error && <div className="admin-error">{error}</div>}
      <button className="admin-btn primary" type="submit" disabled={busy || !password}>{busy ? 'Checking…' : 'Sign in'}</button>
    </form>
  )
}

function VisitsPanel({ data, loading, onPage }) {
  if (!data) return <div className="admin-empty">{loading ? 'Loading…' : 'No visits recorded yet.'}</div>
  const { visits, page, pages, total } = data

  return (
    <>
      {visits.length === 0 ? (
        <div className="admin-empty">No visits recorded yet.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>IP address</th><th>Device</th><th>Time zone</th><th>Visits</th><th>Last visit</th></tr>
            </thead>
            <tbody>
              {visits.map((v) => (
                <tr key={v._id}>
                  <td className="mono">{v.ip}</td>
                  <td title={v.userAgent}>{v.device}</td>
                  <td>{v.timezone}</td>
                  <td><span className="admin-count">{v.count}</span></td>
                  <td>{formatDate(v.lastSeen)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="admin-pager">
        <span className="admin-msg-meta">{total} unique {total === 1 ? 'visitor' : 'visitors'}</span>
        <div className="admin-actions">
          <button className="admin-btn" onClick={() => onPage(page - 1)} disabled={loading || page <= 1}>Previous</button>
          <span className="admin-msg-meta">Page {page} of {pages}</span>
          <button className="admin-btn" onClick={() => onPage(page + 1)} disabled={loading || page >= pages}>Next</button>
        </div>
      </div>
    </>
  )
}

export default function AdminPage() {
  const [token, setToken] = useState(readToken)
  const [tab, setTab] = useState('messages')
  const [messages, setMessages] = useState([])
  const [visits, setVisits] = useState(null)
  const [visitPage, setVisitPage] = useState(1)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmId, setConfirmId] = useState(null)

  const logout = useCallback(() => {
    saveToken('')
    setToken('')
    setMessages([])
    setVisits(null)
  }, [])

  const api = useCallback(async (path, options = {}) => {
    const res = await fetch(`${API_URL}/api/admin${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers },
    })
    if (res.status === 401) { logout(); throw new Error('Session expired. Please sign in again.') }
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Request failed.')
    return data
  }, [token, logout])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api('/messages')
      setMessages(data.messages)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [api])

  const loadVisits = useCallback(async (page = 1) => {
    setLoading(true)
    setError('')
    try {
      const data = await api(`/visits?page=${page}&limit=10`)
      setVisits(data)
      setVisitPage(data.page)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [api])

  useEffect(() => {
    document.title = 'Admin · Faizan Khan'
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex, nofollow'
    document.head.appendChild(robots)
    return () => robots.remove()
  }, [])

  useEffect(() => {
    if (!token) return
    if (tab === 'messages') load()
    else loadVisits(1)
  }, [token, tab, load, loadVisits])

  const toggleRead = async (msg) => {
    try {
      const { message } = await api(`/messages/${msg._id}`, { method: 'PATCH', body: JSON.stringify({ read: !msg.read }) })
      setMessages((list) => list.map((m) => (m._id === message._id ? message : m)))
    } catch (err) { setError(err.message) }
  }

  const remove = async (id) => {
    try {
      await api(`/messages/${id}`, { method: 'DELETE' })
      setMessages((list) => list.filter((m) => m._id !== id))
      setConfirmId(null)
    } catch (err) { setError(err.message) }
  }

  const unread = messages.filter((m) => !m.read).length
  const visible = useMemo(() => messages.filter((m) => {
    if (filter === 'unread') return !m.read
    if (filter === 'chat') return m.source === 'ai-chat'
    if (filter === 'form') return m.source !== 'ai-chat'
    return true
  }), [messages, filter])

  if (!token) {
    return (
      <div className="admin-page">
        <Login onLogin={(t) => { saveToken(t); setToken(t) }} />
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-wrap">
        <div className="admin-top">
          <h1>{tab === 'messages' ? 'Messages' : 'Recent visits'} {tab === 'messages' && unread > 0 && <small>{unread} new</small>}</h1>
          <div className="admin-actions">
            <button className="admin-btn" onClick={() => (tab === 'messages' ? load() : loadVisits(visitPage))} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</button>
            <a className="admin-btn" href="/">View site</a>
            <button className="admin-btn" onClick={logout}>Sign out</button>
          </div>
        </div>

        <div className="admin-nav">
          {[['messages', 'Messages'], ['visits', 'Recent visits']].map(([id, label]) => (
            <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        {tab === 'messages' && (
          <div className="admin-filters">
            {[['all', 'All'], ['unread', 'Unread'], ['chat', 'From AI chat'], ['form', 'From form']].map(([id, label]) => (
              <button key={id} className={filter === id ? 'on' : ''} onClick={() => setFilter(id)}>{label}</button>
            ))}
          </div>
        )}

        {error && <div className="admin-error" style={{ marginBottom: 12 }}>{error}</div>}

        {tab === 'visits' && <VisitsPanel data={visits} loading={loading} onPage={loadVisits} />}

        {tab === 'messages' && (
          <div className="admin-list">
            {visible.length === 0 && !loading && <div className="admin-empty">No messages here yet.</div>}
            {visible.map((m) => (
              <article key={m._id} className={`admin-msg${m.read ? '' : ' unread'}`}>
                <div className="admin-msg-head">
                  <div>
                    <span className="admin-msg-name">{m.name}</span>
                    <span className={`admin-tag${m.source === 'ai-chat' ? ' chat' : ''}`}>{m.source === 'ai-chat' ? 'AI chat' : 'Form'}</span>
                    {m.company && <span className="admin-tag">{m.company}</span>}
                  </div>
                  <span className="admin-msg-meta">{formatDate(m.createdAt)}</span>
                </div>
                <div className="admin-msg-meta">{m.email}</div>
                <p>{m.message}</p>
                {m.emailStatus && <div className={`admin-email-status${m.emailStatus.startsWith('failed') ? ' bad' : ''}`}>Email to you: {m.emailStatus}</div>}
                <div className="admin-msg-actions">
                  <a className="admin-btn primary" href={`mailto:${m.email}?subject=${encodeURIComponent('Re: your message on my portfolio')}`}>Reply</a>
                  <button className="admin-btn" onClick={() => toggleRead(m)}>{m.read ? 'Mark unread' : 'Mark read'}</button>
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
        )}
      </div>
    </div>
  )
}
