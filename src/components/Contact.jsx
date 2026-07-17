import { useState, useRef, useEffect } from 'react'
import MagneticElement from './MagneticElement'
import SuccessPopup from './SuccessPopup'
import { useScramble } from '../hooks/useScramble'
import { useGsapReveal } from '../hooks/useGsapReveal'
import { useGsapParallax } from '../hooks/useGsapParallax'

const SOCIALS = [
  {
    label: 'GitHub',
    href: 'https://github.com/Faizankhan17623?tab=repositories',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/faizankhan-fullstack/',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    label: 'Twitter / X',
    href: 'https://x.com/FAIZANKHAN43395',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: 'Email',
    href: 'mailto:faizankhan901152@gmail.com',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    ),
  },
  {
    label: 'LeetCode',
    href: 'https://leetcode.com/u/MADMAN9656/',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/>
      </svg>
    ),
  },
]

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sending, setSending] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [error, setError] = useState('')
  const ref = useRef(null)
  const sectionRef = useRef(null)
  const revealRef = useGsapReveal('.reveal', { y: 26, stagger: 0.1 })
  // Social row drifts upward as it scrolls through view — adds depth.
  const socialRowRef = useGsapParallax({ distance: -16 })
  const [inView, setInView] = useState(false)
  const t1 = useScramble('GET IN', { trigger: inView, speed: 35, delay: 80 })
  const t2 = useScramble('TOUCH', { trigger: inView, speed: 35, delay: 320 })

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { rootMargin: '-80px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in all fields.')
      return
    }
    setError('')
    setSending(true)
    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')
      setForm({ name: '', email: '', message: '' })
      setShowPopup(true)
      setTimeout(() => setShowPopup(false), 5000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="section" ref={sectionRef}>
      <SuccessPopup show={showPopup} onClose={() => setShowPopup(false)} />

      <div ref={revealRef}>
      <div className="reveal">
        <div className="sec-badge">Contact</div>
        <h2 className="sec-title scramble-text">
          <span>{t1}</span> <span className="hl">{t2}</span>
        </h2>
        <p className="sec-sub">Have a project in mind or just want to say hi? I'd love to hear from you.</p>
      </div>

      <div className="contact-wrap" ref={ref}>
        {/* Left: form */}
        <form
          className="contact-form reveal"
          onSubmit={handleSubmit}
        >
          <div className="cf-row">
            <div className="cf-group">
              <label>Name</label>
              <input
                type="text" placeholder="John Doe" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="cf-group">
              <label>Email</label>
              <input
                type="email" placeholder="john@example.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
          </div>
          <div className="cf-group">
            <label>Message</label>
            <textarea
              rows={5} placeholder="Tell me about your project or idea..."
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            />
          </div>

          {error && (
            <p className="cf-error">
              {error}
            </p>
          )}

          <MagneticElement className="full-w">
            <button
              type="submit"
              className="btn-glow primary full-w interactive"
              disabled={sending}
            >
              {sending ? (
                <span className="sending-dots">Sending<span>.</span><span>.</span><span>.</span></span>
              ) : 'Send Message →'}
            </button>
          </MagneticElement>
        </form>

        {/* Right: info + socials */}
        <div className="contact-info">
          <div className="ci-block reveal">
            <h4>Email</h4>
            <a href="mailto:faizankhan901152@gmail.com" className="ci-link">faizankhan901152@gmail.com</a>
          </div>
          <div className="ci-block reveal">
            <h4>Location</h4>
            <p>India 🇮🇳</p>
          </div>
          <div className="ci-block reveal">
            <h4>Status</h4>
            <p className="ci-available"><span className="dot pulse" />Available for opportunities</p>
          </div>
          <div className="ci-block reveal">
            <h4>Find me on</h4>
            <div className="social-row" ref={socialRowRef}>
              {SOCIALS.map(s => (
                <MagneticElement key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="social-btn interactive"
                    title={s.label}
                  >
                    {s.icon}
                  </a>
                </MagneticElement>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
