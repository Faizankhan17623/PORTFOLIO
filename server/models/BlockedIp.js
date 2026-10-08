const mongoose = require('mongoose')

const blockedIpSchema = new mongoose.Schema({
  ip:     { type: String, required: true, unique: true, maxlength: 64 },
  reason: { type: String, default: '', maxlength: 200 },
  at:     { type: Date, default: Date.now },
})

module.exports = mongoose.model('BlockedIp', blockedIpSchema)
