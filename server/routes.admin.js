const net = require('net')
const express = require('express')
const mongoose = require('mongoose')
const rateLimit = require('express-rate-limit')
const Message = require('./models/Message')
const Visitor = require('./models/Visitor')
const ResumeOpen = require('./models/ResumeOpen')
const DayStat = require('./models/DayStat')
const AdminEvent = require('./models/AdminEvent')
const BlockedIp = require('./models/BlockedIp')
const { issueToken, requireAdmin, safeEqual, isLocked, recordFailure, MAX_FAILS } = require('./lib/adminAuth')
const { cleanIp, parseDevice } = require('./lib/visitors')
const { blockIp, unblockIp } = require('./lib/blocklist')
const { logEvent } = require('./lib/events')
const { sendAlert, emailStatus } = require('./lib/mailer')
const { markOwnerIp } = require('./lib/owner')
const { dayStart } = require('./lib/stats')

const router = express.Router()
const DAY_MS = 24 * 60 * 60 * 1000
const NOT_BOT = { device: { $not: /· Bot$/ } }

// Nothing under /api/admin should ever be cached by a browser or a proxy.
router.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

router.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests. Slow down.' },
}))

const whenLabel = () => `${new Date().toUTCString()}`

router.post('/login', (req, res) => {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected || expected.length < 12) return res.status(503).json({ error: 'Unavailable.' })
  if (isLocked(req.ip)) return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' })

  if (typeof req.body?.password !== 'string' || !safeEqual(req.body.password, expected)) {
    const attempts = recordFailure(req.ip)
    logEvent('login-failed', req, `attempt ${attempts} of ${MAX_FAILS}`)
    if (attempts === MAX_FAILS) {
      logEvent('lockout', req, 'locked for 15 minutes')
      sendAlert('Admin lockout: repeated wrong passwords', [
        'Someone entered the wrong admin password too many times and has been locked out for 15 minutes.',
        '',
        `IP: ${cleanIp(req.ip)}`,
        `Device: ${parseDevice(String(req.get('user-agent') || ''))}`,
        `Time: ${whenLabel()}`,
      ])
    }
    return res.status(401).json({ error: 'Incorrect password.' })
  }

  logEvent('login-success', req)
  markOwnerIp(req.ip) // from now on this address is treated as the owner's and left out of the stats
  sendAlert('Admin sign-in', [
    'Your admin dashboard was just signed in to.',
    '',
    `IP: ${cleanIp(req.ip)}`,
    `Device: ${parseDevice(String(req.get('user-agent') || ''))}`,
    `Time: ${whenLabel()}`,
    '',
    'If this was not you, change ADMIN_PASSWORD and ADMIN_TOKEN_SECRET on the server right away.',
  ])
  res.json({ token: issueToken() })
})

// ── Messages ────────────────────────────────────────────
router.get('/messages', requireAdmin, async (_req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 }).limit(500).lean()
  res.json({ messages })
})

router.patch('/messages/:id', requireAdmin, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Bad id.' })
  const body = req.body || {}
  const update = {}
  for (const key of ['read', 'starred', 'replied']) if (typeof body[key] === 'boolean') update[key] = body[key]
  if (typeof body.note === 'string') update.note = body.note.slice(0, 1000)
  if (!Object.keys(update).length) return res.status(400).json({ error: 'Nothing to update.' })

  const message = await Message.findByIdAndUpdate(req.params.id, update, { new: true })
  if (!message) return res.status(404).json({ error: 'Not found.' })
  res.json({ message })
})

router.delete('/messages/:id', requireAdmin, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Bad id.' })
  const removed = await Message.findByIdAndDelete(req.params.id)
  if (removed) logEvent('message-deleted', req, `message from ${removed.name}`)
  res.json({ success: true })
})

// ── Pagination helper ───────────────────────────────────
const pageParams = (query, defaultLimit = 10) => ({
  limit: Math.min(Math.max(parseInt(query.limit, 10) || defaultLimit, 1), 50),
  wanted: Math.max(parseInt(query.page, 10) || 1, 1),
})

async function paginate(model, query, { sort, select = '-__v', defaultLimit = 10 }) {
  const { limit, wanted } = pageParams(query, defaultLimit)
  const total = await model.countDocuments()
  const pages = Math.max(Math.ceil(total / limit), 1)
  const page = Math.min(wanted, pages)
  const rows = await model.find().sort(sort).skip((page - 1) * limit).limit(limit).select(select).lean()
  return { rows, page, pages, total, limit }
}

// ── Visitors ────────────────────────────────────────────
router.get('/visits', requireAdmin, async (req, res) => {
  const { rows, ...meta } = await paginate(Visitor, req.query, { sort: { lastSeen: -1 } })
  const blocked = new Set((await BlockedIp.find({ ip: { $in: rows.map((row) => row.ip) } }).select('ip').lean()).map((row) => row.ip))
  res.json({ visits: rows.map((row) => ({ ...row, blocked: blocked.has(row.ip) })), ...meta })
})

// ── Résumé opens ────────────────────────────────────────
router.get('/resume-downloads', requireAdmin, async (req, res) => {
  const { rows, ...meta } = await paginate(ResumeOpen, req.query, { sort: { lastAt: -1 } })
  res.json({ downloads: rows, ...meta })
})

// ── Analytics ───────────────────────────────────────────
const sumRange = (series, days, field) => series.slice(-days).reduce((sum, day) => sum + day[field], 0)

router.get('/analytics', requireAdmin, async (_req, res) => {
  const days = 30
  const since = new Date(dayStart().getTime() - (days - 1) * DAY_MS)
  const rows = await DayStat.find({ day: { $gte: since } }).lean()
  const byDay = new Map(rows.map((row) => [row.day.getTime(), row]))
  const series = Array.from({ length: days }, (_, i) => {
    const day = new Date(since.getTime() + i * DAY_MS)
    const row = byDay.get(day.getTime()) || {}
    return { day: day.toISOString().slice(0, 10), visits: row.visits || 0, newVisitors: row.newVisitors || 0, resumeOpens: row.resumeOpens || 0 }
  })

  // Rows from before a field existed have no value for it; group them under the fallback label.
  const top = (field, fallback = 'Unknown') => Visitor.aggregate([
    { $match: NOT_BOT },
    { $group: { _id: { $ifNull: [`$${field}`, fallback] }, visitors: { $sum: 1 }, visits: { $sum: '$count' } } },
    { $sort: { visitors: -1, visits: -1 } },
    { $limit: 8 },
  ])

  const [uniqueVisitors, bots, visitTotals, sources, timezones, devices, resumeIps, resumeTotals, messageTotal, messageUnread] = await Promise.all([
    Visitor.countDocuments(NOT_BOT),
    Visitor.countDocuments({ device: /· Bot$/ }),
    Visitor.aggregate([{ $match: NOT_BOT }, { $group: { _id: null, visits: { $sum: '$count' } } }]),
    top('source', 'direct'),
    top('timezone'),
    top('device'),
    ResumeOpen.countDocuments(),
    ResumeOpen.aggregate([{ $group: { _id: null, opens: { $sum: '$count' } } }]),
    Message.countDocuments(),
    Message.countDocuments({ read: false }),
  ])

  const label = (rows) => rows.map((row) => ({ name: row._id || 'Unknown', visitors: row.visitors, visits: row.visits }))
  res.json({
    series,
    totals: {
      uniqueVisitors,
      bots,
      totalVisits: visitTotals[0]?.visits || 0,
      visitsToday: sumRange(series, 1, 'visits'),
      visits7: sumRange(series, 7, 'visits'),
      visits30: sumRange(series, 30, 'visits'),
      newVisitors7: sumRange(series, 7, 'newVisitors'),
      resumeUniqueIps: resumeIps,
      resumeOpens: resumeTotals[0]?.opens || 0,
      resumeOpens7: sumRange(series, 7, 'resumeOpens'),
      messages: messageTotal,
      unread: messageUnread,
    },
    sources: label(sources),
    timezones: label(timezones),
    devices: label(devices),
  })
})

// ── Security: audit log + blocked IPs ───────────────────
router.get('/events', requireAdmin, async (req, res) => {
  const { rows, ...meta } = await paginate(AdminEvent, req.query, { sort: { at: -1 }, defaultLimit: 15 })
  res.json({ events: rows, ...meta })
})

router.get('/blocked', requireAdmin, async (_req, res) => {
  const blocked = await BlockedIp.find().sort({ at: -1 }).limit(200).select('-__v').lean()
  res.json({ blocked })
})

router.post('/blocked', requireAdmin, async (req, res) => {
  const ip = cleanIp(typeof req.body?.ip === 'string' ? req.body.ip.trim() : '')
  if (!net.isIP(ip)) return res.status(400).json({ error: 'That is not a valid IP address.' })
  if (ip === cleanIp(req.ip)) return res.status(400).json({ error: 'You cannot block the IP you are using right now.' })
  const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim().slice(0, 200) : ''
  await blockIp(ip, reason)
  logEvent('ip-blocked', req, `${ip}${reason ? ` (${reason})` : ''}`)
  res.json({ success: true })
})

router.delete('/blocked/:ip', requireAdmin, async (req, res) => {
  const ip = cleanIp(req.params.ip)
  if (!net.isIP(ip)) return res.status(400).json({ error: 'Bad IP.' })
  await unblockIp(ip)
  logEvent('ip-unblocked', req, ip)
  res.json({ success: true })
})

// ── Status (read-only) ──────────────────────────────────
router.get('/status', requireAdmin, async (_req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting']
  const state = states[mongoose.connection.readyState] || 'unknown'

  let latencyMs = null
  if (state === 'connected') {
    const started = Date.now()
    try { await mongoose.connection.db.admin().ping(); latencyMs = Date.now() - started } catch { /* shown as unknown */ }
  }

  const dayAgo = new Date(Date.now() - DAY_MS)
  const [recentErrors, spam24h, blockedCount, latestMessage] = await Promise.all([
    AdminEvent.find({ type: 'server-error' }).sort({ at: -1 }).limit(5).select('detail at').lean(),
    AdminEvent.countDocuments({ type: 'spam-blocked', at: { $gte: dayAgo } }),
    BlockedIp.countDocuments(),
    Message.findOne().sort({ createdAt: -1 }).select('emailStatus createdAt').lean(),
  ])

  const password = process.env.ADMIN_PASSWORD || ''
  res.json({
    server: {
      uptimeSeconds: Math.round(process.uptime()),
      node: process.version,
      memoryMb: Math.round(process.memoryUsage().rss / 1048576),
      environment: process.env.NODE_ENV || 'development',
    },
    database: { state, latencyMs },
    email: { ...emailStatus(), latestMessage: latestMessage ? { at: latestMessage.createdAt, status: latestMessage.emailStatus || 'not sent yet' } : null },
    security: {
      passwordStrong: password.length >= 12,
      tokenSecretSet: !!process.env.ADMIN_TOKEN_SECRET,
      blockedIps: blockedCount,
      spamBlocked24h: spam24h,
    },
    recentErrors,
  })
})

module.exports = router
