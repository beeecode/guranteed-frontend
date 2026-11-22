import { resolveAction } from "@/server/bff/actions"
import { assertCsrf } from "@/server/bff/csrf"
import { errorResponse, json, requireSession } from "@/server/bff/http"

export const dynamic = "force-dynamic"
export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  try {
    const { action } = await context.params
    const input = await request.json() as { params?: Record<string, unknown>; payload?: unknown }
    const resolved = resolveAction(action, input)
    const auth = requireSession(request, resolved.role)
    assertCsrf(request, auth.session)
    const result = await auth.gateway.request(resolved.path, {
      method: resolved.method,
      body: resolved.body,
      token: auth.session.accessToken,
    })
    return json(result)
  } catch (error) { return errorResponse(error) }
}
