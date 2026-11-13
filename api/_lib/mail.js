import nodemailer from 'nodemailer'
import { settings } from './db.js'
import { decrypt, encrypt } from './crypto.js'

/*
  Email notifications for the team, sent through plain SMTP (Gmail with an App Password works
  on the free tier). The settings come from either:

    1. the admin panel (Security tab → Email notifications), saved in the database with the
       app password encrypted, or
    2. environment variables: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_TO

  The admin panel wins when both exist. Without either nothing is sent, but every form is still
  saved and shown in the admin panel, so no message is lost.
*/

const CACHE_MS = 30000
let cache = { at: 0, cfg: null }
let transport = { id: '', mailer: null }

export async function getMailConfig() {
  if (Date.now() - cache.at < CACHE_MS) return cache.cfg
  let cfg = null
  const row = await settings.findOne({ key: 'mail' }).catch(() => null)
  if (row?.user && row?.pass) {
    const pass = decrypt(row.pass)
    if (pass) cfg = { host: row.host || 'smtp.gmail.com', port: Number(row.port || 465), user: row.user, pass, to: row.to || row.user, source: 'admin' }
  }
  if (!cfg && process.env.SMTP_USER && process.env.SMTP_PASS) {
    cfg = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 465),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      to: process.env.MAIL_TO || process.env.SMTP_USER,
      source: 'env',
    }
  }
  cache = { at: Date.now(), cfg }
  return cfg
}

// What the admin panel may see: never the password
export async function mailStatus() {
  const cfg = await getMailConfig()
  return cfg ? { configured: true, user: cfg.user, to: cfg.to, host: cfg.host, source: cfg.source } : { configured: false }
}

export async function saveMailConfig({ user, pass, to, host, port }) {
  const row = await settings.findOne({ key: 'mail' })
  const data = {
    key: 'mail',
    user,
    to: to || user,
    host: host || 'smtp.gmail.com',
    port: Number(port || 465),
    // Keep the saved password when the form is submitted without a new one
    pass: pass ? encrypt(pass) : row?.pass || '',
    updatedAt: new Date().toISOString(),
  }
  if (row) await settings.update(row.id, data)
  else await settings.insert(data)
  cache.at = 0
}

export async function clearMailConfig() {
  const row = await settings.findOne({ key: 'mail' })
  if (row) await settings.remove(row.id)
  cache.at = 0
}

function mailer(cfg) {
  const id = `${cfg.host}:${cfg.port}:${cfg.user}:${cfg.pass}`
  if (transport.id !== id) {
    transport = {
      id,
      mailer: nodemailer.createTransport({ host: cfg.host, port: cfg.port, secure: cfg.port === 465, auth: { user: cfg.user, pass: cfg.pass } }),
    }
  }
  return transport.mailer
}

const escape = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

// fields: { Label: value, ... } rendered as a simple table. Throws on SMTP errors.
export async function notify({ subject, fields, replyTo }) {
  const cfg = await getMailConfig()
  if (!cfg) return false
  const entries = Object.entries(fields).filter(([, v]) => v !== undefined && v !== null && v !== '')
  const rows = entries
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;border:1px solid #e3e8e0;background:#f5f8f1;font-weight:600;white-space:nowrap">${escape(k)}</td><td style="padding:8px 12px;border:1px solid #e3e8e0;white-space:pre-wrap">${escape(v)}</td></tr>`,
    )
    .join('')
  await mailer(cfg).sendMail({
    from: `"Samarpita website" <${cfg.user}>`,
    to: cfg.to,
    replyTo: replyTo || undefined,
    subject,
    text: entries.map(([k, v]) => `${k}: ${v}`).join('\n'),
    html: `<div style="font-family:Arial,sans-serif;color:#0b1a10"><h2 style="margin:0 0 12px;font-weight:600">${escape(subject)}</h2><table style="border-collapse:collapse;font-size:14px">${rows}</table><p style="margin-top:16px;font-size:12px;color:#55665a">Sent from the Samarpita website. Open the admin panel to manage it.</p></div>`,
  })
  return true
}

// Fire-and-forget: never let a mail problem fail the request that saved the data
export function notifyLater(opts) {
  notify(opts).catch((err) => console.error('[mail]', err.message))
}
