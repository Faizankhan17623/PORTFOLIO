/**
 * useSpotlight — returns props to spread on any card to make a radial glow
 * follow the cursor. Pair with the `spotlight` CSS class in index.css.
 *
 * Usage:
 *   const spot = useSpotlight()
 *   <div className="card spotlight" {...spot}>...</div>
 */
export function useSpotlight() {
  const onMouseMove = (e) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return { onMouseMove }
}
