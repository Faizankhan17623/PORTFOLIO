const crypto = require('crypto')

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000
const secret = () => process.env.ADMIN_TOKEN_SECRET || process.env.ADMIN_PASSWORD || ''

const sign = (payload) => crypto.createHmac('sha256', secret()).update(payload).digest('base64url')

function safeEqual(a, b) {
  const ab = Buffer.from(String(a))
  const bb = Buffer.from(String(b))
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb)
}

function issueToken() {
  const payload = String(Date.now() + TOKEN_TTL_MS)
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

function recordFailure(ip) {
  const rec = failures.get(ip)
  if (!rec || Date.now() - rec.first > WINDOW_MS) failures.set(ip, { count: 1, first: Date.now() })
  else rec.count += 1
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

module.exports = { issueToken, requireAdmin, safeEqual, isLocked, recordFailure }
