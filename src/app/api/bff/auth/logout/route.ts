import { createAuthService } from "@/server/bff/authService"
import { readBffConfig } from "@/server/bff/config"
import { assertCsrf } from "@/server/bff/csrf"
import { clearSessionCookie } from "@/server/bff/session"
import { errorResponse, json, requireSession } from "@/server/bff/http"
import { requestIdFor } from "@/server/bff/requestId"

export const dynamic = "force-dynamic"
export async function POST(request: Request) {
  const requestId = requestIdFor(request)
  try {
    const context = await requireSession(request, undefined, requestId)
    assertCsrf(request, context.session)
    await createAuthService(context.gateway).logout(context.session)
    await context.manager.delete(context.session.id)
    return json({ success: true }, 200, { "set-cookie": clearSessionCookie(context.config.secureCookies) }, requestId)
  } catch (error) {
    const known = error as { status?: number }
    if (known.status === 401) {
      const config = readBffConfig()
      return errorResponse(error, { "set-cookie": clearSessionCookie(config.secureCookies) }, requestId)
    }
    return errorResponse(error, undefined, requestId)
  }
}
