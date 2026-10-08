// The site owner's own browser should not count as a visitor. Signing in to the dashboard marks the browser
// (the owner's IP keeps changing, so a fixed IP list would not work); the dashboard has a switch to undo it.
const KEY = 'portfolio_owner_device'

export const isOwnerDevice = () => {
  try { return localStorage.getItem(KEY) === '1' } catch { return false }
}

export const setOwnerDevice = (on) => {
  try { on ? localStorage.setItem(KEY, '1') : localStorage.removeItem(KEY) } catch { /* storage unavailable */ }
}
