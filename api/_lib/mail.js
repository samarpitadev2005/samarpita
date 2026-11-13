import nodemailer from 'nodemailer'

/*
  Email notifications for the team, sent through plain SMTP. The free option is the
  team's own Gmail with an App Password (README explains the setup):

    SMTP_HOST=smtp.gmail.com  SMTP_PORT=465  SMTP_USER=samarpitateam@gmail.com  SMTP_PASS=<app password>
    MAIL_TO=samarpitateam@gmail.com   (where notifications go; defaults to SMTP_USER)

  Without these variables nothing is sent, but every form is still saved in the database
  and shows up in the admin panel, so no message is ever lost.
*/

export const mailConfigured = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS)

let transport = null
function getTransport() {
  if (!transport) {
    const port = Number(process.env.SMTP_PORT || 465)
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  }
  return transport
}

const escape = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

// fields: { Label: value, ... } rendered as a simple table
export async function notify({ subject, fields, replyTo }) {
  if (!mailConfigured) return false
  const rows = Object.entries(fields)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;border:1px solid #e3e8e0;background:#f5f8f1;font-weight:600;white-space:nowrap">${escape(k)}</td><td style="padding:8px 12px;border:1px solid #e3e8e0;white-space:pre-wrap">${escape(v)}</td></tr>`,
    )
    .join('')
  const text = Object.entries(fields)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')
  await getTransport().sendMail({
    from: `"Samarpita website" <${process.env.SMTP_USER}>`,
    to: process.env.MAIL_TO || process.env.SMTP_USER,
    replyTo: replyTo || undefined,
    subject,
    text,
    html: `<div style="font-family:Arial,sans-serif;color:#0b1a10"><h2 style="margin:0 0 12px;font-weight:600">${escape(subject)}</h2><table style="border-collapse:collapse;font-size:14px">${rows}</table><p style="margin-top:16px;font-size:12px;color:#55665a">Sent from the Samarpita website. Open the admin panel to manage it.</p></div>`,
  })
  return true
}

// Fire-and-forget: never let a mail problem fail the request that saved the data
export function notifyLater(opts) {
  notify(opts).catch((err) => console.error('[mail]', err.message))
}
