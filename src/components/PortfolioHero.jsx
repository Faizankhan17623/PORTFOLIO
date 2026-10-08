import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { CONTACT, SOCIALS } from '../data/contactInfo'
import { resumeLink } from '../lib/resumeTrack'
import { SOCIAL_ICONS } from './SocialIcons'

const ROLES = ['Full-stack developer', 'MERN stack developer', 'AI-integrated products']

// Floating chips around the profile card. --r tilts, --d offsets and --t sets the speed of each bob.
const NOTES = [
  { text: 'Full-stack products', tone: 'coral', pos: { top: '9%', left: '-5%' }, r: -5, d: 0, t: 6.2 },
  { text: 'AI experiments', tone: 'green', pos: { bottom: '26%', right: '-7%' }, r: 4, d: -2.1, t: 7 },
  { text: 'MERN stack', tone: 'gold', pos: { top: '31%', right: '-9%' }, r: 3, d: -3.4, t: 6.6 },
  { text: 'LLM integrations', tone: 'green', pos: { bottom: '31%', left: '-10%' }, r: -3, d: -1.2, t: 7.4 },
  { text: 'Clean, fast UI', tone: 'coral', pos: { top: '1%', right: '9%' }, r: 5, d: -4.2, t: 5.8 },
  { text: 'Shipped to production', tone: 'gold', pos: { bottom: '-5%', left: '10%' }, r: -4, d: -2.8, t: 6.9 },
]

// Deterministic scatter so the dots don't jump around between renders.
const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  top: (i * 53 + 7) % 100,
  size: 4 + ((i * 5) % 9),
  delay: -((i * 0.83) % 7),
  duration: 5 + ((i * 3) % 6),
  dx: ((i * 7) % 29) - 14,
  dy: ((i * 11) % 31) - 15,
  tone: ['coral', 'green', 'gold', 'lime'][i % 4],
}))

export default function PortfolioHero() {
  const [roleIndex, setRoleIndex] = useState(0)
  const rootRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const timer = window.setInterval(() => {
      setRoleIndex((index) => (index + 1) % ROLES.length)
    }, 2800)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-hero-enter]', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.11, ease: 'power3.out', delay: 0.12 })
      gsap.fromTo('.hero-orbit', { rotate: -16, scale: 0.96 }, { rotate: 0, scale: 1, duration: 1.3, ease: 'power3.out', delay: 0.35 })
      gsap.to('.hero-orbit-ring', { rotate: 360, duration: 42, ease: 'none', repeat: -1, transformOrigin: '50% 50%' })
    }, root)
    return () => ctx.revert()
  }, [])

  const scrollTo = (id) => {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    document.getElementById(id)?.scrollIntoView({ behavior })
  }

  return (
    <div className="portfolio-hero" ref={rootRef}>
      <div className="hero-layout">
        <div className="hero-copy">
          <p className="hero-kicker" data-hero-enter>
            <span className="availability-dot" />
            Available immediately <span className="hero-kicker-divider">/</span> Pune, Maharashtra
          </p>

          <h1 className="hero-title" data-hero-enter>
            I build web<br />
            <span className="hero-title-accent">experiences</span><br />
            that feel as good<br />
            as they work.
          </h1>

          <div className="hero-role-row" data-hero-enter>
            <span className="hero-role-label">Currently</span>
            <span className="hero-role-value" key={roleIndex}>{ROLES[roleIndex]}</span>
          </div>

          <p className="hero-intro" data-hero-enter>
            I design, build, and deploy production-grade web applications across the MERN stack, and I’m now bringing LLM features into practical products.
          </p>

          <div className="hero-actions" data-hero-enter>
            <button className="button button-dark" onClick={() => scrollTo('projects')}>
              Explore My Work
            </button>
            <a className="button button-light" {...resumeLink('hero')}>
              View Résumé
            </a>
          </div>

          <div className="hero-contact" data-hero-enter aria-label="Contact details">
            <a className="hero-contact-link" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            <a className="hero-contact-link" href={CONTACT.phoneHref}>{CONTACT.phone}</a>
            <span className="hero-socials">
              {SOCIALS.map((social) => (
                <a href={social.href} key={social.label} target="_blank" rel="noreferrer" aria-label={social.label} title={social.label}>{SOCIAL_ICONS[social.label]}</a>
              ))}
            </span>
          </div>

          <div className="hero-proof" data-hero-enter>
            <span><strong>MERN</strong> end-to-end delivery</span>
            <span><strong>AI</strong> expanding into LLM-integrated apps</span>
          </div>
        </div>

        <div className="hero-art" data-hero-enter aria-hidden="true">
          <div className="hero-art-wash" />
          <div className="hero-orbit-ring"><span className="orbit-satellite" /></div>
          <div className="hero-orbit">
            <div className="hero-profile-card">
              <div className="hero-card-topline">
                <span>INDEPENDENT BUILDER</span>
                <span className="hero-card-index">FK</span>
              </div>
              <div className="hero-monogram-wrap">
                <div className="hero-monogram-ring" />
                <div className="hero-monogram">F<span>K</span></div>
                <span className="hero-orbit-label">IDEAS INTO INTERFACES</span>
              </div>
              <div className="hero-card-bottom">
                <div>
                  <span className="hero-card-caption">FOCUS</span>
                  <strong>Useful, considered software.</strong>
                </div>
                <div className="hero-stack-mark" aria-label="React, Node.js, MongoDB">
                  <span>R</span><span>N</span><span>M</span>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-particles">
            {PARTICLES.map((dot, i) => (
              <span
                key={i}
                className={`hero-particle tone-${dot.tone}`}
                style={{ left: `${dot.left}%`, top: `${dot.top}%`, width: dot.size, height: dot.size, '--dx': `${dot.dx}px`, '--dy': `${dot.dy}px`, '--d': `${dot.delay}s`, '--t': `${dot.duration}s` }}
              />
            ))}
          </div>
          {NOTES.map((note, i) => (
            <div
              key={note.text}
              className={`hero-floating-note tone-${note.tone}${i >= 4 ? ' is-extra' : ''}`}
              style={{ ...note.pos, '--r': `${note.r}deg`, '--d': `${note.d}s`, '--t': `${note.t}s` }}
            >
              <i aria-hidden="true" />{note.text}
            </div>
          ))}
        </div>
      </div>

      <button className="hero-scroll-cue" onClick={() => scrollTo('about')} aria-label="Scroll to About section">
        <span className="hero-scroll-line" /> Keep scrolling
      </button>
    </div>
  )
}
