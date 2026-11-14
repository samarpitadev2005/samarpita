import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { admins } from './db.js'

/*
  Admin sign-in.

  - Passwords are never stored: only a bcrypt hash (12 rounds) lives in the admins collection.
  - A successful login returns a signed JWT in an httpOnly, SameSite=Strict cookie, so page
    scripts can't read it and other sites can't send it. It expires after SESSION_HOURS.
  - Five wrong passwords lock the account for LOCK_MINUTES.
  - JWT_SECRET must be a long random string set in the environment (never in the code).
*/

export const COOKIE = 'samarpita_admin'
const SESSION_HOURS = Number(process.env.SESSION_HOURS || 8)
const MAX_FAILS = 5
const LOCK_MINUTES = 15
const ROUNDS = 12

const isProd = Boolean(process.env.VERCEL) || process.env.NODE_ENV === 'production'

function secret() {
  const s = process.env.JWT_SECRET
  if (s && s.length >= 32) return s
  if (isProd) throw new Error('JWT_SECRET is missing or shorter than 32 characters')
  // Local development only: a per-process secret, so sessions reset when the server restarts
  if (!globalThis.__devJwtSecret) globalThis.__devJwtSecret = require_random()
  return globalThis.__devJwtSecret
}
function require_random() {
  return Array.from({ length: 48 }, () => Math.floor(Math.random() * 36).toString(36)).join('')
}

export const signingSecret = secret

export const hashPassword = (pw) => bcrypt.hash(pw, ROUNDS)
let dummy = null
const dummyHash = async () => (dummy ||= await bcrypt.hash('not-a-real-password', ROUNDS))
export const checkPassword = (pw, hash) => bcrypt.compare(pw, hash)

export const normalizeEmail = (e) => String(e || '').trim().toLowerCase()

export function passwordProblem(pw) {
  if (typeof pw !== 'string' || pw.length < 10) return 'Password must be at least 10 characters.'
  if (pw.length > 128) return 'Password is too long.'
  if (!/[a-zA-Z]/.test(pw) || !/\d/.test(pw)) return 'Use both letters and numbers.'
  return null
}

// First run: when there is no admin yet, one is created from ADMIN_EMAIL / ADMIN_PASSWORD,
// or with the default login below. The default is flagged `mustChange`, so the admin panel
// keeps asking for a new password until it is changed (Security tab).
export const DEFAULT_ADMIN_EMAIL = 'samarpitateam@gmail.com'
export const DEFAULT_ADMIN_PASSWORD = 'Samarpita@2026'
let bootstrapped = false
export async function ensureAdmin() {
  if (bootstrapped) return
  bootstrapped = true
  if ((await admins.count()) > 0) return
  const email = normalizeEmail(process.env.ADMIN_EMAIL) || DEFAULT_ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD
  const mustChange = !process.env.ADMIN_PASSWORD
  if (mustChange) console.warn(`[api] First admin ${email} created with the default password. Change it in the admin panel (Security tab).`)
  await admins.insert({ email, passwordHash: await hashPassword(password), fails: 0, lockedUntil: null, mustChange, createdAt: new Date().toISOString() })
}

export async function login(emailRaw, password) {
  await ensureAdmin()
  const email = normalizeEmail(emailRaw)
  const admin = await admins.findOne({ email })
  // Same message and similar timing whether or not the email exists
  if (!admin) {
    await bcrypt.compare(String(password || ''), await dummyHash())
    return { error: 'Wrong email or password.' }
  }
  if (admin.lockedUntil && new Date(admin.lockedUntil) > new Date()) {
    const mins = Math.ceil((new Date(admin.lockedUntil) - Date.now()) / 60000)
    return { error: `Too many wrong attempts. Try again in ${mins} minute${mins > 1 ? 's' : ''}.` }
  }
  const ok = await checkPassword(String(password || ''), admin.passwordHash)
  if (!ok) {
    const fails = (admin.fails || 0) + 1
    const lock = fails >= MAX_FAILS
    await admins.update(admin.id, { fails: lock ? 0 : fails, lockedUntil: lock ? new Date(Date.now() + LOCK_MINUTES * 60000).toISOString() : null })
    return { error: lock ? `Too many wrong attempts. Account locked for ${LOCK_MINUTES} minutes.` : 'Wrong email or password.' }
  }
  await admins.update(admin.id, { fails: 0, lockedUntil: null, lastLoginAt: new Date().toISOString() })
  const token = jwt.sign({ sub: admin.id, email: admin.email }, secret(), { expiresIn: `${SESSION_HOURS}h`, issuer: 'samarpita' })
  return { token, admin: { email: admin.email, mustChange: Boolean(admin.mustChange) } }
}

export async function changePassword(adminId, current, next) {
  const admin = await admins.get(adminId)
  if (!admin) return 'Not signed in.'
  if (!(await checkPassword(String(current || ''), admin.passwordHash))) return 'Current password is wrong.'
  const problem = passwordProblem(next)
  if (problem) return problem
  await admins.update(adminId, { passwordHash: await hashPassword(next), mustChange: false, passwordChangedAt: new Date().toISOString() })
  return null
}

// Minimal cookie helpers (the token is base64url, so no escaping is needed)
const setCookie = (value, maxAge) =>
  `${COOKIE}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Strict${isProd ? '; Secure' : ''}`
const readCookie = (header, name) => {
  for (const part of String(header || '').split(';')) {
    const i = part.indexOf('=')
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim()
  }
  return null
}

export const sessionCookie = (token) => setCookie(token, SESSION_HOURS * 3600)
export const clearCookie = () => setCookie('', 0)

export function readSession(req) {
  const token = readCookie(req.headers.cookie, COOKIE)
  if (!token) return null
  try {
    const payload = jwt.verify(token, secret(), { issuer: 'samarpita' })
    return { id: payload.sub, email: payload.email }
  } catch {
    return null
  }
}

// Express middleware: only signed-in admins get past this point
export function requireAdmin(req, res, next) {
  const session = readSession(req)
  if (!session) return res.status(401).json({ error: 'Please sign in.' })
  req.admin = session
  next()
}
