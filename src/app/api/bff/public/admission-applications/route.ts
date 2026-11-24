import { assertSameOrigin } from "@/server/bff/csrf"
import { errorResponse, integrationContext, json } from "@/server/bff/http"
import { parseAdmissionApplication } from "@/server/bff/admissionApplication"
import { requestIdFor } from "@/server/bff/requestId"

export const dynamic = "force-dynamic"
// Stage 11: public admission application (parent registers a child).
export async function POST(request: Request) {
  const requestId = requestIdFor(request)
  try {
    assertSameOrigin(request)
    const body = parseAdmissionApplication(await request.json())
    const { gateway } = await integrationContext(request, requestId)
    return json(await gateway.request("/api/public/admission-applications", { method: "POST", body }), 200, undefined, requestId)
  } catch (error) { return errorResponse(error, undefined, requestId) }
}
