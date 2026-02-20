import { motion } from 'framer-motion'

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
  viewport: { once: true },
})

export default function About() {
  return (
    <div className="section">
      <motion.div {...fade()}>
        <div className="sec-badge">// about_me.json</div>
        <h2 className="sec-title">About <span className="hl">Me</span></h2>
        <p className="sec-sub">A little bit about who I am, what I build, and where I'm headed.</p>
      </motion.div>

      <div className="about-wrap">
        <motion.div {...fade(0.1)} className="about-avatar">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="140" height="140">
            {/* Monitor */}
            <rect x="30" y="30" width="140" height="100" rx="10" fill="none" stroke="#a855f7" strokeWidth="4"/>
            <rect x="40" y="40" width="120" height="80" rx="6" fill="#0d1117"/>
            {/* Code lines */}
            <rect x="52" y="55" width="40" height="5" rx="2.5" fill="#c084fc"/>
            <rect x="98" y="55" width="25" height="5" rx="2.5" fill="#22d3ee"/>
            <rect x="60" y="68" width="55" height="5" rx="2.5" fill="#4ade80"/>
            <rect x="52" y="81" width="30" height="5" rx="2.5" fill="#fb923c"/>
            <rect x="88" y="81" width="45" height="5" rx="2.5" fill="#c084fc"/>
            <rect x="60" y="94" width="20" height="5" rx="2.5" fill="#22d3ee"/>
            {/* Stand */}
            <rect x="90" y="130" width="20" height="25" rx="3" fill="none" stroke="#a855f7" strokeWidth="4"/>
            <rect x="65" y="152" width="70" height="8" rx="4" fill="none" stroke="#a855f7" strokeWidth="4"/>
            {/* Cursor blink */}
            <rect x="52" y="106" width="3" height="10" rx="1.5" fill="#a855f7" opacity="0.9"/>
          </svg>
        </motion.div>

        <div>
          <motion.p {...fade(0.2)} className="about-bio">
            I'm <strong style={{ color: '#c084fc' }}>Faizan Khan</strong>, a passionate and self-driven
            <strong style={{ color: '#22d3ee' }}> Full Stack Developer</strong> with a strong foundation
            in the MERN stack. I thrive on turning ideas into fully functional, production-ready web
            applications — handling everything from UI design to backend architecture and deployment.
          </motion.p>
          <motion.p {...fade(0.28)} className="about-bio">
            I have independently built real-world projects like <strong style={{ color: '#22d3ee' }}>Cine Circuit</strong> (a
            full-stack movie ticketing platform) and <strong style={{ color: '#4ade80' }}>StudyNotion</strong> (an
            EdTech platform) — both featuring multi-role dashboards, Razorpay payment integration,
            JWT authentication, and Cloudinary media management, built entirely from scratch.
          </motion.p>
          <motion.p {...fade(0.35)} className="about-bio">
            I'm a quick learner who stays ahead of the curve — currently exploring
            <strong style={{ color: '#fb923c' }}> Generative AI, LLM integrations, and MCP</strong> to
            build smarter, context-aware applications. I'm actively seeking opportunities where I can
            contribute, grow, and make a real impact from day one.
          </motion.p>

          <motion.div {...fade(0.42)} className="about-stats">
            {[
              ['5+', 'Projects Built'],
              ['15+', 'Technologies'],
              ['🚀', 'Open to Work'],
            ].map(([n, label]) => (
              <div key={label} className="stat-item">
                <h4>{n}</h4>
                <p>{label}</p>
              </div>
            ))}
          </motion.div>

          <motion.button
            {...fade(0.5)}
            className="btn-glow primary"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Let's Talk →
          </motion.button>
        </div>
      </div>
    </div>
  )
}
