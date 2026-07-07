import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ACHIEVEMENTS, isUnlocked, unlock, unlockedCount } from '../lib/achievements'

const EMAIL = 'faizankhan901152@gmail.com'
const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

// Ctrl+K / Cmd+K command palette — quick navigation, actions and links,
// plus a trophies view for the achievement system.
export default function CommandPalette({ onTerminalOpen }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const [view, setView] = useState('commands') // 'commands' | 'trophies'
  const [copied, setCopied] = useState(false)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setIndex(0)
    setView('commands')
    setCopied(false)
  }, [])

  // Global open shortcuts: Ctrl/Cmd+K anywhere, or a `palette:open` event
  // (fired by the ⌘K button in the navbar).
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('palette:open', onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('palette:open', onOpen)
    }
  }, [])

  useEffect(() => {
    if (open) {
      unlock('command_center')
      setTimeout(() => inputRef.current?.focus(), 60)
    }
  }, [open])

  const copyEmail = useCallback(() => {
    navigator.clipboard?.writeText(EMAIL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  const commands = useMemo(() => [
    { id: 'nav-home', group: 'Navigate', icon: '⌂', label: 'Home', hint: 'hero top', run: () => scrollTo('home') },
    { id: 'nav-about', group: 'Navigate', icon: '◈', label: 'About', hint: 'bio who', run: () => scrollTo('about') },
    { id: 'nav-skills', group: 'Navigate', icon: '⚡', label: 'Skills', hint: 'stack tech', run: () => scrollTo('skills') },
    { id: 'nav-projects', group: 'Navigate', icon: '▣', label: 'Projects', hint: 'work apps', run: () => scrollTo('projects') },
    { id: 'nav-github', group: 'Navigate', icon: '◉', label: 'GitHub Stats', hint: 'contributions graph', run: () => scrollTo('github') },
    { id: 'nav-contact', group: 'Navigate', icon: '✉', label: 'Contact', hint: 'email reach', run: () => scrollTo('contact') },
    { id: 'act-terminal', group: 'Actions', icon: '>_', label: 'Open Terminal', hint: 'shell cli console', run: onTerminalOpen },
    { id: 'act-email', group: 'Actions', icon: copied ? '✓' : '⧉', label: copied ? 'Email copied!' : 'Copy Email', hint: 'clipboard mail', run: copyEmail, keepOpen: true },
    { id: 'act-trophies', group: 'Actions', icon: '🏆', label: 'View Achievements', hint: 'trophies unlocked progress', run: () => setView('trophies'), keepOpen: true },
    { id: 'link-gh', group: 'Links', icon: '↗', label: 'GitHub Profile', hint: 'code repos', run: () => window.open('https://github.com/Faizankhan17623', '_blank') },
    { id: 'link-li', group: 'Links', icon: '↗', label: 'LinkedIn', hint: 'connect hire', run: () => window.open('https://linkedin.com/in/faizankhan-fullstack', '_blank') },
    { id: 'secret', group: 'Classified', icon: '▚', label: '??? — do not run this', hint: 'secret forbidden', run: () => window.dispatchEvent(new Event('konami:trigger')) },
  ], [onTerminalOpen, copied, copyEmail])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter(c => `${c.label} ${c.hint} ${c.group}`.toLowerCase().includes(q))
  }, [commands, query])

  // Keep the active row visible while arrowing through the list.
  useEffect(() => {
    listRef.current?.querySelector('.cp-item.active')?.scrollIntoView({ block: 'nearest' })
  }, [index])

  const runItem = (item) => {
    if (!item) return
    item.run()
    if (!item.keepOpen) close()
  }

  const handleKey = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      if (view === 'trophies') { setView('commands'); setIndex(0) }
      else close()
    } else if (view === 'commands') {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setIndex(i => Math.min(i + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setIndex(i => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        runItem(filtered[index])
      }
    }
  }

  let lastGroup = null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="cp-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => { if (e.target === e.currentTarget) close() }}
        >
          <motion.div
            className="cp-window"
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            onKeyDown={handleKey}
          >
            <div className="cp-input-row">
              <span className="cp-chevron">{view === 'trophies' ? '🏆' : '❯'}</span>
              {view === 'commands' ? (
                <input
                  ref={inputRef}
                  className="cp-input"
                  placeholder="Type a command or search…"
                  value={query}
                  onChange={e => { setQuery(e.target.value); setIndex(0) }}
                  spellCheck={false}
                  autoComplete="off"
                />
              ) : (
                <span className="cp-input cp-troph-heading">
                  Achievements — {unlockedCount()}/{ACHIEVEMENTS.length} unlocked
                </span>
              )}
              <kbd className="cp-esc">{view === 'trophies' ? 'esc back' : 'esc'}</kbd>
            </div>

            <div className="cp-list" ref={listRef}>
              {view === 'commands' ? (
                filtered.length === 0 ? (
                  <div className="cp-empty">No matches. Try “projects” or “terminal”.</div>
                ) : (
                  filtered.map((item, i) => {
                    const showGroup = item.group !== lastGroup
                    lastGroup = item.group
                    return (
                      <div key={item.id}>
                        {showGroup && <div className="cp-group">{item.group}</div>}
                        <button
                          className={`cp-item ${i === index ? 'active' : ''}`}
                          onMouseEnter={() => setIndex(i)}
                          onClick={() => runItem(item)}
                        >
                          <span className="cp-item-icon">{item.icon}</span>
                          <span>{item.label}</span>
                          {i === index && <span className="cp-item-enter">↵</span>}
                        </button>
                      </div>
                    )
                  })
                )
              ) : (
                ACHIEVEMENTS.map(a => {
                  const got = isUnlocked(a.id)
                  return (
                    <div key={a.id} className={`cp-troph ${got ? '' : 'locked'}`}>
                      <span className="cp-troph-icon">{got ? a.icon : '🔒'}</span>
                      <div>
                        <span className="cp-troph-title">{a.title}</span>
                        <span className="cp-troph-desc">{got ? a.desc : '??? — keep exploring'}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="cp-footer">
              <span><kbd>↑↓</kbd> navigate <kbd>↵</kbd> run <kbd>esc</kbd> close</span>
              <span className="cp-trophy-count">🏆 {unlockedCount()}/{ACHIEVEMENTS.length}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
