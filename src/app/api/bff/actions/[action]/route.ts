import { resolveAction } from "@/server/bff/actions"
import { assertCsrf } from "@/server/bff/csrf"
import { errorResponse, json, requireSession } from "@/server/bff/http"
import { forwardWithSession } from "@/server/bff/forwardWithSession"
import { requestIdFor } from "@/server/bff/requestId"
import { isDownloadOperation, isUploadOperation, prepareUpload, resolveDownload, safeDownloadHeaders } from "@/server/bff/fileTransport"

export const dynamic = "force-dynamic"
// Closing grades every attempt still open (Stage 11 §8); give these up to a minute.
const LONG_ACTIONS = new Set(["admin-bundle-close", "admin-exam-update"])
// Exam-time traffic stays on the short limit: a hung save is retried sooner by the client.
const FAST_ACTIONS = new Set(["student-answers-save", "student-heartbeat", "student-security-event"])
export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  const requestId = requestIdFor(request)
  try {
    const { action } = await context.params
    if (isUploadOperation(action)) {
      const auth = await requireSession(request, "admin", requestId)
      assertCsrf(request, auth.session)
      if (!auth.gateway.requestRaw) throw Object.assign(new Error("File transport is unavailable."), { status: 503, code: "FILE_TRANSPORT_UNAVAILABLE" })
      const prepared = prepareUpload(action, await request.formData())
      const requestRaw = auth.gateway.requestRaw
      const response = await forwardWithSession(auth, (token) => requestRaw(prepared.path, {
        method: "POST", body: prepared.body, token, signal: request.signal,
      }))
      return json(await response.json().catch(() => ({})), response.status, undefined, requestId)
    }
    const input = await request.json() as { params?: Record<string, unknown>; payload?: unknown }
    if (isDownloadOperation(action)) {
      const auth = await requireSession(request, "admin", requestId)
      assertCsrf(request, auth.session)
      if (!auth.gateway.requestRaw) throw Object.assign(new Error("File transport is unavailable."), { status: 503, code: "FILE_TRANSPORT_UNAVAILABLE" })
      const requestRaw = auth.gateway.requestRaw
      const path = resolveDownload(action, input.params || {})
      const response = await forwardWithSession(auth, (token) => requestRaw(path, { token, signal: request.signal }))
      return new Response(response.body, { status: response.status, headers: safeDownloadHeaders(response.headers, requestId) })
    }
    const resolved = resolveAction(action, input)
    const auth = await requireSession(request, resolved.role, requestId)
    assertCsrf(request, auth.session)
    // Stage 11: refresh the access token when close to expiry (and once on 401) so a
    // long exam never locks because the one-hour Supabase token expired mid-sitting.
    const result = await forwardWithSession(auth, (token) => auth.gateway.request(resolved.path, {
      method: resolved.method,
      body: resolved.body,
      token,
      timeoutMs: LONG_ACTIONS.has(action) ? 60_000 : FAST_ACTIONS.has(action) ? 10_000 : undefined,
    }))
    return json(result, 200, undefined, requestId)
  } catch (error) { return errorResponse(error, undefined, requestId) }
}
