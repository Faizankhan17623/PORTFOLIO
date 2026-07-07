// Synthesized UI sound design — every effect is generated with the Web Audio
// API (no audio files). The AudioContext is created lazily on first use so we
// respect autoplay policies; mute preference persists in localStorage.

const STORAGE_KEY = 'ff_sound_muted'

let ctx = null
let muted = (() => {
  try { return localStorage.getItem(STORAGE_KEY) === '1' } catch { return false }
})()
const listeners = new Set()

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

function tone({ type = 'sine', from = 440, to = from, dur = 0.1, gain = 0.05, delay = 0 }) {
  if (muted) return
  const c = ac()
  if (!c) return
  const t0 = c.currentTime + delay
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(from, t0)
  if (to !== from) osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), t0 + dur)
  g.gain.setValueAtTime(gain, t0)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g)
  g.connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

export const sfx = {
  hover: () => tone({ type: 'square', from: 2400, dur: 0.012, gain: 0.012 }),
  click: () => tone({ type: 'square', from: 1300, to: 700, dur: 0.05, gain: 0.035 }),
  key: () => tone({ type: 'square', from: 1700 + Math.random() * 600, dur: 0.015, gain: 0.02 }),
  enter: () => tone({ type: 'square', from: 880, to: 1100, dur: 0.07, gain: 0.03 }),
  error: () => tone({ type: 'sawtooth', from: 220, to: 110, dur: 0.18, gain: 0.05 }),
  open: () => tone({ from: 320, to: 900, dur: 0.16, gain: 0.04 }),
  close: () => tone({ from: 900, to: 320, dur: 0.14, gain: 0.03 }),
  achievement: () => {
    tone({ from: 659, dur: 0.09, gain: 0.05 })
    tone({ from: 988, dur: 0.14, gain: 0.05, delay: 0.09 })
    tone({ from: 1319, dur: 0.22, gain: 0.04, delay: 0.18 })
  },
  coin: () => {
    tone({ type: 'square', from: 988, dur: 0.08, gain: 0.05 })
    tone({ type: 'square', from: 1319, dur: 0.18, gain: 0.05, delay: 0.08 })
  },
  eat: () => tone({ type: 'square', from: 660, to: 990, dur: 0.05, gain: 0.045 }),
  gameOver: () => {
    tone({ type: 'square', from: 494, dur: 0.15, gain: 0.05 })
    tone({ type: 'square', from: 370, dur: 0.15, gain: 0.05, delay: 0.15 })
    tone({ type: 'square', from: 247, dur: 0.32, gain: 0.05, delay: 0.3 })
  },
  powerDown: () => tone({ type: 'sawtooth', from: 400, to: 40, dur: 0.7, gain: 0.07 }),
  theme: () => {
    tone({ from: 523, dur: 0.06, gain: 0.04 })
    tone({ from: 784, dur: 0.06, gain: 0.04, delay: 0.06 })
    tone({ from: 1046, dur: 0.12, gain: 0.04, delay: 0.12 })
  },
}

export function isMuted() {
  return muted
}

export function setMuted(m) {
  muted = m
  try { localStorage.setItem(STORAGE_KEY, m ? '1' : '0') } catch { /* ignore */ }
  listeners.forEach(fn => fn(m))
}

export function toggleMuted() {
  setMuted(!muted)
  return muted
}

export function onMuteChange(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
