import { safeEqual, type BffSession } from "./session.ts"

export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin")
  if (!origin || origin !== new URL(request.url).origin) throw Object.assign(new Error("Cross-site request rejected"), { status: 403, code: "CSRF_ORIGIN_REJECTED" })
}
export function assertCsrf(request: Request, session: BffSession): void {
  assertSameOrigin(request)
  const token = request.headers.get("x-csrf-token") || ""
  if (!token || !safeEqual(token, session.csrfToken)) throw Object.assign(new Error("CSRF token is missing or invalid"), { status: 403, code: "CSRF_TOKEN_REJECTED" })
}
