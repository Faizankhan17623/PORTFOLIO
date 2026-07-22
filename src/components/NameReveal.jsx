import { useEffect, useRef } from 'react'

// Cursor-driven reveal: "FAIZAN KHAN" sits as the base layer; moving the
// mouse across it wipes a trail that reveals a hidden matrix-styled line
// underneath. Same canvas-compositing trick as a classic image-reveal
// effect, but drawing text instead of two images.
const BASE_TEXT = 'FAIZAN KHAN'
const REVEAL_TEXT = 'BUILT DIFFERENT'
const TRAIL_LENGTH = 26
const HEAD_RADIUS = 70

export default function NameReveal() {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')

    const off = document.createElement('canvas')
    const offc = off.getContext('2d')

    const DPR = Math.min(window.devicePixelRatio || 1, 2)
    const mouse = { x: -9999, y: -9999 }
    const smooth = { x: -9999, y: -9999 }
    let trail = []
    let raf

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function resize() {
      const w = wrap.offsetWidth
      const h = wrap.offsetHeight
      canvas.width = w * DPR
      canvas.height = h * DPR
      off.width = w * DPR
      off.height = h * DPR
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
      offc.setTransform(DPR, 0, 0, DPR, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    function handleMove(e) {
      const r = wrap.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
    }
    function handleLeave() {
      mouse.x = -9999
      mouse.y = -9999
    }
    function handleTouch(e) {
      const r = wrap.getBoundingClientRect()
      const t = e.touches[0]
      mouse.x = t.clientX - r.left
      mouse.y = t.clientY - r.top
    }
    wrap.addEventListener('mousemove', handleMove)
    wrap.addEventListener('mouseleave', handleLeave)
    wrap.addEventListener('touchmove', handleTouch, { passive: true })

    function fontFor(w) {
      const size = Math.max(38, Math.min(w * 0.098, 68))
      return { size, font: `700 ${size}px 'Rajdhani', sans-serif` }
    }

    function draw() {
      const w = wrap.offsetWidth
      const h = wrap.offsetHeight
      const { size, font } = fontFor(w)

      smooth.x += (mouse.x - smooth.x) * 0.18
      smooth.y += (mouse.y - smooth.y) * 0.18

      trail.unshift({ x: smooth.x, y: smooth.y })
      if (trail.length > TRAIL_LENGTH) trail.length = TRAIL_LENGTH

      ctx.clearRect(0, 0, w, h)
      ctx.font = font
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#e8f4f0'
      ctx.fillText(BASE_TEXT, 2, h / 2)

      offc.clearRect(0, 0, w, h)
      offc.globalCompositeOperation = 'source-over'
      for (let i = 0; i < trail.length; i++) {
        const t = 1 - i / trail.length
        const r = HEAD_RADIUS * (0.2 + 0.8 * t)
        const alpha = Math.pow(t, 1.4)
        offc.beginPath()
        offc.arc(trail[i].x, trail[i].y, r, 0, Math.PI * 2)
        offc.fillStyle = `rgba(0,0,0,${alpha})`
        offc.fill()
      }
      offc.globalCompositeOperation = 'source-in'
      offc.font = font
      offc.textBaseline = 'middle'
      offc.fillStyle = '#39ff14'
      offc.shadowColor = 'rgba(57,255,20,0.85)'
      offc.shadowBlur = 18
      offc.fillText(REVEAL_TEXT.length * (size * 0.56) > w ? BASE_TEXT : REVEAL_TEXT, 2, h / 2)
      offc.shadowBlur = 0

      ctx.drawImage(off, 0, 0, w, h)

      if (trail.length && mouse.x > -9000) {
        const head = trail[0]
        const glow = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, HEAD_RADIUS * 1.3)
        glow.addColorStop(0, 'rgba(57,255,20,0.25)')
        glow.addColorStop(1, 'rgba(57,255,20,0)')
        ctx.beginPath()
        ctx.arc(head.x, head.y, HEAD_RADIUS * 1.3, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    if (reduced) {
      const w = wrap.offsetWidth
      const h = wrap.offsetHeight
      const { font } = fontFor(w)
      ctx.font = font
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#e8f4f0'
      ctx.fillText(BASE_TEXT, 2, h / 2)
    } else {
      draw()
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      wrap.removeEventListener('mousemove', handleMove)
      wrap.removeEventListener('mouseleave', handleLeave)
      wrap.removeEventListener('touchmove', handleTouch)
    }
  }, [])

  return (
    <div className="name-reveal" ref={wrapRef}>
      <canvas ref={canvasRef} className="name-reveal-canvas" aria-hidden="true" />
      <span className="name-reveal-sr">{BASE_TEXT}</span>
    </div>
  )
}
