import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../lib/motion'

// three.js only downloads once the skills section is close to the screen.
const SkillsOrbitScene = lazy(() => import('./three/SkillsOrbitScene'))

export default function SkillsOrbit({ skills }) {
  const wrapRef = useRef(null)
  const [near, setNear] = useState(false)
  const [still] = useState(prefersReducedMotion)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap || still) return undefined
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setNear(true) }, { rootMargin: '900px 0px' })
    observer.observe(wrap)
    return () => observer.disconnect()
  }, [still])

  // With reduced motion the plain list of tools below is enough.
  if (still) return null

  return (
    <div className="skills-orbit skills-reveal" ref={wrapRef} role="img" aria-label="An interactive sphere of my skills. The same tools are listed below.">
      {near && <Suspense fallback={null}><SkillsOrbitScene skills={skills} /></Suspense>}
      <span className="skills-orbit-hint">Drag to spin</span>
    </div>
  )
}
