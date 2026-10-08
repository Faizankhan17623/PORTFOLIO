import { useGsapReveal } from '../hooks/useGsapReveal'
import VisitorCounter from './VisitorCounter'
import NowPlaying from './NowPlaying'

export default function Footer() {
  const revealRef = useGsapReveal('.footer-reveal')

  return (
    <footer className="footer">
      <div className="footer-inner" ref={revealRef}>
        <NowPlaying />

        <VisitorCounter />
      </div>

      <div className="footer-legal">
        <div className="footer-logo">
          <span>faizan<span className="site-brand-muted">.dev</span></span>
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
        </div>
        <p>© {new Date().getFullYear()} All rights reserved, Faizan Khan</p>
      </div>
    </footer>
  )
}
