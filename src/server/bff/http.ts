import { ApiError } from "../../lib/api/core.ts"
import { createBackendGateway } from "./backend.ts"
import { readBffConfig } from "./config.ts"
import { openSession, readCookie, sealSession, serializeSessionCookie, SESSION_COOKIE, type BffSession } from "./session.ts"

export const json = (body: unknown, status = 200, headers?: HeadersInit) => Response.json(body, { status, headers: { "cache-control": "private, no-store", ...headers } })
export const errorResponse = (error: unknown, headers?: HeadersInit) => {
  if (error instanceof ApiError) return json({ message: error.message, code: error.code }, error.status, headers)
  const known = error as { status?: number; code?: string; message?: string }
  return json({ message: known.message || "The request could not be completed.", code: known.code || "BFF_ERROR" }, known.status && known.status >= 400 && known.status <= 599 ? known.status : 500, headers)
}
export function integrationContext(request: Request) {
  const config = readBffConfig()
  if (config.mode !== "integration" || !config.backendUrl || !config.sessionSecret) throw Object.assign(new Error("Backend integration is not enabled."), { status: 503, code: config.mode === "mock" ? "MOCK_MODE" : "INTEGRATION_DISABLED" })
  const value = readCookie(request.headers.get("cookie"), SESSION_COOKIE)
  const session = value ? openSession(value, config.sessionSecret) : null
  return { config, gateway: createBackendGateway(config.backendUrl), session }
}
export const requireSession = (request: Request, role?: "student" | "admin") => {
  const context = integrationContext(request)
  if (!context.session) throw Object.assign(new Error("Authentication required."), { status: 401, code: "UNAUTHORIZED" })
  if (role && context.session.profile.role !== role) throw Object.assign(new Error("You do not have permission to access this resource."), { status: 403, code: "FORBIDDEN" })
  return { ...context, session: context.session as BffSession }
}
export const sessionCookieHeader = (session: BffSession, secret: string, secure: boolean) => serializeSessionCookie(sealSession(session, secret), secure)
