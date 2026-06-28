import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * useGsapTitle — word-by-word reveal for a section heading. Splits the heading's
 * text into words, then sweeps them up into place (clip + slide) as the heading
 * scrolls into view. Attach the returned ref to the heading element.
 *
 * Respects prefers-reduced-motion (heading stays as-is, no split).
 */
export function useGsapTitle(opts = {}) {
  const ref = useRef(null)
  const { start = 'top 85%', stagger = 0.08, deps = [] } = opts

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (el.dataset.titleRevealed) return
    el.dataset.titleRevealed = '1'

    // Wrap each top-level child (and bare text nodes) in an inline-block span so
    // we can animate them without disturbing inline highlight (.hl) styling.
    const pieces = []
    el.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const words = node.textContent.split(/(\s+)/)
        const frag = document.createDocumentFragment()
        words.forEach((w) => {
          if (w.trim() === '') {
            frag.appendChild(document.createTextNode(w))
          } else {
            const span = document.createElement('span')
            span.textContent = w
            span.style.display = 'inline-block'
            frag.appendChild(span)
            pieces.push(span)
          }
        })
        el.replaceChild(frag, node)
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        node.style.display = 'inline-block'
        pieces.push(node)
      }
    })

    if (!pieces.length) return

    const tween = gsap.from(pieces, {
      yPercent: 120,
      autoAlpha: 0,
      rotateX: -40,
      transformOrigin: '50% 100%',
      duration: 0.7,
      ease: 'power3.out',
      stagger,
      scrollTrigger: { trigger: el, start, toggleActions: 'play none none none' },
    })
    ScrollTrigger.refresh()

    return () => {
      tween.scrollTrigger && tween.scrollTrigger.kill()
      tween.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, stagger, ...deps])

  return ref
}
