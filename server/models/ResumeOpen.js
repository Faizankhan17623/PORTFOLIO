const mongoose = require('mongoose')

const RETENTION_DAYS = 365

// One row per IP that clicked a résumé button; repeat clicks bump `count`.
const resumeOpenSchema = new mongoose.Schema({
  ip:         { type: String, required: true, unique: true, maxlength: 64 },
  device:     { type: String, default: 'Unknown', maxlength: 80 },
  userAgent:  { type: String, default: '', maxlength: 300 },
  timezone:   { type: String, default: 'Unknown', maxlength: 64 },
  lastSource: { type: String, default: 'unknown', maxlength: 40 },
  count:      { type: Number },
  firstAt:    { type: Date },
  lastAt:     { type: Date, required: true },
})

resumeOpenSchema.index({ lastAt: 1 }, { expireAfterSeconds: RETENTION_DAYS * 24 * 60 * 60 })

module.exports = mongoose.model('ResumeOpen', resumeOpenSchema)
