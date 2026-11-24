import { ApiError, normalizeApiError, validateServerBaseUrl } from "../../lib/api/core.ts"

interface BackendRequestOptions { method?: string; body?: unknown; token?: string; signal?: AbortSignal }
interface BackendRawRequestOptions { method?: string; body?: BodyInit; token?: string; signal?: AbortSignal; headers?: Record<string, string> }
export interface BackendGateway {
  request<T>(path: string, options?: BackendRequestOptions): Promise<T>
  requestRaw?(path: string, options?: BackendRawRequestOptions): Promise<Response>
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
          signal: options.signal ?? AbortSignal.timeout(10_000),
        })
        if (!response.ok) await safeFailure(response)
        const payload = await parseBody(response)
        return payload as T
      } catch (error) {
        if (error instanceof ApiError) throw error
        const outage = new ApiError("The backend could not be reached.", { status: 503 })
        Object.assign(outage, { requestId })
        throw outage
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
          signal: options.signal ?? AbortSignal.timeout(30_000),
        })
        if (!response.ok) await safeFailure(response)
        return response
      } catch (error) {
        if (error instanceof ApiError) throw error
        const outage = new ApiError("The backend could not be reached.", { status: 503 })
        Object.assign(outage, { requestId })
        throw outage
      }
    },
  }
}
