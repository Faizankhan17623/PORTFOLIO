import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const EMOJI_COLORS = {
  '🎬': '#e11d48',
  '📚': '#f59e0b',
  '💳': '#3b82f6',
  '🌤️': '#0ea5e9',
  '🧮': '#8b5cf6',
  '📡': '#22d3ee',
  '👁️': '#10b981',
  '🧠': '#a855f7',
  '🚀': '#f97316',
  '⚡': '#eab308',
  '🎮': '#ec4899',
}

function getAmbientColor(emoji) {
  return EMOJI_COLORS[emoji] || '#c084fc'
}

function ProjectCard({ p, isAdmin, onRemove, onHover, onLeave }) {
  return (
    <motion.div
      className="hscroll-card"
      layout
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 100 }}
      viewport={{ once: true }}
      onMouseEnter={() => onHover(p.emoji)}
      onMouseLeave={onLeave}
    >
      {isAdmin && (
        <button className="proj-del" onClick={() => onRemove(p.id)}>×</button>
      )}
      <div className="hcard-top">
        <span className="hcard-emoji">{p.emoji}</span>
        <div className="hcard-links">
          {p.github && (
            <a href={p.github} target="_blank" rel="noreferrer" className="proj-link interactive" title="Source Code">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>
          )}
          {p.live && (
            <a href={p.live} target="_blank" rel="noreferrer" className="proj-link live interactive" title="Live Demo">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          )}
        </div>
      </div>
      <h3 className="hcard-title">{p.title}</h3>
      <p className="hcard-desc">{p.description}</p>
      <div className="hcard-tags">
        {p.tags.slice(0, 4).map(t => <span key={t} className="proj-tag">{t}</span>)}
        {p.tags.length > 4 && <span className="proj-tag">+{p.tags.length - 4}</span>}
      </div>
    </motion.div>
  )
}

export default function Projects({ projects, isAdmin, onUpdate }) {
  const [form, setForm] = useState({ title: '', description: '', tags: '', emoji: '🚀', github: '', live: '' })
  const [adding, setAdding] = useState(false)
  const [ambientColor, setAmbientColor] = useState(null)
  const scrollRef = useRef(null)

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

  const handleHover = useCallback((emoji) => {
    setAmbientColor(getAmbientColor(emoji))
  }, [])

  const handleLeave = useCallback(() => {
    setAmbientColor(null)
  }, [])

  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  const onMouseDown = (e) => {
    isDragging.current = true
    startX.current = e.pageX - scrollRef.current.offsetLeft
    scrollLeft.current = scrollRef.current.scrollLeft
    scrollRef.current.style.cursor = 'grabbing'
  }
  const onMouseUp = () => {
    isDragging.current = false
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab'
  }
  const onMouseMove = (e) => {
    if (!isDragging.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX.current) * 1.5
    scrollRef.current.scrollLeft = scrollLeft.current - walk
  }

  return (
    <div
      className="projects-outer"
      style={{
        '--ambient': ambientColor || 'var(--purple)',
        transition: 'all 0.6s ease',
      }}
    >
      <motion.div
        className="ambient-blob"
        animate={{
          background: ambientColor
            ? `radial-gradient(circle at 50% 50%, ${ambientColor}22 0%, transparent 70%)`
            : 'none',
          opacity: ambientColor ? 1 : 0,
        }}
        transition={{ duration: 0.6 }}
      />

      <div className="section">
        <motion.div
          initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }} viewport={{ once: true }}
        >
          <div className="sec-badge">// projects.json</div>
          <h2 className="sec-title">My <span className="hl">Projects</span></h2>
          <p className="sec-sub">
            Real-world applications I've built from scratch.
            <span className="scroll-hint"> ← drag to explore →</span>
          </p>
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
                <input placeholder="Emoji" value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} className="pf-emoji" />
                <input placeholder="Project title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <textarea placeholder="Short description..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
              <input placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
              <div className="pf-row">
                <input placeholder="GitHub URL" value={form.github} onChange={e => setForm(f => ({ ...f, github: e.target.value }))} />
                <input placeholder="Live URL" value={form.live} onChange={e => setForm(f => ({ ...f, live: e.target.value }))} />
              </div>
              <button className="btn-glow primary" onClick={addProject}>Save Project</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        className="hscroll-rail"
        ref={scrollRef}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onMouseMove={onMouseMove}
      >
        <div className="hscroll-inner">
          <AnimatePresence>
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                p={p}
                isAdmin={isAdmin}
                onRemove={removeProject}
                onHover={handleHover}
                onLeave={handleLeave}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
