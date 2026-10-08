import { useEffect, useState } from 'react'
import { useGsapReveal } from '../hooks/useGsapReveal'
import { isOwnerDevice } from '../lib/owner'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Stable per-browser id so the same tab isn't double-counted as "online".
function getVisitorId() {
  let id = localStorage.getItem('visitorId')
  if (!id) {
    id = `v_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
    localStorage.setItem('visitorId', id)
  }
  return id
}

// Where this visitor came from: a ?ref= tag (use it to label links you send out), a UTM source, or the
// referring site. Falls back to "direct".
function getSource() {
  try {
    const params = new URLSearchParams(window.location.search)
    const tag = params.get('ref') || params.get('utm_source')
    if (tag) return tag
    if (document.referrer) {
      const host = new URL(document.referrer).hostname
      if (host && host !== window.location.hostname) return host
    }
  } catch { /* fall through */ }
  return 'direct'
}

function getTimezone() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || '' } catch { return '' }
}

export default function VisitorCounter() {
  const [stats, setStats] = useState({ total: null, online: null })
  const revealRef = useGsapReveal('.reveal', { deps: [stats.total] })

  useEffect(() => {
    // The owner's own browser only reads the numbers; it never adds to them.
    if (isOwnerDevice()) {
      const readStats = () => fetch(`${API_URL}/api/stats`).then((r) => r.json()).then(setStats).catch(() => setStats({ total: null, online: null }))
      readStats()
      const poll = setInterval(readStats, 30000)
      return () => clearInterval(poll)
    }

    const id = getVisitorId()
    let beat

    // Count one visit per session, then just heartbeat to stay "online".
    const init = async () => {
      try {
        const counted = sessionStorage.getItem('visitCounted')
        const endpoint = counted ? '/api/heartbeat' : '/api/visit'
        const res = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, timezone: getTimezone(), source: getSource() }),
        })
        const data = await res.json()
        sessionStorage.setItem('visitCounted', '1')
        // /api/heartbeat doesn't return total, so fall back to /api/stats.
        if (data.total == null) {
          const s = await fetch(`${API_URL}/api/stats`).then((r) => r.json())
          setStats(s)
        } else {
          setStats(data)
        }
      } catch {
        setStats({ total: null, online: null })
      }
    }

    init()
    beat = setInterval(() => {
      fetch(`${API_URL}/api/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
        .then((r) => r.json())
        .then((d) => setStats((s) => ({ ...s, online: d.online })))
        .catch(() => {})
    }, 30000)

    return () => clearInterval(beat)
  }, [])

  // Don't render if the backend is unreachable.
  if (stats.total == null) return null

  return (
    <span ref={revealRef} style={{ display: 'contents' }}>
    <div className="visitor-counter reveal">
      <span className="vc-item">
        <span className="vc-dot online" />
        <span className="vc-num">{stats.online ?? '—'}</span> online now
      </span>
      <span className="vc-sep">·</span>
      <span className="vc-item">
        <span className="vc-num">{stats.total?.toLocaleString()}</span> total visits
      </span>
    </div>
    </span>
  )
}
