require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const Message = require('./models/Message')
const Counter = require('./models/Counter')

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
  methods: ['GET', 'POST', 'OPTIONS'],
}))
app.use(express.json())

// ── DB ──────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => { console.error('❌ MongoDB error:', err.message); process.exit(1) })

// ── Routes ──────────────────────────────────────────────
app.get('/', (_req, res) => res.json({ status: 'Portfolio API running' }))

// ── Visitor counter (#8) ────────────────────────────────
// In-memory "online now" set keyed by a heartbeat timestamp.
const online = new Map() // id -> last-seen ms
const ONLINE_TTL = 60 * 1000 // a visitor is "online" for 60s after last ping

function pruneOnline() {
  const now = Date.now()
  for (const [id, ts] of online) {
    if (now - ts > ONLINE_TTL) online.delete(id)
  }
}

// Increment total visits + register this visitor as online.
app.post('/api/visit', async (req, res) => {
  try {
    const { id } = req.body || {}
    if (id) online.set(String(id), Date.now())
    pruneOnline()

    const doc = await Counter.findOneAndUpdate(
      { key: 'visits' },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    )
    res.json({ total: doc.count, online: online.size })
  } catch (err) {
    console.error('Visit error:', err)
    res.status(500).json({ error: 'Could not record visit.' })
  }
})

// Lightweight heartbeat — keeps a visitor "online" without inflating the total.
app.post('/api/heartbeat', (req, res) => {
  const { id } = req.body || {}
  if (id) online.set(String(id), Date.now())
  pruneOnline()
  res.json({ online: online.size })
})

// Read current stats without counting a new visit.
app.get('/api/stats', async (_req, res) => {
  try {
    pruneOnline()
    const doc = await Counter.findOne({ key: 'visits' })
    res.json({ total: doc?.count || 0, online: online.size })
  } catch (err) {
    res.status(500).json({ error: 'Could not read stats.' })
  }
})

// ── Spotify "Now Playing" (#9) ──────────────────────────
// Requires SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN.
// If not configured, returns { isPlaying: false } so the UI degrades gracefully.
async function getSpotifyAccessToken() {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) return null

  const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')
  const resp = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: SPOTIFY_REFRESH_TOKEN,
    }),
  })
  if (!resp.ok) return null
  const data = await resp.json()
  return data.access_token
}

app.get('/api/now-playing', async (_req, res) => {
  try {
    const token = await getSpotifyAccessToken()
    if (!token) return res.json({ isPlaying: false, configured: false })

    const resp = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: `Bearer ${token}` },
    })

    // 204 = nothing playing right now
    if (resp.status === 204 || resp.status > 400) {
      return res.json({ isPlaying: false, configured: true })
    }

    const song = await resp.json()
    if (!song || !song.item) return res.json({ isPlaying: false, configured: true })

    res.json({
      isPlaying: song.is_playing,
      configured: true,
      title: song.item.name,
      artist: song.item.artists.map((a) => a.name).join(', '),
      album: song.item.album.name,
      albumArt: song.item.album.images?.[0]?.url || '',
      songUrl: song.item.external_urls?.spotify || '',
    })
  } catch (err) {
    console.error('Spotify error:', err.message)
    res.json({ isPlaying: false, configured: false })
  }
})

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
