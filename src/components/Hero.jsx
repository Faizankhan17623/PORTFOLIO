import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import MagneticElement from './MagneticElement'
import TiltCard from './TiltCard'

const ROLES = [
  'Full Stack Developer',
  'MERN Stack Developer',
  'React Developer',
  'Node.js Engineer',
]

function useTypewriter(words) {
  const [text, setText] = useState('')
  const [idx, setIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const word = words[idx]
    const speed = deleting ? 38 : 82
    const timer = setTimeout(() => {
      if (!deleting) {
        const next = word.slice(0, text.length + 1)
        setText(next)
        if (next === word) {
          setPaused(true)
          setTimeout(() => { setPaused(false); setDeleting(true) }, 1800)
        }
      } else {
        const next = word.slice(0, text.length - 1)
        setText(next)
        if (next === '') {
          setDeleting(false)
          setIdx(i => (i + 1) % words.length)
        }
      }
    }, speed)
    return () => clearTimeout(timer)
  }, [text, deleting, idx, paused, words])

  return text
}

function ParticleCanvas() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Mouse interaction
    let mouse = { x: null, y: null, radius: 150 }
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    const handleMouseLeave = () => {
      mouse.x = null
      mouse.y = null
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    const N = 80 // Increased particle count slightly for better effect
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.6, // Slightly faster
      vy: (Math.random() - 0.5) * 0.6,
      r: Math.random() * 1.8 + 0.8, // Slightly larger
      baseX: 0,
      baseY: 0
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy
        
        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        // Mouse interaction (repel)
        if (mouse.x != null && mouse.y != null) {
          let dx = mouse.x - p.x
          let dy = mouse.y - p.y
          let distance = Math.hypot(dx, dy)
          
          if (distance < mouse.radius) {
            const forceDirectionX = dx / distance
            const forceDirectionY = dy / distance
            const force = (mouse.radius - distance) / mouse.radius
            const directionX = forceDirectionX * force * -2 // Push away
            const directionY = forceDirectionY * force * -2
            
            p.x += directionX
            p.y += directionY
          }
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(168, 85, 247, 0.7)' // Brighter dot
        ctx.fill()
      })
      
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y)
          if (d < 140) {
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            // Gradient lines depending on distance
            const opacity = 0.3 * (1 - d / 140)
            ctx.strokeStyle = `rgba(34, 211, 238, ${opacity})` // Cyan lines for contrast
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { 
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return <canvas ref={ref} className="hero-canvas" style={{ pointerEvents: 'none' }} />
}

export default function Hero() {
  const role = useTypewriter(ROLES)

  return (
    <div className="hero">
      <ParticleCanvas />
      <div className="hero-inner">

        {/* ── Left ── */}
        <div>
          <motion.div
            className="hero-tag"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            <span className="dot" /> Available for opportunities
          </motion.div>

          <motion.h1 className="hero-name">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Hi, I'm<br />
            </motion.span>
            <motion.span
              className="gradient"
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.4, duration: 0.6, type: 'spring' }}
            >
              Faizan Khan
            </motion.span>
          </motion.h1>

          <motion.div
            className="hero-role"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          >
            <span className="prompt">{'>'}</span>
            <span>{role}</span>
            <span className="cursor" />
          </motion.div>

          <motion.p
            className="hero-desc"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.72 }}
          >
            I build fast, beautiful, production-ready web applications end-to-end.
            React on the front, Node.js & MongoDB on the back — from idea to deployment.
          </motion.p>

          <motion.div
            className="hero-btns"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.88 }}
          >
            <MagneticElement>
              <button
                className="btn-glow primary"
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View My Work ↓
              </button>
            </MagneticElement>
            <MagneticElement>
              <button
                className="btn-glow outline"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Contact Me
              </button>
            </MagneticElement>
          </motion.div>
        </div>

        {/* ── Right: Terminal ── */}
        <motion.div
          initial={{ opacity: 0, x: 40, y: 0 }} 
          animate={{ 
            opacity: 1, 
            x: 0, 
            y: [-8, 8, -8] 
          }}
          transition={{ 
            opacity: { delay: 0.5, duration: 0.8, ease: 'easeOut' },
            x: { delay: 0.5, duration: 0.8, ease: 'easeOut' },
            y: { duration: 5, repeat: Infinity, ease: 'easeInOut' } 
          }}
        >
          <TiltCard className="hero-terminal">
            <div className="terminal-bar">
              <div className="t-dot r" /><div className="t-dot y" /><div className="t-dot g" />
              <span className="t-filename">developer.config.js</span>
            </div>
            <div className="terminal-body">
              <span><span className="t-p">const</span> <span className="t-c">developer</span> <span className="t-w">= &#123;</span></span>
              <span className="t-i"><span className="t-g">name</span><span className="t-w">: </span><span className="t-o">"Faizan Khan"</span><span className="t-w">,</span></span>
              <span className="t-i"><span className="t-g">role</span><span className="t-w">: </span><span className="t-o">"Full Stack Developer"</span><span className="t-w">,</span></span>
              <span className="t-i"><span className="t-g">stack</span><span className="t-w">: [</span></span>
              <span className="t-i2"><span className="t-o">"React"</span><span className="t-w">, </span><span className="t-o">"Node.js"</span><span className="t-w">, </span><span className="t-o">"MongoDB"</span><span className="t-w">,</span></span>
              <span className="t-i2"><span className="t-o">"Express"</span><span className="t-w">, </span><span className="t-o">"JavaScript"</span></span>
              <span className="t-i"><span className="t-w">],</span></span>
              <span className="t-i"><span className="t-g">passion</span><span className="t-w">: </span><span className="t-o">"Building cool stuff"</span><span className="t-w">,</span></span>
              <span className="t-i"><span className="t-g">openToWork</span><span className="t-w">: </span><span className="t-c">true</span><span className="t-w">,</span></span>
              <span className="t-i"><span className="t-g">coffee</span><span className="t-w">: </span><span className="t-o">"always"</span></span>
              <span><span className="t-w">&#125;</span></span>
            </div>
          </TiltCard>
        </motion.div>

      </div>
    </div>
  )
}
