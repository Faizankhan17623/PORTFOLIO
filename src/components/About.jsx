import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import MagneticElement from './MagneticElement'
import { useScramble } from '../hooks/useScramble'

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 28, filter: 'blur(10px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.8, delay, type: 'spring', bounce: 0.4 },
  viewport: { once: true, margin: '-50px' },
})

export default function About() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const title1 = useScramble('ABOUT', { trigger: inView, speed: 35, delay: 100 })
  const title2 = useScramble('ME', { trigger: inView, speed: 35, delay: 300 })

  return (
    <div className="section" ref={ref}>
      <motion.div {...fade()}>
        <div className="sec-badge">about_me.json</div>
        <h2 className="sec-title scramble-text">
          <span>{title1}</span> <span className="hl">{title2}</span>
        </h2>
        <p className="sec-sub">A little bit about who I am, what I build, and where I'm headed.</p>
      </motion.div>

      <div className="about-wrap">
        <motion.div
          className="about-avatar corner-box corner-box-inner"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: [-5, 5, -5] }}
          transition={{
             opacity: { duration: 0.6, delay: 0.1 },
             y: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
          }}
          viewport={{ once: true }}
        >
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="140" height="140">
            {/* Monitor */}
            <rect x="30" y="30" width="140" height="100" rx="0" fill="none" stroke="#39ff14" strokeWidth="2"/>
            <rect x="40" y="40" width="120" height="80" rx="0" fill="#020904"/>
            {/* Code lines */}
            <rect x="52" y="55" width="40" height="4" rx="0" fill="#ff2d78"/>
            <rect x="98" y="55" width="25" height="4" rx="0" fill="#00f5ff"/>
            <rect x="60" y="68" width="55" height="4" rx="0" fill="#39ff14"/>
            <rect x="52" y="81" width="30" height="4" rx="0" fill="#f5ff00"/>
            <rect x="88" y="81" width="45" height="4" rx="0" fill="#ff2d78"/>
            <rect x="60" y="94" width="20" height="4" rx="0" fill="#00f5ff"/>
            {/* Stand */}
            <rect x="90" y="130" width="20" height="25" rx="0" fill="none" stroke="#39ff14" strokeWidth="2"/>
            <rect x="65" y="152" width="70" height="6" rx="0" fill="none" stroke="#39ff14" strokeWidth="2"/>
            {/* Cursor blink */}
            <rect x="52" y="106" width="8" height="4" rx="0" fill="#39ff14" opacity="0.9"/>
          </svg>
        </motion.div>

        <div>
          <motion.p {...fade(0.2)} className="about-bio">
            I'm <strong style={{ color: '#39ff14' }}>Faizan Khan</strong>, a passionate and self-driven
            <strong style={{ color: '#00f5ff' }}> Full Stack Developer</strong> with a strong foundation
            in the MERN stack. I thrive on turning ideas into fully functional, production-ready web
            applications — handling everything from UI design to backend architecture and deployment.
          </motion.p>
          <motion.p {...fade(0.28)} className="about-bio">
            I have independently built real-world projects like <strong style={{ color: '#00f5ff' }}>Cine Circuit</strong> (a
            full-stack movie ticketing platform) and <strong style={{ color: '#39ff14' }}>StudyNotion</strong> (an
            EdTech platform) — both featuring multi-role dashboards, Razorpay payment integration,
            JWT authentication, and Cloudinary media management, built entirely from scratch.
          </motion.p>
          <motion.p {...fade(0.35)} className="about-bio">
            I'm a quick learner who stays ahead of the curve — currently exploring
            <strong style={{ color: '#ff2d78' }}> Generative AI, LLM integrations, and MCP</strong> to
            build smarter, context-aware applications. I'm actively seeking opportunities where I can
            contribute, grow, and make a real impact from day one.
          </motion.p>

          <motion.div 
            className="about-stats"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.15, delayChildren: 0.3 } }
            }}
          >
            {[
              ['5+', 'Projects Built'],
              ['15+', 'Technologies'],
              ['🚀', 'Open to Work'],
            ].map(([n, label]) => (
              <motion.div 
                key={label} 
                className="stat-item"
                variants={{
                  hidden: { opacity: 0, scale: 0.8, y: 20 },
                  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
                }}
              >
                <h4>{n}</h4>
                <p>{label}</p>
              </motion.div>
            ))}
          </motion.div>

          <MagneticElement>
            <motion.button
              {...fade(0.5)}
              className="btn-glow primary interactive"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Let's Talk →
            </motion.button>
          </MagneticElement>
        </div>
      </div>
    </div>
  )
}
