import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { finishLoader, heroReady, isLoaderDone, wakeBackend } from '../lib/loader'
import { prefersReducedMotion } from '../lib/motion'

const MIN_MS = 4000 // the loader always plays for at least this long, so it feels intentional
const CAP_MS = 10000 // and never holds the page longer than this, even if the free server is still asleep

// What the loader waits for, and how much each part counts towards the bar.
const WEIGHTS = { fonts: 0.15, scene: 0.4, server: 0.45 }

export default function Loader() {
  const [open, setOpen] = useState(() => !isLoaderDone())
  const rootRef = useRef(null)
  const barRef = useRef(null)
  const percentRef = useRef(null)
  const statusRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const html = document.documentElement
    html.classList.add('is-loading')

    const reduced = prefersReducedMotion()
    const minMs = reduced ? 1200 : MIN_MS
    const ready = { fonts: false, scene: false, server: false }
    const mark = (key) => () => { ready[key] = true }
    ;(document.fonts?.ready ?? Promise.resolve()).then(mark('fonts'), mark('fonts'))
    heroReady.then(mark('scene'))
    wakeBackend().then(mark('server'))

    const start = performance.now()
    let shown = 0
    let raf = 0
    let closing = false
    let lastStatus = ''

    const close = () => {
      if (closing) return
      closing = true
      const root = rootRef.current
      finishLoader() // the hero starts its entrance (and the robot waves) as the curtain lifts
      const finish = () => { html.classList.remove('is-loading'); setOpen(false) }
      if (!root) { finish(); return }
      if (reduced) {
        gsap.to(root, { opacity: 0, duration: 0.3, onComplete: finish })
        return
      }
      gsap.timeline({ onComplete: finish })
        .to('.loader-face', { scale: 1.12, duration: 0.35, ease: 'power2.out' })
        .to(root, { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, '+=0.05')
    }

    let lastNow = start
    const tick = (now) => {
      const elapsed = now - start
      const dt = Math.min((now - lastNow) / 1000, 0.25) // eased by real time, so slow devices are not left crawling
      lastNow = now
      const real = Object.entries(ready).reduce((sum, [key, ok]) => sum + (ok ? WEIGHTS[key] : 0), 0)
      const allReady = real >= 0.999
      const timedOut = elapsed >= CAP_MS
      // The bar follows the clock but never runs ahead of what has really finished.
      const ceiling = allReady || timedOut ? 1 : 0.15 + real * 0.75
      const target = Math.min(Math.min(elapsed / minMs, 1), ceiling)
      shown += (target - shown) * (1 - Math.exp(-dt * 4.5))
      const forced = elapsed >= CAP_MS + 800 // hard stop: whatever is still loading carries on behind the page
      if (forced) shown = 1
      if (barRef.current) barRef.current.style.transform = `scaleX(${shown.toFixed(4)})`
      if (percentRef.current) percentRef.current.textContent = `${String(Math.round(shown * 100)).padStart(3, '0')}%`

      let status = 'Almost there…'
      if (!ready.server) status = elapsed > 5500 ? 'Free servers sleep when idle, so this can take a few more seconds…' : 'Waking up the server…'
      else if (!ready.scene) status = 'Loading the 3D scene…'
      if (statusRef.current && status !== lastStatus) { statusRef.current.textContent = status; lastStatus = status }

      if (forced || (allReady && elapsed >= minMs && shown > 0.985) || (timedOut && shown > 0.9)) { close(); return }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      html.classList.remove('is-loading')
    }
  }, [open])

  if (!open) return null

  return (
    <div className="loader" ref={rootRef} role="status" aria-live="polite" aria-label="Loading the portfolio">
      <div className="loader-inner">
        <div className="loader-face" aria-hidden="true">
          <span className="loader-antenna" />
          <span className="loader-ear left" />
          <span className="loader-ear right" />
          <div className="loader-screen">
            <span className="loader-eye" />
            <span className="loader-eye" />
            <span className="loader-smile" />
          </div>
        </div>
        <p className="loader-name">Faizan Khan</p>
        <div className="loader-track" aria-hidden="true"><span ref={barRef} /></div>
        <div className="loader-meta">
          <span ref={statusRef}>Waking up the server…</span>
          <b ref={percentRef}>000%</b>
        </div>
      </div>
    </div>
  )
}
