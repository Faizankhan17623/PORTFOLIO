import { prefersReducedMotion } from './motion'

// Mouse-only effects, all driven by one pointer listener (event delegation), so no component needs its own:
//  - magnetic buttons: they lean toward the cursor
//  - spotlight: a soft light follows the cursor inside cards
//  - tilt: project cards tilt in 3D toward the cursor
//  - dock: icon groups grow as the cursor gets close to each icon
// Skipped on touch screens and for people who asked for reduced motion.
const MAGNETIC = '.button, .nav-terminal, .nav-resume, .nav-email, .project-link-live, .project-link-source'
const SPOTLIGHT = '.project-card, .skill-group'
const TILT = '.project-card'
const DOCK = '.nav-socials, .hero-socials'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export function initInteractions() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || prefersReducedMotion()) return () => {}

  // ---- magnetic pull, eased frame by frame (uses the `translate` property so it never fights other transforms)
  const pulled = new Map() // element -> { x, y, tx, ty }
  let raf = 0
  const animate = () => {
    raf = 0
    let moving = false
    pulled.forEach((state, el) => {
      state.x += (state.tx - state.x) * 0.18
      state.y += (state.ty - state.y) * 0.18
      if (state.tx === 0 && state.ty === 0 && Math.abs(state.x) < 0.05 && Math.abs(state.y) < 0.05) {
        el.style.translate = ''
        pulled.delete(el)
        return
      }
      el.style.translate = `${state.x.toFixed(2)}px ${state.y.toFixed(2)}px`
      moving = true
    })
    if (moving) raf = requestAnimationFrame(animate)
  }
  const pull = (el, tx, ty) => {
    const state = pulled.get(el) || { x: 0, y: 0, tx: 0, ty: 0 }
    state.tx = tx
    state.ty = ty
    pulled.set(el, state)
    if (!raf) raf = requestAnimationFrame(animate)
  }

  let magnet = null
  let tiltCard = null
  let dock = null

  const resetTilt = (card) => { card.style.removeProperty('--rx'); card.style.removeProperty('--ry') }
  const undock = (group) => group.querySelectorAll('a').forEach((icon) => { icon.style.scale = '' })
  const growIcons = (group, x) => group.querySelectorAll('a').forEach((icon) => {
    const rect = icon.getBoundingClientRect()
    const closeness = Math.max(0, 1 - Math.abs(x - (rect.left + rect.width / 2)) / 72)
    icon.style.scale = (1 + 0.5 * closeness * closeness).toFixed(3)
  })

  const onMove = (event) => {
    const target = event.target instanceof Element ? event.target : null

    const button = target?.closest(MAGNETIC) || null
    if (button !== magnet) { if (magnet) pull(magnet, 0, 0); magnet = button }
    if (button) {
      const rect = button.getBoundingClientRect()
      pull(button, clamp((event.clientX - (rect.left + rect.width / 2)) * 0.25, -9, 9), clamp((event.clientY - (rect.top + rect.height / 2)) * 0.35, -7, 7))
    }

    const card = target?.closest(SPOTLIGHT) || null
    if (card) {
      const rect = card.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      card.style.setProperty('--mx', `${x.toFixed(0)}px`)
      card.style.setProperty('--my', `${y.toFixed(0)}px`)
      if (card.matches(TILT)) {
        card.style.setProperty('--rx', `${((y / rect.height - 0.5) * -6).toFixed(2)}deg`)
        card.style.setProperty('--ry', `${((x / rect.width - 0.5) * 6).toFixed(2)}deg`)
      }
    }
    const tilted = card && card.matches(TILT) ? card : null
    if (tiltCard && tiltCard !== tilted) resetTilt(tiltCard)
    tiltCard = tilted

    const group = target?.closest(DOCK) || null
    if (group !== dock) { if (dock) undock(dock); dock = group }
    if (group) growIcons(group, event.clientX)
  }

  const onLeave = () => {
    if (magnet) pull(magnet, 0, 0)
    magnet = null
    if (tiltCard) resetTilt(tiltCard)
    tiltCard = null
    if (dock) undock(dock)
    dock = null
  }

  window.addEventListener('pointermove', onMove, { passive: true })
  document.documentElement.addEventListener('mouseleave', onLeave)
  return () => {
    window.removeEventListener('pointermove', onMove)
    document.documentElement.removeEventListener('mouseleave', onLeave)
    cancelAnimationFrame(raf)
    pulled.forEach((_, el) => { el.style.translate = '' })
    pulled.clear()
    onLeave()
  }
}
