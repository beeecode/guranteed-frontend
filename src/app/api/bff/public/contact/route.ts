import { assertSameOrigin } from "@/server/bff/csrf"
import { errorResponse, integrationContext, json } from "@/server/bff/http"
import { parsePublicEnquiry } from "@/server/bff/publicEnquiry"

export const dynamic = "force-dynamic"
export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    const body = parsePublicEnquiry(await request.json(), "contact")
    const { gateway } = integrationContext(request)
    return json(await gateway.request("/api/public/contact", { method: "POST", body }))
  } catch (error) { return errorResponse(error) }
}
