import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const LINKS = ['home', 'about', 'skills', 'projects', 'contact']

export default function Navbar() {
  const [active, setActive] = useState('home')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30)
      for (const id of LINKS) {
        const el = document.getElementById(id)
        if (!el) continue
        const { top, bottom } = el.getBoundingClientRect()
        if (top <= 120 && bottom >= 120) { setActive(id); break }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{ borderBottomColor: scrolled ? 'rgba(168,85,247,0.22)' : 'rgba(255,255,255,0.07)' }}
    >
      <motion.div
        className="nav-logo"
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        faizan.dev
      </motion.div>
      <ul className="nav-links">
        {LINKS.map((id, i) => (
          <motion.li
            key={id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
          >
            <button
              className={active === id ? 'active' : ''}
              onClick={() => scrollTo(id)}
            >
              {id.charAt(0).toUpperCase() + id.slice(1)}
            </button>
          </motion.li>
        ))}
      </ul>
    </motion.nav>
  )
}
