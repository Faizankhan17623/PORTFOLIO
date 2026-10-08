const DayStat = require('../models/DayStat')

const dayStart = (date = new Date()) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))

// Adds to today's (UTC) totals. Never throws.
async function bumpDay(inc) {
  const clean = Object.fromEntries(Object.entries(inc).filter(([, n]) => n > 0))
  if (!Object.keys(clean).length) return
  try {
    await DayStat.updateOne({ day: dayStart() }, { $inc: clean }, { upsert: true })
  } catch (err) {
    // A concurrent first write of the day can collide on the unique index; one retry makes it a plain update.
    if (err.code === 11000) {
      try { await DayStat.updateOne({ day: dayStart() }, { $inc: clean }) } catch { /* stats are best effort */ }
    } else {
      console.error('Stats update failed:', err.message)
    }
  }
}

module.exports = { bumpDay, dayStart }
