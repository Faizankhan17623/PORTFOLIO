// Tiny pub/sub achievement engine. Unlocks persist in localStorage so
// returning visitors keep their trophies; listeners get the definition of
// each newly unlocked achievement (used by the toast stack).

const STORAGE_KEY = 'ff_achievements'

export const ACHIEVEMENTS = [
  { id: 'first_contact', icon: '👋', title: 'First Contact', desc: 'Booted into the portfolio' },
  { id: 'command_center', icon: '⌘', title: 'Command Center', desc: 'Opened the command palette' },
  { id: 'terminal_hacker', icon: '💻', title: 'Shell Access', desc: 'Opened the terminal' },
  { id: 'matrix_mode', icon: '🕶️', title: 'Red Pill', desc: 'Entered the Matrix' },
  { id: 'ai_whisperer', icon: '🤖', title: 'AI Whisperer', desc: 'Talked to the AI assistant' },
  { id: 'deep_diver', icon: '🌊', title: 'Deep Diver', desc: 'Scrolled all the way down' },
  { id: 'night_owl', icon: '🦉', title: 'Night Owl', desc: 'Visited between midnight and 5 AM' },
  { id: 'konami_master', icon: '🕹️', title: 'Cheat Code Activated', desc: 'Entered the Konami code' },
]

function load() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY)) || [])
  } catch {
    return new Set()
  }
}

const unlocked = load()
const listeners = new Set()

export function isUnlocked(id) {
  return unlocked.has(id)
}

export function unlockedCount() {
  return unlocked.size
}

export function unlock(id) {
  const def = ACHIEVEMENTS.find(a => a.id === id)
  if (!def || unlocked.has(id)) return
  unlocked.add(id)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...unlocked]))
  } catch { /* private mode — trophies just won't persist */ }
  listeners.forEach(fn => fn(def))
}

export function onUnlock(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
