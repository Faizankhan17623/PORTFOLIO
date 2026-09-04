import { cloneElement, useEffect, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { GitHubCalendar } from 'react-github-calendar'
import { useSpotlight } from '../hooks/useSpotlight'
import { useGsapReveal } from '../hooks/useGsapReveal'
import { useGsapTitle } from '../hooks/useGsapTitle'
import { useGsapParallax } from '../hooks/useGsapParallax'

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

// Single stat card — its icon drifts upward as the card scrolls through view.
function StatCard({ icon, value, label, spot }) {
  const iconRef = useGsapParallax({ distance: -18 })
  return (
    <div className="gh-stat-card spotlight reveal" {...spot}>
      <div className="gh-stat-icon" ref={iconRef}>{icon}</div>
      <div className="gh-stat-num">{value}</div>
      <div className="gh-stat-label">{label}</div>
    </div>
  )
}

export default function GitHubStats() {
  const [data, setData] = useState(null)
  const [repos, setRepos] = useState([])
  const [totalStars, setTotalStars] = useState(0)
  const [error, setError] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const spot = useSpotlight()
  const revealRef = useGsapReveal('.reveal', { y: 26, stagger: 0.08, deps: [repos.length, !!data] })
  const titleRef = useGsapTitle()

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch(`https://api.github.com/users/${GH_USER}`, { cache: 'no-store' }).then(r => r.json()),
      fetch(`https://api.github.com/users/${GH_USER}/repos?per_page=100&sort=updated`, { cache: 'no-store' }).then(r => r.json()),
    ])
      .then(([user, repoList]) => {
        if (cancelled) return
        if (user.message) { setError(true); return }
        setData(user)
        if (Array.isArray(repoList)) {
          const owned = repoList.filter(r => !r.fork)
          setTotalStars(owned.reduce((sum, r) => sum + r.stargazers_count, 0))
          const latest = [...owned]
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, 3)
          setRepos(latest)
        }
      })
      .catch(() => !cancelled && setError(true))
    return () => { cancelled = true }
  }, [])

  // The API response reflows this section (stat numbers, repo cards, chart
  // image) after ScrollTrigger already measured it pre-data — re-measure once
  // the new layout has painted, otherwise reveal triggers stay stuck at their
  // stale (often off-screen) positions and the section never animates in.
  useEffect(() => {
    if (!data) return
    const t = setTimeout(() => ScrollTrigger.refresh(), 150)
    return () => clearTimeout(t)
  }, [data, repos.length])

  if (error) return null

  const stats = data ? {
    repos: data.public_repos,
    followers: data.followers,
    following: data.following,
  } : { repos: 0, followers: 0, following: 0 }

  return (
    <div className="gh-stats-wrap" ref={revealRef}>
      <div className="gh-header reveal">
        <span className="gh-pill">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.24 3.33.95.1-.74.4-1.24.73-1.53-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.51-1.47.11-3.06 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.26 5.69.41.36.78 1.05.78 2.13 0 1.54-.01 2.78-.01 3.16 0 .31.21.68.8.56 4.56-1.52 7.85-5.83 7.85-10.91C23.5 5.65 18.35.5 12 .5z" />
          </svg>
          LIVE FROM GITHUB
        </span>
        <h2 className="gh-title" ref={titleRef}>
          Code I'm <span className="gradient">shipping</span> right now
        </h2>
        <p className="gh-sub">Pulled live from my GitHub — no static numbers, no lies.</p>
      </div>

      <div className="gh-grid">
        <StatCard icon="📦" value={<Counter to={stats.repos} />} label="Public Repos" spot={spot} />
        <StatCard icon="👥" value={<Counter to={stats.followers} />} label="Followers" spot={spot} />
        <StatCard icon="🔭" value={<Counter to={stats.following} />} label="Following" spot={spot} />
        <StatCard icon="⭐" value={<Counter to={totalStars} />} label="Total Stars" spot={spot} />
      </div>

      <div className="gh-chart reveal">
        <div className="gh-repos-label">Contribution Activity</div>
        <div className="gh-chart-frame">
          <div className="gh-chart-bar">
            <span className="t-dot r" /><span className="t-dot y" /><span className="t-dot g" />
            <span className="gh-chart-path">~/{GH_USER}/contributions.log</span>
          </div>
          <div className="gh-chart-inner">
            <GitHubCalendar
              username={GH_USER}
              colorScheme="dark"
              blockSize={24}
              blockMargin={4}
              fontSize={13}
              showColorLegend={false}
              showTotalCount
              errorMessage="Contribution activity is temporarily unavailable. View it directly on GitHub."
              renderBlock={(block, activity) => cloneElement(block, {
                role: 'button',
                tabIndex: 0,
                'aria-label': `${activity.count} contributions on ${activity.date}`,
                onMouseEnter: () => setSelectedActivity(activity),
                onMouseLeave: () => setSelectedActivity(null),
                onFocus: () => setSelectedActivity(activity),
                onBlur: () => setSelectedActivity(null),
                onClick: () => setSelectedActivity(activity),
                onKeyDown: (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setSelectedActivity(activity)
                  }
                },
                className: 'gh-activity-block',
                stroke: selectedActivity?.date === activity.date ? '#f5ff00' : undefined,
                strokeWidth: selectedActivity?.date === activity.date ? 2 : undefined,
              })}
              theme={{
                dark: ['#101820', '#123d1d', '#197b2c', '#24bd39', '#39ff14'],
              }}
            />
          </div>
          {selectedActivity && (
            <div className="gh-day-popup" role="status">
              <button
                type="button"
                className="gh-day-popup-close"
                onClick={() => setSelectedActivity(null)}
                aria-label="Close contribution details"
              >
                ×
              </button>
              <span className="gh-day-popup-kicker">ACTIVITY LOG</span>
              <strong>{new Date(`${selectedActivity.date}T00:00:00`).toLocaleDateString('en-US', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}</strong>
              <span className="gh-day-popup-count">
                {selectedActivity.count} {selectedActivity.count === 1 ? 'contribution' : 'contributions'}
              </span>
              <span className="gh-day-popup-level">Intensity level: {selectedActivity.level}/4</span>
              <a
                href={`https://github.com/${GH_USER}?tab=overview&from=${selectedActivity.date}&to=${selectedActivity.date}`}
                target="_blank"
                rel="noreferrer"
              >
                View day on GitHub →
              </a>
            </div>
          )}
          <div className="gh-chart-legend">
            <span>Less</span>
            <span className="gh-legend-cell" style={{ background: '#101820' }} />
            <span className="gh-legend-cell" style={{ background: '#123d1d' }} />
            <span className="gh-legend-cell" style={{ background: '#197b2c' }} />
            <span className="gh-legend-cell" style={{ background: '#24bd39' }} />
            <span className="gh-legend-cell" style={{ background: '#39ff14' }} />
            <span>More</span>
          </div>
        </div>
      </div>

      {repos.length > 0 && (
        <div className="gh-repos reveal">
          <div className="gh-repos-label">⚡ Latest Repositories</div>
          <div className="gh-repos-grid">
            {repos.map(r => (
              <a key={r.id} href={r.html_url} target="_blank" rel="noreferrer" className="gh-repo-card spotlight" {...spot}>
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
        </div>
      )}

      <a
        href={`https://github.com/${GH_USER}`}
        target="_blank"
        rel="noreferrer"
        className="gh-cta reveal"
      >
        See all on GitHub →
      </a>
    </div>
  )
}
