import { useCallback, useEffect, useState } from 'react'
import { API_URL } from '../lib/contactApi'
import { isOwnerDevice, setOwnerDevice } from '../lib/owner'
import MessagesPanel from './admin/MessagesPanel'
import VisitsPanel from './admin/VisitsPanel'
import AnalyticsPanel from './admin/AnalyticsPanel'
import StatusPanel from './admin/StatusPanel'
import SecurityPanel from './admin/SecurityPanel'
import '../admin.css'

const TOKEN_KEY = 'portfolio_admin_token'

const readToken = () => {
  try { return sessionStorage.getItem(TOKEN_KEY) || '' } catch { return '' }
}
const saveToken = (token) => {
  try { token ? sessionStorage.setItem(TOKEN_KEY, token) : sessionStorage.removeItem(TOKEN_KEY) } catch { /* private mode */ }
}

const TABS = [
  ['messages', 'Messages'],
  ['visits', 'Recent visits'],
  ['analytics', 'Analytics'],
  ['status', 'Status'],
  ['security', 'Security'],
]

function Login({ onLogin, notice }) {
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
      {notice && !error && <div className="admin-notice">{notice}</div>}
      {error && <div className="admin-error">{error}</div>}
      <button className="admin-btn primary" type="submit" disabled={busy || !password}>{busy ? 'Checking…' : 'Sign in'}</button>
    </form>
  )
}

export default function AdminPage() {
  const [token, setToken] = useState(readToken)
  const [tab, setTab] = useState('messages')
  const [refreshKey, setRefreshKey] = useState(0)
  const [unread, setUnread] = useState(0)
  const [notice, setNotice] = useState('')
  const [now, setNow] = useState(0)
  const [excluded, setExcluded] = useState(isOwnerDevice)

  const logout = useCallback((reason = '') => {
    saveToken('')
    setToken('')
    setUnread(0)
    setNotice(reason)
  }, [])

  // The token starts with its expiry time (ms). Sign out by ourselves when it passes, and keep a countdown.
  const expiresAt = token ? Number(token.split('.')[0]) || 0 : 0
  useEffect(() => {
    if (!token) return undefined
    const tick = () => {
      const t = Date.now()
      setNow(t)
      if (t >= expiresAt) logout('Your session ended. Please sign in again.')
    }
    const first = setTimeout(tick, 0)
    const timer = setInterval(tick, 15000)
    return () => { clearTimeout(first); clearInterval(timer) }
  }, [token, expiresAt, logout])

  const api = useCallback(async (path, options = {}) => {
    const res = await fetch(`${API_URL}/api/admin${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers },
    })
    if (res.status === 401) { logout('Your session ended. Please sign in again.'); throw new Error('Session expired. Please sign in again.') }
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Request failed.')
    return data
  }, [token, logout])

  useEffect(() => {
    document.title = 'Admin · Faizan Khan'
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex, nofollow'
    document.head.appendChild(robots)
    return () => robots.remove()
  }, [])

  if (!token) {
    return (
      <div className="admin-page">
        <Login notice={notice} onLogin={(t) => { saveToken(t); setToken(t); setNotice(''); setOwnerDevice(true); setExcluded(true) }} />
      </div>
    )
  }

  const title = TABS.find(([id]) => id === tab)[1]

  return (
    <div className="admin-page">
      <div className="admin-wrap">
        <div className="admin-top">
          <h1>{title} {tab === 'messages' && unread > 0 && <small>{unread} new</small>}</h1>
          <div className="admin-actions">
            <button className="admin-btn" onClick={() => setRefreshKey((n) => n + 1)}>Refresh</button>
            <a className="admin-btn" href="/">View site</a>
            <button className="admin-btn" onClick={() => logout()}>Sign out</button>
          </div>
        </div>
        {now > 0 && (
          <div className="admin-session">
            Session ends in {Math.max(1, Math.ceil((expiresAt - now) / 60000))} min · you will be signed out automatically
            <span className="admin-session-sep"> · </span>
            {excluded ? 'Your visits from this device are not counted' : 'Your visits from this device are being counted'}{' '}
            <button className="adm-linkbtn" onClick={() => { setOwnerDevice(!excluded); setExcluded(!excluded) }}>{excluded ? 'Count them' : 'Stop counting'}</button>
          </div>
        )}

        <div className="admin-nav">
          {TABS.map(([id, label]) => (
            <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>
              {label}{id === 'messages' && unread > 0 ? ` (${unread})` : ''}
            </button>
          ))}
        </div>

        {tab === 'messages' && <MessagesPanel api={api} refreshKey={refreshKey} onUnread={setUnread} />}
        {tab === 'visits' && <VisitsPanel api={api} refreshKey={refreshKey} />}
        {tab === 'analytics' && <AnalyticsPanel api={api} refreshKey={refreshKey} />}
        {tab === 'status' && <StatusPanel api={api} refreshKey={refreshKey} />}
        {tab === 'security' && <SecurityPanel api={api} refreshKey={refreshKey} />}
      </div>
    </div>
  )
}
