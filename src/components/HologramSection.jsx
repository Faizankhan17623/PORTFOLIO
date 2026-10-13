import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '../lib/motion'

// three.js is only downloaded once this section is close to the screen.
const HologramScene = lazy(() => import('./three/HologramScene'))

// `at` is the scan progress (0-1) at which each card switches on.
const CARDS = [
  { id: 'name', side: 'left', row: 'upper', at: 0.1, label: 'Name', title: 'Faizan Khan', sub: 'Pune, Maharashtra, India', pin: true },
  { id: 'about', side: 'left', row: 'lower', at: 0.34, label: 'What I do', text: 'Made full-stack products with AI integration in them.' },
  { id: 'stack', side: 'right', row: 'upper', at: 0.55, label: 'Core stack', chips: ['React', 'Node.js', 'Express', 'MongoDB'] },
  { id: 'status', side: 'right', row: 'lower', at: 0.78, label: 'Status', title: 'Available', sub: 'Ready to join immediately', live: true },
]

export default function HologramSection() {
  const wrapRef = useRef(null)
  const counterRef = useRef(null)
  const statusRef = useRef(null)
  const progressRef = useRef(0)
  const [near, setNear] = useState(false)
  const [still] = useState(prefersReducedMotion)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return undefined
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setNear(true) }, { rootMargin: '1400px 0px' })
    observer.observe(wrap)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return undefined
    if (still) { progressRef.current = 1; return undefined }
    const trigger = ScrollTrigger.create({
      trigger: wrap,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => { progressRef.current = self.progress },
      onRefresh: (self) => { progressRef.current = self.progress },
    })
    return () => trigger.kill()
  }, [still])

  // Called on every frame with the smoothed scan progress: updates the counter and switches cards on.
  const onFrame = useCallback((p) => {
    if (counterRef.current) counterRef.current.textContent = `${String(Math.round(p * 100)).padStart(3, '0')}%`
    if (statusRef.current) statusRef.current.textContent = p < 0.04 ? 'Keep scrolling to scan' : p > 0.96 ? 'Scan complete' : 'Scanning profile…'
    wrapRef.current?.querySelectorAll('[data-at]').forEach((card) => {
      card.classList.toggle('is-on', p >= Number(card.dataset.at))
    })
  }, [])

  return (
    <div className={`holo-wrap${still ? ' is-still' : ''}`} ref={wrapRef}>
      <div className="holo-sticky">
        {near && (
          <Suspense fallback={null}>
            <HologramScene progressRef={progressRef} onFrame={onFrame} />
          </Suspense>
        )}

        <div className="holo-ui">
          <div className="holo-head">
            <span className="holo-kicker">Profile scan</span>
            <span className="holo-status" ref={statusRef}>Keep scrolling to scan</span>
          </div>

          {CARDS.map((card) => (
            <div key={card.id} className={`holo-card holo-${card.side} holo-${card.row}`} data-at={card.at}>
              <span className="holo-card-label">{card.label}</span>
              {card.title && <strong className="holo-card-title">{card.live && <i className="holo-live" />}{card.title}</strong>}
              {card.sub && (
                <span className="holo-card-sub">
                  {card.pin && (
                    <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="10" r="2.4" fill="currentColor" /></svg>
                  )}
                  {card.sub}
                </span>
              )}
              {card.text && <p className="holo-card-text">{card.text}</p>}
              {card.chips && <div className="holo-chips">{card.chips.map((chip) => <span key={chip}>{chip}</span>)}</div>}
            </div>
          ))}

          <div className="holo-counter" aria-hidden="true"><span>Scan</span><b ref={counterRef}>000%</b></div>
        </div>
      </div>
    </div>
  )
}
