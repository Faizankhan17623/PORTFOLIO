import { useEffect, useRef, useState } from 'react'
import { unlock } from '../lib/achievements'
import { motion, AnimatePresence } from 'framer-motion'

const QUICK_ASKS = [
  'Who are you?',
  'What is your tech stack?',
  'Best project?',
  'Are you available for hire?',
  'How can I contact you?',
  'Why should I hire you?',
]

const RESPONSES = {
  'who are you?':
    "I'm Faizan Khan, a full-stack developer based in Pune. I design, build, and deploy production-grade web applications across the MERN stack, and I'm currently expanding into AI-integrated products with LLM features.",
  'what is your tech stack?':
    "Languages: JavaScript and Python.\nFrontend: React.js, HTML, CSS, Tailwind CSS, and Bootstrap.\nBackend and data: Node.js, Express.js, MongoDB, and SQL.\nTesting and delivery: Postman, Selenium, Git, GitHub, Docker, GitHub Actions, Vercel, Render, and AWS.\nCurrent focus: LLM integrations and AI/ML fundamentals.",
  'best project?':
    "Resumify is a full-stack career platform with an ATS-aware résumé scan, an 11-template builder with PDF and DOCX export, recruiter workflows, and AI candidate-fit scoring. You can try it at ai-resume-enhancer-v2.vercel.app. I also built Notewise, an AI study companion for grounded notes, flashcards, quizzes, and chat.",
  'are you available for hire?':
    "I'm available immediately and based in Pune, Maharashtra, India. Email me at faizankhan901152@gmail.com or call +91 90115 75978.",
  'how can i contact you?':
    "Email: faizankhan901152@gmail.com\nPhone: +91 90115 75978\nLinkedIn: linkedin.com/in/faizankhan-fullstack\nGitHub: github.com/Faizankhan17623\nLeetCode: leetcode.com/u/MADMAN9656/",
  'why should i hire you?':
    "I take ownership across the full product cycle: design, implementation, deployment, debugging, and ongoing improvement. Resumify and Notewise show how I work through complex product flows, and I bring a strong problem-solving mindset, adaptability, and a habit of continuous learning.",
}

function getResponse(q) {
  const key = q.trim().toLowerCase()
  if (RESPONSES[key]) return RESPONSES[key]
  // fuzzy match
  for (const k of Object.keys(RESPONSES)) {
    const words = k.split(' ').filter(w => w.length > 3)
    if (words.some(w => key.includes(w))) return RESPONSES[k]
  }
  if (key.includes('hire') || key.includes('job') || key.includes('work')) return RESPONSES['are you available for hire?']
  if (key.includes('contact') || key.includes('email') || key.includes('reach')) return RESPONSES['how can i contact you?']
  if (key.includes('skill') || key.includes('stack') || key.includes('tech')) return RESPONSES['what is your tech stack?']
  if (key.includes('project') || key.includes('work') || key.includes('build')) return RESPONSES['best project?']
  return "For anything I haven't covered, email me at faizankhan901152@gmail.com. You can also explore my projects and résumé on this portfolio."
}

function TypingDots() {
  return (
    <div className="ai-typing">
      <span /><span /><span />
    </div>
  )
}

export default function AIChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { from: 'ai', text: "Hey 👋 I'm Faizan's AI assistant. Ask me anything about him — his stack, projects, availability." },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  const send = (text) => {
    const msg = (text ?? input).trim()
    if (!msg) return
    unlock('ai_whisperer')
    setMessages(m => [...m, { from: 'user', text: msg }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages(m => [...m, { from: 'ai', text: getResponse(msg) }])
    }, 700 + Math.random() * 500)
  }

  return (
    <>
      <motion.button
        className={`ai-fab ${open ? 'open' : ''}`}
        onClick={() => setOpen(o => !o)}
        // Continuous idle float so the button reads as "alive" even before it's touched.
        animate={open ? { y: 0, rotate: 0 } : { y: [0, -10, 0], rotate: [0, -4, 4, 0] }}
        transition={open ? { duration: 0.3 } : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={{ scale: 1.06, y: -4 }}
        whileTap={{ scale: 0.94 }}
        aria-label="Open AI chat"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <>
            <span className="ai-fab-icon">✨</span>
            <span className="ai-fab-dot" />
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="ai-chat-panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          >
            <div className="ai-chat-head">
              <div className="ai-chat-head-left">
                <div className="ai-avatar">✦</div>
                <div>
                  <div className="ai-chat-title">Faizan's AI</div>
                  <div className="ai-chat-status"><span className="ai-status-dot" /> Online</div>
                </div>
              </div>
              <button className="ai-chat-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
            </div>

            <div className="ai-chat-body" ref={scrollRef}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  className={`ai-msg ai-msg-${m.from}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {m.from === 'ai' && <div className="ai-msg-avatar">✦</div>}
                  <div className="ai-msg-bubble">
                    {m.text.split('\n').map((line, j) => (
                      <span key={j}>{line}{j < m.text.split('\n').length - 1 && <br />}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
              {typing && (
                <div className="ai-msg ai-msg-ai">
                  <div className="ai-msg-avatar">✦</div>
                  <div className="ai-msg-bubble"><TypingDots /></div>
                </div>
              )}
            </div>

            <div className="ai-chat-quick">
              {QUICK_ASKS.map(q => (
                <button key={q} className="ai-quick-btn" onClick={() => send(q)}>{q}</button>
              ))}
            </div>

            <form
              className="ai-chat-input-row"
              onSubmit={(e) => { e.preventDefault(); send() }}
            >
              <input
                className="ai-chat-input"
                placeholder="Ask anything…"
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <button type="submit" className="ai-chat-send" aria-label="Send">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
