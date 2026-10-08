const BlockedIp = require('../models/BlockedIp')
const { cleanIp } = require('./visitors')

// Kept in memory so the check on every request costs nothing; refreshed from the database regularly.
let blocked = new Set()

async function refreshBlocklist() {
  try {
    const rows = await BlockedIp.find().select('ip').lean()
    blocked = new Set(rows.map((row) => row.ip))
  } catch (err) {
    console.error('Blocklist refresh failed:', err.message)
  }
}

setInterval(refreshBlocklist, 60 * 1000).unref()

const isBlocked = (ip) => blocked.has(cleanIp(ip))

// Blocked IPs get a flat 403 everywhere except the health check.
function blockedGuard(req, res, next) {
  if (req.path === '/health') return next()
  if (isBlocked(req.ip)) return res.status(403).json({ error: 'Forbidden' })
  next()
}

async function blockIp(ip, reason = '') {
  await BlockedIp.updateOne({ ip }, { $setOnInsert: { ip, reason: String(reason).slice(0, 200), at: new Date() } }, { upsert: true })
  blocked.add(ip)
}

async function unblockIp(ip) {
  await BlockedIp.deleteOne({ ip })
  blocked.delete(ip)
}

module.exports = { blockedGuard, blockIp, unblockIp, refreshBlocklist, isBlocked }
