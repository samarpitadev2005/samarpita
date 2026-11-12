import { randomBytes } from 'node:crypto'

/*
  Storage for the API.

  With MONGODB_URI set (Vercel → Project → Settings → Environment Variables) data lives in
  MongoDB Atlas. Without it, during local development only, an in-memory store is used so
  the site and admin can be tried without a database. Memory data is lost on restart.

  Every collection exposes the same tiny API so the routes never care which one is in use:
    all(filter, { sort }) · get(id) · insert(doc) · update(id, patch) · remove(id) · count(filter)
*/

const URI = process.env.MONGODB_URI
const DB_NAME = process.env.MONGODB_DB || 'samarpita'
export const usingMemory = !URI

if (usingMemory && process.env.VERCEL) {
  console.error('MONGODB_URI is not set. Add it in the Vercel project settings; data will not be saved.')
}

// ---------- MongoDB ----------
let clientPromise = null
async function mongo() {
  if (!clientPromise) {
    const { MongoClient } = await import('mongodb')
    const client = new MongoClient(URI, { maxPoolSize: 5 })
    clientPromise = client.connect().then((c) => c.db(DB_NAME))
    clientPromise.catch(() => (clientPromise = null))
  }
  return clientPromise
}

const matches = (doc, filter = {}) => Object.entries(filter).every(([k, v]) => doc[k] === v)

function mongoCollection(name) {
  const withId = (d) => {
    if (!d) return null
    const { _id, ...rest } = d
    return { id: String(_id), ...rest }
  }
  const oid = async (id) => {
    const { ObjectId } = await import('mongodb')
    return ObjectId.isValid(id) ? new ObjectId(id) : null
  }
  return {
    async all(filter = {}, { sort = { createdAt: -1 }, limit = 0 } = {}) {
      const db = await mongo()
      const cur = db.collection(name).find(filter).sort(sort)
      if (limit) cur.limit(limit)
      return (await cur.toArray()).map(withId)
    },
    async get(id) {
      const _id = await oid(id)
      if (!_id) return null
      const db = await mongo()
      return withId(await db.collection(name).findOne({ _id }))
    },
    async findOne(filter) {
      const db = await mongo()
      return withId(await db.collection(name).findOne(filter))
    },
    async insert(doc) {
      const db = await mongo()
      const r = await db.collection(name).insertOne(doc)
      return { id: String(r.insertedId), ...doc }
    },
    async update(id, patch) {
      const _id = await oid(id)
      if (!_id) return null
      const db = await mongo()
      const r = await db.collection(name).findOneAndUpdate({ _id }, { $set: patch }, { returnDocument: 'after' })
      return withId(r && (r.value ?? r))
    },
    async remove(id) {
      const _id = await oid(id)
      if (!_id) return false
      const db = await mongo()
      return (await db.collection(name).deleteOne({ _id })).deletedCount > 0
    },
    async count(filter = {}) {
      const db = await mongo()
      return db.collection(name).countDocuments(filter)
    },
  }
}

// ---------- In-memory (local development only) ----------
const memory = new Map()
function memoryCollection(name) {
  if (!memory.has(name)) memory.set(name, new Map())
  const rows = memory.get(name)
  const sortBy = (list, sort) => {
    const [[key, dir]] = Object.entries(sort)
    return [...list].sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0) * dir)
  }
  return {
    async all(filter = {}, { sort = { createdAt: -1 }, limit = 0 } = {}) {
      const list = sortBy([...rows.values()].filter((d) => matches(d, filter)), sort)
      return (limit ? list.slice(0, limit) : list).map((d) => ({ ...d }))
    },
    async get(id) {
      return rows.has(id) ? { ...rows.get(id) } : null
    },
    async findOne(filter) {
      const d = [...rows.values()].find((x) => matches(x, filter))
      return d ? { ...d } : null
    },
    async insert(doc) {
      const id = randomBytes(12).toString('hex')
      rows.set(id, { id, ...doc })
      return { id, ...doc }
    },
    async update(id, patch) {
      if (!rows.has(id)) return null
      rows.set(id, { ...rows.get(id), ...patch })
      return { ...rows.get(id) }
    },
    async remove(id) {
      return rows.delete(id)
    },
    async count(filter = {}) {
      return [...rows.values()].filter((d) => matches(d, filter)).length
    },
  }
}

export const collection = (name) => (usingMemory ? memoryCollection(name) : mongoCollection(name))

export const donors = collection('donors')
export const feedback = collection('feedback')
export const admins = collection('admins')
