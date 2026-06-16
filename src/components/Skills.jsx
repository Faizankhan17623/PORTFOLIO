import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useScramble } from '../hooks/useScramble'
import { useSpotlight } from '../hooks/useSpotlight'

const ICONS = {
  frontend: '🖥️',
  styling: '🎨',
  libraries: '📦',
  backend: '⚙️',
  apis: '🔌',
  database: '🗄️',
  tools: '🛠️',
  ai: '🤖',
  deployment: '🚀',
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const tag = {
  hidden: { opacity: 0, scale: 0.7, y: 10 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 18 } },
}

export default function Skills({ skills }) {
  const spot = useSpotlight()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const t1 = useScramble('TECH', { trigger: inView, speed: 35, delay: 80 })
  const t2 = useScramble('STACK', { trigger: inView, speed: 35, delay: 280 })

  return (
    <div className="section" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }} viewport={{ once: true }}
      >
        <div className="sec-badge">Tech Stack</div>
        <h2 className="sec-title scramble-text">
          <span>{t1}</span> <span className="hl">{t2}</span>
        </h2>
        <p className="sec-sub">Tools and technologies I work with daily.</p>
      </motion.div>

      <div className="skills-grid">
        {Object.entries(skills).map(([cat, list], ci) => (
          <motion.div
            key={cat}
            className="skill-card corner-box spotlight"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: ci * 0.12 }}
            viewport={{ once: true }}
            {...spot}
          >
            <div className="skill-card-header">
              <span className="skill-icon">{ICONS[cat]}</span>
              <h3>{cat.charAt(0).toUpperCase() + cat.slice(1)}</h3>
            </div>
            <motion.div className="skill-tags" variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
              {list.map((s, i) => (
                <motion.span key={s + i} variants={tag} className="skill-tag" layout>
                  {s}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
