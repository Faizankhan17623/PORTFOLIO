import { Link } from 'react-router-dom'

function About() {
  return (
    <div className="page">
      <div className="container">
        <div className="about-grid">
          <div className="about-img">Your Photo</div>
          <div className="about-text">
            <h1>About <span>Me</span></h1>
            <p>
              I'm a passionate Full Stack Developer with experience in building
              modern web applications. I love turning ideas into reality through code.
            </p>
            <p>
              With a strong foundation in both frontend and backend technologies,
              I create seamless digital experiences.
            </p>
            <div className="about-tags">
              <span>React</span>
              <span>Node.js</span>
              <span>JavaScript</span>
              <span>Python</span>
              <span>MongoDB</span>
            </div>
            <Link to="/contact" className="btn btn-primary">Let's Talk</Link>
            <div className="about-stats">
              <div className="stat">
                <h3>3+</h3>
                <p>Years Experience</p>
              </div>
              <div className="stat">
                <h3>20+</h3>
                <p>Projects</p>
              </div>
              <div className="stat">
                <h3>10+</h3>
                <p>Clients</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
