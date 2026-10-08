const nodemailer = require('nodemailer')

const { EMAIL_USER, EMAIL_APP_PASSWORD, NOTIFY_TO } = process.env

const transporter = EMAIL_USER && EMAIL_APP_PASSWORD
  ? nodemailer.createTransport({ service: 'gmail', auth: { user: EMAIL_USER, pass: EMAIL_APP_PASSWORD } })
  : null

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

// Fire-and-forget: a mail failure must never stop a message from being saved.
function notifyNewMessage(msg) {
  if (!transporter) {
    console.warn('Email notifications disabled (set EMAIL_USER and EMAIL_APP_PASSWORD).')
    return
  }
  const via = msg.source === 'ai-chat' ? 'AI chat' : 'contact form'
  const lines = [
    `Name: ${msg.name}`,
    `Email: ${msg.email}`,
    msg.company ? `Company: ${msg.company}` : null,
    `Via: ${via}`,
    '',
    msg.message,
  ].filter((l) => l !== null)

  transporter
    .sendMail({
      from: `"Portfolio" <${EMAIL_USER}>`,
      to: NOTIFY_TO || EMAIL_USER,
      replyTo: `"${msg.name.replace(/"/g, '')}" <${msg.email}>`,
      subject: `New portfolio message from ${msg.name} (${via})`,
      text: lines.join('\n'),
      html: `<p><b>${escapeHtml(msg.name)}</b> &lt;${escapeHtml(msg.email)}&gt;${msg.company ? ` · ${escapeHtml(msg.company)}` : ''}<br><small>via ${via}</small></p><p style="white-space:pre-wrap">${escapeHtml(msg.message)}</p><p><small>Hit reply to answer them directly.</small></p>`,
    })
    .catch((err) => console.error('Email notify failed:', err.message))
}

module.exports = { notifyNewMessage }
