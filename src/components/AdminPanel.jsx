import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PASSWORD = 'admin@123'

export default function AdminPanel({ loggedIn, onLogin, onClose, skills, projects, onUpdateSkills, onUpdateProjects }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(false)
  const [tab, setTab] = useState('skills')

  // skill add
  const [newSkill, setNewSkill] = useState({ cat: 'frontend', val: '' })
  // project add
  const [pForm, setPForm] = useState({ title: '', description: '', tags: '', emoji: '🚀', github: '', live: '' })
  const [addingProj, setAddingProj] = useState(false)

  const tryLogin = () => {
    if (pw === PASSWORD) { onLogin(); setErr(false) }
    else { setErr(true); setTimeout(() => setErr(false), 700) }
  }

  const addSkill = () => {
    const v = newSkill.val.trim()
    if (!v) return
    onUpdateSkills({ ...skills, [newSkill.cat]: [...skills[newSkill.cat], v] })
    setNewSkill(s => ({ ...s, val: '' }))
  }

  const removeSkill = (cat, idx) => {
    onUpdateSkills({ ...skills, [cat]: skills[cat].filter((_, i) => i !== idx) })
  }

  const addProject = () => {
    if (!pForm.title.trim()) return
    const p = {
      id: Date.now(),
      title: pForm.title.trim(),
      description: pForm.description.trim(),
      tags: pForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      emoji: pForm.emoji || '🚀',
      github: pForm.github.trim(),
      live: pForm.live.trim(),
    }
    onUpdateProjects([p, ...projects])
    setPForm({ title: '', description: '', tags: '', emoji: '🚀', github: '', live: '' })
    setAddingProj(false)
  }

  const removeProject = (id) => onUpdateProjects(projects.filter(p => p.id !== id))

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="modal"
          initial={{ scale: 0.88, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        >
          <div className="modal-header">
            <h3>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" style={{ marginRight: 8, verticalAlign: 'middle' }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Admin Panel
            </h3>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>

          {!loggedIn ? (
            <motion.div className="modal-login" animate={err ? { x: [0, -8, 8, -8, 0] } : {}} transition={{ duration: 0.35 }}>
              <p className="modal-hint">Enter password to continue</p>
              <input
                type="password"
                placeholder="Password"
                value={pw}
                onChange={e => { setPw(e.target.value); setErr(false) }}
                onKeyDown={e => e.key === 'Enter' && tryLogin()}
                className={err ? 'input-err' : ''}
                autoFocus
              />
              {err && <p className="err-msg">Incorrect password</p>}
              <button className="btn-glow primary full-w" onClick={tryLogin}>Login</button>
            </motion.div>
          ) : (
            <div className="modal-body">
              <div className="modal-tabs">
                <button className={tab === 'skills' ? 'tab active' : 'tab'} onClick={() => setTab('skills')}>Skills</button>
                <button className={tab === 'projects' ? 'tab active' : 'tab'} onClick={() => setTab('projects')}>Projects</button>
              </div>

              <AnimatePresence mode="wait">
                {tab === 'skills' && (
                  <motion.div key="skills" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                    <div className="admin-add-row">
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
                    </div>

                    {Object.entries(skills).map(([cat, list]) => (
                      <div key={cat} className="admin-skill-group">
                        <h4 className="admin-cat">{cat}</h4>
                        <div className="skill-tags">
                          {list.map((s, i) => (
                            <span key={s + i} className="skill-tag">
                              {s}
                              <button className="tag-del" onClick={() => removeSkill(cat, i)}>×</button>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {tab === 'projects' && (
                  <motion.div key="projects" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                    <button className="btn-glow outline mb-12" onClick={() => setAddingProj(v => !v)}>
                      {addingProj ? '✕ Cancel' : '+ Add Project'}
                    </button>

                    <AnimatePresence>
                      {addingProj && (
                        <motion.div
                          className="project-form"
                          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        >
                          <div className="pf-row">
                            <input placeholder="Emoji" value={pForm.emoji}
                              onChange={e => setPForm(f => ({ ...f, emoji: e.target.value }))} className="pf-emoji" />
                            <input placeholder="Title *" value={pForm.title}
                              onChange={e => setPForm(f => ({ ...f, title: e.target.value }))} />
                          </div>
                          <textarea placeholder="Description..." value={pForm.description}
                            onChange={e => setPForm(f => ({ ...f, description: e.target.value }))} rows={3} />
                          <input placeholder="Tags (comma separated)" value={pForm.tags}
                            onChange={e => setPForm(f => ({ ...f, tags: e.target.value }))} />
                          <div className="pf-row">
                            <input placeholder="GitHub URL" value={pForm.github}
                              onChange={e => setPForm(f => ({ ...f, github: e.target.value }))} />
                            <input placeholder="Live URL" value={pForm.live}
                              onChange={e => setPForm(f => ({ ...f, live: e.target.value }))} />
                          </div>
                          <button className="btn-glow primary" onClick={addProject}>Save Project</button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="admin-proj-list">
                      {projects.map(p => (
                        <div key={p.id} className="admin-proj-item">
                          <span>{p.emoji} {p.title}</span>
                          <button className="tag-del" onClick={() => removeProject(p.id)}>×</button>
                        </div>
                      ))}
                      {projects.length === 0 && <p className="admin-empty">No projects yet.</p>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
