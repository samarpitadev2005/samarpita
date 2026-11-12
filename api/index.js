import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { donors, feedback, usingMemory } from './_lib/db.js'
import { login, changePassword, sessionCookie, clearCookie, readSession, requireAdmin } from './_lib/auth.js'

/*
  Samarpita API — one Express app, served by Vercel as a serverless function
  (vercel.json rewrites /api/* here) and mounted into the Vite dev server locally.

  Public:  POST /api/donors · POST /api/feedback · GET /api/heroes · GET /api/feedback/featured
  Auth:    POST /api/auth/login · POST /api/auth/logout · GET /api/auth/me · POST /api/auth/password
  Admin:   GET|PATCH|DELETE /api/admin/donors[/:id] · GET|PATCH|DELETE /api/admin/feedback[/:id]
*/

const app = express()
app.disable('x-powered-by')
app.set('trust proxy', 1) // Vercel sits in front, so the client IP comes from x-forwarded-for
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }))
app.use(express.json({ limit: '32kb' }))

// Mutating requests must come from this site (blocks cross-site form posts even if a cookie leaks)
app.use((req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD') return next()
  const origin = req.headers.origin
  const host = req.headers['x-forwarded-host'] || req.headers.host
  if (origin && host && new URL(origin).host !== host) return res.status(403).json({ error: 'Cross-site request blocked.' })
  next()
})
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store')
  next()
})

const limiter = (max, minutes, message) =>
  rateLimit({ windowMs: minutes * 60000, max, standardHeaders: true, legacyHeaders: false, message: { error: message } })
const formLimiter = limiter(20, 60, 'Too many submissions from this network. Please try again later.')
const loginLimiter = limiter(20, 15, 'Too many sign-in attempts. Please wait a few minutes.')

// ---------- validation helpers ----------
const GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
const STATUSES = ['registered', 'contacted', 'donated', 'inactive']
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const phoneOk = (p) => /^[0-9+\s-]{10,15}$/.test(p)
const emailOk = (e) => !e || (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 120)
const now = () => new Date().toISOString()
const wrap = (fn) => (req, res) =>
  fn(req, res).catch((err) => {
    console.error(err)
    res.status(500).json({ error: 'Server error. Please try again.' })
  })

// ---------- public ----------
app.get('/api/health', (req, res) => res.json({ ok: true, storage: usingMemory ? 'memory' : 'mongodb' }))

app.post(
  '/api/donors',
  formLimiter,
  wrap(async (req, res) => {
    const b = req.body || {}
    const donor = {
      name: str(b.name, 100),
      phone: str(b.phone, 20),
      email: str(b.email, 120),
      group: str(b.group, 3),
      gender: str(b.gender, 20),
      age: str(b.age, 3),
      weight: str(b.weight, 4),
      district: str(b.district, 60),
      area: str(b.area, 100),
      lastDonation: str(b.lastDonation, 40),
      availability: str(b.availability, 40),
      showOnWall: Boolean(b.showOnWall),
      status: 'registered',
      createdAt: now(),
    }
    if (!donor.name || !phoneOk(donor.phone) || !GROUPS.includes(donor.group) || !emailOk(donor.email)) {
      return res.status(400).json({ error: 'Please check the name, phone number and blood group.' })
    }
    await donors.insert(donor)
    res.status(201).json({ ok: true })
  }),
)

app.post(
  '/api/feedback',
  formLimiter,
  wrap(async (req, res) => {
    const b = req.body || {}
    const rating = Number(b.rating)
    const item = { name: str(b.name, 100), place: str(b.place, 100), rating, message: str(b.message, 2000), featured: false, createdAt: now() }
    if (!item.name || !item.message || !(rating >= 1 && rating <= 5)) return res.status(400).json({ error: 'Please add your name, a rating and a message.' })
    await feedback.insert(item)
    res.status(201).json({ ok: true })
  }),
)

// Heroes wall: donors who donated and agreed to be shown — name, group, district and date only
app.get(
  '/api/heroes',
  wrap(async (req, res) => {
    const list = await donors.all({ status: 'donated', showOnWall: true }, { sort: { donatedAt: -1 }, limit: 24 })
    res.setHeader('Cache-Control', 'public, max-age=300')
    res.json(list.map(({ id, name, group, district, donatedAt }) => ({ id, name, group, district, donatedAt })))
  }),
)

app.get(
  '/api/feedback/featured',
  wrap(async (req, res) => {
    const list = await feedback.all({ featured: true }, { limit: 12 })
    res.setHeader('Cache-Control', 'public, max-age=300')
    res.json(list.map(({ id, name, place, rating, message, createdAt }) => ({ id, name, place, rating, message, createdAt })))
  }),
)

// ---------- auth ----------
app.post(
  '/api/auth/login',
  loginLimiter,
  wrap(async (req, res) => {
    const { email, password } = req.body || {}
    const result = await login(email, password)
    if (result.error) return res.status(401).json({ error: result.error })
    res.setHeader('Set-Cookie', sessionCookie(result.token))
    res.json({ admin: result.admin })
  }),
)
app.post('/api/auth/logout', (req, res) => {
  res.setHeader('Set-Cookie', clearCookie())
  res.json({ ok: true })
})
app.get('/api/auth/me', (req, res) => {
  const session = readSession(req)
  res.json({ admin: session ? { email: session.email } : null })
})
app.post(
  '/api/auth/password',
  requireAdmin,
  wrap(async (req, res) => {
    const { current, next } = req.body || {}
    const problem = await changePassword(req.admin.id, current, next)
    if (problem) return res.status(400).json({ error: problem })
    // Old sessions keep working until they expire; sign this one out so the new password is used
    res.setHeader('Set-Cookie', clearCookie())
    res.json({ ok: true })
  }),
)

// ---------- admin ----------
const admin = express.Router()
admin.use(requireAdmin)

admin.get('/donors', wrap(async (req, res) => res.json(await donors.all())))
admin.patch(
  '/donors/:id',
  wrap(async (req, res) => {
    const b = req.body || {}
    const patch = {}
    if (b.status !== undefined) {
      if (!STATUSES.includes(b.status)) return res.status(400).json({ error: 'Unknown status.' })
      patch.status = b.status
    }
    if (b.showOnWall !== undefined) patch.showOnWall = Boolean(b.showOnWall)
    if (b.donatedAt !== undefined) patch.donatedAt = str(b.donatedAt, 40) || null
    if (!Object.keys(patch).length) return res.status(400).json({ error: 'Nothing to update.' })
    const row = await donors.update(req.params.id, patch)
    if (!row) return res.status(404).json({ error: 'Donor not found.' })
    res.json(row)
  }),
)
admin.delete(
  '/donors/:id',
  wrap(async (req, res) => {
    res.json({ ok: await donors.remove(req.params.id) })
  }),
)

admin.get('/feedback', wrap(async (req, res) => res.json(await feedback.all())))
admin.patch(
  '/feedback/:id',
  wrap(async (req, res) => {
    const b = req.body || {}
    if (b.featured === undefined) return res.status(400).json({ error: 'Nothing to update.' })
    const row = await feedback.update(req.params.id, { featured: Boolean(b.featured) })
    if (!row) return res.status(404).json({ error: 'Feedback not found.' })
    res.json(row)
  }),
)
admin.delete(
  '/feedback/:id',
  wrap(async (req, res) => {
    res.json({ ok: await feedback.remove(req.params.id) })
  }),
)

app.use('/api/admin', admin)

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }))
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON.' })
  console.error(err)
  res.status(500).json({ error: 'Server error.' })
})

export default app
