import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from '../lib/motion'

// A number that counts up (and from then on, glides to each new value) once it scrolls into view.
export default function AnimatedNumber({ value, duration = 1.6 }) {
  const ref = useRef(null)
  const shown = useRef(0)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setSeen(true) }, { threshold: 0.2 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || typeof value !== 'number') return undefined
    if (prefersReducedMotion()) {
      shown.current = value
      el.textContent = value.toLocaleString()
      return undefined
    }
    if (!seen) return undefined // keeps showing 0 until the number scrolls into view, then counts up
    const counter = { n: shown.current }
    const tween = gsap.to(counter, {
      n: value,
      duration: shown.current === 0 ? duration : 0.8,
      ease: 'power2.out',
      onUpdate: () => { shown.current = counter.n; el.textContent = Math.round(counter.n).toLocaleString() },
    })
    return () => tween.kill()
  }, [value, seen, duration])

  return <span ref={ref}>{typeof value === 'number' ? '0' : '—'}</span>
}
