import { useRef } from 'react'

/**
 * SpotlightCard — a wrapper that makes a soft radial glow follow the cursor
 * across the card. Exposes --mx / --my CSS vars consumed by the .spotlight
 * styles in index.css. Keeps the Neon Noir vibe (cyan glow by default).
 *
 * Usage: <SpotlightCard className="skill-card">...</SpotlightCard>
 */
export default function SpotlightCard({ children, className = '', color = '0, 245, 255', ...rest }) {
  const ref = useRef(null)

  const onMouseMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    el.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  return (
    <div
      ref={ref}
      className={`spotlight ${className}`}
      onMouseMove={onMouseMove}
      style={{ '--spot-color': color }}
      {...rest}
    >
      {children}
    </div>
  )
}
