export type DataAdapterMode = "mock" | "disabled"
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export interface PaginationInput {
  page?: number
  limit?: number
}

export interface ApiClientConfig {
  baseUrl: string
  getAccessToken: () => Promise<string | null>
  fetchImpl?: typeof fetch
  timeoutMs?: number
  getRetries?: number
}

export interface ApiRequestOptions<TBody = unknown> {
  method?: HttpMethod
  body?: TBody
  signal?: AbortSignal
  headers?: HeadersInit
}

const STATUS_MESSAGES: Record<number, string> = {
  401: "Your session has expired. Please sign in again.",
  403: "You do not have permission to perform this action.",
  409: "This record conflicts with existing or historical data.",
  429: "Too many requests. Please wait and try again.",
  503: "The service is temporarily unavailable. Please try again later.",
}

export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly details?: unknown
  readonly requestId?: string

  constructor(
    message: string,
    {
      status,
      code,
      details,
      requestId,
    }: { status: number; code?: string; details?: unknown; requestId?: string },
  ) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code
    this.details = details
    this.requestId = requestId
  }
}

export function normalizeApiError(status: number, payload: unknown): ApiError {
  const body =
    payload && typeof payload === "object"
      ? payload as {
          message?: unknown
          error?: unknown
          code?: unknown
          details?: unknown
          request_id?: unknown
        }
      : {}
  const backendMessage =
    typeof body.message === "string"
      ? body.message
      : typeof body.error === "string"
        ? body.error
        : undefined
  const code = typeof body.code === "string" ? body.code : undefined
  const message =
    code === "QUESTION_HISTORY_LOCKED"
      ? "This question is part of an exam attempt and cannot be changed. Create a replacement question for future exams."
      : (backendMessage ??
        STATUS_MESSAGES[status] ??
        "Something went wrong. Please try again.")
  const requestId = typeof body.request_id === "string" ? body.request_id : undefined
  return new ApiError(message, { status, code, details: body.details, requestId })
}

export function buildPaginationQuery(
  input: PaginationInput = {},
  maxLimit = 100,
): string {
  const params = new URLSearchParams()
  if (input.page !== undefined) {
    if (!Number.isInteger(input.page) || input.page < 1)
      throw new Error("page must be a positive integer")
    params.set("page", String(input.page))
  }
  if (input.limit !== undefined) {
    if (
      !Number.isInteger(input.limit) ||
      input.limit < 1 ||
      input.limit > maxLimit
    ) {
      throw new Error(`limit must be an integer from 1 to ${maxLimit}`)
    }
    params.set("limit", String(input.limit))
  }
  const query = params.toString()
  return query ? `?${query}` : ""
}

/** Stage 8 permits sample-data rendering or a disabled state only. */
export function resolveAdapterMode(value?: string): DataAdapterMode {
  const normalized = String(value || "mock")
    .trim()
    .toLowerCase()
  if (normalized === "mock" || normalized === "disabled") return normalized
  throw new Error("Live API adapters are not enabled during Stage 8")
}

export function validateServerBaseUrl(raw: string): string {
  if (typeof window !== "undefined") {
    throw new Error(
      "The Express API client is server-only and must be called through the BFF",
    )
  }
  const url = new URL(raw)
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1"
  if (url.protocol !== "https:" && !(local && url.protocol === "http:")) {
    throw new Error(
      "Backend URL must use HTTPS except on loopback development hosts",
    )
  }
  return url.toString().replace(/\/$/, "")
}

const parseBody = async (response: Response): Promise<unknown> => {
  if (response.status === 204) return null
  const contentType = response.headers.get("content-type") || ""
  if (!contentType.includes("application/json")) return null
  return response.json()
}

/**
 * Server-only transport for a future Next.js BFF. Merely creating this client
 * does not activate it; no application screen imports or instantiates it.
 */
export function createBffApiClient(config: ApiClientConfig) {
  const baseUrl = validateServerBaseUrl(config.baseUrl)
  const fetchImpl = config.fetchImpl ?? fetch
  const timeoutMs = config.timeoutMs ?? 10_000
  const getRetries = Math.max(0, Math.min(config.getRetries ?? 1, 2))

  return async function request<TResponse, TBody = unknown>(
    path: string,
    options: ApiRequestOptions<TBody> = {},
  ): Promise<TResponse> {
    const method = options.method ?? "GET"
    const attempts = method === "GET" ? getRetries + 1 : 1
    let lastNetworkError: unknown

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const timeout = AbortSignal.timeout(timeoutMs)
      const signal = options.signal
        ? AbortSignal.any([options.signal, timeout])
        : timeout
      const token = await config.getAccessToken()
      const headers = new Headers(options.headers)
      headers.set("accept", "application/json")
      headers.set("cache-control", "no-store")
      if (token) headers.set("authorization", `Bearer ${token}`)
      if (options.body !== undefined)
        headers.set("content-type", "application/json")

      try {
        const response = await fetchImpl(`${baseUrl}${path}`, {
          method,
          headers,
          body:
            options.body === undefined
              ? undefined
              : JSON.stringify(options.body),
          cache: "no-store",
          signal,
        })
        const payload = await parseBody(response)
        if (!response.ok) throw normalizeApiError(response.status, payload)
        return payload as TResponse
      } catch (error) {
        if (error instanceof ApiError || options.signal?.aborted) throw error
        lastNetworkError = error
        if (attempt + 1 >= attempts) break
      }
    }

    throw new ApiError("The backend could not be reached.", {
      status: 503,
      details:
        lastNetworkError instanceof Error ? lastNetworkError.name : undefined,
    })
  }
}
