import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// How long the maintenance screen shows (ms)
const DURATION = 3500

export default function MaintenanceScreen({ onDone }) {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min((elapsed / DURATION) * 100, 100)
      setProgress(pct)
      if (pct >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          setVisible(false)
          setTimeout(onDone, 700)
        }, 300)
      }
    }, 16)
    return () => clearInterval(interval)
  }, [onDone])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="maint-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        >
          {/* Subtle scanline overlay */}
          <div className="maint-scanlines" />

          <div className="maint-content">
            {/* Logo */}
            <motion.div
              className="maint-logo"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              faizan.dev
            </motion.div>

            {/* Status line */}
            <motion.div
              className="maint-status"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <span className="maint-dot" />
              Initializing portfolio...
            </motion.div>

            {/* Progress bar */}
            <motion.div
              className="maint-bar-wrap"
              initial={{ opacity: 0, scaleX: 0.8 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.9 }}
            >
              <div className="maint-bar-track">
                <motion.div
                  className="maint-bar-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="maint-pct">{Math.floor(progress)}%</span>
            </motion.div>

            {/* Terminal lines */}
            <motion.div
              className="maint-terminal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              <TerminalLine delay={1.2} text="→ Loading components..." />
              <TerminalLine delay={1.8} text="→ Connecting to database..." />
              <TerminalLine delay={2.4} text="→ Spinning up React..." />
              <TerminalLine delay={2.9} text={<span style={{ color: '#4ade80' }}>✓ Ready. Welcome!</span>} />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function TerminalLine({ delay, text }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay * 1000)
    return () => clearTimeout(t)
  }, [delay])

  return show ? (
    <motion.div
      className="maint-line"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {text}
    </motion.div>
  ) : null
}
