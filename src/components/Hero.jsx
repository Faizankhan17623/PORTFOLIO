import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

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

    const N = 65
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 1.4 + 0.5,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(168,85,247,0.55)'
        ctx.fill()
      })
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y)
          if (d < 130) {
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.strokeStyle = `rgba(168,85,247,${0.22 * (1 - d / 130)})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={ref} className="hero-canvas" />
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

          <motion.h1
            className="hero-name"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38, duration: 0.7 }}
          >
            Hi, I'm<br />
            <span className="gradient">Faizan Khan</span>
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
            <button
              className="btn-glow primary"
              onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View My Work ↓
            </button>
            <button
              className="btn-glow outline"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Contact Me
            </button>
          </motion.div>
        </div>

        {/* ── Right: Terminal ── */}
        <motion.div
          className="hero-terminal"
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
        >
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
        </motion.div>

      </div>
    </div>
  )
}
