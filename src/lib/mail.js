import { call } from './store'

// Contact-form problems and volunteer sign-ups go to the site's own API, which saves them
// for the admin panel and emails the team (see api/_lib/mail.js for the SMTP setup).
export const sendMessage = (type, fields) => call('messages', { method: 'POST', body: { type, ...fields } })
