import { useEffect, useState } from 'react'
import { motion, useSpring } from 'framer-motion'

export default function ScrollProgressBar() {
  const [progress, setProgress] = useState(0)
  const spring = useSpring(0, { stiffness: 200, damping: 30 })

  useEffect(() => {
    const update = () => {
      const el = document.documentElement
      const scrolled = el.scrollTop
      const total = el.scrollHeight - el.clientHeight
      const pct = total > 0 ? (scrolled / total) * 100 : 0
      setProgress(pct)
      spring.set(pct)
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [spring])

  return (
    <div className="scroll-progress-track">
      <motion.div
        className="scroll-progress-bar"
        style={{ width: spring.get() + '%' }}
        animate={{ width: progress + '%' }}
        transition={{ type: 'spring', stiffness: 200, damping: 30 }}
      />
    </div>
  )
}
