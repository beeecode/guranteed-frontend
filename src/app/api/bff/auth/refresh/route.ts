import { createAuthService } from "@/server/bff/authService"
import { readBffConfig } from "@/server/bff/config"
import { assertCsrf } from "@/server/bff/csrf"
import { clearSessionCookie, createSessionCookieValue } from "@/server/bff/session"
import { errorResponse, json, requireSession, sessionCookieHeader } from "@/server/bff/http"
import { requestIdFor } from "@/server/bff/requestId"

export const dynamic = "force-dynamic"
export async function POST(request: Request) {
  const requestId = requestIdFor(request)
  try {
    const context = await requireSession(request, undefined, requestId)
    assertCsrf(request, context.session)
    const refreshed = await context.manager.refresh(context.snapshot, createAuthService(context.gateway).refresh)
    const session = refreshed.session
    const currentCookie = createSessionCookieValue(session.id, session.profile.role, context.config.sessionSecret!)
    return json({ user: session.profile, csrfToken: session.csrfToken }, 200, {
      "set-cookie": sessionCookieHeader(currentCookie, context.config.secureCookies),
    }, requestId)
  } catch (error) {
    const known = error as { status?: number }
    if (known.status === 401) {
      const config = readBffConfig()
      return errorResponse(error, { "set-cookie": clearSessionCookie(config.secureCookies) }, requestId)
    }
    return errorResponse(error, undefined, requestId)
  }
}
