import { useCallback, useEffect, useRef, useState } from 'react'

export const formatDate = (iso) => (iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—')

// Compact version for table cells: "Oct 8, 7:11 PM" (the year only when it isn't this year).
export const formatShort = (iso) => {
  if (!iso) return '—'
  const date = new Date(iso)
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }), hour: 'numeric', minute: '2-digit' })
}

export const formatDuration = (seconds) => {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d) return `${d}d ${h}h`
  if (h) return `${h}h ${m}m`
  return `${m}m ${seconds % 60}s`
}

// Loads one page of a paginated admin endpoint and re-loads it (same page) whenever `refreshKey` changes.
export function usePaged(api, path, refreshKey, limit = 10) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const pageRef = useRef(1)

  const load = useCallback(async (page = 1) => {
    setLoading(true)
    setError('')
    try {
      const result = await api(`${path}?page=${page}&limit=${limit}`)
      pageRef.current = result.page
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [api, path, limit])

  useEffect(() => { load(pageRef.current) }, [load, refreshKey])

  return { data, loading, error, load }
}
