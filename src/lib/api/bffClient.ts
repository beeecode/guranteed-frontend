import { ApiError, normalizeApiError } from "./core"
import { announceSessionEnded, SESSION_ENDED_MESSAGE } from "./sessionEvents"

let csrfToken = ""
const requestId = () => globalThis.crypto?.randomUUID?.() ?? `web-${Date.now()}-${Math.random().toString(16).slice(2)}`
const requestHeaders = (headers?: HeadersInit) => {
  const next = new Headers(headers)
  next.set("x-request-id", requestId())
  return next
}
/**
 * Stage 11: the browser lost its connection (Wi-Fi drop, server down). Status 0 keeps it
 * "retryable" for exam saves; the message is meant for people, not "Failed to fetch".
 */
const send = async (input: string, init: RequestInit) => {
  try { return await fetch(input, init) }
  catch {
    throw new ApiError("Your connection to the school server was lost. Check the network, then try again.", { status: 0, code: "NETWORK_ERROR" })
  }
}
const parse = async (response: Response) => {
  const payload = await response.json().catch(() => ({}))
  // Every BFF 401 means the sign-in has ended (sign-in itself does not use this client).
  if (response.status === 401) {
    announceSessionEnded()
    throw new ApiError(SESSION_ENDED_MESSAGE, { status: 401, code: "SESSION_ENDED" })
  }
  if (!response.ok) throw normalizeApiError(response.status, payload)
  return payload
}

/**
 * Stage 11: one session request at a time per page. Several components ask for the session
 * on load (sidebar profile + the first action needing a CSRF token); concurrent session
 * validations conflict on the server ("The session changed during validation"), so callers
 * share the request that is already in flight.
 */
let sessionInFlight: Promise<{ user: unknown; csrfToken: string }> | null = null
const loadSession = () => {
  sessionInFlight ??= (async () => {
    try {
      const payload = await parse(await send("/api/bff/auth/session", { cache: "no-store", headers: requestHeaders() })) as { user: unknown; csrfToken: string }
      csrfToken = payload.csrfToken
      return payload
    } finally { sessionInFlight = null }
  })()
  return sessionInFlight
}

export const bffClient = {
  async session<T>() {
    const payload = await loadSession()
    return payload.user as T
  },
  async action<T>(action: string, input: { params?: Record<string, unknown>; payload?: unknown } = {}) {
    if (!csrfToken) await this.session()
    return parse(await send(`/api/bff/actions/${encodeURIComponent(action)}`, {
      method: "POST",
      headers: requestHeaders({ "content-type": "application/json", "x-csrf-token": csrfToken }),
      body: JSON.stringify(input),
    })) as Promise<T>
  },
  async upload<T>(operation: "students-csv" | "questions-csv" | "question-image" | "exam-answers-csv", data: FormData) {
    if (!csrfToken) await this.session()
    return parse(await send(`/api/bff/actions/${encodeURIComponent(operation)}`, {
      method: "POST",
      headers: requestHeaders({ "x-csrf-token": csrfToken }),
      body: data,
    })) as Promise<T>
  },
  async download(operation: "exam-results" | "bundle-results" | "bulk-transcripts", params: Record<string, unknown>) {
    if (!csrfToken) await this.session()
    const response = await send(`/api/bff/actions/${encodeURIComponent(operation)}`, {
      method: "POST",
      headers: requestHeaders({ "content-type": "application/json", "x-csrf-token": csrfToken }),
      body: JSON.stringify({ params }),
    })
    if (!response.ok) await parse(response)
    const disposition = response.headers.get("content-disposition") || ""
    const filename = disposition.match(/filename="?([^";]+)"?/i)?.[1]?.replace(/[^A-Za-z0-9._-]/g, "_") || "export.csv"
    return { blob: await response.blob(), filename }
  },
  async logout() {
    if (!csrfToken) throw new ApiError("No active application session.", { status: 401 })
    await parse(await send("/api/bff/auth/logout", { method: "POST", headers: requestHeaders({ "x-csrf-token": csrfToken }) }))
    csrfToken = ""
  },
}
