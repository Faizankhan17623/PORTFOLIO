require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const Message = require('./models/Message')
const Counter = require('./models/Counter')
const { notifyNewMessage } = require('./lib/mailer')
const { recordVisit } = require('./lib/visitors')
const adminRoutes = require('./routes.admin')

const app = express()
const PORT = process.env.PORT || 5000
app.set('trust proxy', 1)

// ── Middleware ──────────────────────────────────────────
app.disable('x-powered-by')
app.use(helmet())

// Exact origins only. A wildcard like portfolio-*.vercel.app would let anyone's Vercel project in.
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://portfolio-pied-eight-2csy0b9zua.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => callback(null, !origin || ALLOWED_ORIGINS.includes(origin)),
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
}))
app.use(express.json({ limit: '10kb' }))

const limiter = (windowMs, limit, error, extra = {}) => rateLimit({
  windowMs,
  limit,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error },
  ...extra,
})

// Blanket cap per IP, with tighter caps on the routes that write data.
app.use(limiter(15 * 60 * 1000, 600, 'Too many requests. Please slow down.'))

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
const ONLINE_MAX = 5000 // hard cap so a flood of fake ids can't exhaust memory

function markOnline(id) {
  if (typeof id !== 'string' || !id || id.length > 64) return
  if (!online.has(id) && online.size >= ONLINE_MAX) return
  online.set(id, Date.now())
}

function pruneOnline() {
  const now = Date.now()
  for (const [id, ts] of online) {
    if (now - ts > ONLINE_TTL) online.delete(id)
  }
}

// Increment total visits + register this visitor as online.
app.post('/api/visit', limiter(15 * 60 * 1000, 30, 'Too many requests.'), async (req, res) => {
  try {
    markOnline(req.body?.id)
    pruneOnline()
    await recordVisit(req)

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
app.post('/api/heartbeat', limiter(15 * 60 * 1000, 120, 'Too many requests.'), (req, res) => {
  markOnline(req.body?.id)
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

app.use('/api/admin', adminRoutes)

const contactLimit = limiter(60 * 60 * 1000, 5, 'Too many messages. Please try again later.', { skipFailedRequests: true })

app.post('/api/contact', contactLimit, async (req, res) => {
  const { name, email, message, company, source } = req.body || {}

  if ([name, email, message].some((v) => typeof v !== 'string' || !v.trim())) {
    return res.status(400).json({ error: 'All fields are required.' })
  }
  if (name.trim().length > 100 || email.trim().length > 200 || message.trim().length > 2000 || (typeof company === 'string' && company.trim().length > 120)) {
    return res.status(400).json({ error: 'One of the fields is too long.' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ error: 'Invalid email address.' })
  }

  try {
    const saved = await Message.create({
      name: name.trim(),
      email: email.trim(),
      company: typeof company === 'string' ? company.trim() : '',
      message: message.trim(),
      source: source === 'ai-chat' ? 'ai-chat' : 'contact-form',
    })
    notifyNewMessage(saved).then((emailStatus) => Message.updateOne({ _id: saved._id }, { emailStatus })).catch(() => {})
    res.status(201).json({ success: true, message: 'Message saved successfully.' })
  } catch (err) {
    console.error('Save error:', err)
    res.status(500).json({ error: 'Server error. Please try again.' })
  }
})

app.use((_req, res) => res.status(404).json({ error: 'Not found.' }))

// Last resort: never leak stack traces or internals to the client.
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request too large.' })
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Bad request.' })
  console.error('Unhandled error:', err.message)
  res.status(500).json({ error: 'Server error.' })
})

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))
