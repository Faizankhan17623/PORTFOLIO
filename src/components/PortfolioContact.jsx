import { useEffect, useRef, useState } from 'react'
import { useGsapReveal } from '../hooks/useGsapReveal'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function PortfolioContact() {
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' })
  const startedAt = useRef(0)
  useEffect(() => { startedAt.current = performance.now() }, [])
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })
  const revealRef = useGsapReveal('.contact-reveal', { y: 22, stagger: 0.1 })

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setStatus({ type: '', message: '' })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSending(true)
    setStatus({ type: '', message: '' })

    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, elapsed: Math.round(performance.now() - startedAt.current) }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Your message could not be sent. Please email me directly.')
      setForm({ name: '', email: '', message: '', website: '' })
      startedAt.current = performance.now()
      setStatus({ type: 'success', message: 'Thanks for reaching out. I’ll get back to you soon.' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Your message could not be sent. Please email me directly.' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="portfolio-section contact-section" ref={revealRef}>
      <div className="contact-layout">
        <div className="contact-copy contact-reveal">
          <div className="section-kicker">Start a conversation</div>
          <h2 className="contact-title">Have a good<br />project in mind?<br /><em>Let’s talk.</em></h2>
          <p className="contact-description">Have a role, an idea, or a tricky problem to solve? I’d love to hear what you’re working on.</p>
          <p className="contact-location"><span className="availability-dot" /> Pune, Maharashtra, India · Available immediately</p>
        </div>

        <form className="contact-form contact-reveal" onSubmit={handleSubmit}>
          <div className="contact-form-heading">
            <span>Write a note</span>
          </div>
          <input className="hp-field" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={updateField} />
          <label className="contact-field">
            <span>Your name</span>
            <input name="name" type="text" autoComplete="name" placeholder="Name" value={form.name} onChange={updateField} required />
          </label>
          <label className="contact-field">
            <span>Email address</span>
            <input name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={updateField} required />
          </label>
          <label className="contact-field">
            <span>What’s on your mind?</span>
            <textarea name="message" rows={4} placeholder="A little context goes a long way…" value={form.message} onChange={updateField} required />
          </label>
          <div className="contact-submit-row">
            <button className="button button-dark" type="submit" disabled={sending}>
              {sending ? 'Sending…' : 'Send message'} <span aria-hidden="true">↗</span>
            </button>
            <span className="contact-form-note">Usually replies within a day</span>
          </div>
          {status.message && <p className={`contact-status ${status.type}`} role="status">{status.message}</p>}
        </form>
      </div>
    </div>
  )
}
