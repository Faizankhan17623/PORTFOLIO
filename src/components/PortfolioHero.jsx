import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { CONTACT, RESUME, SOCIALS } from '../data/contactInfo'
import { SOCIAL_ICONS } from './SocialIcons'

const ROLES = ['Full-stack developer', 'MERN stack developer', 'AI-integrated products']

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
              Explore my work <span aria-hidden="true">↘</span>
            </button>
            <a className="button button-text" href={RESUME.href} target="_blank" rel="noreferrer">
              View résumé <span aria-hidden="true">↗</span>
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
                <span className="hero-card-index">FK / 01</span>
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
          <div className="hero-floating-note hero-note-one"><span>01</span> Full-stack products</div>
          <div className="hero-floating-note hero-note-two"><span>02</span> AI experiments</div>
        </div>
      </div>

      <button className="hero-scroll-cue" onClick={() => scrollTo('about')} aria-label="Scroll to About section">
        <span className="hero-scroll-line" /> Keep scrolling
      </button>
    </div>
  )
}
