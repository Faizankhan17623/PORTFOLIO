import { useGsapReveal } from '../hooks/useGsapReveal'
import { useGsapTitle } from '../hooks/useGsapTitle'
import { useGsapParallax } from '../hooks/useGsapParallax'

export default function SecondBrain() {
  const revealRef = useGsapReveal('.reveal')
  const titleRef = useGsapTitle()
  const iconRef = useGsapParallax({ distance: -40 })

  return (
    <div className="section" ref={revealRef}>
      <p className="sec-badge reveal">
        // second_brain.md
      </p>
      <h2 className="sec-title" ref={titleRef}>
        My <span className="hl">Second Brain</span>
      </h2>
      <p className="sec-sub reveal">
        A personal knowledge base where I document everything I learn.
      </p>

      <a
        href="https://faizankhan17623.github.io/Quarts/"
        target="_blank"
        rel="noopener noreferrer"
        className="brain-card interactive reveal"
      >
        <div className="brain-card-icon" ref={iconRef}>🧠</div>
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
      </a>
    </div>
  )
}
