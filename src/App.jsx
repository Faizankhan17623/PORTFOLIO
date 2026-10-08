import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

import Navbar from './components/PortfolioNavbar'
import Hero from './components/PortfolioHero'
import About from './components/PortfolioAbout'
import Resume from './components/Resume'
import Skills from './components/PortfolioSkills'
import Projects from './components/PortfolioProjects'
import Contact from './components/PortfolioContact'
import Footer from './components/Footer'
import TerminalOverlay from './components/TerminalOverlay'
import ScrollProgressBar from './components/ScrollProgressBar'
import GitHubStats from './components/GitHubStats'
import AIChat from './components/AIChat'
import KonamiEasterEgg from './components/KonamiEasterEgg'
import CommandPalette from './components/CommandPalette'
import AchievementToasts from './components/AchievementToasts'
import Blackout from './components/Blackout'
import SnakeGame from './components/SnakeGame'
import SoundFX from './components/SoundFX'
import { defaultSkills, defaultProjects } from './data/portfolioData'

function App() {
  const [terminalOpen, setTerminalOpen] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      smoothTouch: false,
    })

    lenis.on('scroll', ScrollTrigger.update)
    let frameId
    const raf = (time) => {
      lenis.raf(time)
      frameId = requestAnimationFrame(raf)
    }
    frameId = requestAnimationFrame(raf)
    const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 100)

    return () => {
      window.clearTimeout(refreshTimer)
      cancelAnimationFrame(frameId)
      lenis.off('scroll', ScrollTrigger.update)
      lenis.destroy()
    }
  }, [])

  useEffect(() => {
    const onKey = (event) => {
      const target = event.target
      const isTyping = target instanceof HTMLElement && (
        target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      )
      if (event.key === '/' && !terminalOpen && !isTyping) {
        event.preventDefault()
        setTerminalOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [terminalOpen])

  return (
    <>
      <ScrollProgressBar />
      <div className="portfolio-site">
        <a className="skip-link" href="#main-content">Skip to content</a>
        <Navbar onTerminalOpen={() => setTerminalOpen(true)} />
        <main id="main-content" className="portfolio-main">
          <section id="home" className="portfolio-hero-section"><Hero /></section>
          <section id="about"><About /></section>
          <section id="resume"><Resume /></section>
          <section id="skills"><Skills skills={defaultSkills} /></section>
          <section id="projects"><Projects projects={defaultProjects} /></section>
          <section id="github"><GitHubStats /></section>
          <section id="contact"><Contact /></section>
        </main>
        <Footer />
      </div>

      <AIChat />
      <KonamiEasterEgg />
      <CommandPalette onTerminalOpen={() => setTerminalOpen(true)} />
      <AchievementToasts />
      <Blackout />
      <SnakeGame />
      <SoundFX />
      <TerminalOverlay open={terminalOpen} onClose={() => setTerminalOpen(false)} />
    </>
  )
}

export default App
