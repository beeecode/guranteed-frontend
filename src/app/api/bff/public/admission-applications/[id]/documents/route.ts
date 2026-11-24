import { assertSameOrigin } from "@/server/bff/csrf"
import { errorResponse, integrationContext, json } from "@/server/bff/http"
import { validateApplicationDocument } from "@/server/bff/admissionApplication"
import { requestIdFor } from "@/server/bff/requestId"

export const dynamic = "force-dynamic"
// Stage 11: one document per request (keeps each request under the hosting size limit).
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const requestId = requestIdFor(request)
  try {
    assertSameOrigin(request)
    const { id } = await context.params
    if (!/^\d{1,12}$/.test(id)) throw Object.assign(new Error("Application not found."), { status: 404, code: "APPLICATION_NOT_FOUND" })
    const token = request.headers.get("x-upload-token") || ""
    if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) throw Object.assign(new Error("This upload link is not valid."), { status: 403, code: "UPLOAD_NOT_ALLOWED" })
    const body = validateApplicationDocument(await request.formData())
    const { gateway } = await integrationContext(request, requestId)
    if (!gateway.requestRaw) throw Object.assign(new Error("File upload is unavailable."), { status: 503, code: "FILE_TRANSPORT_UNAVAILABLE" })
    const response = await gateway.requestRaw(`/api/public/admission-applications/${id}/documents`, { method: "POST", body, headers: { "x-upload-token": token }, signal: request.signal })
    return json(await response.json().catch(() => ({})), response.status, undefined, requestId)
  } catch (error) { return errorResponse(error, undefined, requestId) }
}
