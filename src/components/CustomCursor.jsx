import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseOver = (e) => {
      // Check if hovering over interactive elements
      if (
        e.target.tagName.toLowerCase() === 'button' ||
        e.target.tagName.toLowerCase() === 'a' ||
        e.target.closest('button') ||
        e.target.closest('a') ||
        e.target.classList.contains('interactive')
      ) {
        setIsHovering(true)
      } else {
        setIsHovering(false)
      }
    }

    window.addEventListener('mousemove', updateMousePosition)
    window.addEventListener('mouseover', handleMouseOver)

    return () => {
      window.removeEventListener('mousemove', updateMousePosition)
      window.removeEventListener('mouseover', handleMouseOver)
    }
  }, [])

  const variants = {
    default: {
      x: mousePosition.x - 10,
      y: mousePosition.y - 10,
      scale: 1,
      borderColor: '#39ff14',
    },
    hover: {
      x: mousePosition.x - 20,
      y: mousePosition.y - 20,
      scale: 2,
      borderColor: '#ff2d78',
    }
  }

  return (
    <>
      <motion.div
        className="custom-cursor"
        variants={variants}
        animate={isHovering ? 'hover' : 'default'}
        transition={{ type: 'spring', stiffness: 600, damping: 30, mass: 0.4 }}
      />
      <motion.div
        className="custom-cursor-dot"
        animate={{
          x: mousePosition.x - 2,
          y: mousePosition.y - 2,
          backgroundColor: isHovering ? '#ff2d78' : '#39ff14',
          opacity: isHovering ? 0 : 1
        }}
        transition={{ type: 'spring', stiffness: 1000, damping: 40 }}
      />
    </>
  )
}
