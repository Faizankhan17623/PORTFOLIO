const mongoose = require('mongoose')

const RETENTION_DAYS = 90

// One document per unique IP; repeat visits bump `count` instead of adding rows.
const visitorSchema = new mongoose.Schema({
  ip:        { type: String, required: true, unique: true, maxlength: 64 },
  device:    { type: String, default: 'Unknown', maxlength: 80 },
  userAgent: { type: String, default: '', maxlength: 300 },
  timezone:  { type: String, default: 'Unknown', maxlength: 64 },
  source:    { type: String, default: 'direct', maxlength: 40 },
  count:     { type: Number },
  firstSeen: { type: Date },
  lastSeen:  { type: Date, required: true },
})

// IPs are personal data, so rows expire on their own once a visitor has been gone for a while.
visitorSchema.index({ lastSeen: 1 }, { expireAfterSeconds: RETENTION_DAYS * 24 * 60 * 60 })

module.exports = mongoose.model('Visitor', visitorSchema)
