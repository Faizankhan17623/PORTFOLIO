import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '../lib/motion'

gsap.registerPlugin(ScrollTrigger)

// Wraps every word inside `el` (keeping <em>, <span> and <br> as they are) so it can slide up from a mask.
function splitWords(el) {
  const existing = el.querySelectorAll('.w-in')
  if (existing.length) return Array.from(existing)

  const words = []
  const walk = (node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) { walk(child); return }
      if (child.nodeType !== Node.TEXT_NODE || !child.textContent.trim()) return
      const fragment = document.createDocumentFragment()
      child.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return
        if (/^\s+$/.test(part)) { fragment.appendChild(document.createTextNode(part)); return }
        const mask = document.createElement('span')
        mask.className = 'w-mask'
        const inner = document.createElement('span')
        inner.className = 'w-in'
        inner.textContent = part
        mask.appendChild(inner)
        fragment.appendChild(mask)
        words.push(inner)
      })
      child.replaceWith(fragment)
    })
  }
  walk(el)
  return words
}

// Headings slide up word by word as they scroll into view.
export function useWordReveal(selector) {
  useEffect(() => {
    if (prefersReducedMotion()) return undefined
    const ctx = gsap.context(() => {
      document.querySelectorAll(selector).forEach((el) => {
        const words = splitWords(el)
        if (!words.length) return
        gsap.set(words, { yPercent: 118 })
        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          once: true,
          onEnter: () => gsap.to(words, { yPercent: 0, duration: 0.95, ease: 'power4.out', stagger: 0.07 }),
        })
      })
    })
    return () => ctx.revert()
  }, [selector])
}
