import { useState } from 'react'
import { ErrorLine, Pager } from './shared'
import { formatShort, usePaged } from './utils'

export default function VisitsPanel({ api, refreshKey }) {
  const { data, loading, error, load } = usePaged(api, '/visits', refreshKey)
  const [confirmIp, setConfirmIp] = useState(null)
  const [actionError, setActionError] = useState('')

  const block = async (ip) => {
    setActionError('')
    try {
      await api('/blocked', { method: 'POST', body: JSON.stringify({ ip, reason: 'Blocked from Recent visits' }) })
      setConfirmIp(null)
      load(data?.page || 1)
    } catch (err) {
      setActionError(err.message)
      setConfirmIp(null)
    }
  }

  if (!data) return <><ErrorLine error={error} /><div className="admin-empty">{loading ? 'Loading…' : 'No visits recorded yet.'}</div></>

  return (
    <>
      <ErrorLine error={error || actionError} />
      {data.visits.length === 0 ? (
        <div className="admin-empty">No visits recorded yet.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>IP address</th><th>Device</th><th>Time zone</th><th>Source</th><th>Visits</th><th>Last visit</th><th /></tr>
            </thead>
            <tbody>
              {data.visits.map((v) => (
                <tr key={v._id}>
                  <td className="mono">{v.ip}</td>
                  <td className="adm-wrap-cell" title={v.userAgent}>{v.device}</td>
                  <td>{v.timezone}</td>
                  <td>{v.source || 'direct'}</td>
                  <td><span className="admin-count">{v.count}</span></td>
                  <td>{formatShort(v.lastSeen)}</td>
                  <td className="adm-cell-action">
                    {v.blocked ? <span className="admin-tag danger">Blocked</span> : confirmIp === v.ip ? (
                      <>
                        <button className="admin-btn danger small" onClick={() => block(v.ip)}>Confirm block</button>
                        <button className="admin-btn small" onClick={() => setConfirmIp(null)}>Cancel</button>
                      </>
                    ) : (
                      <button className="admin-btn small" onClick={() => setConfirmIp(v.ip)}>Block</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager data={data} loading={loading} onPage={load} noun={data.total === 1 ? 'unique visitor' : 'unique visitors'} />
    </>
  )
}
