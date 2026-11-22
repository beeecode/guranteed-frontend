import { ApiError, normalizeApiError } from "./core"

let csrfToken = ""
const parse = async (response: Response) => {
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw normalizeApiError(response.status, payload)
  return payload
}

export const bffClient = {
  async session<T>() {
    const payload = await parse(await fetch("/api/bff/auth/session", { cache: "no-store" })) as { user: T; csrfToken: string }
    csrfToken = payload.csrfToken
    return payload.user
  },
  async action<T>(action: string, input: { params?: Record<string, unknown>; payload?: unknown } = {}) {
    if (!csrfToken) await this.session()
    return parse(await fetch(`/api/bff/actions/${encodeURIComponent(action)}`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-csrf-token": csrfToken },
      body: JSON.stringify(input),
    })) as Promise<T>
  },
  async logout() {
    if (!csrfToken) throw new ApiError("No active application session.", { status: 401 })
    await parse(await fetch("/api/bff/auth/logout", { method: "POST", headers: { "x-csrf-token": csrfToken } }))
    csrfToken = ""
  },
}
