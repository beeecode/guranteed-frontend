import { ApiError, normalizeApiError } from "./core"

let csrfToken = ""
const requestId = () => globalThis.crypto?.randomUUID?.() ?? `web-${Date.now()}-${Math.random().toString(16).slice(2)}`
const requestHeaders = (headers?: HeadersInit) => {
  const next = new Headers(headers)
  next.set("x-request-id", requestId())
  return next
}
const parse = async (response: Response) => {
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw normalizeApiError(response.status, payload)
  return payload
}

export const bffClient = {
  async session<T>() {
    const payload = await parse(await fetch("/api/bff/auth/session", { cache: "no-store", headers: requestHeaders() })) as { user: T; csrfToken: string }
    csrfToken = payload.csrfToken
    return payload.user
  },
  async action<T>(action: string, input: { params?: Record<string, unknown>; payload?: unknown } = {}) {
    if (!csrfToken) await this.session()
    return parse(await fetch(`/api/bff/actions/${encodeURIComponent(action)}`, {
      method: "POST",
      headers: requestHeaders({ "content-type": "application/json", "x-csrf-token": csrfToken }),
      body: JSON.stringify(input),
    })) as Promise<T>
  },
  async upload<T>(operation: "students-csv" | "questions-csv" | "question-image" | "exam-answers-csv", data: FormData) {
    if (!csrfToken) await this.session()
    return parse(await fetch(`/api/bff/actions/${encodeURIComponent(operation)}`, {
      method: "POST",
      headers: requestHeaders({ "x-csrf-token": csrfToken }),
      body: data,
    })) as Promise<T>
  },
  async download(operation: "exam-results" | "bundle-results" | "bulk-transcripts", params: Record<string, unknown>) {
    if (!csrfToken) await this.session()
    const response = await fetch(`/api/bff/actions/${encodeURIComponent(operation)}`, {
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
    await parse(await fetch("/api/bff/auth/logout", { method: "POST", headers: requestHeaders({ "x-csrf-token": csrfToken }) }))
    csrfToken = ""
  },
}
