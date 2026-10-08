export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// `startedAt` is performance.now() from when the form appeared; the server uses the elapsed time
// (a person needs a few seconds to fill a form, a bot posts instantly) as one of its spam checks.
export async function sendContactMessage(payload, startedAt) {
  const response = await fetch(`${API_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, elapsed: Math.round(performance.now() - startedAt) }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Your message could not be sent. Please email me directly.')
  return data
}
