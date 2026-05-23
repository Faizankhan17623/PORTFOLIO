require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const Message = require('./models/Message')

const app = express()
const PORT = process.env.PORT || 5000

// ── Middleware ──────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://portfolio-pied-eight-2csy0b9zua.vercel.app',
  process.env.FRONTEND_URL,
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (
      ALLOWED_ORIGINS.filter(Boolean).includes(origin) ||
      /https:\/\/portfolio-.*\.vercel\.app$/.test(origin)
    ) {
      return callback(null, true)
    }
    callback(new Error('Not allowed by CORS'))
  },
  methods: ['GET', 'POST'],
}))
app.use(express.json())

// ── DB ──────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => { console.error('❌ MongoDB error:', err.message); process.exit(1) })

// ── Routes ──────────────────────────────────────────────
app.get('/', (_req, res) => res.json({ status: 'Portfolio API running' }))

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'All fields are required.' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' })
  }

  try {
    const existing = await Message.findOne({ email: email.trim().toLowerCase() })
    if (existing) {
      return res.status(409).json({ error: 'This email has already sent a message. I will get back to you soon!' })
    }
    await Message.create({ name: name.trim(), email: email.trim(), message: message.trim() })
    res.status(201).json({ success: true, message: 'Message saved successfully.' })
  } catch (err) {
    console.error('Save error:', err)
    res.status(500).json({ error: 'Server error. Please try again.' })
  }
})

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))
