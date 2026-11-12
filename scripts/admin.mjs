// Manage admin accounts from the terminal (needs MONGODB_URI in .env or the environment).
//
//   npm run admin -- list
//   npm run admin -- add <email> <password>
//   npm run admin -- password <email> <new-password>
//   npm run admin -- remove <email>
import { readFileSync } from 'node:fs'

// Load .env (KEY=value lines) without extra packages
try {
  const text = readFileSync(new URL('../.env', import.meta.url), 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i)
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
} catch {}

const { admins } = await import('../api/_lib/db.js')
const { hashPassword, normalizeEmail, passwordProblem } = await import('../api/_lib/auth.js')

const [cmd, emailArg, password] = process.argv.slice(2)
const email = normalizeEmail(emailArg)

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set. Put it in .env (see .env.example).')
  process.exit(1)
}

const fail = (msg) => {
  console.error(msg)
  process.exit(1)
}

if (cmd === 'list') {
  const list = await admins.all({}, { sort: { createdAt: 1 } })
  if (!list.length) console.log('No admins yet.')
  for (const a of list) console.log(`${a.email}  (last login: ${a.lastLoginAt || 'never'})`)
} else if (cmd === 'add') {
  if (!email || !password) fail('Usage: npm run admin -- add <email> <password>')
  if (passwordProblem(password)) fail(passwordProblem(password))
  if (await admins.findOne({ email })) fail('That admin already exists.')
  await admins.insert({ email, passwordHash: await hashPassword(password), fails: 0, lockedUntil: null, createdAt: new Date().toISOString() })
  console.log(`Added admin ${email}`)
} else if (cmd === 'password') {
  if (!email || !password) fail('Usage: npm run admin -- password <email> <new-password>')
  if (passwordProblem(password)) fail(passwordProblem(password))
  const a = await admins.findOne({ email })
  if (!a) fail('No admin with that email.')
  await admins.update(a.id, { passwordHash: await hashPassword(password), fails: 0, lockedUntil: null, passwordChangedAt: new Date().toISOString() })
  console.log(`Password updated for ${email}`)
} else if (cmd === 'remove') {
  const a = await admins.findOne({ email })
  if (!a) fail('No admin with that email.')
  await admins.remove(a.id)
  console.log(`Removed admin ${email}`)
} else {
  console.log('Commands: list | add <email> <password> | password <email> <new-password> | remove <email>')
}
process.exit(0)
