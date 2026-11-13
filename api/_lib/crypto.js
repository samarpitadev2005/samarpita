import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'
import { signingSecret } from './auth.js'

// Small secrets saved by admins (the SMTP app password) are encrypted at rest with
// AES-256-GCM, keyed from JWT_SECRET. If that secret changes, saved values must be re-entered.
const key = () => createHash('sha256').update(signingSecret()).digest()

export function encrypt(text) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key(), iv)
  const enc = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()])
  return [iv, cipher.getAuthTag(), enc].map((b) => b.toString('base64url')).join('.')
}

export function decrypt(blob) {
  try {
    const [iv, tag, enc] = String(blob).split('.').map((s) => Buffer.from(s, 'base64url'))
    const decipher = createDecipheriv('aes-256-gcm', key(), iv)
    decipher.setAuthTag(tag)
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8')
  } catch {
    return null
  }
}
