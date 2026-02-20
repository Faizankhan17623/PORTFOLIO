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
        <p className="sec-sub">A little bit about who I am and what I do.</p>
      </motion.div>

      <div className="about-wrap">
        <motion.div {...fade(0.1)} className="about-avatar">👨‍💻</motion.div>

        <div>
          <motion.p {...fade(0.2)} className="about-bio">
            Hey! I'm <strong style={{ color: '#c084fc' }}>Faizan Khan</strong>, a passionate Full Stack Developer from India.
            I love building complete, end-to-end web applications that are fast, scalable, and look great.
          </motion.p>
          <motion.p {...fade(0.28)} className="about-bio">
            I've built real-world projects like <strong style={{ color: '#22d3ee' }}>Cine Circuit</strong> — a full-stack movie
            ticketing platform with multi-role dashboards, Razorpay payment integration, JWT auth, and real-time features.
          </motion.p>
          <motion.p {...fade(0.35)} className="about-bio">
            When I'm not coding I'm exploring new tech, contributing to open-source, or planning the next thing to build.
            I'm always learning and always building.
          </motion.p>

          <motion.div {...fade(0.42)} className="about-stats">
            {[
              ['2+', 'Years Coding'],
              ['5+', 'Projects Built'],
              ['10+', 'Technologies'],
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
