import { ApiError } from "../../lib/api/core.ts"
import { createBackendGateway } from "./backend.ts"
import { readBffConfig } from "./config.ts"
import { requestIdFor } from "./requestId.ts"
import { isIP } from "node:net"
import { readCookie, serializeSessionCookie, SESSION_COOKIE, SessionManager, type BffSession } from "./session.ts"
import { sessionStoreFor } from "./sessionStoreFactory.ts"

export const json = (body: unknown, status = 200, headers?: HeadersInit, requestId?: string) => Response.json(body, {
  status,
  headers: { "cache-control": "private, no-store", ...(requestId ? { "x-request-id": requestId } : {}), ...headers },
})
export const errorResponse = (error: unknown, headers?: HeadersInit, fallbackRequestId?: string) => {
  const known = error as { status?: number; code?: string; message?: string; requestId?: string }
  const requestId = known.requestId || fallbackRequestId
  const body = { message: known.message || "The request could not be completed.", code: known.code || "BFF_ERROR", ...(requestId ? { request_id: requestId } : {}) }
  if (error instanceof ApiError) return json(body, error.status, headers, requestId)
  return json(body, known.status && known.status >= 400 && known.status <= 599 ? known.status : 500, headers, requestId)
}
/**
 * Stage 11: the visitor address as the hosting platform reports it (Vercel sets
 * x-forwarded-for / x-real-ip itself). Only a syntactically valid IP is forwarded.
 */
export function visitorAddress(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  const candidate = forwarded || request.headers.get("x-real-ip")?.trim() || ""
  return isIP(candidate) ? candidate : null
}
export async function integrationContext(request: Request, providedRequestId?: string) {
  const config = readBffConfig()
  const requestId = providedRequestId || requestIdFor(request)
  if (config.mode !== "integration" || !config.backendUrl || !config.sessionSecret) throw Object.assign(new Error("Backend integration is not enabled."), { status: 503, code: config.mode === "mock" ? "MOCK_MODE" : "INTEGRATION_DISABLED", requestId })
  const manager = new SessionManager(sessionStoreFor(config), config.sessionSecret)
  const value = readCookie(request.headers.get("cookie"), SESSION_COOKIE)
  const snapshot = await manager.readCookie(value)
  const client = { address: visitorAddress(request), sharedSecret: config.backendSharedSecret }
  return { config, gateway: createBackendGateway(config.backendUrl, fetch, requestId, client), manager, requestId, snapshot, session: snapshot?.session ?? null }
}
export const requireSession = async (request: Request, role?: "student" | "admin", providedRequestId?: string) => {
  const context = await integrationContext(request, providedRequestId)
  if (!context.session || !context.snapshot) throw Object.assign(new Error("Authentication required."), { status: 401, code: "UNAUTHORIZED", requestId: context.requestId })
  if (role && context.session.profile.role !== role) throw Object.assign(new Error("You do not have permission to access this resource."), { status: 403, code: "FORBIDDEN", requestId: context.requestId })
  return { ...context, session: context.session as BffSession, snapshot: context.snapshot }
}
export const sessionCookieHeader = (cookieValue: string, secure: boolean) => serializeSessionCookie(cookieValue, secure)
