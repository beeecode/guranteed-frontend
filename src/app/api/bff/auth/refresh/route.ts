import { createAuthService } from "@/server/bff/authService"
import { readBffConfig } from "@/server/bff/config"
import { assertCsrf } from "@/server/bff/csrf"
import { clearSessionCookie } from "@/server/bff/session"
import { errorResponse, json, requireSession, sessionCookieHeader } from "@/server/bff/http"

export const dynamic = "force-dynamic"
export async function POST(request: Request) {
  try {
    const context = requireSession(request)
    assertCsrf(request, context.session)
    const session = await createAuthService(context.gateway).refresh(context.session)
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
