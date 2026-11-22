import { createAuthService } from "@/server/bff/authService"
import { readBffConfig } from "@/server/bff/config"
import { clearSessionCookie } from "@/server/bff/session"
import { errorResponse, json, requireSession, sessionCookieHeader } from "@/server/bff/http"

export const dynamic = "force-dynamic"
export async function GET(request: Request) {
  try {
    const context = requireSession(request)
    const needsRefresh = context.session.accessExpiresAt - Date.now() < 60_000
    const auth = createAuthService(context.gateway)
    const session = needsRefresh ? await auth.refresh(context.session) : await auth.validate(context.session)
    return json({ user: session.profile, csrfToken: session.csrfToken }, 200, {
      "set-cookie": sessionCookieHeader(session, context.config.sessionSecret!, context.config.secureCookies),
    })
  } catch (error) {
    const known = error as { status?: number }
    if (known.status === 401) {
      const config = readBffConfig()
      return errorResponse(error, { "set-cookie": clearSessionCookie(config.secureCookies) })
    }
    return errorResponse(error)
  }
}
