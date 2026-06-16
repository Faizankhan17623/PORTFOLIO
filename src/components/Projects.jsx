import { useState, useRef, useMemo } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import TiltCard from './TiltCard'
import { useScramble } from '../hooks/useScramble'
import { useSpotlight } from '../hooks/useSpotlight'

const CATEGORY_ORDER = ['Full-Stack', 'Frontend', 'Games', 'AI / CV', 'Tools', 'Other']

// ─── Single project card ────────────────────────────────────────────
function ProjectCard({ p, i, isAdmin, onRemove }) {
  const spot = useSpotlight()
  return (
    <motion.div
      key={p.id}
      className="project-card spotlight"
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 100, delay: (i % 6) * 0.07 }}
      whileHover={{ y: -8, scale: 1.02, transition: { type: 'spring', stiffness: 300 } }}
      {...spot}
    >
      <TiltCard className="project-card corner-box corner-box-inner">
        {isAdmin && (
          <button className="proj-del" onClick={() => onRemove(p.id)}>×</button>
        )}
        <div className="proj-card-top">
          <div className="proj-emoji">{p.emoji}</div>
          {p.category && <span className="proj-cat-chip">{p.category}</span>}
        </div>
        <h3 className="proj-title">{p.title}</h3>
        <p className="proj-desc">{p.description}</p>
        <div className="proj-tags">
          {p.tags.map(t => <span key={t} className="proj-tag">{t}</span>)}
        </div>
        <div className="proj-links">
          {p.github && (
            <a href={p.github} target="_blank" rel="noreferrer" className="proj-link interactive">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              Code
            </a>
          )}
          {p.live && (
            <a href={p.live} target="_blank" rel="noreferrer" className="proj-link live interactive">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Live
            </a>
          )}
        </div>
      </TiltCard>
    </motion.div>
  )
}

export default function Projects({ projects, isAdmin, onUpdate }) {
  const [form, setForm] = useState({ title: '', description: '', tags: '', emoji: '🚀', category: 'Full-Stack', github: '', live: '' })
  const [adding, setAdding] = useState(false)
  const [openCats, setOpenCats] = useState({})
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const t1 = useScramble('MY', { trigger: inView, speed: 35, delay: 80 })
  const t2 = useScramble('PROJECTS', { trigger: inView, speed: 35, delay: 260 })

  // Build ordered list of categories that actually have projects
  const categories = useMemo(() => {
    const present = new Set(projects.map(p => p.category || 'Other'))
    return CATEGORY_ORDER.filter(c => present.has(c))
  }, [projects])

  // Group projects by category (preserving order)
  const grouped = useMemo(() => {
    const map = {}
    for (const c of categories) map[c] = []
    for (const p of projects) (map[p.category || 'Other'] ||= []).push(p)
    return map
  }, [projects, categories])

  const toggleCat = (c) => setOpenCats(s => ({ ...s, [c]: !s[c] }))

  const addProject = () => {
    if (!form.title.trim()) return
    const p = {
      id: Date.now(),
      title: form.title.trim(),
      description: form.description.trim(),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      emoji: form.emoji || '🚀',
      category: form.category || 'Other',
      github: form.github.trim(),
      live: form.live.trim(),
    }
    onUpdate([p, ...projects])
    setForm({ title: '', description: '', tags: '', emoji: '🚀', category: 'Full-Stack', github: '', live: '' })
    setAdding(false)
  }

  const removeProject = (id) => onUpdate(projects.filter(p => p.id !== id))

  return (
    <div className="section" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }} viewport={{ once: true }}
      >
        <div className="sec-badge">Projects</div>
        <h2 className="sec-title scramble-text">
          <span>{t1}</span> <span className="hl">{t2}</span>
        </h2>
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
              <select value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="pf-select">
                {CATEGORY_ORDER.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input placeholder="GitHub URL" value={form.github}
                onChange={e => setForm(f => ({ ...f, github: e.target.value }))} />
            </div>
            <input placeholder="Live URL" value={form.live}
              onChange={e => setForm(f => ({ ...f, live: e.target.value }))} />
            <button className="btn-glow primary" onClick={addProject}>Save Project</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ COLLAPSIBLE DROPDOWNS BY CATEGORY ═══ */}
      <div className="cat-accordion">
        {categories.map((c, ci) => {
          const open = openCats[c] ?? ci === 0 // first one open by default
          return (
            <div key={c} className={`acc-section ${open ? 'open' : ''}`}>
              <button className="acc-header" onClick={() => toggleCat(c)}>
                <span className="acc-arrow">{open ? '▼' : '▶'}</span>
                <span className="acc-title">{c}</span>
                <span className="acc-count">{grouped[c].length}</span>
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    key="body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="projects-grid acc-grid">
                      {grouped[c].map((p, i) => (
                        <ProjectCard key={p.id} p={p} i={i} isAdmin={isAdmin} onRemove={removeProject} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
