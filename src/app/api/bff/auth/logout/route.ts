import { createAuthService } from "@/server/bff/authService"
import { readBffConfig } from "@/server/bff/config"
import { assertCsrf } from "@/server/bff/csrf"
import { clearSessionCookie } from "@/server/bff/session"
import { errorResponse, json, requireSession } from "@/server/bff/http"

export const dynamic = "force-dynamic"
export async function POST(request: Request) {
  try {
    const context = requireSession(request)
    assertCsrf(request, context.session)
    await createAuthService(context.gateway).logout(context.session)
    return json({ success: true }, 200, { "set-cookie": clearSessionCookie(context.config.secureCookies) })
  } catch (error) {
    const known = error as { status?: number }
    if (known.status === 401) {
      const config = readBffConfig()
      return errorResponse(error, { "set-cookie": clearSessionCookie(config.secureCookies) })
    }
    return errorResponse(error)
  }
}
