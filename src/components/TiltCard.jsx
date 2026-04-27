import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function TiltCard({ children, className = '' }) {
  const ref = useRef(null)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })

  const onMouseMove = (e) => {
    if (!ref.current) return
    const card = ref.current
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -10 // Max 10 deg
    const rotateY = ((x - centerX) / centerX) * 10

    setRotate({ x: rotateX, y: rotateY })
  }

  const onMouseLeave = () => {
    setRotate({ x: 0, y: 0 })
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      animate={{ rotateX: rotate.x, rotateY: rotate.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ 
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
    >
      <div style={{ transform: 'translateZ(30px)' }}>
        {children}
      </div>
    </motion.div>
  )
}
