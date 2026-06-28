import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import MagneticElement from './MagneticElement'
import { useScramble } from '../hooks/useScramble'
import { useSpotlight } from '../hooks/useSpotlight'
import { useGsapReveal } from '../hooks/useGsapReveal'

export default function About() {
  const ref = useRef(null)
  const revealRef = useGsapReveal('.reveal')
  const avatarRef = useRef(null)
  const [inView, setInView] = useState(false)
  const title1 = useScramble('ABOUT', { trigger: inView, speed: 35, delay: 100 })
  const title2 = useScramble('ME', { trigger: inView, speed: 35, delay: 300 })
  const spot = useSpotlight()

  // Trigger the title scramble when the section scrolls into view.
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

  // Gentle floating loop for the avatar (replaces the old Framer loop).
  useEffect(() => {
    if (!avatarRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const tween = gsap.to(avatarRef.current, {
      y: 8,
      duration: 2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })
    return () => tween.kill()
  }, [])

  return (
    <div className="section" ref={ref}>
      <div ref={revealRef}>
        <div className="reveal">
          <div className="sec-badge">About Me</div>
          <h2 className="sec-title scramble-text">
            <span>{title1}</span> <span className="hl">{title2}</span>
          </h2>
          <p className="sec-sub">A little bit about who I am, what I build, and where I'm headed.</p>
        </div>

        <div className="bento">
          {/* Intro — large tile */}
          <div className="bento-card bento-intro spotlight reveal" {...spot}>
            <span className="bento-tag">// whoami</span>
            <p className="about-bio">
              I'm <strong style={{ color: '#39ff14' }}>Faizan Khan</strong>, a
              <strong style={{ color: '#00f5ff' }}> Full Stack Developer</strong> who builds for the web with the
              MERN stack. I like owning a product end-to-end — designing the interface, writing the API,
              modelling the data, and shipping it to production.
            </p>
            <p className="about-bio">
              So far I've built <strong style={{ color: '#39ff14' }}>11+ projects</strong> on my own, and I care
              about the parts that are actually hard: real payments with <strong style={{ color: '#00f5ff' }}>Razorpay</strong>,
              secure <strong style={{ color: '#00f5ff' }}>JWT &amp; OTP auth</strong>, role-based dashboards, and a
              <strong style={{ color: '#ff2d78' }}> RAG pipeline</strong> with streaming AI responses in
              <strong style={{ color: '#ff2d78' }}> Personal GPT</strong>.
            </p>
            <p className="about-bio">
              I'm just as happy outside the MERN box — a 3D <strong style={{ color: '#00f5ff' }}>GTA-style game</strong>
              in Three.js and a real-time <strong style={{ color: '#39ff14' }}>computer-vision</strong> app are some
              of my favourite things I've built. I learn fast, sweat the details, and ship.
            </p>
          </div>

          {/* Avatar / logo tile */}
          <div className="bento-card bento-avatar spotlight reveal" {...spot}>
            <div ref={avatarRef}>
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
            </div>
          </div>

          {/* Stat tiles */}
          {[
            ['11+', 'Projects Built'],
            ['25+', 'Technologies'],
          ].map(([n, label]) => (
            <div key={label} className="bento-card bento-stat spotlight reveal" {...spot}>
              <h4>{n}</h4>
              <p>{label}</p>
            </div>
          ))}

          {/* Currently learning tile */}
          <div className="bento-card bento-learning spotlight reveal" {...spot} style={{ '--spot-color': '255, 45, 120' }}>
            <span className="bento-tag pink">// currently exploring</span>
            <p className="bento-learning-text">
              <strong style={{ color: '#ff2d78' }}>Generative AI</strong>, LLM integrations,
              <strong style={{ color: '#ff2d78' }}> RAG</strong> &amp; <strong style={{ color: '#ff2d78' }}>MCP</strong> —
              building smarter, context-aware applications.
            </p>
          </div>

          {/* Status + CTA tile */}
          <div className="bento-card bento-cta spotlight reveal" {...spot} style={{ '--spot-color': '57, 255, 20' }}>
            <p className="ci-available"><span className="dot pulse" />Open to opportunities</p>
            <MagneticElement>
              <button
                className="btn-glow primary interactive"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Let's Talk →
              </button>
            </MagneticElement>
          </div>
        </div>
      </div>
    </div>
  )
}
