import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="page">
      <div className="hero">
        <div className="hero-content">
          <h1>Hi, I'm <span>Your Name</span></h1>
          <p>
            A passionate Full Stack Developer building beautiful,
            functional web applications.
          </p>
          <div className="hero-btns">
            <Link to="/projects" className="btn btn-primary">View Projects</Link>
            <Link to="/contact" className="btn btn-outline">Contact Me</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
