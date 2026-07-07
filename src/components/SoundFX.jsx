import { useEffect } from 'react'
import { sfx } from '../lib/sound'

// Site-wide hover/click sounds via event delegation — one pair of listeners
// covers every button, link and .interactive element without touching them.
export default function SoundFX() {
  useEffect(() => {
    let lastHover = null
    const interactive = (el) =>
      el.closest?.('button, a, .interactive, [role="button"]') || null

    const onOver = (e) => {
      const el = interactive(e.target)
      if (el && el !== lastHover) sfx.hover()
      lastHover = el
    }
    const onClick = (e) => {
      if (interactive(e.target)) sfx.click()
    }
    document.addEventListener('pointerover', onOver)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('click', onClick)
    }
  }, [])

  return null
}
