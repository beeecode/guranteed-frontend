import { ApiError, normalizeApiError, validateServerBaseUrl } from "../../lib/api/core.ts"

interface BackendRequestOptions { method?: string; body?: unknown; token?: string; signal?: AbortSignal; timeoutMs?: number }
interface BackendRawRequestOptions { method?: string; body?: BodyInit; token?: string; signal?: AbortSignal; headers?: Record<string, string>; timeoutMs?: number }
export interface BackendGateway {
  request<T>(path: string, options?: BackendRequestOptions): Promise<T>
  requestRaw?(path: string, options?: BackendRawRequestOptions): Promise<Response>
}
/**
 * Stage 11: how long the BFF waits for the API. Reads are quick; writes may make several
 * database/auth calls (password reset, imports), and closing an exam or bundle grades every
 * open attempt, so they get longer. Callers can override per request.
 */
export const READ_TIMEOUT_MS = 10_000
export const WRITE_TIMEOUT_MS = 30_000
const timeoutFor = (method: string | undefined, override?: number) => override ?? ((method || "GET").toUpperCase() === "GET" ? READ_TIMEOUT_MS : WRITE_TIMEOUT_MS)

/**
 * "Not reachable" and "too slow" need different advice: after a timeout the API may still
 * finish the action, so the user must check before repeating it.
 */
export function backendFailure(error: unknown, requestId?: string) {
  const name = (error as { name?: string } | null)?.name
  const timedOut = name === "TimeoutError" || name === "AbortError"
  const failure = timedOut
    ? new ApiError("The school server is taking too long to answer. The action may still complete — refresh the page to check before trying again.", { status: 504, code: "BACKEND_TIMEOUT" })
    : new ApiError("The school server could not be reached (it may be restarting). Please try again in a moment.", { status: 503, code: "BACKEND_UNREACHABLE" })
  Object.assign(failure, { requestId })
  return failure
}
const parseBody = async (response: Response) => (response.headers.get("content-type") || "").includes("application/json") ? response.json() : null

/** Stage 11: the visitor address forwarded to the API, proven by the shared secret. */
export interface ForwardedClient { address?: string | null; sharedSecret?: string }

export function createBackendGateway(baseUrl: string, fetchImpl: typeof fetch = fetch, requestId?: string, client?: ForwardedClient): BackendGateway {
  const safeBase = validateServerBaseUrl(baseUrl)
  const headersFor = (token?: string) => {
    const headers = new Headers({ accept: "application/json", "cache-control": "no-store" })
    if (requestId) headers.set("x-request-id", requestId)
    if (client?.address && client.sharedSecret) {
      headers.set("x-bff-client-ip", client.address)
      headers.set("x-bff-secret", client.sharedSecret)
    }
    if (token) headers.set("authorization", `Bearer ${token}`)
    return headers
  }
  const safeFailure = async (response: Response) => {
    const payload = await parseBody(response)
    const error = normalizeApiError(response.status, payload)
    Object.assign(error, { requestId: response.headers.get("x-request-id") || requestId })
    throw error
  }
  return {
    async request<T>(path: string, options: BackendRequestOptions = {}) {
      if (!path.startsWith("/api/")) throw new Error("BFF backend paths must be explicit API paths")
      const headers = headersFor(options.token)
      if (options.body !== undefined) headers.set("content-type", "application/json")
      try {
        const response = await fetchImpl(`${safeBase}${path}`, {
          method: options.method || "GET",
          headers,
          body: options.body === undefined ? undefined : JSON.stringify(options.body),
          cache: "no-store",
          signal: options.signal ?? AbortSignal.timeout(timeoutFor(options.method, options.timeoutMs)),
        })
        if (!response.ok) await safeFailure(response)
        const payload = await parseBody(response)
        return payload as T
      } catch (error) {
        if (error instanceof ApiError) throw error
        throw backendFailure(error, requestId)
      }
    },
    async requestRaw(path: string, options: BackendRawRequestOptions = {}) {
      if (!path.startsWith("/api/")) throw new Error("BFF backend paths must be explicit API paths")
      try {
        const headers = headersFor(options.token)
        for (const [name, value] of Object.entries(options.headers ?? {})) headers.set(name, value)
        const response = await fetchImpl(`${safeBase}${path}`, {
          method: options.method || "GET",
          headers,
          body: options.body,
          cache: "no-store",
          signal: options.signal ?? AbortSignal.timeout(options.timeoutMs ?? WRITE_TIMEOUT_MS),
        })
        if (!response.ok) await safeFailure(response)
        return response
      } catch (error) {
        if (error instanceof ApiError) throw error
        throw backendFailure(error, requestId)
      }
    },
  }
}
