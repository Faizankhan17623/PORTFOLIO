import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SEQUENCE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
]

// Falling green code rain — matches the Neon Noir theme.
function MatrixRain({ onComplete }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const chars = 'アイウエオカキクケコ0123456789ABCDEFFAIZAN<>{}[]/$#*'.split('')
    const fontSize = 16
    const columns = Math.floor(canvas.width / fontSize)
    const drops = Array(columns).fill(1)

    let animId
    const draw = () => {
      ctx.fillStyle = 'rgba(2, 9, 4, 0.08)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#39ff14'
      ctx.font = `${fontSize}px monospace`

      drops.forEach((y, i) => {
        const text = chars[Math.floor(Math.random() * chars.length)]
        ctx.fillText(text, i * fontSize, y * fontSize)
        if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0
        drops[i]++
      })
      animId = requestAnimationFrame(draw)
    }
    draw()

    const timer = setTimeout(onComplete, 6000) // rain for 6s
    return () => { cancelAnimationFrame(animId); clearTimeout(timer) }
  }, [onComplete])

  return (
    <motion.canvas
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'none',
      }}
    />
  )
}

export default function KonamiEasterEgg() {
  const [active, setActive] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const progress = useRef(0)

  // Fire the full effect: matrix rain + secret popup.
  const trigger = () => {
    setActive(true)
    setTimeout(() => setShowPopup(true), 1200)
  }

  useEffect(() => {
    const onKey = (e) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      const expected = SEQUENCE[progress.current]
      if (key === expected) {
        progress.current++
        if (progress.current === SEQUENCE.length) {
          progress.current = 0
          trigger()
        }
      } else {
        // Restart, but allow the first key to re-seed the sequence.
        progress.current = key === SEQUENCE[0] ? 1 : 0
      }
    }
    window.addEventListener('keydown', onKey)

    // Allow a disguised UI element (e.g. the footer glyph) to fire the effect.
    const onSecret = () => trigger()
    window.addEventListener('konami:trigger', onSecret)

    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('konami:trigger', onSecret)
    }
  }, [])

  return (
    <>
      <AnimatePresence>
        {active && <MatrixRain key="rain" onComplete={() => setActive(false)} />}

      {showPopup && (
        <motion.div
          key="popup"
          className="konami-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Cross in the top-right closes everything (popup + rain). */}
          <button
            className="konami-close"
            onClick={() => { setShowPopup(false); setActive(false) }}
            aria-label="Close"
          >
            ×
          </button>

          <motion.div
            className="konami-content"
            initial={{ opacity: 0, scale: 0.85, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.1 }}
          >
            <div className="konami-emoji">🎮</div>
            <h3 className="konami-title">YOU FOUND THE SECRET</h3>
            <p className="konami-text">
              You typed the Konami Code — you clearly know your stuff. 👾<br />
              People who notice the small things are exactly who I love working with.
            </p>
            <p className="konami-text konami-cta">Let&apos;s build something together:</p>
            <a className="konami-mail" href="mailto:faizankhan901152@gmail.com">faizankhan901152@gmail.com</a>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  )
}
