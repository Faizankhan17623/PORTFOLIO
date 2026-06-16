import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import MagneticElement from './MagneticElement'
import { useScramble } from '../hooks/useScramble'
import { useSpotlight } from '../hooks/useSpotlight'

const tile = (delay = 0) => ({
  initial: { opacity: 0, y: 24, filter: 'blur(8px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.6, delay, type: 'spring', bounce: 0.25 },
  viewport: { once: true, margin: '-50px' },
})

export default function About() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const title1 = useScramble('ABOUT', { trigger: inView, speed: 35, delay: 100 })
  const title2 = useScramble('ME', { trigger: inView, speed: 35, delay: 300 })
  const spot = useSpotlight()

  return (
    <div className="section" ref={ref}>
      <motion.div {...tile()}>
        <div className="sec-badge">About Me</div>
        <h2 className="sec-title scramble-text">
          <span>{title1}</span> <span className="hl">{title2}</span>
        </h2>
        <p className="sec-sub">A little bit about who I am, what I build, and where I'm headed.</p>
      </motion.div>

      <div className="bento">
        {/* Intro — large tile */}
        <motion.div className="bento-card bento-intro spotlight" {...spot} {...tile(0.05)}>
          <span className="bento-tag">// whoami</span>
          <p className="about-bio">
            I'm <strong style={{ color: '#39ff14' }}>Faizan Khan</strong>, a passionate and self-driven
            <strong style={{ color: '#00f5ff' }}> Full Stack Developer</strong> with a strong foundation
            in the MERN stack. I thrive on turning ideas into fully functional, production-ready web
            applications — handling everything from UI design to backend architecture and deployment.
          </p>
          <p className="about-bio">
            I've independently built real-world projects like <strong style={{ color: '#00f5ff' }}>Cine Circuit</strong> and
            <strong style={{ color: '#39ff14' }}> StudyNotion</strong> — featuring multi-role dashboards, Razorpay
            payments, JWT auth, and Cloudinary media, built entirely from scratch.
          </p>
        </motion.div>

        {/* Avatar / logo tile */}
        <motion.div className="bento-card bento-avatar spotlight" {...spot} {...tile(0.12)}>
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="120" height="120">
              <rect x="30" y="30" width="140" height="100" fill="none" stroke="#39ff14" strokeWidth="2"/>
              <rect x="40" y="40" width="120" height="80" fill="#020904"/>
              <rect x="52" y="55" width="40" height="4" fill="#ff2d78"/>
              <rect x="98" y="55" width="25" height="4" fill="#00f5ff"/>
              <rect x="60" y="68" width="55" height="4" fill="#39ff14"/>
              <rect x="52" y="81" width="30" height="4" fill="#f5ff00"/>
              <rect x="88" y="81" width="45" height="4" fill="#ff2d78"/>
              <rect x="60" y="94" width="20" height="4" fill="#00f5ff"/>
              <rect x="90" y="130" width="20" height="25" fill="none" stroke="#39ff14" strokeWidth="2"/>
              <rect x="65" y="152" width="70" height="6" fill="none" stroke="#39ff14" strokeWidth="2"/>
              <rect x="52" y="106" width="8" height="4" fill="#39ff14" opacity="0.9"/>
            </svg>
          </motion.div>
        </motion.div>

        {/* Stat tiles */}
        {[
          ['5+', 'Projects Built', 0.18],
          ['15+', 'Technologies', 0.24],
        ].map(([n, label, d]) => (
          <motion.div key={label} className="bento-card bento-stat spotlight" {...spot} {...tile(d)}>
            <h4>{n}</h4>
            <p>{label}</p>
          </motion.div>
        ))}

        {/* Currently learning tile */}
        <motion.div className="bento-card bento-learning spotlight" {...spot} {...tile(0.3)} style={{ '--spot-color': '255, 45, 120' }}>
          <span className="bento-tag pink">// currently exploring</span>
          <p className="bento-learning-text">
            <strong style={{ color: '#ff2d78' }}>Generative AI</strong>, LLM integrations,
            <strong style={{ color: '#ff2d78' }}> RAG</strong> &amp; <strong style={{ color: '#ff2d78' }}>MCP</strong> —
            building smarter, context-aware applications.
          </p>
        </motion.div>

        {/* Status + CTA tile */}
        <motion.div className="bento-card bento-cta spotlight" {...spot} {...tile(0.36)} style={{ '--spot-color': '57, 255, 20' }}>
          <p className="ci-available"><span className="dot pulse" />Open to opportunities</p>
          <MagneticElement>
            <motion.button
              className="btn-glow primary interactive"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Let's Talk →
            </motion.button>
          </MagneticElement>
        </motion.div>
      </div>
    </div>
  )
}
