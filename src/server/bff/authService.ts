import { ApiError } from "../../lib/api/core.ts"
import type { BackendGateway } from "./backend.ts"
import { createSession, type BffSession, type SessionProfile } from "./session.ts"

interface AuthSessionPayload { access_token: string; refresh_token: string; expires_at?: number; expires_in?: number }
interface AuthPayload { session: AuthSessionPayload; user?: SessionProfile }
interface ProfilePayload { user: SessionProfile }
const refreshLocks = new Map<string, Promise<BffSession>>()
const expiryMs = (session: AuthSessionPayload, now: number) => session.expires_at ? session.expires_at * 1000 : now + (session.expires_in || 3600) * 1000

export function createAuthService(gateway: BackendGateway, now = () => Date.now()) {
  const profile = async (token: string) => {
    const payload = await gateway.request<ProfilePayload>("/api/me", { token })
    const trusted = payload.user
    if (!trusted?.id || !["student", "admin"].includes(trusted.role) || trusted.is_active !== true) {
      throw new ApiError("This account is not authorized to use the portal.", { status: 403, code: "PROFILE_NOT_AUTHORIZED" })
    }
    return trusted
  }
  return {
    async validate(session: BffSession) {
      const trusted = await profile(session.accessToken)
      return { ...session, profile: trusted }
    },
    async login(identifier: string, password: string, expectedRole: "student" | "admin") {
      const payload = await gateway.request<AuthPayload>("/api/auth/login", { method: "POST", body: { identifier, password } })
      const trusted = await profile(payload.session.access_token)
      if (trusted.role !== expectedRole) {
        await gateway.request("/api/auth/logout", { method: "POST", token: payload.session.access_token }).catch(() => undefined)
        throw new ApiError("This account cannot access the selected portal.", { status: 403, code: "ROLE_MISMATCH" })
      }
      return createSession({ accessToken: payload.session.access_token, refreshToken: payload.session.refresh_token, expiresAt: expiryMs(payload.session, now()), profile: trusted, now: now() })
    },
    async refresh(session: BffSession): Promise<BffSession> {
      const existing = refreshLocks.get(session.id)
      if (existing) return existing
      const pending = (async () => {
        const payload = await gateway.request<AuthPayload>("/api/auth/refresh", { method: "POST", body: { refresh_token: session.refreshToken } })
        const trusted = await profile(payload.session.access_token)
        return { ...session, accessToken: payload.session.access_token, refreshToken: payload.session.refresh_token, accessExpiresAt: expiryMs(payload.session, now()), profile: trusted }
      })()
      refreshLocks.set(session.id, pending)
      try { return await pending } finally { refreshLocks.delete(session.id) }
    },
    async logout(session: BffSession) {
      await gateway.request("/api/auth/logout", { method: "POST", token: session.accessToken }).catch(() => undefined)
    },
  }
}
