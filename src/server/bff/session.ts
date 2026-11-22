import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto"

export const SESSION_COOKIE = "gfms_session"
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8

export interface SessionProfile {
  id: string
  role: "student" | "admin"
  is_active: boolean
  full_name?: string
  email?: string | null
  student_id?: string | null
  [key: string]: unknown
}
export interface BffSession {
  version: 1
  id: string
  csrfToken: string
  accessToken: string
  refreshToken: string
  accessExpiresAt: number
  absoluteExpiresAt: number
  profile: SessionProfile
}

const keyFromSecret = (secret: string) => createHash("sha256").update(secret).digest()
const b64 = (value: Buffer) => value.toString("base64url")
const fromB64 = (value: string) => Buffer.from(value, "base64url")

export function createSession(input: { accessToken: string; refreshToken: string; expiresAt: number; profile: SessionProfile; now?: number }): BffSession {
  const now = input.now ?? Date.now()
  return {
    version: 1,
    id: randomUUID(),
    csrfToken: b64(randomBytes(24)),
    accessToken: input.accessToken,
    refreshToken: input.refreshToken,
    accessExpiresAt: input.expiresAt,
    absoluteExpiresAt: now + SESSION_MAX_AGE_SECONDS * 1000,
    profile: input.profile,
  }
}

export function sealSession(session: BffSession, secret: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", keyFromSecret(secret), iv)
  const encrypted = Buffer.concat([cipher.update(Buffer.from(JSON.stringify(session), "utf8")), cipher.final()])
  return [b64(iv), b64(cipher.getAuthTag()), b64(encrypted)].join(".")
}

export function openSession(value: string, secret: string, now = Date.now()): BffSession | null {
  try {
    const [ivValue, tagValue, encryptedValue, extra] = value.split(".")
    if (!ivValue || !tagValue || !encryptedValue || extra) return null
    const decipher = createDecipheriv("aes-256-gcm", keyFromSecret(secret), fromB64(ivValue))
    decipher.setAuthTag(fromB64(tagValue))
    const plaintext = Buffer.concat([decipher.update(fromB64(encryptedValue)), decipher.final()]).toString("utf8")
    const session = JSON.parse(plaintext) as BffSession
    if (session.version !== 1 || !session.id || !session.csrfToken || !session.accessToken || !session.refreshToken || !session.profile?.id || !["student", "admin"].includes(session.profile.role) || session.profile.is_active !== true || session.absoluteExpiresAt <= now) return null
    return session
  } catch { return null }
}

export function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  return a.length === b.length && timingSafeEqual(a, b)
}
export const serializeSessionCookie = (value: string, secure: boolean) => `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}${secure ? "; Secure" : ""}`
export const clearSessionCookie = (secure: boolean) => `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? "; Secure" : ""}`
export function readCookie(header: string | null, name: string): string | null {
  if (!header) return null
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=")
    if (key === name) return rest.join("=") || null
  }
  return null
}
