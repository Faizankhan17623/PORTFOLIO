import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ICONS = {
  frontend: '🖥️',
  backend: '⚙️',
  tools: '🛠️',
  ai: '🤖',
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const tag = {
  hidden: { opacity: 0, scale: 0.7, y: 10 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 18 } },
}

export default function Skills({ skills, isAdmin, onUpdate }) {
  const [newSkill, setNewSkill] = useState({ cat: 'frontend', val: '' })

  const addSkill = () => {
    const v = newSkill.val.trim()
    if (!v) return
    const updated = { ...skills, [newSkill.cat]: [...skills[newSkill.cat], v] }
    onUpdate(updated)
    setNewSkill(s => ({ ...s, val: '' }))
  }

  const removeSkill = (cat, idx) => {
    const updated = { ...skills, [cat]: skills[cat].filter((_, i) => i !== idx) }
    onUpdate(updated)
  }

  return (
    <div className="section">
      <motion.div
        initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }} viewport={{ once: true }}
      >
        <div className="sec-badge">// skills.config</div>
        <h2 className="sec-title">Tech <span className="hl">Stack</span></h2>
        <p className="sec-sub">Tools and technologies I work with daily.</p>
      </motion.div>

      <div className="skills-grid">
        {Object.entries(skills).map(([cat, list], ci) => (
          <motion.div
            key={cat}
            className="skill-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: ci * 0.12 }}
            viewport={{ once: true }}
          >
            <div className="skill-card-header">
              <span className="skill-icon">{ICONS[cat]}</span>
              <h3>{cat.charAt(0).toUpperCase() + cat.slice(1)}</h3>
            </div>
            <motion.div className="skill-tags" variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <AnimatePresence>
                {list.map((s, i) => (
                  <motion.span key={s + i} variants={tag} className="skill-tag" layout>
                    {s}
                    {isAdmin && (
                      <button className="tag-del" onClick={() => removeSkill(cat, i)}>×</button>
                    )}
                  </motion.span>
                ))}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {isAdmin && (
        <motion.div
          className="admin-add-row"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        >
          <select value={newSkill.cat} onChange={e => setNewSkill(s => ({ ...s, cat: e.target.value }))}>
            {Object.keys(skills).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            placeholder="New skill..."
            value={newSkill.val}
            onChange={e => setNewSkill(s => ({ ...s, val: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && addSkill()}
          />
          <button className="btn-glow primary" onClick={addSkill}>Add</button>
        </motion.div>
      )}
    </div>
  )
}
