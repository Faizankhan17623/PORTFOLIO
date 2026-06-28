import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * useGsapParallax — ties an element's vertical position to scroll (scrub), so it
 * drifts as the section moves through the viewport. Attach the returned ref to
 * the element you want to parallax.
 *
 *   distance  total px of drift across the scroll range (negative = upward)
 *
 * Respects prefers-reduced-motion (no movement).
 */
export function useGsapParallax(opts = {}) {
  const ref = useRef(null)
  const { distance = -120, start = 'top bottom', end = 'bottom top', deps = [] } = opts

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const tween = gsap.to(el, {
      y: distance,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start,
        end,
        scrub: true,
      },
    })
    ScrollTrigger.refresh()

    return () => {
      tween.scrollTrigger && tween.scrollTrigger.kill()
      tween.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [distance, start, end, ...deps])

  return ref
}
