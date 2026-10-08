import { useCallback, useEffect, useState } from 'react'
import { ErrorLine, Pager } from './shared'
import { formatShort, usePaged } from './utils'

function Card({ label, value, sub }) {
  return (
    <div className="adm-card">
      <span className="adm-card-label">{label}</span>
      <b>{value.toLocaleString()}</b>
      {sub && <span className="adm-card-sub">{sub}</span>}
    </div>
  )
}

function VisitsChart({ series }) {
  const max = Math.max(1, ...series.map((d) => d.visits))
  const W = 600
  const H = 150
  const slot = W / series.length
  return (
    <div className="adm-chart">
      <svg viewBox={`0 -12 ${W} ${H + 34}`} role="img" aria-label="Visits per day over the last 30 days">
        {[0.25, 0.5, 0.75, 1].map((f) => <line key={f} x1="0" x2={W} y1={H - H * f} y2={H - H * f} className="adm-grid" />)}
        {series.map((d, i) => {
          const h = (d.visits / max) * H
          return (
            <g key={d.day}>
              <rect x={i * slot + 3} y={H - h} width={slot - 6} height={Math.max(h, d.visits ? 2 : 0)} rx="3" className="adm-bar">
                <title>{`${d.day}: ${d.visits} visit${d.visits === 1 ? '' : 's'}, ${d.resumeOpens} résumé open${d.resumeOpens === 1 ? '' : 's'}`}</title>
              </rect>
              {d.resumeOpens > 0 && <circle cx={i * slot + slot / 2} cy={H - h - 7} r="3.5" className="adm-dot" />}
            </g>
          )
        })}
        <text x="0" y={H + 17} className="adm-axis">{series[0].day}</text>
        <text x={W} y={H + 17} textAnchor="end" className="adm-axis">{series[series.length - 1].day} (UTC)</text>
      </svg>
      <div className="adm-legend"><span><i className="adm-key bar" /> Visits per day</span><span><i className="adm-key dot" /> Day with résumé opens</span><span className="adm-axis-note">Peak: {max}</span></div>
    </div>
  )
}

function BreakdownList({ title, rows, empty }) {
  const top = Math.max(1, ...rows.map((r) => r.visitors))
  return (
    <section className="adm-panel">
      <h3>{title}</h3>
      {rows.length === 0 ? <p className="admin-msg-meta">{empty}</p> : (
        <ul className="adm-bars">
          {rows.map((row) => (
            <li key={row.name}>
              <span className="adm-bars-name" title={row.name}>{row.name}</span>
              <span className="adm-bars-track"><span style={{ width: `${(row.visitors / top) * 100}%` }} /></span>
              <span className="adm-bars-num">{row.visitors}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function ResumeTable({ api, refreshKey }) {
  const { data, loading, error, load } = usePaged(api, '/resume-downloads', refreshKey, 8)
  return (
    <section className="adm-panel">
      <h3>Résumé opens by IP</h3>
      <p className="admin-msg-meta adm-lead">Every click on a résumé button on the site is recorded once per IP (repeat clicks raise the count). It shows the résumé was opened, not that the file finished downloading.</p>
      <ErrorLine error={error} />
      {!data ? <div className="admin-empty">{loading ? 'Loading…' : ''}</div> : data.downloads.length === 0 ? (
        <div className="admin-empty">Nobody has opened the résumé yet.</div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>IP address</th><th>Device</th><th>Time zone</th><th>Opens</th><th>Last button</th><th>Last opened</th></tr></thead>
              <tbody>
                {data.downloads.map((r) => (
                  <tr key={r._id}>
                    <td className="mono">{r.ip}</td>
                    <td className="adm-wrap-cell" title={r.userAgent}>{r.device}</td>
                    <td>{r.timezone}</td>
                    <td><span className="admin-count">{r.count}</span></td>
                    <td>{r.lastSource}</td>
                    <td>{formatShort(r.lastAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager data={data} loading={loading} onPage={load} noun={data.total === 1 ? 'IP address' : 'IP addresses'} />
        </>
      )}
    </section>
  )
}

export default function AnalyticsPanel({ api, refreshKey }) {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try { setStats(await api('/analytics')) } catch (err) { setError(err.message) } finally { setLoading(false) }
  }, [api])

  useEffect(() => { load() }, [load, refreshKey])

  if (!stats) return <><ErrorLine error={error} /><div className="admin-empty">{loading ? 'Loading…' : ''}</div></>
  const t = stats.totals

  return (
    <>
      <ErrorLine error={error} />
      <div className="adm-cards">
        <Card label="Unique visitors" value={t.uniqueVisitors} sub={t.bots ? `${t.bots} bot${t.bots === 1 ? '' : 's'} filtered out` : 'bots filtered out'} />
        <Card label="Visits today" value={t.visitsToday} sub={`${t.visits7} in 7 days · ${t.visits30} in 30`} />
        <Card label="New visitors (7 days)" value={t.newVisitors7} />
        <Card label="Résumé opens" value={t.resumeOpens} sub={`${t.resumeUniqueIps} IP${t.resumeUniqueIps === 1 ? '' : 's'} · ${t.resumeOpens7} this week`} />
        <Card label="Messages" value={t.messages} sub={`${t.unread} unread`} />
      </div>

      <section className="adm-panel">
        <h3>Visits, last 30 days</h3>
        <VisitsChart series={stats.series} />
      </section>

      <div className="adm-two-col">
        <BreakdownList title="Where visitors came from" rows={stats.sources} empty="No sources yet." />
        <BreakdownList title="Top time zones" rows={stats.timezones} empty="No data yet." />
      </div>
      <BreakdownList title="Devices" rows={stats.devices} empty="No data yet." />

      <div className="adm-tip">
        <b>Tip:</b> add <code>?ref=company-name</code> to any link you send, for example <code>{window.location.origin}/?ref=acme</code>, and that name shows up under “Where visitors came from”.
      </div>

      <ResumeTable api={api} refreshKey={refreshKey} />
    </>
  )
}
