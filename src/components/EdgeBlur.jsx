import { useEffect, useState } from 'react'

// A progressive blur along the bottom edge of the screen, shown only while you scroll: content fades into a soft
// blur as it slides off the bottom instead of being cut off. It never rests over text, and it stays away from the
// footer and the pinned "profile scan" section, which have their own content at the bottom of the screen.
export default function EdgeBlur() {
  const [blocked, setBlocked] = useState(false)
  const [scrolling, setScrolling] = useState(false)

  useEffect(() => {
    const targets = document.querySelectorAll('.holo-wrap, .footer')
    if (!targets.length) return undefined
    const onScreen = new Set()
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) onScreen.add(entry.target); else onScreen.delete(entry.target) })
      setBlocked(onScreen.size > 0)
    })
    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let timer = 0
    const onScroll = () => {
      setScrolling(true)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setScrolling(false), 450)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); window.clearTimeout(timer) }
  }, [])

  return (
    <div className={`edge-blur${scrolling && !blocked ? ' is-active' : ''}`} aria-hidden="true">
      <i /><i /><i /><i /><i />
    </div>
  )
}
