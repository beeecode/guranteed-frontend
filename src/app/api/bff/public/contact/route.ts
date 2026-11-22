import { assertSameOrigin } from "@/server/bff/csrf"
import { errorResponse, integrationContext, json } from "@/server/bff/http"
import { parsePublicEnquiry } from "@/server/bff/publicEnquiry"
import { requestIdFor } from "@/server/bff/requestId"

export const dynamic = "force-dynamic"
export async function POST(request: Request) {
  const requestId = requestIdFor(request)
  try {
    assertSameOrigin(request)
    const body = parsePublicEnquiry(await request.json(), "contact")
    const { gateway } = await integrationContext(request, requestId)
    return json(await gateway.request("/api/public/contact", { method: "POST", body }), 200, undefined, requestId)
  } catch (error) { return errorResponse(error, undefined, requestId) }
}
