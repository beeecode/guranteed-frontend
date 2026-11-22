import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto"
import type { SessionStore } from "./sessionStore.ts"

export const SESSION_COOKIE = "gfms_session"
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8
const REFRESH_LEASE_MS = 15_000
const WAIT_INTERVAL_MS = 10
const WAIT_TIMEOUT_MS = 20_000

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
  version: 2
  id: string
  csrfToken: string
  accessToken: string
  refreshToken: string
  accessExpiresAt: number
  absoluteExpiresAt: number
  profile: SessionProfile
}
export interface SessionSnapshot { session: BffSession; storeVersion: number }

const keyFromSecret = (secret: string) => createHash("sha256").update(secret).digest()
const b64 = (value: Buffer) => value.toString("base64url")
const fromB64 = (value: string) => Buffer.from(value, "base64url")
const sleep = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds))

export function createSession(input: { accessToken: string; refreshToken: string; expiresAt: number; profile: SessionProfile; now?: number }): BffSession {
  const now = input.now ?? Date.now()
  return {
    version: 2,
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
    if (session.version !== 2 || !session.id || !session.csrfToken || !session.accessToken || !session.refreshToken || !session.profile?.id || !["student", "admin"].includes(session.profile.role) || session.profile.is_active !== true || session.absoluteExpiresAt <= now) return null
    return session
  } catch { return null }
}

export function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  return a.length === b.length && timingSafeEqual(a, b)
}

const verifier = (id: string, role: SessionProfile["role"], secret: string) => createHmac("sha256", secret).update(`gfms-session:${id}:${role}`).digest("base64url")
export const createSessionCookieValue = (id: string, role: SessionProfile["role"], secret: string) => `${id}.${role}.${verifier(id, role, secret)}`
export function readSessionCookieProfile(value: string, secret: string) {
  const [id, role, signature, extra] = value.split(".")
  if (!id || !signature || extra || !/^[0-9a-f-]{36}$/i.test(id) || (role !== "student" && role !== "admin")) return null
  return safeEqual(signature, verifier(id, role, secret)) ? { id, role } : null
}
export const readSessionCookieId = (value: string, secret: string) => readSessionCookieProfile(value, secret)?.id ?? null
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

export class SessionManager {
  private readonly store: SessionStore
  private readonly secret: string
  private readonly now: () => number

  constructor(store: SessionStore, secret: string, now = () => Date.now()) {
    this.store = store
    this.secret = secret
    this.now = now
  }

  async create(session: BffSession) {
    await this.store.create({ id: session.id, version: 1, sealedState: sealSession(session, this.secret), expiresAt: session.absoluteExpiresAt })
    return createSessionCookieValue(session.id, session.profile.role, this.secret)
  }

  async readCookie(value: string | null): Promise<SessionSnapshot | null> {
    if (!value) return null
    const id = readSessionCookieId(value, this.secret)
    if (!id) return null
    const record = await this.store.read(id)
    if (!record || record.expiresAt <= this.now()) {
      if (record) await this.store.delete(id)
      return null
    }
    const session = openSession(record.sealedState, this.secret, this.now())
    return session ? { session, storeVersion: record.version } : null
  }

  async replace(snapshot: SessionSnapshot, next: BffSession) {
    const owner = randomUUID()
    const now = this.now()
    const acquired = await this.store.acquireRefresh(next.id, snapshot.storeVersion, owner, now + REFRESH_LEASE_MS, now)
    if (!acquired) return false
    return this.store.commitRefresh(next.id, snapshot.storeVersion, owner, sealSession(next, this.secret), next.absoluteExpiresAt)
  }

  async refresh(snapshot: SessionSnapshot, rotate: (session: BffSession) => Promise<BffSession>): Promise<SessionSnapshot> {
    const owner = randomUUID()
    const startedAt = this.now()
    while (this.now() - startedAt < WAIT_TIMEOUT_MS) {
      const record = await this.store.read(snapshot.session.id)
      if (!record) throw Object.assign(new Error("Authentication required."), { status: 401, code: "UNAUTHORIZED" })
      if (record.version > snapshot.storeVersion) {
        const session = openSession(record.sealedState, this.secret, this.now())
        if (!session) throw Object.assign(new Error("Authentication required."), { status: 401, code: "UNAUTHORIZED" })
        return { session, storeVersion: record.version }
      }
      const now = this.now()
      const acquired = await this.store.acquireRefresh(record.id, record.version, owner, now + REFRESH_LEASE_MS, now)
      if (!acquired) { await sleep(WAIT_INTERVAL_MS); continue }
      try {
        const current = openSession(record.sealedState, this.secret, this.now())
        if (!current) throw Object.assign(new Error("Authentication required."), { status: 401, code: "UNAUTHORIZED" })
        const next = await rotate(current)
        const committed = await this.store.commitRefresh(record.id, record.version, owner, sealSession(next, this.secret), next.absoluteExpiresAt)
        if (!committed) throw Object.assign(new Error("The session changed while it was being refreshed."), { status: 409, code: "SESSION_CHANGED" })
        return { session: next, storeVersion: record.version + 1 }
      } catch (error) {
        await this.store.releaseRefresh(record.id, record.version, owner)
        throw error
      }
    }
    throw Object.assign(new Error("Session refresh is temporarily busy."), { status: 503, code: "SESSION_REFRESH_BUSY" })
  }

  async delete(sessionId: string) { await this.store.delete(sessionId) }
}
