const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true, maxlength: 100 },
    email:   { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    company: { type: String, trim: true, maxlength: 120, default: '' },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    source:  { type: String, enum: ['contact-form', 'ai-chat'], default: 'contact-form' },
    read:    { type: Boolean, default: false },
    emailStatus: { type: String, default: '' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Message', messageSchema)
