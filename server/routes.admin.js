const express = require('express')
const mongoose = require('mongoose')
const rateLimit = require('express-rate-limit')
const Message = require('./models/Message')
const Visitor = require('./models/Visitor')
const { issueToken, requireAdmin, safeEqual, isLocked, recordFailure } = require('./lib/adminAuth')

const router = express.Router()

// Nothing under /api/admin should ever be cached by a browser or a proxy.
router.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

router.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests. Slow down.' },
}))

router.post('/login', (req, res) => {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected || expected.length < 12) return res.status(503).json({ error: 'Unavailable.' })
  if (isLocked(req.ip)) return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' })
  if (typeof req.body?.password !== 'string' || !safeEqual(req.body.password, expected)) {
    recordFailure(req.ip)
    return res.status(401).json({ error: 'Incorrect password.' })
  }
  res.json({ token: issueToken() })
})

router.get('/messages', requireAdmin, async (_req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 }).limit(500).lean()
  res.json({ messages })
})

router.patch('/messages/:id', requireAdmin, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Bad id.' })
  const message = await Message.findByIdAndUpdate(req.params.id, { read: req.body?.read === true }, { new: true })
  if (!message) return res.status(404).json({ error: 'Not found.' })
  res.json({ message })
})

router.delete('/messages/:id', requireAdmin, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Bad id.' })
  await Message.findByIdAndDelete(req.params.id)
  res.json({ success: true })
})

// Recent visitors, one row per unique IP, newest activity first.
router.get('/visits', requireAdmin, async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50)
  const total = await Visitor.countDocuments()
  const pages = Math.max(Math.ceil(total / limit), 1)
  const page = Math.min(Math.max(parseInt(req.query.page, 10) || 1, 1), pages)

  const visits = await Visitor.find()
    .sort({ lastSeen: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select('-__v')
    .lean()

  res.json({ visits, page, pages, total, limit })
})

module.exports = router
