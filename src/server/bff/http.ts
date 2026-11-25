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
/** Validation details are written for people ("enter a valid phone number"); only {field, issue} strings pass. */
export const fieldDetails = (value: unknown): Array<{ field: string; issue: string }> => (Array.isArray(value)
  ? value
    .filter((item): item is { field: string; issue: string } => Boolean(item) && typeof item.field === "string" && typeof item.issue === "string")
    .slice(0, 20)
    .map((item) => ({ field: item.field.slice(0, 60), issue: item.issue.slice(0, 200) }))
  : [])
export const SERVER_OUTDATED_MESSAGE = "This feature is not available on the school server yet. The server needs to be restarted or updated — please tell the administrator."
export const errorResponse = (error: unknown, headers?: HeadersInit, fallbackRequestId?: string) => {
  const known = error as { status?: number; code?: string; message?: string; requestId?: string }
  const requestId = known.requestId || fallbackRequestId
  const body = { message: known.message || "The request could not be completed.", code: known.code || "BFF_ERROR", ...(requestId ? { request_id: requestId } : {}) }
  if (error instanceof ApiError) {
    // Stage 11: the API answered "route not found" — the server is older than this screen
    // (not restarted or not yet updated). Say so instead of a technical message.
    if (error.status === 404 && known.message === "API route not found.") {
      return json({ ...body, message: SERVER_OUTDATED_MESSAGE, code: "SERVER_OUTDATED" }, 404, headers, requestId)
    }
    // Stage 11: pass validation details through so forms can say which field is wrong.
    const details = error.status === 400 ? fieldDetails(error.details) : []
    return json(details.length ? { ...body, details } : body, error.status, headers, requestId)
  }
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
