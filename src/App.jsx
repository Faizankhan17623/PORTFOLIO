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
import AdminPanel from './components/AdminPanel'
import { defaultSkills, defaultProjects } from './data/portfolioData'

function App() {
  const [adminOpen, setAdminOpen] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

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

  const [skills, setSkills] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fk_skills')) || defaultSkills }
    catch { return defaultSkills }
  })
  const [projects, setProjects] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fk_projects')) || defaultProjects }
    catch { return defaultProjects }
  })

  const saveSkills = (s) => { setSkills(s); localStorage.setItem('fk_skills', JSON.stringify(s)) }
  const saveProjects = (p) => { setProjects(p); localStorage.setItem('fk_projects', JSON.stringify(p)) }

  return (
    <>
      <CustomCursor />
      <Navbar />
      <main>
        <section id="home"><Hero /></section>
        <div className="divider" />
        <section id="about"><About /></section>
        <div className="divider" />
        <section id="skills">
          <Skills skills={skills} isAdmin={loggedIn} onUpdate={saveSkills} />
        </section>
        <div className="divider" />
        <section id="projects">
          <Projects projects={projects} isAdmin={loggedIn} onUpdate={saveProjects} />
        </section>
        <div className="divider" />
        <section id="contact"><Contact /></section>
      </main>
      <Footer onAdminClick={() => setAdminOpen(true)} />
      {adminOpen && (
        <AdminPanel
          loggedIn={loggedIn}
          onLogin={() => setLoggedIn(true)}
          onClose={() => setAdminOpen(false)}
          skills={skills}
          projects={projects}
          onUpdateSkills={saveSkills}
          onUpdateProjects={saveProjects}
        />
      )}
    </>
  )
}

export default App
