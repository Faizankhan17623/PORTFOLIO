import { useEffect, useState } from 'react'

const LINKS = [
  { id: 'about', label: 'About' },
  { id: 'resume', label: 'Resume' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'github', label: 'GitHub' },
  { id: 'contact', label: 'Contact' },
]

import { CONTACT, SOCIALS } from '../data/contactInfo'
import { resumeLink } from '../lib/resumeTrack'
import { SOCIAL_ICONS } from './SocialIcons'

export default function PortfolioNavbar({ onTerminalOpen }) {
  const [active, setActive] = useState('home')
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24)
        let current = 'home'
        for (const id of ['home', ...LINKS.map((link) => link.id), 'contact']) {
          const section = document.getElementById(id)
          if (!section) continue
          const { top, bottom } = section.getBoundingClientRect()
          if (top <= 150 && bottom > 150) current = id
        }
        setActive(current)
      })
    }

    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update)
    }
  }, [])

  useEffect(() => {
    if (!menuOpen) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [menuOpen])

  const scrollTo = (id) => {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    document.getElementById(id)?.scrollIntoView({ behavior })
    setMenuOpen(false)
  }

  return (
    <header className={`site-nav${scrolled ? ' is-scrolled' : ''}`}>
      <div className="site-nav-inner">
        <button className="site-brand" onClick={() => scrollTo('home')} aria-label="Faizan Khan, back to top">
          <span className="site-brand-mark">F<span>.</span></span>
          <span>faizan<span className="site-brand-muted">.dev</span></span>
        </button>

        <nav className="site-nav-links" aria-label="Main navigation">
          {LINKS.map(({ id, label }) => (
            <button
              key={id}
              className={active === id ? 'is-active' : ''}
              onClick={() => scrollTo(id)}
              aria-current={active === id ? 'location' : undefined}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="site-nav-actions">
          <div className="nav-socials">
            {SOCIALS.map((social) => (
              <a href={social.href} key={social.label} target="_blank" rel="noreferrer" aria-label={social.label} title={social.label}>{SOCIAL_ICONS[social.label]}</a>
            ))}
          </div>
          <a className="nav-resume" {...resumeLink('navbar')} title="Open my résumé (PDF)">Résumé</a>
          <a className="nav-email" href={`mailto:${CONTACT.email}`} title={CONTACT.email}>Email me</a>
          <button className="nav-shortcut" onClick={() => window.dispatchEvent(new Event('palette:open'))} title="Open command palette">
            <span>⌘</span><span>K</span>
          </button>
          <button className="nav-terminal" onClick={onTerminalOpen} title="Open terminal overlay">Terminal <span>↗</span></button>
          <button
            className={`nav-menu-toggle${menuOpen ? ' is-open' : ''}`}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            <span /><span />
          </button>
        </div>
      </div>

      <nav id="mobile-navigation" className={`mobile-nav${menuOpen ? ' is-open' : ''}`} aria-label="Mobile navigation" aria-hidden={!menuOpen}>
        {LINKS.map(({ id, label }) => (
          <button key={id} onClick={() => scrollTo(id)} tabIndex={menuOpen ? 0 : -1}>
            {label}
          </button>
        ))}
        <div className="mobile-nav-contact">
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
          <a className="mobile-resume" {...resumeLink('mobile-menu')}>Open résumé (PDF)</a>
          <div className="nav-socials">
            {SOCIALS.map((social) => (
              <a href={social.href} key={social.label} target="_blank" rel="noreferrer" aria-label={social.label}>{SOCIAL_ICONS[social.label]}</a>
            ))}
          </div>
        </div>
      </nav>
    </header>
  )
}
