import { useGsapReveal } from '../hooks/useGsapReveal'

export default function PortfolioAbout() {
  const revealRef = useGsapReveal('.about-reveal', { y: 28, stagger: 0.1 })

  return (
    <div className="portfolio-section about-section" ref={revealRef}>
      <div className="section-kicker about-reveal">A little about me</div>
      <div className="about-layout">
        <h2 className="about-statement about-reveal">
          I build from<br />
          first sketch to<br />
          <span>production.</span>
        </h2>
        <div className="about-copy about-reveal">
          <p className="about-lede">
            I’m Faizan Khan, a full-stack developer with hands-on experience designing, building, and deploying production-grade web applications.
          </p>
          <p>
            I work across the MERN stack and take ownership of the full delivery cycle—from polished, user-friendly interfaces and backend architecture to deployment, bug fixing, and continuous improvement.
          </p>
          <p>
            My current direction is AI-integrated applications. I’m applying LLM integrations in products while strengthening my AI and machine-learning fundamentals.
          </p>
        </div>
      </div>

      <div className="about-facts about-reveal" aria-label="At a glance">
        <div><strong>MERN</strong><span>Core environment</span></div>
        <div><strong>Pune</strong><span>Maharashtra, India</span></div>
        <div><strong>Available</strong><span>Ready to join immediately</span></div>
      </div>
    </div>
  )
}
