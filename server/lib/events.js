const AdminEvent = require('../models/AdminEvent')
const { parseDevice, cleanIp } = require('./visitors')

// Writes one audit entry. Never throws: logging must not break the request that triggered it.
async function logEvent(type, req, detail = '') {
  try {
    await AdminEvent.create({
      type,
      ip: req ? cleanIp(req.ip) : '',
      device: req ? parseDevice(String(req.get('user-agent') || '')) : '',
      detail: String(detail).slice(0, 400),
    })
  } catch (err) {
    console.error('Event log failed:', err.message)
  }
}

module.exports = { logEvent }
