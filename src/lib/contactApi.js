export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export async function sendContactMessage(payload) {
  const response = await fetch(`${API_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Your message could not be sent. Please email me directly.')
  return data
}
