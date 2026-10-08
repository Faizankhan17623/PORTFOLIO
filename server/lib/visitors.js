const Visitor = require('../models/Visitor')
const ResumeOpen = require('../models/ResumeOpen')

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

const isBotDevice = (device) => device.endsWith('· Bot')
const cleanIp = (ip = '') => String(ip).replace(/^::ffff:/, '').slice(0, 64) || 'unknown'
const cleanTimezone = (tz) => (typeof tz === 'string' && /^[A-Za-z0-9_+\-/]{1,64}$/.test(tz) ? tz : 'Unknown')
// Where a visit came from: a ?ref= tag, a UTM source or the referrer's hostname. Anything odd becomes "direct".
const cleanSource = (src, fallback = 'direct') => {
  const value = typeof src === 'string' ? src.trim().toLowerCase().replace(/^www\./, '') : ''
  return /^[a-z0-9._-]{1,40}$/.test(value) ? value : fallback
}

const uaOf = (req) => String(req.get('user-agent') || '').slice(0, 300)

async function upsertVisit(ip, userAgent, timezone, source) {
  const now = new Date()
  const set = { lastSeen: now, device: parseDevice(userAgent), userAgent, timezone }
  const setOnInsert = { firstSeen: now }
  // A direct visit shouldn't wipe out the source we learned from an earlier tagged visit.
  if (source !== 'direct') set.source = source
  else setOnInsert.source = 'direct'

  const result = await Visitor.updateOne({ ip }, { $inc: { count: 1 }, $set: set, $setOnInsert: setOnInsert }, { upsert: true })
  return result.upsertedCount > 0
}

// Records one visit for this IP. Never throws: the visitor counter must work even if this fails.
// Resolves to { isNew, bot } so the caller can feed the daily stats.
async function recordVisit(req) {
  const ip = cleanIp(req.ip)
  const userAgent = uaOf(req)
  const timezone = cleanTimezone(req.body?.timezone)
  const source = cleanSource(req.body?.source)
  const bot = isBotDevice(parseDevice(userAgent))
  try {
    let isNew
    try {
      isNew = await upsertVisit(ip, userAgent, timezone, source)
    } catch (err) {
      // Two first-time requests from one IP can race on the unique index; the retry becomes a plain update.
      if (err.code !== 11000) throw err
      isNew = await upsertVisit(ip, userAgent, timezone, source)
    }
    return { isNew, bot }
  } catch (err) {
    console.error('Visitor log failed:', err.message)
    return { isNew: false, bot }
  }
}

const RESUME_DEDUPE_MS = 5000

// Records a résumé click. Clicks from one IP within a few seconds count once (double-clicks, retries).
// Resolves to true when it was counted. Never throws.
async function recordResumeOpen(req) {
  const ip = cleanIp(req.ip)
  const userAgent = uaOf(req)
  const now = new Date()
  const filter = { ip, lastAt: { $lt: new Date(now.getTime() - RESUME_DEDUPE_MS) } }
  try {
    await ResumeOpen.updateOne(
      filter,
      {
        $inc: { count: 1 },
        $set: {
          lastAt: now,
          device: parseDevice(userAgent),
          userAgent,
          timezone: cleanTimezone(req.body?.timezone),
          lastSource: cleanSource(req.body?.source, 'unknown'),
        },
        $setOnInsert: { firstAt: now },
      },
      { upsert: true }
    )
    return true
  } catch (err) {
    // The filter excludes a very recent row, so the upsert collides with the unique index: a duplicate click.
    if (err.code === 11000) return false
    console.error('Resume log failed:', err.message)
    return false
  }
}

module.exports = { recordVisit, recordResumeOpen, parseDevice, cleanIp, cleanSource, isBotDevice }
