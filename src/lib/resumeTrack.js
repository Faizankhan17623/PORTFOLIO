import { API_URL } from './contactApi'
import { RESUME } from '../data/contactInfo'
import { isOwnerDevice } from './owner'

const timezone = () => {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || '' } catch { return '' }
}

// Tells the backend someone clicked a résumé button. It is fire-and-forget (and keepalive, so it survives
// the new tab opening): the PDF always opens straight from the site and tracking can never delay or block it.
export function trackResume(source) {
  if (isOwnerDevice()) return
  try {
    fetch(`${API_URL}/api/resume-open`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source, timezone: timezone() }),
      keepalive: true,
    }).catch(() => {})
  } catch { /* tracking is best effort */ }
}

// Spread onto an <a>: opens the PDF in a new tab and records which button was used.
export const resumeLink = (source) => ({
  href: RESUME.href,
  target: '_blank',
  rel: 'noreferrer',
  onClick: () => trackResume(source),
  onAuxClick: (event) => { if (event.button === 1) trackResume(source) },
})
