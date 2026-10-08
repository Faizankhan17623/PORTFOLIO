const mongoose = require('mongoose')

const RETENTION_DAYS = 180

// Audit trail: sign-ins, lockouts, blocks, deletions and server errors.
const adminEventSchema = new mongoose.Schema({
  type:   { type: String, required: true, maxlength: 40 },
  ip:     { type: String, default: '', maxlength: 64 },
  device: { type: String, default: '', maxlength: 80 },
  detail: { type: String, default: '', maxlength: 400 },
  at:     { type: Date, default: Date.now },
})

adminEventSchema.index({ at: -1 })
adminEventSchema.index({ at: 1 }, { expireAfterSeconds: RETENTION_DAYS * 24 * 60 * 60 })

module.exports = mongoose.model('AdminEvent', adminEventSchema)
