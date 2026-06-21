import { useState, useEffect } from 'react'
import Lenis from 'lenis'
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
import { defaultSkills, defaultProjects } from './data/portfolioData'
import Ticker from './components/Ticker'

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

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => lenis.destroy()
  }, [])

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
      <ScrollProgressBar />
      <CustomCursor />
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
      <TerminalOverlay open={terminalOpen} onClose={() => setTerminalOpen(false)} />
    </>
  )
}

export default App
