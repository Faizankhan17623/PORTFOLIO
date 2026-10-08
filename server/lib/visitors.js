const Visitor = require('../models/Visitor')

// "Chrome · Windows · Desktop" from a user-agent string. Good enough for a glance, not for fingerprinting.
function parseDevice(ua = '') {
  const bot = /bot|crawl|spider|slurp|headless|curl|wget|python-requests|axios|node-fetch/i.test(ua)

  let browser = 'Unknown browser'
  if (/Edg(e|A|iOS)?\//.test(ua)) browser = 'Edge'
  else if (/OPR\/|Opera/.test(ua)) browser = 'Opera'
  else if (/Firefox\/|FxiOS\//.test(ua)) browser = 'Firefox'
  else if (/Chrome\/|CriOS\//.test(ua)) browser = 'Chrome'
  else if (/Safari\//.test(ua)) browser = 'Safari'

  let os = 'Unknown OS'
  if (/Windows/.test(ua)) os = 'Windows'
  else if (/Android/.test(ua)) os = 'Android'
  else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS'
  else if (/Mac OS X|Macintosh/.test(ua)) os = 'macOS'
  else if (/CrOS/.test(ua)) os = 'ChromeOS'
  else if (/Linux/.test(ua)) os = 'Linux'

  let type = 'Desktop'
  if (bot) type = 'Bot'
  else if (/iPad|Tablet/i.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua))) type = 'Tablet'
  else if (/Mobi|iPhone|iPod/i.test(ua)) type = 'Mobile'

  return `${browser} · ${os} · ${type}`
}

const cleanIp = (ip = '') => String(ip).replace(/^::ffff:/, '').slice(0, 64) || 'unknown'
const cleanTimezone = (tz) => (typeof tz === 'string' && /^[A-Za-z0-9_+\-/]{1,64}$/.test(tz) ? tz : 'Unknown')

async function upsertVisit(ip, userAgent, timezone) {
  const now = new Date()
  await Visitor.updateOne(
    { ip },
    {
      $inc: { count: 1 },
      $set: { lastSeen: now, device: parseDevice(userAgent), userAgent, timezone },
      $setOnInsert: { firstSeen: now },
    },
    { upsert: true }
  )
}

// Records one visit for this IP. Never throws: the visitor counter must work even if this fails.
async function recordVisit(req) {
  const ip = cleanIp(req.ip)
  const userAgent = String(req.get('user-agent') || '').slice(0, 300)
  const timezone = cleanTimezone(req.body?.timezone)
  try {
    try {
      await upsertVisit(ip, userAgent, timezone)
    } catch (err) {
      // Two first-time requests from one IP can race on the unique index; the retry becomes a plain update.
      if (err.code !== 11000) throw err
      await upsertVisit(ip, userAgent, timezone)
    }
  } catch (err) {
    console.error('Visitor log failed:', err.message)
  }
}

module.exports = { recordVisit, parseDevice }
