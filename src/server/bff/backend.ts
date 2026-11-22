import { ApiError, normalizeApiError, validateServerBaseUrl } from "../../lib/api/core.ts"

interface BackendRequestOptions { method?: string; body?: unknown; token?: string; signal?: AbortSignal }
export interface BackendGateway { request<T>(path: string, options?: BackendRequestOptions): Promise<T> }
const parseBody = async (response: Response) => (response.headers.get("content-type") || "").includes("application/json") ? response.json() : null

export function createBackendGateway(baseUrl: string, fetchImpl: typeof fetch = fetch): BackendGateway {
  const safeBase = validateServerBaseUrl(baseUrl)
  return {
    async request<T>(path: string, options: BackendRequestOptions = {}) {
      if (!path.startsWith("/api/")) throw new Error("BFF backend paths must be explicit API paths")
      const headers = new Headers({ accept: "application/json", "cache-control": "no-store" })
      if (options.token) headers.set("authorization", `Bearer ${options.token}`)
      if (options.body !== undefined) headers.set("content-type", "application/json")
      try {
        const response = await fetchImpl(`${safeBase}${path}`, {
          method: options.method || "GET",
          headers,
          body: options.body === undefined ? undefined : JSON.stringify(options.body),
          cache: "no-store",
          signal: options.signal ?? AbortSignal.timeout(10_000),
        })
        const payload = await parseBody(response)
        if (!response.ok) throw normalizeApiError(response.status, payload)
        return payload as T
      } catch (error) {
        if (error instanceof ApiError) throw error
        throw new ApiError("The backend could not be reached.", { status: 503 })
      }
    },
  }
}
