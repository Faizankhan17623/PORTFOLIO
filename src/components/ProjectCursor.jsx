import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/motion'

// A soft ring that trails the mouse. It grows over links and buttons, and turns into a labelled bubble
// (for example "Live ↗") over anything marked with data-cursor="label". Mouse only: it is skipped on touch screens.
export default function ProjectCursor() {
  const bubbleRef = useRef(null)
  const labelRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches || prefersReducedMotion()) return undefined
    const bubble = bubbleRef.current
    const label = labelRef.current
    if (!bubble || !label) return undefined

    const pos = { x: 0, y: 0, tx: 0, ty: 0 }
    let raf = 0
    let shown = false

    const loop = () => {
      pos.x += (pos.tx - pos.x) * 0.22
      pos.y += (pos.ty - pos.y) * 0.22
      bubble.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`
      raf = Math.abs(pos.tx - pos.x) + Math.abs(pos.ty - pos.y) > 0.3 ? requestAnimationFrame(loop) : 0
    }
    const onMove = (event) => {
      pos.tx = event.clientX
      pos.ty = event.clientY
      if (!shown) {
        shown = true
        pos.x = pos.tx
        pos.y = pos.ty
        bubble.classList.add('is-visible')
      }
      if (!raf) raf = requestAnimationFrame(loop)
    }
    const onOver = (event) => {
      const el = event.target instanceof Element ? event.target : null
      const interactive = el?.closest('a, button, input, textarea, select, label')
      const labelled = el?.closest('[data-cursor]')
      const mode = interactive ? 'link' : labelled ? 'label' : ''
      bubble.dataset.mode = mode
      label.textContent = mode === 'label' ? labelled.dataset.cursor : ''
    }
    const onLeave = () => { shown = false; bubble.classList.remove('is-visible') }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return <div className="cursor-bubble" ref={bubbleRef} aria-hidden="true"><span ref={labelRef} /></div>
}
