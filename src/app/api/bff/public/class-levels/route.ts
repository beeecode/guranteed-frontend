import { errorResponse, integrationContext, json } from "@/server/bff/http"
import { requestIdFor } from "@/server/bff/requestId"

export const dynamic = "force-dynamic"
// Stage 11: active classes for the public admission form (catalogue data only).
export async function GET(request: Request) {
  const requestId = requestIdFor(request)
  try {
    const { gateway } = await integrationContext(request, requestId)
    return json(await gateway.request("/api/public/class-levels"), 200, { "cache-control": "public, max-age=300" }, requestId)
  } catch (error) { return errorResponse(error, undefined, requestId) }
}
