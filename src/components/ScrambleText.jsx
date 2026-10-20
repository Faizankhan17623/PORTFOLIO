import { useEffect, useRef } from 'react'
import { onLoaderDone } from '../lib/loader'
import { prefersReducedMotion } from '../lib/motion'

const LETTERS = 'abcdefghijklmnopqrstuvwxyz'

// Text that starts as a jumble of letters and settles into the real words, one character at a time.
// It waits for the opening loader to lift. Screen readers always get the real text.
export default function ScrambleText({ text, delay = 0.5, duration = 1.1 }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return undefined
    let raf = 0
    let timer = 0
    const jumble = (progress) => [...text].map((char, i) => {
      if (char === ' ' || char === '/' || i < progress * text.length) return char
      return LETTERS[Math.floor(Math.random() * LETTERS.length)]
    }).join('')

    el.textContent = jumble(0)
    const stopWaiting = onLoaderDone(() => {
      timer = window.setTimeout(() => {
        const start = performance.now()
        const tick = (now) => {
          const progress = Math.min(1, (now - start) / (duration * 1000))
          el.textContent = progress >= 1 ? text : jumble(progress)
          if (progress < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      }, delay * 1000)
    })
    return () => {
      stopWaiting()
      window.clearTimeout(timer)
      cancelAnimationFrame(raf)
      el.textContent = text
    }
  }, [text, delay, duration])

  return (
    <span aria-label={text}>
      <span ref={ref} aria-hidden="true">{text}</span>
    </span>
  )
}
