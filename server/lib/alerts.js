const { sendAlert } = require('./mailer')
const { logEvent } = require('./events')

const ERROR_EMAIL_GAP_MS = 15 * 60 * 1000
let lastSentAt = 0
let suppressed = 0

// Logs a server error and emails it, at most once per 15 minutes so a failure loop can't flood the inbox.
function alertError(err, where, req) {
  const message = err?.message || String(err)
  logEvent('server-error', req, `${where}: ${message}`)

  const now = Date.now()
  if (now - lastSentAt < ERROR_EMAIL_GAP_MS) { suppressed += 1; return }
  const skipped = suppressed
  lastSentAt = now
  suppressed = 0

  const stack = String(err?.stack || '').split('\n').slice(1, 6).map((line) => line.trim())
  sendAlert('Portfolio server error', [
    `Something failed on the portfolio server (${where}).`,
    '',
    `Error: ${message}`,
    ...stack,
    '',
    skipped ? `${skipped} similar error(s) happened since the last alert and were not emailed.` : 'Further errors will be grouped for 15 minutes.',
  ])
}

module.exports = { alertError }
