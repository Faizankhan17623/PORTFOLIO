import { useState, useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
import CustomCursor from './components/CustomCursor'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Footer from './components/Footer'
import MaintenanceScreen from './components/MaintenanceScreen'
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
import Ticker from './components/Ticker'
// import SpiderManOverlay from './components/SpiderManOverlay'

function App() {
  const [loading, setLoading] = useState(true)
  const [terminalOpen, setTerminalOpen] = useState(false)

  // Initialize smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    })

    // Keep GSAP ScrollTrigger in sync with Lenis's virtual scroll position,
    // otherwise scroll-driven animations never fire under smooth scrolling.
    lenis.on('scroll', ScrollTrigger.update)

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    // Recalculate trigger positions once everything has mounted.
    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 300)

    return () => {
      clearTimeout(refreshTimer)
      lenis.off('scroll', ScrollTrigger.update)
      lenis.destroy()
    }
  }, [])

  // Once the boot screen lifts, the real content mounts — recompute all
  // ScrollTrigger positions against the now-visible layout, otherwise every
  // scroll reveal would have been measured behind the boot overlay and never fire.
  useEffect(() => {
    if (loading) return
    const t = setTimeout(() => ScrollTrigger.refresh(), 100)
    return () => clearTimeout(t)
  }, [loading])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !terminalOpen && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault()
        setTerminalOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [terminalOpen])

  const skills = defaultSkills
  const projects = defaultProjects

  return (
    <>
      {loading && <MaintenanceScreen onDone={() => setLoading(false)} />}
      {/* Mount the real content only after the boot screen finishes, so GSAP
          entrance + ScrollTrigger reveals initialize against the visible page
          (not behind the overlay, where they'd play unseen and never re-fire). */}
      {!loading && (
        <>
          <ScrollProgressBar />
          <CustomCursor />
          {/* <SpiderManOverlay /> */}
          <Navbar onTerminalOpen={() => setTerminalOpen(true)} />
          {/* <Ticker /> */}
          <main>
            <section id="home"><Hero /></section>
            <div className="divider" />
            <section id="about"><About /></section>
            <div className="divider" />
            <section id="skills">
              <Skills skills={skills} />
            </section>
            <div className="divider" />
            <section id="projects">
              <Projects projects={projects} />
            </section>
            <div className="divider" />
            <section id="github"><GitHubStats /></section>
            <div className="divider" />
            <section id="contact"><Contact /></section>
          </main>
          <Footer />

          <AIChat />
          <KonamiEasterEgg />
          <CommandPalette onTerminalOpen={() => setTerminalOpen(true)} />
          <AchievementToasts />
          <Blackout />
          <SnakeGame />
          <SoundFX />
          <TerminalOverlay open={terminalOpen} onClose={() => setTerminalOpen(false)} />
        </>
      )}
    </>
  )
}

export default App
