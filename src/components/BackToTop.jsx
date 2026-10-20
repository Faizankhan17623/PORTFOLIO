import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../lib/motion'

const RADIUS = 22
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// A round button that shows how far down the page you are and takes you back to the top.
export default function BackToTop() {
  const ringRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      if (ringRef.current) ringRef.current.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - progress))
      setVisible(window.scrollY > 520)
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <button
      type="button"
      className={`back-to-top${visible ? ' is-visible' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
    >
      <svg viewBox="0 0 52 52" width="52" height="52" aria-hidden="true">
        <circle className="btt-track" cx="26" cy="26" r={RADIUS} />
        <circle className="btt-ring" ref={ringRef} cx="26" cy="26" r={RADIUS} strokeDasharray={CIRCUMFERENCE} strokeDashoffset={CIRCUMFERENCE} />
        <path className="btt-arrow" d="M26 33V19M19.5 25.5 26 19l6.5 6.5" />
      </svg>
    </button>
  )
}
