import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TESTIMONIALS = [
  {
    name: 'Rohan Sharma',
    role: 'Senior Engineer',
    company: 'Stealth Startup',
    quote:
      "Faizan ships fast and clean. He delivered the entire booking flow for our MVP in under two weeks — payment integration, auth, the works. Rare to find someone who's this hands-on AND this detail-oriented.",
    avatar: 'RS',
    color: 'purple',
  },
  {
    name: 'Aisha Patel',
    role: 'Product Designer',
    company: 'Freelance',
    quote:
      "Working with Faizan was a designer's dream. He turned my Figma into pixel-perfect React in days, and even pushed back (rightly) on a few interaction choices that improved the UX.",
    avatar: 'AP',
    color: 'cyan',
  },
  {
    name: 'Vikram Iyer',
    role: 'CTO',
    company: 'EdTech Startup',
    quote:
      "We needed a full-stack engineer who could own the backend AND the UI. Faizan did both — Razorpay integration, role-based dashboards, the whole stack. Hire him before someone else does.",
    avatar: 'VI',
    color: 'green',
  },
  {
    name: 'Sneha Verma',
    role: 'Tech Lead',
    company: 'SaaS',
    quote:
      "Beyond just writing code, Faizan thinks about edge cases, performance, and the user. He caught three bugs in code review that I'd missed. That's the kind of engineer you want on your team.",
    avatar: 'SV',
    color: 'purple',
  },
]

export default function Testimonials() {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setIdx(i => (i + 1) % TESTIMONIALS.length), 5500)
    return () => clearInterval(id)
  }, [paused])

  const current = TESTIMONIALS[idx]

  return (
    <div
      className="testimonials-wrap"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div
        className="t-header"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span className="t-pill">★ KIND WORDS</span>
        <h2 className="t-title">
          What people <span className="gradient">say</span>
        </h2>
        <p className="t-sub">From folks I've collaborated with on real projects.</p>
      </motion.div>

      <div className="t-carousel">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            className="t-card"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.4 }}
          >
            <div className="t-quote-mark">"</div>
            <p className="t-quote">{current.quote}</p>
            <div className="t-person">
              <div className={`t-avatar t-avatar-${current.color}`}>{current.avatar}</div>
              <div>
                <div className="t-name">{current.name}</div>
                <div className="t-role">{current.role} · {current.company}</div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="t-dots">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              className={`t-dot ${i === idx ? 'active' : ''}`}
              onClick={() => setIdx(i)}
              aria-label={`Show testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
