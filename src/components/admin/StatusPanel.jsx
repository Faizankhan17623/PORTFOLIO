import { useCallback, useEffect, useState } from 'react'
import { ErrorLine } from './shared'
import { formatDate, formatDuration } from './utils'

const Pill = ({ ok, children }) => <span className={`adm-pill ${ok ? 'ok' : 'bad'}`}>{children}</span>
const Row = ({ label, children }) => <div className="adm-row"><span>{label}</span><span>{children}</span></div>

export default function StatusPanel({ api, refreshKey }) {
  const [status, setStatus] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try { setStatus(await api('/status')) } catch (err) { setError(err.message) } finally { setLoading(false) }
  }, [api])

  useEffect(() => { load() }, [load, refreshKey])

  if (!status) return <><ErrorLine error={error} /><div className="admin-empty">{loading ? 'Loading…' : ''}</div></>
  const { server, database, email, security, recentErrors } = status
  const dbUp = database.state === 'connected'
  const last = email.last

  return (
    <>
      <ErrorLine error={error} />
      <p className="admin-msg-meta adm-lead">Read-only. Checked when you open this tab or press Refresh.</p>
      <div className="adm-two-col">
        <section className="adm-panel">
          <h3>Server</h3>
          <Row label="Status"><Pill ok>Running</Pill></Row>
          <Row label="Uptime">{formatDuration(server.uptimeSeconds)}</Row>
          <Row label="Memory">{server.memoryMb} MB</Row>
          <Row label="Node">{server.node}</Row>
          <Row label="Environment">{server.environment}</Row>
        </section>

        <section className="adm-panel">
          <h3>Database</h3>
          <Row label="Connection"><Pill ok={dbUp}>{database.state}</Pill></Row>
          <Row label="Response time">{database.latencyMs != null ? `${database.latencyMs} ms` : 'unknown'}</Row>
        </section>

        <section className="adm-panel">
          <h3>Email notifications</h3>
          <Row label="Provider"><Pill ok={email.configured}>{email.provider === 'none' ? 'not set up' : email.provider}</Pill></Row>
          <Row label="Last email sent">{last.at ? <><Pill ok={last.ok}>{last.ok ? 'delivered' : 'failed'}</Pill> {formatDate(last.at)}</> : 'none since the server started'}</Row>
          {last.at && !last.ok && <p className="admin-error adm-small">{last.detail}</p>}
          <Row label="Latest message">{email.latestMessage ? `${email.latestMessage.status}` : 'no messages yet'}</Row>
        </section>

        <section className="adm-panel">
          <h3>Protection</h3>
          <Row label="Admin password"><Pill ok={security.passwordStrong}>{security.passwordStrong ? 'strong' : 'too short'}</Pill></Row>
          <Row label="Separate token secret"><Pill ok={security.tokenSecretSet}>{security.tokenSecretSet ? 'set' : 'not set'}</Pill></Row>
          <Row label="Blocked IPs">{security.blockedIps}</Row>
          <Row label="Spam stopped (24h)">{security.spamBlocked24h}</Row>
        </section>
      </div>

      <section className="adm-panel">
        <h3>Recent server errors</h3>
        {recentErrors.length === 0 ? <p className="admin-msg-meta">None recorded. 🎉</p> : (
          <ul className="adm-events">
            {recentErrors.map((e, i) => <li key={i}><span className="admin-msg-meta">{formatDate(e.at)}</span> {e.detail}</li>)}
          </ul>
        )}
      </section>
    </>
  )
}
