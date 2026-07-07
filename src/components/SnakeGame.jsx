import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { unlock } from '../lib/achievements'
import { sfx } from '../lib/sound'

const COLS = 24
const ROWS = 16
const CELL = 22
const HS_KEY = 'ff_snake_hs'

const DIRS = {
  arrowup: { x: 0, y: -1 }, w: { x: 0, y: -1 },
  arrowdown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
  arrowleft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
  arrowright: { x: 1, y: 0 }, d: { x: 1, y: 0 },
}

function placeFood(g) {
  let spot
  do {
    spot = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
  } while (g.snake.some(s => s.x === spot.x && s.y === spot.y))
  g.food = spot
}

// Hidden arcade — neon Snake, opened via a `game:snake` window event
// (terminal `play` command or the palette's Classified section).
export default function SnakeGame() {
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState('ready') // ready | playing | over
  const [score, setScore] = useState(0)
  const [high, setHigh] = useState(() => {
    try { return Number(localStorage.getItem(HS_KEY)) || 0 } catch { return 0 }
  })
  const [isNewHigh, setIsNewHigh] = useState(false)
  const canvasRef = useRef(null)
  const gameRef = useRef(null)
  const touchRef = useRef(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const css = getComputedStyle(document.documentElement)
    const green = css.getPropertyValue('--neon-green').trim() || '#39ff14'
    const pink = css.getPropertyValue('--neon-pink').trim() || '#ff2d78'

    ctx.fillStyle = '#04070a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)'
    for (let i = 1; i < COLS; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, ROWS * CELL); ctx.stroke()
    }
    for (let j = 1; j < ROWS; j++) {
      ctx.beginPath(); ctx.moveTo(0, j * CELL); ctx.lineTo(COLS * CELL, j * CELL); ctx.stroke()
    }

    const g = gameRef.current
    if (!g) return
    ctx.shadowColor = pink
    ctx.shadowBlur = 14
    ctx.fillStyle = pink
    ctx.fillRect(g.food.x * CELL + 4, g.food.y * CELL + 4, CELL - 8, CELL - 8)
    ctx.shadowColor = green
    ctx.shadowBlur = 10
    g.snake.forEach((s, i) => {
      ctx.fillStyle = green
      ctx.globalAlpha = i === 0 ? 1 : Math.max(0.35, 1 - i * 0.04)
      ctx.fillRect(s.x * CELL + 1.5, s.y * CELL + 1.5, CELL - 3, CELL - 3)
    })
    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
  }, [])

  const start = useCallback(() => {
    const g = {
      snake: [{ x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }],
      dir: { x: 1, y: 0 },
      queue: [],
      food: null,
      score: 0,
    }
    placeFood(g)
    gameRef.current = g
    sfx.coin()
    setScore(0)
    setIsNewHigh(false)
    setPhase('playing')
  }, [])

  const steer = useCallback((d) => {
    const g = gameRef.current
    if (!g || g.queue.length >= 3) return
    const last = g.queue.length ? g.queue[g.queue.length - 1] : g.dir
    if (d.x === -last.x && d.y === -last.y) return // no 180° turns
    g.queue.push(d)
  }, [])

  useEffect(() => {
    const onOpen = () => {
      unlock('arcade_rat')
      gameRef.current = null
      setPhase('ready')
      setOpen(true)
    }
    window.addEventListener('game:snake', onOpen)
    return () => window.removeEventListener('game:snake', onOpen)
  }, [])

  // Paint the empty board as soon as the window mounts.
  useEffect(() => {
    if (open) requestAnimationFrame(draw)
  }, [open, draw])

  // Game loop — a setTimeout chain so the speed can ramp with the score.
  useEffect(() => {
    if (phase !== 'playing') return
    let timer
    const tick = () => {
      const g = gameRef.current
      if (g.queue.length) g.dir = g.queue.shift()
      const head = { x: g.snake[0].x + g.dir.x, y: g.snake[0].y + g.dir.y }
      const dead =
        head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS ||
        g.snake.some(s => s.x === head.x && s.y === head.y)
      if (dead) {
        sfx.gameOver()
        if (g.score > high) {
          setHigh(g.score)
          setIsNewHigh(true)
          try { localStorage.setItem(HS_KEY, String(g.score)) } catch { /* ignore */ }
        }
        setPhase('over')
        return
      }
      g.snake.unshift(head)
      if (head.x === g.food.x && head.y === g.food.y) {
        sfx.eat()
        g.score++
        setScore(g.score)
        if (g.score >= 15) unlock('snake_charmer')
        placeFood(g)
      } else {
        g.snake.pop()
      }
      draw()
      timer = setTimeout(tick, Math.max(70, 140 - g.score * 4))
    }
    draw()
    timer = setTimeout(tick, 140)
    return () => clearTimeout(timer)
  }, [phase, high, draw])

  // Capture-phase key handling so arrows don't scroll the page or feed the
  // Konami listener / terminal shortcut while the game is up.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      e.stopPropagation()
      const k = e.key.toLowerCase()
      if (k === 'escape') { setOpen(false); return }
      if (phase !== 'playing') {
        if (k === ' ' || k === 'enter' || k === 'r') { e.preventDefault(); start() }
        return
      }
      const d = DIRS[k]
      if (d) { e.preventDefault(); steer(d) }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open, phase, start, steer])

  const onTouchStart = (e) => {
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const onTouchEnd = (e) => {
    if (phase !== 'playing') { start(); return }
    const t = touchRef.current
    if (!t) return
    const dx = e.changedTouches[0].clientX - t.x
    const dy = e.changedTouches[0].clientY - t.y
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return
    steer(Math.abs(dx) > Math.abs(dy)
      ? { x: Math.sign(dx), y: 0 }
      : { x: 0, y: Math.sign(dy) })
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="snake-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <motion.div
            className="snake-window"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            <div className="snake-titlebar">
              <span className="snake-title">👾 SNAKE.EXE</span>
              <span className="snake-hud">SCORE {String(score).padStart(2, '0')} · HI {String(high).padStart(2, '0')}</span>
              <kbd className="snake-esc" onClick={() => setOpen(false)}>ESC quit</kbd>
            </div>
            <div className="snake-stage">
              <canvas ref={canvasRef} width={COLS * CELL} height={ROWS * CELL} />
              {phase === 'ready' && (
                <div className="snake-msg">
                  <span className="snake-msg-title">INSERT COIN</span>
                  <span className="snake-msg-sub">SPACE / tap to start · arrows or WASD to steer</span>
                </div>
              )}
              {phase === 'over' && (
                <div className="snake-msg">
                  <span className="snake-msg-title">GAME OVER</span>
                  <span className="snake-msg-sub">
                    score {score}{isNewHigh && ' — ⚡ NEW HIGH SCORE'}
                  </span>
                  <span className="snake-msg-sub">R / SPACE to retry · ESC to quit</span>
                </div>
              )}
            </div>
            <div className="snake-foot">beat 15 for a trophy 🐍 — beat my high score? screenshot it &amp; email me 😏</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
