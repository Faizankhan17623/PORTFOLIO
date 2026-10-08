export function Pager({ data, loading, onPage, noun }) {
  if (!data) return null
  const { page, pages, total } = data
  return (
    <div className="admin-pager">
      <span className="admin-msg-meta">{total} {noun}</span>
      <div className="admin-actions">
        <button className="admin-btn" onClick={() => onPage(page - 1)} disabled={loading || page <= 1}>Previous</button>
        <span className="admin-msg-meta">Page {page} of {pages}</span>
        <button className="admin-btn" onClick={() => onPage(page + 1)} disabled={loading || page >= pages}>Next</button>
      </div>
    </div>
  )
}

export const ErrorLine = ({ error }) => (error ? <div className="admin-error" style={{ marginBottom: 12 }}>{error}</div> : null)
