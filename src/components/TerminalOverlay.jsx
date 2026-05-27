import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ASCII_LOGO = `
 ███████╗██╗  ██╗
 ██╔════╝██║ ██╔╝
 █████╗  █████╔╝
 ██╔══╝  ██╔═██╗
 ██║     ██║  ██╗
 ╚═╝     ╚═╝  ╚═╝`

const COMMANDS = {
  help: () => ({
    output: [
      { t: 'cm', v: 'Available commands:' },
      { t: 'gap' },
      { t: 'row', k: 'whoami', v: 'About me' },
      { t: 'row', k: 'skills', v: 'Tech stack' },
      { t: 'row', k: 'projects', v: 'My projects' },
      { t: 'row', k: 'contact', v: 'Get in touch' },
      { t: 'row', k: 'clear', v: 'Clear terminal' },
      { t: 'row', k: 'exit', v: 'Close terminal' },
      { t: 'gap' },
      { t: 'dim', v: 'Pro tip: use ↑↓ to navigate history' },
    ],
  }),

  whoami: () => ({
    output: [
      { t: 'ascii', v: ASCII_LOGO },
      { t: 'gap' },
      { t: 'hl', v: 'Faizan Khan' },
      { t: 'cm', v: 'Full Stack Developer · MERN Stack · Open to Work' },
      { t: 'gap' },
      { t: 'dim', v: 'I build fast, beautiful, production-ready web apps.' },
      { t: 'dim', v: 'React on the front, Node.js & MongoDB on the back.' },
      { t: 'gap' },
      { t: 'row', k: 'Email', v: 'fk3701@gmail.com' },
      { t: 'row', k: 'Location', v: 'India' },
      { t: 'row', k: 'Status', v: '● Open to opportunities', c: 'green' },
    ],
  }),

  skills: () => ({
    output: [
      { t: 'hl', v: '$ Tech Stack' },
      { t: 'gap' },
      { t: 'cat', v: 'Frontend' },
      { t: 'tags', v: ['React', 'JavaScript (ES6+)', 'HTML5', 'CSS3', 'Tailwind CSS'] },
      { t: 'gap' },
      { t: 'cat', v: 'Backend' },
      { t: 'tags', v: ['Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'JWT Auth'] },
      { t: 'gap' },
      { t: 'cat', v: 'Tools & DevOps' },
      { t: 'tags', v: ['Git', 'GitHub', 'Docker', 'Postman', 'Cloudinary', 'CI/CD'] },
      { t: 'gap' },
      { t: 'cat', v: 'AI / ML' },
      { t: 'tags', v: ['Prompt Engineering', 'OpenAI API', 'MCP', 'Computer Vision'] },
    ],
  }),

  projects: () => ({
    output: [
      { t: 'hl', v: '$ Projects' },
      { t: 'gap' },
      { t: 'proj', emoji: '🎬', title: 'Cine Circuit', desc: 'Full-stack movie ticketing platform', live: 'https://mw-bay.vercel.app/' },
      { t: 'proj', emoji: '📚', title: 'StudyNotion', desc: 'EdTech platform with course marketplace', live: 'https://study-notion-project-phi.vercel.app/' },
      { t: 'proj', emoji: '📡', title: 'ByteFeed', desc: 'Real-time blog aggregator for 22+ dev blogs', live: 'https://www.bytefeed.store/', gh: 'https://github.com/Faizankhan17623/ByteFeed' },
      { t: 'proj', emoji: '👁️', title: 'Eye Blink Counter', desc: 'Computer vision attention tracker (Python)', gh: 'https://github.com/Faizankhan17623/eye-blink-finger-counter' },
      { t: 'proj', emoji: '🌤️', title: 'Weather Predictor', desc: 'Real-time weather app (vanilla JS)' },
      { t: 'gap' },
      { t: 'dim', v: 'Type "projects" for full details, or scroll to the Projects section.' },
    ],
  }),

  contact: () => ({
    output: [
      { t: 'hl', v: '$ Contact' },
      { t: 'gap' },
      { t: 'row', k: 'Email', v: 'fk3701@gmail.com' },
      { t: 'row', k: 'GitHub', v: 'github.com/Faizankhan17623' },
      { t: 'row', k: 'LinkedIn', v: 'linkedin.com/in/faizan-khan-dev' },
      { t: 'gap' },
      { t: 'dim', v: "Best way to reach me: shoot me an email or scroll to Contact section." },
    ],
  }),
}

function OutputLine({ line }) {
  switch (line.t) {
    case 'ascii':
      return <pre className="t-ascii">{line.v}</pre>
    case 'hl':
      return <div className="t-output-hl">{line.v}</div>
    case 'cm':
      return <div className="t-output-cm">{line.v}</div>
    case 'dim':
      return <div className="t-output-dim">{line.v}</div>
    case 'gap':
      return <div className="t-output-gap" />
    case 'cat':
      return <div className="t-output-cat">{line.v}</div>
    case 'tags':
      return (
        <div className="t-output-tags">
          {line.v.map(tag => <span key={tag} className="t-tag">{tag}</span>)}
        </div>
      )
    case 'row':
      return (
        <div className="t-output-row">
          <span className="t-key">{line.k}</span>
          <span className={`t-val${line.c ? ' t-' + line.c : ''}`}>{line.v}</span>
        </div>
      )
    case 'proj':
      return (
        <div className="t-proj-row">
          <span className="t-proj-emoji">{line.emoji}</span>
          <div>
            <span className="t-proj-title">{line.title}</span>
            <span className="t-output-dim"> — {line.desc}</span>
            {(line.live || line.gh) && (
              <span className="t-proj-links">
                {line.live && <a href={line.live} target="_blank" rel="noreferrer" className="t-link">↗ Live</a>}
                {line.gh && <a href={line.gh} target="_blank" rel="noreferrer" className="t-link">⌥ Code</a>}
              </span>
            )}
          </div>
        </div>
      )
    default:
      return null
  }
}

function TerminalLine({ entry }) {
  if (entry.type === 'input') {
    return (
      <div className="t-history-input">
        <span className="t-prompt">faizan@portfolio</span>
        <span className="t-at">:</span>
        <span className="t-tilde">~</span>
        <span className="t-dollar">$</span>
        <span className="t-cmd-text">{entry.text}</span>
      </div>
    )
  }
  if (entry.type === 'error') {
    return <div className="t-error">zsh: command not found: {entry.text} — try `help`</div>
  }
  if (entry.type === 'output') {
    return (
      <div className="t-output-block">
        {entry.lines.map((line, i) => <OutputLine key={i} line={line} />)}
      </div>
    )
  }
  return null
}

export default function TerminalOverlay({ open, onClose }) {
  const [history, setHistory] = useState([
    { type: 'output', lines: [
      { t: 'hl', v: 'Welcome to faizan@portfolio' },
      { t: 'dim', v: 'Type `help` to see available commands.' },
    ]},
  ])
  const [input, setInput] = useState('')
  const [cmdHistory, setCmdHistory] = useState([])
  const [histIdx, setHistIdx] = useState(-1)
  const inputRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const runCommand = useCallback((raw) => {
    const cmd = raw.trim().toLowerCase()
    if (!cmd) return

    setCmdHistory(h => [raw, ...h])
    setHistIdx(-1)

    if (cmd === 'exit') {
      setHistory(h => [...h, { type: 'input', text: raw }])
      setTimeout(onClose, 200)
      return
    }

    if (cmd === 'clear') {
      setHistory([])
      return
    }

    const fn = COMMANDS[cmd]
    setHistory(h => [
      ...h,
      { type: 'input', text: raw },
      fn ? { type: 'output', lines: fn().output } : { type: 'error', text: raw },
    ])
  }, [onClose])

  const handleKey = (e) => {
    if (e.key === 'Enter') {
      runCommand(input)
      setInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(histIdx + 1, cmdHistory.length - 1)
      setHistIdx(next)
      setInput(cmdHistory[next] ?? '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = Math.max(histIdx - 1, -1)
      setHistIdx(next)
      setInput(next === -1 ? '' : cmdHistory[next])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="terminal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            className="terminal-window"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            <div className="t-titlebar">
              <div className="t-dots">
                <button className="t-dot-btn r" onClick={onClose} title="Close" />
                <div className="t-dot-btn y" />
                <div className="t-dot-btn g" />
              </div>
              <span className="t-title">faizan@portfolio — zsh — 80×24</span>
              <kbd className="t-hint">ESC to close</kbd>
            </div>

            <div className="t-body" onClick={() => inputRef.current?.focus()}>
              {history.map((entry, i) => <TerminalLine key={i} entry={entry} />)}

              <div className="t-input-line">
                <span className="t-prompt">faizan@portfolio</span>
                <span className="t-at">:</span>
                <span className="t-tilde">~</span>
                <span className="t-dollar">$</span>
                <input
                  ref={inputRef}
                  className="t-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  spellCheck={false}
                  autoComplete="off"
                  autoCapitalize="off"
                />
              </div>
              <div ref={bottomRef} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
