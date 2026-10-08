import { useCallback, useEffect, useState } from 'react'
import { ErrorLine, Pager } from './shared'
import { formatDate, formatShort, usePaged } from './utils'

const EVENT_LABELS = {
  'login-success': ['Signed in', 'ok'],
  'login-failed': ['Wrong password', 'warn'],
  lockout: ['Locked out', 'bad'],
  'ip-blocked': ['IP blocked', 'neutral'],
  'ip-unblocked': ['IP unblocked', 'neutral'],
  'message-deleted': ['Message deleted', 'neutral'],
  'spam-blocked': ['Spam stopped', 'warn'],
  'server-error': ['Server error', 'bad'],
}

function BlockedIps({ api, refreshKey }) {
  const [blocked, setBlocked] = useState([])
  const [ip, setIp] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try { setBlocked((await api('/blocked')).blocked) } catch (err) { setError(err.message) }
  }, [api])

  useEffect(() => { load() }, [load, refreshKey])

  const add = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api('/blocked', { method: 'POST', body: JSON.stringify({ ip: ip.trim(), reason }) })
      setIp('')
      setReason('')
      load()
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  const remove = async (value) => {
    try {
      await api(`/blocked/${encodeURIComponent(value)}`, { method: 'DELETE' })
      load()
    } catch (err) { setError(err.message) }
  }

  return (
    <section className="adm-panel">
      <h3>Blocked IPs</h3>
      <p className="admin-msg-meta adm-lead">A blocked IP gets an error from every part of the site and can no longer visit, send messages or reach the admin.</p>
      <form className="adm-inline-form" onSubmit={add}>
        <input className="adm-search" placeholder="IP address, e.g. 203.0.113.7" value={ip} onChange={(e) => setIp(e.target.value)} />
        <input className="adm-search" placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={200} />
        <button className="admin-btn primary" type="submit" disabled={busy || !ip.trim()}>Block</button>
      </form>
      <ErrorLine error={error} />
      {blocked.length === 0 ? <p className="admin-msg-meta">No IPs are blocked.</p> : (
        <ul className="adm-events">
          {blocked.map((b) => (
            <li key={b.ip} className="adm-blocked">
              <span><b className="mono">{b.ip}</b> {b.reason && <span className="admin-msg-meta">— {b.reason}</span>} <span className="admin-msg-meta">· {formatDate(b.at)}</span></span>
              <button className="admin-btn small" onClick={() => remove(b.ip)}>Unblock</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default function SecurityPanel({ api, refreshKey }) {
  const { data, loading, error, load } = usePaged(api, '/events', refreshKey, 15)

  return (
    <>
      <BlockedIps api={api} refreshKey={refreshKey} />

      <section className="adm-panel">
        <h3>Activity log</h3>
        <p className="admin-msg-meta adm-lead">Sign-ins, wrong passwords, lockouts, blocks, deleted messages, stopped spam and server errors. Entries are removed after 180 days.</p>
        <ErrorLine error={error} />
        {!data ? <div className="admin-empty">{loading ? 'Loading…' : ''}</div> : data.events.length === 0 ? (
          <div className="admin-empty">Nothing logged yet.</div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>When</th><th>Event</th><th>IP address</th><th>Device</th><th>Details</th></tr></thead>
                <tbody>
                  {data.events.map((e) => {
                    const [label, tone] = EVENT_LABELS[e.type] || [e.type, 'neutral']
                    return (
                      <tr key={e._id}>
                        <td>{formatShort(e.at)}</td>
                        <td><span className={`adm-pill ${tone}`}>{label}</span></td>
                        <td className="mono">{e.ip || '—'}</td>
                        <td className="adm-wrap-cell">{e.device || '—'}</td>
                        <td className="adm-wrap-cell">{e.detail || '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Pager data={data} loading={loading} onPage={load} noun={data.total === 1 ? 'event' : 'events'} />
          </>
        )}
      </section>
    </>
  )
}
