import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ACHIEVEMENTS, onUnlock, unlock, unlockedCount } from '../lib/achievements'
import { sfx } from '../lib/sound'

// Renders the neon "ACHIEVEMENT UNLOCKED" toast stack, and owns the site-wide
// trackers (first visit, night owl, scroll-to-bottom) that don't belong to
// any one component.
export default function AchievementToasts() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    unlock('first_contact')
    if (new Date().getHours() < 5) unlock('night_owl')

    const onScroll = () => {
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80
      if (atBottom) unlock('deep_diver')
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => onUnlock((def) => {
    sfx.achievement()
    const key = `${def.id}-${Date.now()}`
    setToasts(t => [...t, { ...def, key, count: unlockedCount() }])
    setTimeout(() => setToasts(t => t.filter(x => x.key !== key)), 5200)
  }), [])

  return (
    <div className="ach-stack">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.key}
            className="ach-toast"
            initial={{ opacity: 0, x: -48, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -32, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            onClick={() => setToasts(ts => ts.filter(x => x.key !== t.key))}
          >
            <span className="ach-icon">{t.icon}</span>
            <div className="ach-body">
              <span className="ach-label">Achievement unlocked · {t.count}/{ACHIEVEMENTS.length}</span>
              <span className="ach-title">{t.title}</span>
              <span className="ach-desc">{t.desc}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
