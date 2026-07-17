import { useRef, useEffect, useState } from 'react'
import { useScramble } from '../hooks/useScramble'
import { useSpotlight } from '../hooks/useSpotlight'
import { useGsapReveal } from '../hooks/useGsapReveal'
import { useGsapParallax } from '../hooks/useGsapParallax'

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

// Single skill card — its icon drifts upward as the card scrolls through view.
function SkillCard({ cat, list, spot }) {
  const iconRef = useGsapParallax({ distance: -18 })
  return (
    <div className="skill-card corner-box spotlight reveal" {...spot}>
      <div className="skill-card-header">
        <span className="skill-icon" ref={iconRef}>{ICONS[cat]}</span>
        <h3>{cat.charAt(0).toUpperCase() + cat.slice(1)}</h3>
      </div>
      <div className="skill-tags">
        {list.map((s, i) => (
          <span key={s + i} className="skill-tag">
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Skills({ skills }) {
  const spot = useSpotlight()
  const ref = useRef(null)
  const revealRef = useGsapReveal('.reveal')
  const [inView, setInView] = useState(false)
  const t1 = useScramble('TECH', { trigger: inView, speed: 35, delay: 80 })
  const t2 = useScramble('STACK', { trigger: inView, speed: 35, delay: 280 })

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

  return (
    <div className="section" ref={ref}>
      <div ref={revealRef}>
        <div className="reveal">
          <div className="sec-badge">Tech Stack</div>
          <h2 className="sec-title scramble-text">
            <span>{t1}</span> <span className="hl">{t2}</span>
          </h2>
          <p className="sec-sub">Tools and technologies I work with daily.</p>
        </div>

        <div className="skills-grid">
          {Object.entries(skills).map(([cat, list]) => (
            <SkillCard key={cat} cat={cat} list={list} spot={spot} />
          ))}
        </div>
      </div>
    </div>
  )
}
