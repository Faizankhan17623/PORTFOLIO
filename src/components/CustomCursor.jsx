import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const ringRef = useRef(null)
  const dotRef = useRef(null)
  const frameRef = useRef(null)
  const positionRef = useRef({ x: -40, y: -40 })
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const paint = () => {
      const { x, y } = positionRef.current
      const transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
      if (ringRef.current) ringRef.current.style.transform = transform
      if (dotRef.current) dotRef.current.style.transform = transform
      frameRef.current = null
    }

    const handleMouseMove = (event) => {
      positionRef.current = { x: event.clientX, y: event.clientY }
      setIsVisible(true)
      if (!frameRef.current) frameRef.current = requestAnimationFrame(paint)
    }

    const handleMouseOver = (event) => {
      setIsHovering(Boolean(event.target.closest(
        'a, button, input, textarea, select, [role="button"], .interactive',
      )))
    }

    const handleMouseLeave = () => setIsVisible(false)

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mouseover', handleMouseOver, { passive: true })
    document.documentElement.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseover', handleMouseOver)
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  const stateClass = `${isVisible ? 'is-visible' : ''} ${isHovering ? 'is-hovering' : ''}`

  return (
    <>
      <div ref={ringRef} className={`custom-cursor ${stateClass}`} />
      <div ref={dotRef} className={`custom-cursor-dot ${stateClass}`} />
    </>
  )
}
