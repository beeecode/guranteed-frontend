import { createAuthService } from "@/server/bff/authService"
import { assertSameOrigin } from "@/server/bff/csrf"
import { errorResponse, integrationContext, json, sessionCookieHeader } from "@/server/bff/http"
import { requestIdFor } from "@/server/bff/requestId"

export const dynamic = "force-dynamic"
export async function POST(request: Request) {
  const requestId = requestIdFor(request)
  try {
    assertSameOrigin(request)
    const body = await request.json() as { identifier?: unknown; password?: unknown; portal?: unknown }
    const identifier = typeof body.identifier === "string" ? body.identifier.trim() : ""
    const password = typeof body.password === "string" ? body.password : ""
    if (!identifier || !password || !["student", "admin"].includes(String(body.portal))) {
      return json({ message: "Identifier, password and portal are required.", code: "VALIDATION_ERROR" }, 400, undefined, requestId)
    }
    const { config, gateway, manager } = await integrationContext(request, requestId)
    const session = await createAuthService(gateway).login(identifier, password, body.portal as "student" | "admin")
    const cookieValue = await manager.create(session)
    return json({ user: session.profile, csrfToken: session.csrfToken }, 200, {
      "set-cookie": sessionCookieHeader(cookieValue, config.secureCookies),
    }, requestId)
  } catch (error) { return errorResponse(error, undefined, requestId) }
}
