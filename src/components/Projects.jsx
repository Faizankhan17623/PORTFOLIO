import { useState, useRef, useMemo, useEffect } from 'react'
import TiltCard from './TiltCard'
import { useScramble } from '../hooks/useScramble'
import { useSpotlight } from '../hooks/useSpotlight'
import { useGsapReveal } from '../hooks/useGsapReveal'
import { useGsapParallax } from '../hooks/useGsapParallax'

const CATEGORY_ORDER = ['Full-Stack', 'Frontend', 'Games', 'AI / CV', 'Tools', 'Other']

// ─── Single project card ────────────────────────────────────────────
function ProjectCard({ p, i }) {
  const spot = useSpotlight()
  // Emoji drifts upward as the card scrolls through view — adds depth.
  const emojiRef = useGsapParallax({ distance: -28 })
  return (
    <div
      key={p.id}
      className="project-card spotlight gsap-reveal-card"
      {...spot}
    >
      <TiltCard className="project-card corner-box corner-box-inner">
        <div className="proj-card-top">
          <div className="proj-emoji" ref={emojiRef}>{p.emoji}</div>
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
    </div>
  )
}

export default function Projects({ projects }) {
  const [openCats, setOpenCats] = useState({})
  const ref = useRef(null)
  const headRef = useGsapReveal('.reveal')
  const accRef = useGsapReveal('.gsap-reveal-card')
  const [inView, setInView] = useState(false)
  const t1 = useScramble('MY', { trigger: inView, speed: 35, delay: 80 })
  const t2 = useScramble('PROJECTS', { trigger: inView, speed: 35, delay: 260 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { rootMargin: '-80px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

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

  return (
    <div className="section" ref={ref}>
      <div ref={headRef}>
        <div className="reveal">
          <div className="sec-badge">Projects</div>
          <h2 className="sec-title scramble-text">
            <span>{t1}</span> <span className="hl">{t2}</span>
          </h2>
          <p className="sec-sub">Real-world applications I've built from scratch.</p>
        </div>
      </div>

      {/* ═══ COLLAPSIBLE DROPDOWNS BY CATEGORY ═══ */}
      <div className="cat-accordion" ref={accRef}>
        {categories.map((c, ci) => {
          const open = openCats[c] ?? ci === 0 // first one open by default
          return (
            <div key={c} className={`acc-section ${open ? 'open' : ''}`}>
              <button className="acc-header" onClick={() => toggleCat(c)}>
                <span className="acc-arrow">{open ? '▼' : '▶'}</span>
                <span className="acc-title">{c}</span>
                <span className="acc-count">{grouped[c].length}</span>
              </button>
              {/* CSS grid-rows expand/collapse (no Framer needed) */}
              <div className={`acc-body ${open ? 'open' : ''}`}>
                <div className="acc-body-inner">
                  <div className="projects-grid acc-grid">
                    {grouped[c].map((p, i) => (
                      <ProjectCard key={p.id} p={p} i={i} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
