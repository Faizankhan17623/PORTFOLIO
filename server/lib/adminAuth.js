const crypto = require('crypto')

// How long one sign-in lasts. Default 60 minutes; ADMIN_SESSION_MINUTES overrides it (1 to 720).
// This only ends the login session: the password itself never changes.
const sessionMinutes = () => Math.min(Math.max(Number(process.env.ADMIN_SESSION_MINUTES) || 60, 1), 720)
const secret = () => process.env.ADMIN_TOKEN_SECRET || process.env.ADMIN_PASSWORD || ''

const sign = (payload) => crypto.createHmac('sha256', secret()).update(payload).digest('base64url')

function safeEqual(a, b) {
  const ab = Buffer.from(String(a))
  const bb = Buffer.from(String(b))
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb)
}

function issueToken() {
  const payload = String(Date.now() + sessionMinutes() * 60 * 1000)
  return `${payload}.${sign(payload)}`
}

function verifyToken(token = '') {
  const [payload, sig] = token.split('.')
  if (!payload || !sig || !secret()) return false
  return safeEqual(sig, sign(payload)) && Number(payload) > Date.now()
}

// Simple in-memory limiter for login attempts (per IP).
const failures = new Map()
const WINDOW_MS = 15 * 60 * 1000
const MAX_FAILS = 5

function isLocked(ip) {
  const rec = failures.get(ip)
  if (!rec) return false
  if (Date.now() - rec.first > WINDOW_MS) { failures.delete(ip); return false }
  return rec.count >= MAX_FAILS
}

// Returns how many failures this IP has now, so the caller can react when it first hits the lockout.
function recordFailure(ip) {
  const rec = failures.get(ip)
  if (!rec || Date.now() - rec.first > WINDOW_MS) {
    failures.set(ip, { count: 1, first: Date.now() })
    return 1
  }
  rec.count += 1
  return rec.count
}

// Drop expired lockout records so a flood of different IPs can't grow this map forever.
setInterval(() => {
  const now = Date.now()
  for (const [ip, rec] of failures) if (now - rec.first > WINDOW_MS) failures.delete(ip)
}, WINDOW_MS).unref()

function requireAdmin(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '')
  if (!verifyToken(token)) return res.status(401).json({ error: 'Unauthorized' })
  next()
}

module.exports = { issueToken, requireAdmin, safeEqual, isLocked, recordFailure, MAX_FAILS }
