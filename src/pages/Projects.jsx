const projects = [
  { id: 1, title: 'E-Commerce App', desc: 'Full shopping platform with cart & payments', tags: ['React', 'Node.js', 'MongoDB'], icon: '🛒' },
  { id: 2, title: 'Task Manager', desc: 'Project management with real-time updates', tags: ['React', 'Firebase'], icon: '📋' },
  { id: 3, title: 'Weather App', desc: 'Beautiful weather dashboard with forecasts', tags: ['React', 'API'], icon: '🌤️' },
  { id: 4, title: 'Chat App', desc: 'Real-time messaging with rooms', tags: ['React', 'Socket.io'], icon: '💬' },
  { id: 5, title: 'Portfolio', desc: 'Modern portfolio with animations', tags: ['React', 'CSS'], icon: '💼' },
  { id: 6, title: 'Social Media', desc: 'Full social platform with posts & likes', tags: ['React', 'Node.js'], icon: '📱' },
]

function Projects() {
  return (
    <div className="page">
      <div className="container">
        <div className="page-title">
          <h1>My <span>Projects</span></h1>
          <p>Here are some projects I've worked on</p>
        </div>
        <div className="projects-grid">
          {projects.map(p => (
            <div key={p.id} className="project-card">
              <div className="project-img">{p.icon}</div>
              <div className="project-info">
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <div className="project-tags">
                  {p.tags.map((t, i) => <span key={i}>{t}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Projects
