import { motion } from 'framer-motion'
import VisitorCounter from './VisitorCounter'
import NowPlaying from './NowPlaying'

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
          {/* Disguised easter-egg trigger — looks like a blinking terminal cursor.
              Clicking it fires the Konami effect. No one would guess what it does. */}
          <span
            className="footer-cursor"
            role="button"
            tabIndex={0}
            aria-label="·"
            onClick={() => window.dispatchEvent(new Event('konami:trigger'))}
            onKeyDown={(e) => { if (e.key === 'Enter') window.dispatchEvent(new Event('konami:trigger')) }}
          >
            _
          </span>
        </motion.div>

        <NowPlaying />

        <motion.p
          className="footer-copy"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }} viewport={{ once: true }}
        >
          Built with React &amp; Framer Motion · {new Date().getFullYear()} Faizan Khan
        </motion.p>

        <VisitorCounter />
      </div>
    </footer>
  )
}
