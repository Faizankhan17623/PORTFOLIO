import { useGsapReveal } from '../hooks/useGsapReveal'

const LABELS = {
  languages: 'Languages',
  frontend: 'Frontend',
  styling: 'UI & styling',
  backend: 'Backend',
  databases: 'Databases',
  testing: 'Testing',
  deployment: 'Deployment',
  devops: 'DevOps',
  ai: 'Current AI focus',
}

export default function PortfolioSkills({ skills }) {
  const groups = Object.entries(skills)
  const revealRef = useGsapReveal('.skills-reveal', { y: 20, scale: 0.98, stagger: 0.07 })

  return (
    <div className="portfolio-section skills-section" ref={revealRef}>
      <div className="section-heading skills-reveal">
        <div>
          <div className="section-kicker">Tools & technologies</div>
          <h2 className="section-title">A practical <em>toolkit.</em></h2>
        </div>
        <p className="section-description">The tools I reach for to design, build, connect, and ship useful products.</p>
      </div>

      <div className="skills-grid">
        {groups.map(([category, items]) => (
          <article className="skill-group skills-reveal" key={category}>
            <h3>{LABELS[category] || category}</h3>
            <div className="skill-tags">
              {items.map((skill) => <span className="skill-tag" key={skill}>{skill}</span>)}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
