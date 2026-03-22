/**
 * AES-256-GCM Token Encryption Utility
 *
 * Encrypts and decrypts OAuth access tokens stored in the database.
 * Uses AES-256-GCM with random 12-byte IV and 16-byte auth tag.
 *
 * Storage format: base64(iv + ciphertext + authTag)
 *
 * Requires ENCRYPTION_KEY env var (32-byte hex string = 64 hex chars).
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    throw new Error(
      'ENCRYPTION_KEY must be a 64-character hex string (32 bytes). ' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    )
  }
  return Buffer.from(hex, 'hex')
}

/**
 * Encrypt a plaintext string (e.g. OAuth access token).
 * Returns a base64-encoded string safe for database storage.
 */
export function encryptToken(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])

  const authTag = cipher.getAuthTag()

  // Pack: iv (12) + ciphertext (variable) + authTag (16)
  const packed = Buffer.concat([iv, encrypted, authTag])
  return packed.toString('base64')
}

/**
 * Decrypt a base64-encoded encrypted token back to plaintext.
 */
export function decryptToken(encoded: string): string {
  const key = getKey()
  const packed = Buffer.from(encoded, 'base64')

  if (packed.length < IV_LENGTH + AUTH_TAG_LENGTH + 1) {
    throw new Error('Invalid encrypted token: too short')
  }

  const iv = packed.subarray(0, IV_LENGTH)
  const authTag = packed.subarray(packed.length - AUTH_TAG_LENGTH)
  const ciphertext = packed.subarray(IV_LENGTH, packed.length - AUTH_TAG_LENGTH)

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ])

  return decrypted.toString('utf8')
}

/**
 * Check if a value looks like it's already encrypted (base64 with correct min length).
 * Useful for migration: skip already-encrypted tokens.
 */
export function isEncrypted(value: string): boolean {
  if (!value || value.length < 40) return false
  try {
    const buf = Buffer.from(value, 'base64')
    // Minimum: 12 (iv) + 1 (ciphertext) + 16 (tag) = 29 bytes
    return buf.length >= IV_LENGTH + AUTH_TAG_LENGTH + 1
  } catch {
    return false
  }
}
