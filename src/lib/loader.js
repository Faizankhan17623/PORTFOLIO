import { API_URL } from './contactApi'

// Shared state for the opening loader. Kept free of heavy imports so the main bundle can use it freely.
// The loader shows once per browser tab (sessionStorage), so moving around or reloading does not repeat it.
const SEEN_KEY = 'portfolio_intro_seen'

const alreadySeen = () => {
  try { return sessionStorage.getItem(SEEN_KEY) === '1' } catch { return false }
}

let done = alreadySeen()
const listeners = new Set()

export const isLoaderDone = () => done

export function finishLoader() {
  if (done) return
  done = true
  try { sessionStorage.setItem(SEEN_KEY, '1') } catch { /* private mode: it simply shows again next time */ }
  listeners.forEach((callback) => callback())
  listeners.clear()
}

// Runs `callback` when the loader finishes (straight away if it already has). Returns an unsubscribe function.
export function onLoaderDone(callback) {
  if (done) { callback(); return () => {} }
  listeners.add(callback)
  return () => listeners.delete(callback)
}

// Resolves when the hero 3D scene has drawn its first frame (or when 3D is not available at all).
let resolveHero
export const heroReady = new Promise((resolve) => { resolveHero = resolve })
export const markHeroReady = () => resolveHero()

// The free server goes to sleep when idle and takes a while to wake up. This pings it as early as possible
// (no-cors, so the answer is not needed, only that the server responded) and never rejects.
let wakePromise
export function wakeBackend() {
  if (!wakePromise) {
    wakePromise = fetch(`${API_URL}/health`, { mode: 'no-cors', cache: 'no-store' }).then(() => true, () => false)
  }
  return wakePromise
}
if (!done) wakeBackend()
