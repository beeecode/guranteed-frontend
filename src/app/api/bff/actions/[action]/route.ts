import { resolveAction } from "@/server/bff/actions"
import { assertCsrf } from "@/server/bff/csrf"
import { errorResponse, json, requireSession } from "@/server/bff/http"
import { requestIdFor } from "@/server/bff/requestId"
import { isDownloadOperation, isUploadOperation, prepareUpload, resolveDownload, safeDownloadHeaders } from "@/server/bff/fileTransport"

export const dynamic = "force-dynamic"
export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  const requestId = requestIdFor(request)
  try {
    const { action } = await context.params
    if (isUploadOperation(action)) {
      const auth = await requireSession(request, "admin", requestId)
      assertCsrf(request, auth.session)
      if (!auth.gateway.requestRaw) throw Object.assign(new Error("File transport is unavailable."), { status: 503, code: "FILE_TRANSPORT_UNAVAILABLE" })
      const prepared = prepareUpload(action, await request.formData())
      const response = await auth.gateway.requestRaw(prepared.path, {
        method: "POST", body: prepared.body, token: auth.session.accessToken, signal: request.signal,
      })
      return json(await response.json().catch(() => ({})), response.status, undefined, requestId)
    }
    const input = await request.json() as { params?: Record<string, unknown>; payload?: unknown }
    if (isDownloadOperation(action)) {
      const auth = await requireSession(request, "admin", requestId)
      assertCsrf(request, auth.session)
      if (!auth.gateway.requestRaw) throw Object.assign(new Error("File transport is unavailable."), { status: 503, code: "FILE_TRANSPORT_UNAVAILABLE" })
      const response = await auth.gateway.requestRaw(resolveDownload(action, input.params || {}), {
        token: auth.session.accessToken, signal: request.signal,
      })
      return new Response(response.body, { status: response.status, headers: safeDownloadHeaders(response.headers, requestId) })
    }
    const resolved = resolveAction(action, input)
    const auth = await requireSession(request, resolved.role, requestId)
    assertCsrf(request, auth.session)
    const result = await auth.gateway.request(resolved.path, {
      method: resolved.method,
      body: resolved.body,
      token: auth.session.accessToken,
    })
    return json(result, 200, undefined, requestId)
  } catch (error) { return errorResponse(error, undefined, requestId) }
}
