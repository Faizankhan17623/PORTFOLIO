// Theme switcher — swaps the CSS custom-property palette via a data-theme
// attribute on <html>. Persisted in localStorage; applied at import time so
// the saved theme paints before first render.

const STORAGE_KEY = 'ff_theme'

export const THEMES = [
  { id: 'noir', name: 'Neon Noir', icon: '◉', desc: 'Toxic green & cyan — the original' },
  { id: 'blade', name: 'Blade Runner', icon: '◉', desc: 'Hot pink, purple & neon orange' },
  { id: 'ghost', name: 'Ghost', icon: '◉', desc: 'Monochrome ice — white & blue' },
]

export function getTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return THEMES.some(t => t.id === saved) ? saved : 'noir'
  } catch {
    return 'noir'
  }
}

export function applyTheme(id) {
  if (!THEMES.some(t => t.id === id)) return false
  document.documentElement.dataset.theme = id
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch { /* private mode — theme just won't persist */ }
  return true
}

applyTheme(getTheme())
