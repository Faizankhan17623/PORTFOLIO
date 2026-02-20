const skills = {
  frontend: { title: 'Frontend', icon: '🎨', skills: [
    { name: 'React', level: 90 }, { name: 'JavaScript', level: 85 },
    { name: 'HTML/CSS', level: 95 }, { name: 'TypeScript', level: 80 }
  ]},
  backend: { title: 'Backend', icon: '⚙️', skills: [
    { name: 'Node.js', level: 85 }, { name: 'Python', level: 75 },
    { name: 'MongoDB', level: 80 }, { name: 'Express', level: 78 }
  ]},
  tools: { title: 'Tools', icon: '🛠️', skills: [
    { name: 'Git', level: 90 }, { name: 'Docker', level: 70 },
    { name: 'AWS', level: 65 }, { name: 'Figma', level: 75 }
  ]}
}

function Skills() {
  return (
    <div className="page">
      <div className="container">
        <div className="page-title">
          <h1>My <span>Skills</span></h1>
          <p>Technologies I work with</p>
        </div>
        <div className="skills-grid">
          {Object.values(skills).map((cat, i) => (
            <div key={i} className="skill-card">
              <h3><span>{cat.icon}</span> {cat.title}</h3>
              {cat.skills.map((s, j) => (
                <div key={j} className="skill-item">
                  <div className="skill-info">
                    <span>{s.name}</span>
                    <span>{s.level}%</span>
                  </div>
                  <div className="skill-bar">
                    <div className="skill-progress" style={{width: s.level + '%'}}></div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Skills
