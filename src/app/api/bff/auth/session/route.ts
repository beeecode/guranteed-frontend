import { createAuthService } from "@/server/bff/authService"
import { readBffConfig } from "@/server/bff/config"
import { clearSessionCookie, createSessionCookieValue } from "@/server/bff/session"
import { errorResponse, json, requireSession, sessionCookieHeader } from "@/server/bff/http"
import { requestIdFor } from "@/server/bff/requestId"

export const dynamic = "force-dynamic"
export async function GET(request: Request) {
  const requestId = requestIdFor(request)
  try {
    const context = await requireSession(request, undefined, requestId)
    const needsRefresh = context.session.accessExpiresAt - Date.now() < 60_000
    const auth = createAuthService(context.gateway)
    const refreshed = needsRefresh ? await context.manager.refresh(context.snapshot, auth.refresh) : null
    const session = refreshed ? refreshed.session : await auth.validate(context.session)
    if (!refreshed) {
      const replaced = await context.manager.replace(context.snapshot, session)
      if (!replaced) throw Object.assign(new Error("The session changed during validation."), { status: 409, code: "SESSION_CHANGED" })
    }
    const cookieValue = createSessionCookieValue(session.id, session.profile.role, context.config.sessionSecret!)
    return json({ user: session.profile, csrfToken: session.csrfToken }, 200, {
      "set-cookie": sessionCookieHeader(cookieValue, context.config.secureCookies),
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
