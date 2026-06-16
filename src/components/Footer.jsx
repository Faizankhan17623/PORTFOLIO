import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <motion.div
          className="footer-logo"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }} viewport={{ once: true }}
        >
          faizan.dev
        </motion.div>

        <motion.p
          className="footer-copy"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }} viewport={{ once: true }}
        >
          Built with React &amp; Framer Motion · {new Date().getFullYear()} Faizan Khan
        </motion.p>
      </div>
    </footer>
  )
}
