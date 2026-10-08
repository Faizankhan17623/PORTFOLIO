const mongoose = require('mongoose')

const RETENTION_DAYS = 400

// One row per UTC day, so the admin charts don't depend on per-visit rows.
const dayStatSchema = new mongoose.Schema({
  day:          { type: Date, required: true }, // UTC midnight
  visits:       { type: Number },
  newVisitors:  { type: Number },
  resumeOpens:  { type: Number },
})

// One index does both jobs: one row per day (unique) and automatic expiry.
dayStatSchema.index({ day: 1 }, { unique: true, expireAfterSeconds: RETENTION_DAYS * 24 * 60 * 60 })

module.exports = mongoose.model('DayStat', dayStatSchema)
