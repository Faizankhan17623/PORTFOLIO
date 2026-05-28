import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const GH_USER = 'Faizankhan17623'

function Counter({ to, duration = 1.4 }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = null
    const end = Number(to) || 0
    const step = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / (duration * 1000), 1)
      setVal(Math.floor(p * end))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [to, duration])
  return <>{val.toLocaleString()}</>
}

export default function GitHubStats() {
  const [data, setData] = useState(null)
  const [repos, setRepos] = useState([])
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch(`https://api.github.com/users/${GH_USER}`).then(r => r.json()),
      fetch(`https://api.github.com/users/${GH_USER}/repos?per_page=100&sort=updated`).then(r => r.json()),
    ])
      .then(([user, repoList]) => {
        if (cancelled) return
        if (user.message) { setError(true); return }
        setData(user)
        if (Array.isArray(repoList)) {
          const top = [...repoList]
            .filter(r => !r.fork)
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 3)
          setRepos(top)
        }
      })
      .catch(() => !cancelled && setError(true))
    return () => { cancelled = true }
  }, [])

  if (error) return null

  const stats = data ? {
    repos: data.public_repos,
    followers: data.followers,
    following: data.following,
  } : { repos: 0, followers: 0, following: 0 }

  return (
    <div className="gh-stats-wrap">
      <motion.div
        className="gh-header"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span className="gh-pill">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.24 3.33.95.1-.74.4-1.24.73-1.53-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.51-1.47.11-3.06 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.26 5.69.41.36.78 1.05.78 2.13 0 1.54-.01 2.78-.01 3.16 0 .31.21.68.8.56 4.56-1.52 7.85-5.83 7.85-10.91C23.5 5.65 18.35.5 12 .5z" />
          </svg>
          LIVE FROM GITHUB
        </span>
        <h2 className="gh-title">
          Code I'm <span className="gradient">shipping</span> right now
        </h2>
        <p className="gh-sub">Pulled live from my GitHub — no static numbers, no lies.</p>
      </motion.div>

      <div className="gh-grid">
        <motion.div className="gh-stat-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }}>
          <div className="gh-stat-icon">📦</div>
          <div className="gh-stat-num"><Counter to={stats.repos} /></div>
          <div className="gh-stat-label">Public Repos</div>
        </motion.div>
        <motion.div className="gh-stat-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.12 }}>
          <div className="gh-stat-icon">👥</div>
          <div className="gh-stat-num"><Counter to={stats.followers} /></div>
          <div className="gh-stat-label">Followers</div>
        </motion.div>
        <motion.div className="gh-stat-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.19 }}>
          <div className="gh-stat-icon">🔭</div>
          <div className="gh-stat-num"><Counter to={stats.following} /></div>
          <div className="gh-stat-label">Following</div>
        </motion.div>
        <motion.div className="gh-stat-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.26 }}>
          <div className="gh-stat-icon">🔥</div>
          <div className="gh-stat-num">365</div>
          <div className="gh-stat-label">Days Coding</div>
        </motion.div>
      </div>

      {repos.length > 0 && (
        <motion.div
          className="gh-repos"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35 }}
        >
          <div className="gh-repos-label">⭐ Top Repositories</div>
          <div className="gh-repos-grid">
            {repos.map(r => (
              <a key={r.id} href={r.html_url} target="_blank" rel="noreferrer" className="gh-repo-card">
                <div className="gh-repo-top">
                  <span className="gh-repo-name">{r.name}</span>
                  <span className="gh-repo-star">★ {r.stargazers_count}</span>
                </div>
                <p className="gh-repo-desc">{r.description || 'No description'}</p>
                <div className="gh-repo-meta">
                  {r.language && <span className="gh-repo-lang"><span className={`gh-lang-dot lang-${r.language.toLowerCase()}`} />{r.language}</span>}
                  <span className="gh-repo-forks">⑂ {r.forks_count}</span>
                </div>
              </a>
            ))}
          </div>
        </motion.div>
      )}

      <motion.a
        href={`https://github.com/${GH_USER}`}
        target="_blank"
        rel="noreferrer"
        className="gh-cta"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
      >
        See all on GitHub →
      </motion.a>
    </div>
  )
}
