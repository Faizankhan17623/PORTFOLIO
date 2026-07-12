import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useVelocity,
  useMotionValueEvent,
  useAnimationFrame,
} from 'framer-motion'

const TRAIL_TTL = 650 // ms — strands must be gone within ~1s of scroll stopping
const THWIP_DEBOUNCE = 900
const VELOCITY_THRESHOLD = 500

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

function useIsEligible() {
  // Disabled on small screens / coarse pointers for performance, per spec.
  const [eligible, setEligible] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px) and (pointer: fine)')
    const update = () => setEligible(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return eligible
}

export default function SpiderManOverlay() {
  const reducedMotion = usePrefersReducedMotion()
  const eligible = useIsEligible()

  if (reducedMotion || !eligible) return null
  return <SpiderManTraveler />
}

function SpiderManTraveler() {
  const { scrollYProgress } = useScroll()
  const scrollVelocity = useVelocity(scrollYProgress)

  // Keyframes: header (top-left) -> far right -> far left -> footer (bottom).
  const x = useTransform(scrollYProgress, [0, 0.33, 0.66, 1], ['4vw', '88vw', '4vw', '46vw'])
  const y = useTransform(scrollYProgress, [0, 0.33, 0.66, 1], ['8vh', '35vh', '65vh', '92vh'])
  const rotateRaw = useTransform(scrollYProgress, [0, 0.33, 0.66, 1], [0, 360, 720, 720])
  // useSpring ONLY on the numeric rotate value — wrapping x/y (unit strings) in
  // useSpring would pin him to position 0, since springs can't animate strings.
  const rotate = useSpring(rotateRaw, { stiffness: 120, damping: 20, mass: 0.6 })

  const [webShoot, setWebShoot] = useState(false)
  const [thwip, setThwip] = useState(false)
  const thwipTimer = useRef(null)

  useMotionValueEvent(scrollVelocity, 'change', (v) => {
    const fast = Math.abs(v) > VELOCITY_THRESHOLD
    setWebShoot(fast)
    if (fast) {
      setThwip(true)
      clearTimeout(thwipTimer.current)
      thwipTimer.current = setTimeout(() => setThwip(false), THWIP_DEBOUNCE)
    }
  })

  useEffect(() => () => clearTimeout(thwipTimer.current), [])

  const wrapRef = useRef(null)

  return (
    <>
      <WebTrail targetRef={wrapRef} />
      <motion.div
        ref={wrapRef}
        style={{
          position: 'fixed',
          left: x,
          top: y,
          rotate,
          pointerEvents: 'none',
          zIndex: 40,
          willChange: 'transform',
        }}
      >
        <motion.div
          animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <SpiderManSVG webShoot={webShoot} />
        </motion.div>
        {thwip && (
          <motion.div
            className="thwip-bubble"
            initial={{ opacity: 0, scale: 0.6, x: 70, y: -10 }}
            animate={{ opacity: 1, scale: 1, x: 66, y: -14 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            THWIP!
          </motion.div>
        )}
      </motion.div>
    </>
  )
}

function SpiderManSVG({ webShoot }) {
  return (
    <svg width="64" height="80" viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="webLines" patternUnits="userSpaceOnUse" width="10" height="10">
          <path d="M0 0L10 10M10 0L0 10M5 0V10M0 5H10" stroke="#000" strokeWidth="0.6" opacity="0.55" />
        </pattern>
      </defs>

      {/* legs */}
      <path d={webShoot ? 'M20 46 L4 34' : 'M20 46 L10 58'} stroke="#0D47A1" strokeWidth="6" strokeLinecap="round" />
      <path d={webShoot ? 'M44 46 L60 34' : 'M44 46 L54 58'} stroke="#0D47A1" strokeWidth="6" strokeLinecap="round" />
      <path d="M24 50 L18 70" stroke="#0D47A1" strokeWidth="7" strokeLinecap="round" />
      <path d="M40 50 L46 70" stroke="#0D47A1" strokeWidth="7" strokeLinecap="round" />

      {/* boots */}
      <rect x="12" y="68" width="12" height="8" rx="2" fill="#E23636" />
      <rect x="40" y="68" width="12" height="8" rx="2" fill="#E23636" />

      {/* torso */}
      <path d="M18 30 Q32 22 46 30 L44 54 Q32 60 20 54 Z" fill="#E23636" />
      <path d="M18 30 Q32 22 46 30 L44 54 Q32 60 20 54 Z" fill="url(#webLines)" />
      {/* chest emblem */}
      <path d="M32 34 L36 42 L44 42 L38 47 L40 55 L32 50 L24 55 L26 47 L20 42 L28 42 Z" fill="#000" opacity="0.85" />

      {/* arms */}
      <path d={webShoot ? 'M18 32 L2 20' : 'M18 32 L6 42'} stroke="#E23636" strokeWidth="7" strokeLinecap="round" />
      <path d={webShoot ? 'M46 32 L62 20' : 'M46 32 L58 42'} stroke="#E23636" strokeWidth="7" strokeLinecap="round" />
      {/* gloves */}
      <circle cx={webShoot ? 2 : 6} cy={webShoot ? 20 : 42} r="5" fill="#0D47A1" />
      <circle cx={webShoot ? 62 : 58} cy={webShoot ? 20 : 42} r="5" fill="#0D47A1" />

      {/* head */}
      <circle cx="32" cy="16" r="15" fill="#E23636" />
      <circle cx="32" cy="16" r="15" fill="url(#webLines)" />
      {/* eyes */}
      <path d="M20 14 Q25 8 30 13 Q25 17 20 14Z" fill="#FDFDFD" />
      <path d="M44 14 Q39 8 34 13 Q39 17 44 14Z" fill="#FDFDFD" />
    </svg>
  )
}

// Tracks the traveler's on-screen position every frame and renders a thick
// webbing mesh between recent points. Points are pruned on EVERY tick (not
// only when new ones are added) so trails vanish even once scrolling stops.
function WebTrail({ targetRef }) {
  const pointsRef = useRef([])
  const svgRef = useRef(null)

  useAnimationFrame(() => {
    const el = targetRef.current
    const now = performance.now()

    if (el) {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const pts = pointsRef.current
      const last = pts[pts.length - 1]
      if (!last || Math.hypot(cx - last.x, cy - last.y) > 6) {
        pts.push({ x: cx, y: cy, t: now })
      }
    }

    // Filter expired points on every tick, independent of new-point pushes,
    // so old webbing disappears even while the page sits still.
    const cutoff = now - TRAIL_TTL
    pointsRef.current = pointsRef.current.filter((p) => p.t > cutoff)

    if (svgRef.current) renderTrail(svgRef.current, pointsRef.current, now)
  })

  return (
    <svg
      ref={svgRef}
      style={{
        position: 'fixed', inset: 0, width: '100vw', height: '100vh',
        pointerEvents: 'none', zIndex: 39,
      }}
    >
      <defs>
        <filter id="webGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#FDFDFD" floodOpacity="0.8" />
        </filter>
      </defs>
    </svg>
  )
}

function renderTrail(svgEl, points, now) {
  // Clear previous frame's strand elements (keep <defs>).
  while (svgEl.lastChild && svgEl.lastChild.tagName !== 'defs') {
    svgEl.removeChild(svgEl.lastChild)
  }
  if (points.length < 2) return

  const ns = 'http://www.w3.org/2000/svg'
  const group = document.createElementNS(ns, 'g')
  group.setAttribute('filter', 'url(#webGlow)')

  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]
    const b = points[i]
    const age = (now - b.t) / TRAIL_TTL
    const opacity = Math.max(0, 1 - age)
    if (opacity <= 0) continue

    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy) || 1
    const nx = -dy / len
    const ny = dx / len
    const rail = 5

    // main thick strand
    addLine(group, ns, a.x, a.y, b.x, b.y, 6, opacity)
    // two parallel side rails
    addLine(group, ns, a.x + nx * rail, a.y + ny * rail, b.x + nx * rail, b.y + ny * rail, 2, opacity * 0.7)
    addLine(group, ns, a.x - nx * rail, a.y - ny * rail, b.x - nx * rail, b.y - ny * rail, 2, opacity * 0.7)
    // X cross-threads + rungs at midpoint
    const mx = (a.x + b.x) / 2
    const my = (a.y + b.y) / 2
    addLine(group, ns, mx + nx * rail, my + ny * rail, mx - nx * rail, my - ny * rail, 1.5, opacity * 0.5)
  }

  svgEl.appendChild(group)
}

function addLine(group, ns, x1, y1, x2, y2, width, opacity) {
  const line = document.createElementNS(ns, 'line')
  line.setAttribute('x1', x1)
  line.setAttribute('y1', y1)
  line.setAttribute('x2', x2)
  line.setAttribute('y2', y2)
  line.setAttribute('stroke', '#FDFDFD')
  line.setAttribute('stroke-width', width)
  line.setAttribute('stroke-linecap', 'round')
  line.setAttribute('opacity', opacity)
  group.appendChild(line)
}
