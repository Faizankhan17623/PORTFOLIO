import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Projects({ projects, isAdmin, onUpdate }) {
  const [form, setForm] = useState({ title: '', description: '', tags: '', emoji: '🚀', github: '', live: '' })
  const [adding, setAdding] = useState(false)

  const addProject = () => {
    if (!form.title.trim()) return
    const p = {
      id: Date.now(),
      title: form.title.trim(),
      description: form.description.trim(),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      emoji: form.emoji || '🚀',
      github: form.github.trim(),
      live: form.live.trim(),
    }
    onUpdate([p, ...projects])
    setForm({ title: '', description: '', tags: '', emoji: '🚀', github: '', live: '' })
    setAdding(false)
  }

  const removeProject = (id) => onUpdate(projects.filter(p => p.id !== id))

  return (
    <div className="section">
      <motion.div
        initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }} viewport={{ once: true }}
      >
        <div className="sec-badge">// projects.json</div>
        <h2 className="sec-title">My <span className="hl">Projects</span></h2>
        <p className="sec-sub">Real-world applications I've built from scratch.</p>
      </motion.div>

      {isAdmin && (
        <motion.div className="admin-bar" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <button className="btn-glow outline" onClick={() => setAdding(v => !v)}>
            {adding ? '✕ Cancel' : '+ Add Project'}
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {adding && isAdmin && (
          <motion.div
            className="project-form"
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
          >
            <div className="pf-row">
              <input placeholder="Emoji (e.g. 🎬)" value={form.emoji}
                onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} className="pf-emoji" />
              <input placeholder="Project title *" value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <textarea placeholder="Short description..." value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
            <input placeholder="Tags (comma separated, e.g. React,Node.js)" value={form.tags}
              onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
            <div className="pf-row">
              <input placeholder="GitHub URL" value={form.github}
                onChange={e => setForm(f => ({ ...f, github: e.target.value }))} />
              <input placeholder="Live URL" value={form.live}
                onChange={e => setForm(f => ({ ...f, live: e.target.value }))} />
            </div>
            <button className="btn-glow primary" onClick={addProject}>Save Project</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="projects-grid">
        <AnimatePresence>
          {projects.map((p, i) => (
            <motion.div
              key={p.id}
              className="project-card"
              layout
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
            >
              {isAdmin && (
                <button className="proj-del" onClick={() => removeProject(p.id)}>×</button>
              )}
              <div className="proj-emoji">{p.emoji}</div>
              <h3 className="proj-title">{p.title}</h3>
              <p className="proj-desc">{p.description}</p>
              <div className="proj-tags">
                {p.tags.map(t => <span key={t} className="proj-tag">{t}</span>)}
              </div>
              <div className="proj-links">
                {p.github && (
                  <a href={p.github} target="_blank" rel="noreferrer" className="proj-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    Code
                  </a>
                )}
                {p.live && (
                  <a href={p.live} target="_blank" rel="noreferrer" className="proj-link live">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    Live
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
