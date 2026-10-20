import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from '../lib/motion'

const SPACING = 120 // pixels the cursor must travel before the next thumbnail appears
const MAX_ALIVE = 7

// While you move the mouse over the projects, small thumbnails of the project cards (same colours and letters
// as each card's artwork) drop behind the cursor and fade away.
export default function ImageTrail() {
  const layerRef = useRef(null)

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || prefersReducedMotion()) return undefined
    const layer = layerRef.current
    if (!layer) return undefined

    let last = null
    let next = 0
    const onMove = (event) => {
      const inside = event.target instanceof Element && event.target.closest('.projects-grid')
      if (!inside) { last = null; return }
      if (last && Math.hypot(event.clientX - last.x, event.clientY - last.y) < SPACING) return
      last = { x: event.clientX, y: event.clientY }

      const cards = document.querySelectorAll('.projects-grid .project-card')
      if (!cards.length) return
      const card = cards[next % cards.length]
      next += 1
      const art = card.querySelector('.project-art')
      const word = card.querySelector('.project-art-word')?.textContent
      if (!art || !word) return
      const style = getComputedStyle(art)

      while (layer.children.length >= MAX_ALIVE) layer.firstElementChild?.remove()
      const item = document.createElement('div')
      item.className = 'trail-item'
      item.textContent = word
      item.style.background = style.backgroundColor
      item.style.color = style.color
      item.style.left = `${event.clientX}px`
      item.style.top = `${event.clientY}px`
      layer.appendChild(item)
      gsap.timeline({ onComplete: () => item.remove() })
        .fromTo(item, { scale: 0.4, opacity: 0, rotate: gsap.utils.random(-14, 14) }, { scale: 1, opacity: 1, duration: 0.28, ease: 'back.out(2)' })
        .to(item, { opacity: 0, scale: 0.86, y: -16, duration: 0.55, ease: 'power2.in' }, '+=0.25')
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      layer.replaceChildren()
    }
  }, [])

  return <div className="img-trail" ref={layerRef} aria-hidden="true" />
}
