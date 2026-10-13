import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const TOP = 'Full-stack ✶ MERN ✶ AI ✶ '
const BOTTOM = 'Ideas into interfaces ✶ '

// Oversized serif type that slides sideways as you scroll past, in opposite directions.
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function BigType() {
  const rootRef = useRef(null)
  const [still] = useState(reducedMotion)

  useEffect(() => {
    const root = rootRef.current
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const ctx = gsap.context(() => {
      root.querySelectorAll('.bigtype-row').forEach((row) => {
        const dir = Number(row.dataset.dir)
        gsap.fromTo(row, { xPercent: dir < 0 ? 0 : -33 }, {
          xPercent: dir < 0 ? -33 : 0,
          ease: 'none',
          scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <div className="bigtype" ref={rootRef} aria-label="Full-stack, MERN, AI. Ideas into interfaces.">
      <div className="bigtype-row" data-dir="-1" aria-hidden="true">{TOP.repeat(still ? 1 : 4)}</div>
      <p className="bigtype-note">I take ideas from the first sketch all the way to production.</p>
      <div className="bigtype-row is-italic" data-dir="1" aria-hidden="true">{BOTTOM.repeat(still ? 1 : 6)}</div>
    </div>
  )
}
