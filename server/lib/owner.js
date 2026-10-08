const Visitor = require('../models/Visitor')
const ResumeOpen = require('../models/ResumeOpen')
const { cleanIp } = require('./visitors')

// The site owner's own visits must not show up in the stats. Their IP keeps changing, so instead of a fixed
// list we remember the address of every successful admin sign-in for a while. Visits from it are not
// recorded, and rows already recorded for it are removed. (A browser also marks itself on sign-in, which
// covers the same device after the IP changes; see src/lib/owner.js.)
const OWNER_WINDOW_MS = 12 * 60 * 60 * 1000
const MAX_REMEMBERED = 50
const owners = new Map() // ip -> expiry (ms)

function isOwnerIp(ip) {
  const key = cleanIp(ip)
  const expires = owners.get(key)
  if (!expires) return false
  if (expires < Date.now()) { owners.delete(key); return false }
  return true
}

// Called after a successful admin sign-in. Never throws.
async function markOwnerIp(ip) {
  const key = cleanIp(ip)
  if (key === 'unknown') return
  const now = Date.now()
  for (const [known, expires] of owners) if (expires < now) owners.delete(known)
  if (owners.size >= MAX_REMEMBERED) owners.delete(owners.keys().next().value)
  owners.set(key, now + OWNER_WINDOW_MS)

  try {
    await Promise.all([Visitor.deleteMany({ ip: key }), ResumeOpen.deleteMany({ ip: key })])
  } catch (err) {
    console.error('Owner cleanup failed:', err.message)
  }
}

module.exports = { isOwnerIp, markOwnerIp }
