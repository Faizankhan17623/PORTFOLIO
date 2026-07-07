import { useEffect, useRef, useState } from 'react'
import { unlock } from '../lib/achievements'
import { sfx } from '../lib/sound'

// "lights off" easter egg — kills all page lighting and hands the visitor a
// flashlight cursor. Triggered via a `blackout:on` window event (terminal
// `lights off` command or the palette's Classified section). Any click or
// ESC restores power.
export default function Blackout() {
  const [on, setOn] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const turnOn = () => {
      unlock('lights_out')
      sfx.powerDown()
      setOn(true)
    }
    window.addEventListener('blackout:on', turnOn)
    return () => window.removeEventListener('blackout:on', turnOn)
  }, [])

  useEffect(() => {
    if (!on) return
    // Paint the flashlight mask directly on the node — a re-render per
    // mousemove would be far too heavy.
    const paint = (x, y) => {
      if (ref.current) {
        ref.current.style.background =
          `radial-gradient(circle 170px at ${x}px ${y}px, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.985) 100%)`
      }
    }
    paint(window.innerWidth / 2, window.innerHeight / 2)
    const onMove = (e) => paint(e.clientX, e.clientY)
    const onKey = (e) => { if (e.key === 'Escape') setOn(false) }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('keydown', onKey)
    }
  }, [on])

  if (!on) return null
  return (
    <div ref={ref} className="blackout" onClick={() => setOn(false)}>
      <span className="blackout-hint">⚡ power failure — click or press esc to restore</span>
    </div>
  )
}
