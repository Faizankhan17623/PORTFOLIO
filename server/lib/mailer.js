const nodemailer = require('nodemailer')

const { EMAIL_USER, EMAIL_APP_PASSWORD, NOTIFY_TO, RESEND_API_KEY, RESEND_FROM } = process.env

// Render's free plan blocks outgoing SMTP, so prefer an HTTPS email API (Resend) when a key is set
// and fall back to Gmail SMTP (works locally and on hosts that allow SMTP).
const smtp = EMAIL_USER && EMAIL_APP_PASSWORD
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: { user: EMAIL_USER, pass: EMAIL_APP_PASSWORD },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    })
  : null

const recipient = () => NOTIFY_TO || EMAIL_USER
const provider = () => (RESEND_API_KEY ? 'resend' : smtp ? 'gmail-smtp' : 'none')

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

function buildEmail(msg) {
  const via = msg.source === 'ai-chat' ? 'AI chat' : 'contact form'
  const when = new Date(msg.createdAt || Date.now()).toUTCString()
  // The name is last so Gmail doesn't stack every notification into a single conversation.
  const subject = `New message from a new recruiter — ${msg.name}`

  const text = [
    'A new recruiter contacted you through your portfolio.',
    '',
    `Name:    ${msg.name}`,
    `Email:   ${msg.email}`,
    msg.company ? `Company: ${msg.company}` : null,
    `Via:     ${via}`,
    `Sent:    ${when}`,
    '',
    'Message:',
    msg.message,
    '',
    'Hit reply to reply directly to that recruiter.',
  ].filter((l) => l !== null).join('\n')

  const row = (label, value) => `<tr><td style="padding:4px 14px 4px 0;color:#66726b">${label}</td><td style="padding:4px 0"><b>${value}</b></td></tr>`
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;color:#1d2a24">
<h2 style="margin:0 0 16px">New message from a new recruiter</h2>
<table style="border-collapse:collapse;font-size:14px">
${row('Name', escapeHtml(msg.name))}
${row('Email', `<a href="mailto:${escapeHtml(msg.email)}">${escapeHtml(msg.email)}</a>`)}
${msg.company ? row('Company', escapeHtml(msg.company)) : ''}
</table>
<div style="margin:18px 0 6px;color:#66726b;font-size:13px">Message</div>
<div style="padding:14px 16px;background:#f4f3ec;border-radius:10px;white-space:pre-wrap;font-size:15px;line-height:1.55">${escapeHtml(msg.message)}</div>
<p style="margin-top:18px;font-size:13px;color:#66726b">Hit reply to reply directly to that recruiter.</p>
</div>`

  return { subject, text, html, replyTo: msg.email, replyName: msg.name.replace(/["<>]/g, '') }
}

async function sendViaResend(mail) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: RESEND_FROM || 'Portfolio <onboarding@resend.dev>',
      to: [recipient()],
      reply_to: mail.replyTo,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`Resend ${res.status}: ${data.message || data.error || 'request failed'}`)
}

async function sendViaSmtp(mail) {
  await smtp.sendMail({
    from: `"Portfolio" <${EMAIL_USER}>`,
    to: recipient(),
    replyTo: `"${mail.replyName}" <${mail.replyTo}>`,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
  })
}

async function deliver(mail) {
  if (provider() === 'none') throw new Error('Email is not configured (set RESEND_API_KEY, or EMAIL_USER + EMAIL_APP_PASSWORD).')
  if (!recipient()) throw new Error('No recipient: set NOTIFY_TO or EMAIL_USER.')
  return provider() === 'resend' ? sendViaResend(mail) : sendViaSmtp(mail)
}

// Never throws: resolves to a short status string that is stored on the message.
async function notifyNewMessage(msg) {
  try {
    await deliver(buildEmail(msg))
    return `sent via ${provider()}`
  } catch (err) {
    console.error('Email notify failed:', err.message)
    return `failed: ${err.message}`.slice(0, 300)
  }
}

module.exports = { notifyNewMessage }
