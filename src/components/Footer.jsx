import { motion } from 'framer-motion'

export default function Footer({ onAdminClick }) {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <motion.div
          className="footer-logo"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }} viewport={{ once: true }}
        >
          <span className="gradient">faizan.dev</span>
        </motion.div>

        <motion.p
          className="footer-copy"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }} viewport={{ once: true }}
        >
          Built with React &amp; Framer Motion · {new Date().getFullYear()} Faizan Khan
        </motion.p>

        {/* Hidden admin lock — barely visible, no label */}
        <button
          className="footer-lock"
          onClick={onAdminClick}
          title=""
          aria-label="admin"
          tabIndex={-1}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </button>
      </div>
    </footer>
  )
}
