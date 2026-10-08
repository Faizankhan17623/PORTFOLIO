const express = require('express')
const mongoose = require('mongoose')
const Message = require('./models/Message')
const { issueToken, requireAdmin, safeEqual, isLocked, recordFailure } = require('./lib/adminAuth')

const router = express.Router()

router.post('/login', (req, res) => {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected || expected.length < 12) return res.status(503).json({ error: 'Admin is disabled until a strong ADMIN_PASSWORD (12+ characters) is set.' })
  if (isLocked(req.ip)) return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' })
  if (!safeEqual(req.body?.password ?? '', expected)) {
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
  const message = await Message.findByIdAndUpdate(req.params.id, { read: !!req.body?.read }, { new: true })
  if (!message) return res.status(404).json({ error: 'Not found.' })
  res.json({ message })
})

router.delete('/messages/:id', requireAdmin, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Bad id.' })
  await Message.findByIdAndDelete(req.params.id)
  res.json({ success: true })
})

module.exports = router
