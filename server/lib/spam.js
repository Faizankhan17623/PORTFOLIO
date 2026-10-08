const crypto = require('crypto')

// Free, self-contained spam checks for the contact form (no external service, nothing to pay for).
const MIN_FILL_MS = 2500                    // people need a few seconds to fill a form; bots post instantly
const MAX_FILL_MS = 6 * 60 * 60 * 1000      // a form left open for hours is not a normal visit
const MAX_LINKS = 2
const DUPLICATE_WINDOW_MS = 60 * 60 * 1000
const DUPLICATE_CACHE_MAX = 2000

const SPAM_WORDS = /\b(viagra|cialis|casino|backlinks?|seo (services?|expert|packages?)|crypto (invest|trading)|forex|loan offer|escort|porn|bitcoin doubler|guaranteed traffic)\b/i
const LINK = /(https?:\/\/|www\.)/gi
const HAS_LINK = /(https?:\/\/|www\.)/i

const seen = new Map() // hash -> expiry ms

function isDuplicate(ip, message) {
  const now = Date.now()
  for (const [hash, expires] of seen) if (expires < now) seen.delete(hash)

  const hash = crypto.createHash('sha1').update(`${ip}|${message.toLowerCase().replace(/\s+/g, ' ')}`).digest('hex')
  if (seen.has(hash)) return true
  if (seen.size >= DUPLICATE_CACHE_MAX) seen.delete(seen.keys().next().value)
  seen.set(hash, now + DUPLICATE_WINDOW_MS)
  return false
}

// Returns a short reason when the submission looks like spam, otherwise null.
function spamReason({ name, message, company, website, elapsed }, ip) {
  if (typeof website === 'string' && website.trim() !== '') return 'honeypot filled'
  if (!Number.isFinite(elapsed)) return 'missing timing'
  if (elapsed < MIN_FILL_MS) return 'submitted too fast'
  if (elapsed > MAX_FILL_MS) return 'form open too long'

  const text = `${name} ${company || ''} ${message}`
  if ((text.match(LINK) || []).length > MAX_LINKS) return 'too many links'
  if (HAS_LINK.test(name)) return 'link in name'
  if (SPAM_WORDS.test(text)) return 'spam keywords'
  if (isDuplicate(ip, message)) return 'duplicate message'
  return null
}

// Log at most a few spam events per IP per hour so an attacker can't fill the audit log.
const logged = new Map() // ip -> { n, reset }
function shouldLogSpam(ip) {
  const now = Date.now()
  const rec = logged.get(ip)
  if (!rec || rec.reset < now) {
    if (logged.size > 2000) logged.clear()
    logged.set(ip, { n: 1, reset: now + 60 * 60 * 1000 })
    return true
  }
  rec.n += 1
  return rec.n <= 3
}

module.exports = { spamReason, shouldLogSpam }
