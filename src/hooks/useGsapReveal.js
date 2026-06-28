import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * useGsapReveal — scroll-driven reveal for a group of elements, powered by
 * GSAP ScrollTrigger. Elements that scroll into view fade + slide + scale in.
 *
 * When `stagger` is set, all matched elements share a single ScrollTrigger and
 * cascade in one-by-one. Otherwise each element gets its own trigger and
 * reveals exactly as it crosses the viewport.
 *
 * Usage:
 *   const reveal = useGsapReveal('.reveal')
 *   <div ref={reveal}> ...children with class "reveal"... </div>
 *
 * Respects prefers-reduced-motion (no animation, elements stay visible).
 */
export function useGsapReveal(selector, opts = {}) {
  const ref = useRef(null)
  const {
    x = 0,            // horizontal slide distance (px). 0 = pure vertical.
    y = 48,           // vertical slide distance (px)
    scale = 0.92,     // starting scale (springs up to 1)
    duration = 0.85,
    stagger = 0.12,   // gap between elements when sharing a trigger
    start = 'top 85%',
    deps = [],
  } = opts

  useEffect(() => {
    const root = ref.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const all = selector
      ? Array.from(root.querySelectorAll(selector))
      : Array.from(root.children)
    // Skip elements that are: already revealed (so re-runs on async data don't
    // re-hide them), or currently collapsed/hidden (e.g. inside a closed
    // accordion) — animating those would leave them stuck invisible.
    const targets = all.filter(
      (el) =>
        !el.dataset.revealed && el.offsetParent !== null && el.offsetHeight > 0
    )
    if (!targets.length) return
    targets.forEach((el) => { el.dataset.revealed = '1' })

    const triggers = []

    // Wait one frame so the DOM has painted and positions are correct.
    const raf = requestAnimationFrame(() => {
      const from = { autoAlpha: 0, y, x, scale }
      const to = {
        autoAlpha: 1,
        y: 0,
        x: 0,
        scale: 1,
        duration,
        ease: 'power3.out',
      }

      if (stagger) {
        // One shared trigger: the group cascades in as it enters the viewport.
        const tween = gsap.fromTo(targets, from, {
          ...to,
          stagger,
          scrollTrigger: {
            trigger: targets[0],
            start,
            toggleActions: 'play none none none',
          },
        })
        if (tween.scrollTrigger) triggers.push(tween.scrollTrigger)
      } else {
        // Per-element triggers: each reveals exactly when it scrolls in.
        targets.forEach((el) => {
          const tween = gsap.fromTo(el, from, {
            ...to,
            scrollTrigger: {
              trigger: el,
              start,
              toggleActions: 'play none none none',
            },
          })
          if (tween.scrollTrigger) triggers.push(tween.scrollTrigger)
        })
      }
      ScrollTrigger.refresh()
    })

    return () => {
      cancelAnimationFrame(raf)
      triggers.forEach((t) => t.kill())
      gsap.killTweensOf(targets)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector, x, y, scale, duration, stagger, start, ...deps])

  return ref
}
