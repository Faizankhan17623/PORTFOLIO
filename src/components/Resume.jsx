import { useGsapReveal } from '../hooks/useGsapReveal'

const PROJECT_WORK = [
  {
    number: '01',
    area: 'Career technology',
    title: 'Resumify — Resume Builder',
    projects: 'Job seekers · Recruiters · Administrators',
    detail: 'Built an ATS-aware résumé scan and an 11-template builder with PDF/DOCX export, recruiter workflows, hiring analytics, and AI candidate-fit scoring.',
    skills: ['ATS checks', '11 templates', 'PDF + DOCX', 'Fit scoring'],
  },
  {
    number: '02',
    area: 'AI study companion',
    title: 'Notewise — AI Study Companion',
    projects: 'Notes → summaries · flashcards · quizzes · chat',
    detail: 'Built a grounded study workspace with PDF, DOCX, audio, and web ingestion, source-page citations, adaptive revision, subscription tiers, and collaborative study rooms.',
    skills: ['Document ingestion', 'Source citations', 'Spaced repetition', 'Study rooms'],
  },
]

const EDUCATION = [
  {
    degree: 'Master of Computer Applications (MCA)',
    school: 'Allana Institute of Computer Science · Pune, India',
  },
  {
    degree: 'Bachelor of Computer Applications (BCA)',
    school: 'Poona College of Arts, Commerce and Science · Pune, India',
    detail: 'CGPA 8.90 / 10',
  },
]

const CERTIFICATIONS = [
  '0-100 Full Stack Web Development Course · 100xdevs',
  'Claude Code in Action · Anthropic Academy',
  'Introduction to Agent Skills · Anthropic Academy',
]

const STRENGTHS = ['Problem solving', 'Debugging', 'Collaboration', 'Adaptability', 'Continuous learning']

import { resumeLink } from '../lib/resumeTrack'

export default function Resume() {
  const revealRef = useGsapReveal('.resume-reveal', { y: 24, stagger: 0.08 })

  return (
    <div className="portfolio-section resume-section" ref={revealRef}>
      <div className="resume-heading resume-reveal">
        <div>
          <div className="section-kicker">Resume snapshot</div>
          <h2 className="section-title">Selected work,<br /><em>real skills.</em></h2>
        </div>
        <p className="resume-heading-note">
          Full-stack product delivery across career technology and AI learning, backed by formal study in computer applications.
        </p>
      </div>

      <div className="resume-layout">
        <aside className="resume-profile resume-reveal">
          <span className="resume-profile-label">PROFILE</span>
          <h3>Full-stack developer</h3>
          <p>Hands-on experience building and deploying production-grade web applications across the MERN environment.</p>
          <div className="resume-profile-divider" />
          <span className="resume-profile-label">CURRENT FOCUS</span>
          <div className="resume-focus-tags">
            <span>LLM integrations</span><span>AI applications</span><span>AI/ML fundamentals</span>
          </div>
          <p className="resume-availability"><span className="availability-dot" /> Available immediately · Pune, India</p>
          <a className="resume-download" {...resumeLink('resume-section')}>
            View full résumé (PDF) <span aria-hidden="true">↗</span>
          </a>
          <a className="resume-profile-link" href="https://github.com/Faizankhan17623?tab=repositories" target="_blank" rel="noreferrer">
            Browse project source <span aria-hidden="true">↗</span>
          </a>
        </aside>

        <div className="resume-timeline" aria-label="Selected résumé projects">
          {PROJECT_WORK.map((item) => (
            <article className="resume-entry resume-reveal" key={item.number}>
              <div className="resume-entry-content">
                <p className="resume-entry-area">{item.area}</p>
                <h3>{item.title}</h3>
                <p className="resume-entry-projects">{item.projects}</p>
                <p className="resume-entry-detail">{item.detail}</p>
                <div className="resume-entry-tags">
                  {item.skills.map((skill) => <span key={skill}>{skill}</span>)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="resume-credentials">
        <section className="credential-card resume-reveal" aria-labelledby="education-heading">
          <div className="credential-label">EDUCATION</div>
          <h3 id="education-heading">Computer applications</h3>
          {EDUCATION.map((item) => (
            <div className="education-entry" key={item.degree}>
              <h4>{item.degree}</h4>
              <p>{item.school}</p>
              {item.detail && <span>{item.detail}</span>}
            </div>
          ))}
        </section>

        <section className="credential-card resume-reveal" aria-labelledby="certifications-heading">
          <div className="credential-label">CERTIFICATIONS</div>
          <h3 id="certifications-heading">Continued learning</h3>
          <ul className="certification-list">
            {CERTIFICATIONS.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <div className="resume-strengths-label">HOW I WORK</div>
          <div className="resume-strengths">
            {STRENGTHS.map((strength) => <span key={strength}>{strength}</span>)}
          </div>
        </section>
      </div>
    </div>
  )
}
