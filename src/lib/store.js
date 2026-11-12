/*
  Data for blood donors, feedback and the public "heroes" wall, through the site's own API
  (api/index.js, served by Vercel). The admin session is an httpOnly cookie set by the API,
  so nothing secret is ever kept in page scripts or localStorage.
*/
export const isLive = true

async function call(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${import.meta.env.BASE_URL}api/${path}`, {
    method,
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  let data = null
  try {
    data = await res.json()
  } catch {}
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`)
    err.status = res.status
    throw err
  }
  return data
}

// ---------- Public ----------
export const addDonor = (donor) => call('donors', { method: 'POST', body: donor })
export const addFeedback = ({ name, place, rating, message }) => call('feedback', { method: 'POST', body: { name, place, rating, message } })
export const listHeroes = () => call('heroes')
export const listFeaturedFeedback = () => call('feedback/featured')

// ---------- Admin session ----------
export const signIn = (email, password) => call('auth/login', { method: 'POST', body: { email, password } }).then((r) => r.admin)
export const signOut = () => call('auth/logout', { method: 'POST' })
export const currentAdmin = () => call('auth/me').then((r) => r.admin)
export const changePassword = (current, next) => call('auth/password', { method: 'POST', body: { current, next } })

// ---------- Admin data ----------
export const listDonors = () => call('admin/donors')
export const updateDonor = (id, patch) => call(`admin/donors/${id}`, { method: 'PATCH', body: patch })
export const deleteDonor = (id) => call(`admin/donors/${id}`, { method: 'DELETE' })
export const listFeedback = () => call('admin/feedback')
export const updateFeedback = (id, patch) => call(`admin/feedback/${id}`, { method: 'PATCH', body: patch })
export const deleteFeedback = (id) => call(`admin/feedback/${id}`, { method: 'DELETE' })
