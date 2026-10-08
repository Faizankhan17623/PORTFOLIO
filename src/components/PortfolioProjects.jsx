import { useMemo, useState } from 'react'
import { useGsapReveal } from '../hooks/useGsapReveal'

const CATEGORY_ORDER = ['Full-Stack', 'AI / CV', 'Other']

function ProjectCard({ project, index }) {
  return (
    <article className={`project-card${index === 0 ? ' is-featured' : ''}`}>
      <div className="project-art" aria-hidden="true">
        <span className="project-art-shape" />
        <span className="project-art-word">{project.category === 'AI / CV' ? 'AI' : project.title.slice(0, 2).toUpperCase()}</span>
        <span className="project-art-caption">FAIZAN KHAN — SELECTED WORK</span>
      </div>

      <div className="project-content">
        <div className="project-meta">
          <span>{project.category || 'Other'}</span>
        </div>
        <h3>{project.title}</h3>
        <p className="project-description">{project.description}</p>
        <div className="project-tags">
          {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
        <div className="project-links">
          {project.live && (
            <a className="project-link-live" href={project.live} target="_blank" rel="noreferrer">
              Live project <span aria-hidden="true">↗</span>
            </a>
          )}
          {project.github && (
            <a className="project-link-source" href={project.github} target="_blank" rel="noreferrer">
              Source code <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

export default function PortfolioProjects({ projects }) {
  const [selected, setSelected] = useState('All')
  const revealRef = useGsapReveal('.projects-reveal', {
    y: 24,
    scale: 0.99,
    stagger: 0.06,
    deps: [selected],
  })
  const categories = useMemo(() => {
    const present = new Set(projects.map((project) => project.category || 'Other'))
    return ['All', ...CATEGORY_ORDER.filter((category) => present.has(category))]
  }, [projects])
  const visibleProjects = useMemo(() => (
    selected === 'All'
      ? projects
      : projects.filter((project) => (project.category || 'Other') === selected)
  ), [projects, selected])

  return (
    <div className="portfolio-section projects-section" ref={revealRef}>
      <div className="section-heading projects-heading projects-reveal">
        <div>
          <div className="section-kicker">Selected projects</div>
          <h2 className="section-title">Built to be <em>used.</em></h2>
        </div>
        <p className="section-description">A selection of full-stack platforms and AI-powered products.</p>
      </div>

      <div className="project-filters projects-reveal" aria-label="Filter projects by category">
        {categories.map((category) => (
          <button
            key={category}
            className={selected === category ? 'is-selected' : ''}
            onClick={() => setSelected(category)}
            aria-pressed={selected === category}
          >
            {category}
            {category === 'All' && <span>{projects.length}</span>}
          </button>
        ))}
      </div>

      <div className="projects-grid projects-reveal" aria-live="polite">
        {visibleProjects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </div>
      <a className="all-projects-link projects-reveal" href="https://github.com/Faizankhan17623?tab=repositories" target="_blank" rel="noreferrer">
        More projects on GitHub <span aria-hidden="true">↗</span>
      </a>
    </div>
  )
}
