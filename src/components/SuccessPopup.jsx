import { motion, AnimatePresence } from 'framer-motion'

export default function SuccessPopup({ show, onClose }) {
  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            className="popup-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Card — x/y keep it centered; scale/opacity animate on top */}
          <motion.div
            className="popup-card"
            initial={{ opacity: 0, scale: 0.7, x: '-50%', y: '-40%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.85, x: '-50%', y: '-44%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          >
            {/* Animated check circle */}
            <div className="popup-icon-wrap">
              <motion.div
                className="popup-ring"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.2, 1], opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.5, times: [0, 0.6, 1] }}
              />
              <motion.svg
                className="popup-check"
                viewBox="0 0 52 52"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.circle
                  cx="26" cy="26" r="24"
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
                />
                <motion.path
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 27 L22 35 L38 19"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.6, duration: 0.4, ease: 'easeOut' }}
                />
              </motion.svg>

              {/* Particle burst */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="popup-particle"
                  initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                  animate={{
                    scale: [0, 1, 0],
                    x: Math.cos((i / 8) * Math.PI * 2) * 60,
                    y: Math.sin((i / 8) * Math.PI * 2) * 60,
                    opacity: [1, 1, 0],
                  }}
                  transition={{ delay: 0.55, duration: 0.7, ease: 'easeOut' }}
                  style={{ '--hue': `${(i / 8) * 360}deg` }}
                />
              ))}
            </div>

            <motion.h3
              className="popup-title"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              Message Sent!
            </motion.h3>

            <motion.p
              className="popup-sub"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
            >
              Thanks for reaching out. I'll get back to you as soon as possible!
            </motion.p>

            <motion.p
              className="popup-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75 }}
            >
              Closing in a few seconds...
            </motion.p>

            <motion.button
              className="popup-close"
              onClick={onClose}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Close
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
