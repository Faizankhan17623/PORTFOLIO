import { motion } from 'framer-motion'

export default function SecondBrain() {
  return (
    <div className="section">
      <motion.p
        className="sec-badge"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        // second_brain.md
      </motion.p>
      <motion.h2
        className="sec-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        My <span className="hl">Second Brain</span>
      </motion.h2>
      <motion.p
        className="sec-sub"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        A personal knowledge base where I document everything I learn.
      </motion.p>

      <motion.a
        href="https://faizankhan17623.github.io/Quarts/"
        target="_blank"
        rel="noopener noreferrer"
        className="brain-card interactive"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        whileHover={{ y: -4, boxShadow: '0 0 40px rgba(192,132,252,0.25)' }}
      >
        <div className="brain-card-icon">🧠</div>
        <div className="brain-card-body">
          <h3 className="brain-card-title">Knowledge Base</h3>
          <p className="brain-card-desc">
            A personal wiki built with <span className="brain-tag">Obsidian</span> and{' '}
            <span className="brain-tag">Claude</span> — covering dev notes, learnings,
            research, and ideas all in one place.
          </p>
          <span className="brain-card-link">
            Visit Wiki <span className="brain-arrow">→</span>
          </span>
        </div>
      </motion.a>
    </div>
  )
}
