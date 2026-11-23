import test from "node:test"
import assert from "node:assert/strict"
import { ApiError } from "../../lib/api/core.ts"
import { SaveAcknowledgementTracker, presentResultPolicy, serverRemainingSeconds } from "../../lib/api/presentation.ts"
import { resolveAction } from "./actions.ts"
import { createAuthService } from "./authService.ts"
import { createBackendGateway, type BackendGateway } from "./backend.ts"
import { readBffConfig } from "./config.ts"
import { forwardWithSession } from "./forwardWithSession.ts"
import { assertCsrf, assertSameOrigin } from "./csrf.ts"
import { loadAdminDashboard, loadStudentDashboard } from "./dashboardService.ts"
import { validateUpload } from "./filePolicy.ts"
import { prepareUpload, resolveDownload, safeDownloadHeaders } from "./fileTransport.ts"
import { parsePublicEnquiry } from "./publicEnquiry.ts"
import { protectPath } from "./routeProtection.ts"
import { requestIdFor } from "./requestId.ts"
import {
  clearSessionCookie,
  createSession,
  openSession,
  sealSession,
  serializeSessionCookie,
  SessionManager,
  readSessionCookieProfile,
  type SessionProfile,
} from "./session.ts"
import { InMemorySessionStore } from "./sessionStore.ts"

const secret = "stage9-test-secret-that-is-at-least-32-characters"
const profile = (role: "student" | "admin" = "student"): SessionProfile => ({
  id: `${role}-id`, role, is_active: true, full_name: "Test User",
})
const session = (role: "student" | "admin" = "student") => createSession({
  accessToken: "access-one", refreshToken: "refresh-one", expiresAt: Date.now() + 60_000, profile: profile(role),
})

test("integration mode fails closed unless every server-side gate is present", () => {
  assert.equal(readBffConfig({}).mode, "disabled")
  assert.equal(readBffConfig({ GFMS_BFF_MODE: "mock" }).mode, "mock")
  assert.throws(() => readBffConfig({ GFMS_BFF_MODE: "integration" }), /authorization/)
  assert.throws(() => readBffConfig({ GFMS_BFF_MODE: "integration", GFMS_INTEGRATION_AUTHORIZATION: "ISOLATED_NON_PRODUCTION_SUPABASE", GFMS_INTEGRATION_ENVIRONMENT_ID: "11111111-1111-4111-8111-111111111111", GFMS_BACKEND_URL: "http://127.0.0.1:5107", GFMS_SESSION_SECRET: secret, GFMS_SESSION_STORE: "external" }), /GFMS_REDIS_URL/)
  assert.throws(() => readBffConfig({
    GFMS_BFF_MODE: "integration",
    GFMS_INTEGRATION_AUTHORIZATION: "ISOLATED_NON_PRODUCTION_SUPABASE",
  }), /UUID/)
  const config = readBffConfig({
    GFMS_BFF_MODE: "integration",
    GFMS_INTEGRATION_AUTHORIZATION: "ISOLATED_NON_PRODUCTION_SUPABASE",
    GFMS_INTEGRATION_ENVIRONMENT_ID: "11111111-1111-4111-8111-111111111111",
    GFMS_BACKEND_URL: "http://127.0.0.1:5107",
    GFMS_SESSION_SECRET: secret,
    GFMS_SESSION_STORE: "memory",
    GFMS_ALLOW_LOCAL_SESSION_STORE: "true",
  })
  assert.equal(config.mode, "integration")
  assert.throws(() => readBffConfig({
    GFMS_BFF_MODE: "integration", GFMS_INTEGRATION_AUTHORIZATION: "ISOLATED_NON_PRODUCTION_SUPABASE",
    GFMS_INTEGRATION_ENVIRONMENT_ID: "11111111-1111-4111-8111-111111111111",
    GFMS_BACKEND_URL: "http://127.0.0.1:5107", GFMS_SESSION_SECRET: secret,
    GFMS_SESSION_STORE: "memory", GFMS_ALLOW_LOCAL_SESSION_STORE: "true", NODE_ENV: "production",
  }), /memory session store/)
})

test("encrypted sessions reject tampering and expiry", () => {
  const original = session()
  const sealed = sealSession(original, secret)
  assert.equal(openSession(sealed, secret)?.profile.role, "student")
  assert.equal(openSession(`${sealed}x`, secret), null)
  assert.equal(openSession(sealed, "a-different-secret-that-is-long-enough"), null)
  assert.equal(openSession(sealed, secret, original.absoluteExpiresAt + 1), null)
})

test("session cookies are HttpOnly, same-site and secure when requested", () => {
  const cookie = serializeSessionCookie("sealed", true)
  assert.match(cookie, /HttpOnly/)
  assert.match(cookie, /SameSite=Lax/)
  assert.match(cookie, /Secure/)
  assert.match(clearSessionCookie(true), /Max-Age=0/)
})

test("CSRF requires exact same origin and the session token", () => {
  const current = session()
  const valid = new Request("https://portal.example.test/api/bff/auth/logout", {
    method: "POST",
    headers: { origin: "https://portal.example.test", "x-csrf-token": current.csrfToken },
  })
  assert.doesNotThrow(() => assertSameOrigin(valid))
  assert.doesNotThrow(() => assertCsrf(valid, current))
  assert.throws(() => assertCsrf(new Request(valid.url, { method: "POST", headers: { origin: "https://evil.example" } }), current), /Cross-site/)
  assert.throws(() => assertCsrf(new Request(valid.url, { method: "POST", headers: { origin: "https://portal.example.test" } }), current), /CSRF token/)
})

test("login uses the trusted profile and rejects a portal-role mismatch", async () => {
  const calls: string[] = []
  const gateway: BackendGateway = {
    async request<T>(path: string) {
      calls.push(path)
      if (path === "/api/auth/login") return { session: { access_token: "a", refresh_token: "r", expires_in: 60 } } as T
      if (path === "/api/me") return { user: profile("student") } as T
      return { success: true } as T
    },
  }
  const auth = createAuthService(gateway)
  assert.equal((await auth.login("S-1", "password", "student")).profile.role, "student")
  await assert.rejects(auth.login("S-1", "password", "admin"), (error: unknown) => error instanceof ApiError && error.code === "ROLE_MISMATCH")
  assert.ok(calls.includes("/api/auth/logout"))
})

test("concurrent refresh calls rotate the token only once per session", async () => {
  let refreshes = 0
  const current = session()
  const store = new InMemorySessionStore()
  const firstInstance = new SessionManager(store, secret)
  const secondInstance = new SessionManager(store, secret)
  const cookie = await firstInstance.create(current)
  const firstSnapshot = await firstInstance.readCookie(cookie)
  const secondSnapshot = await secondInstance.readCookie(cookie)
  const gateway: BackendGateway = {
    async request<T>(path: string) {
      if (path === "/api/auth/refresh") {
        refreshes += 1
        await new Promise((resolve) => setTimeout(resolve, 20))
        return { session: { access_token: "access-two", refresh_token: "refresh-two", expires_in: 60 } } as T
      }
      if (path === "/api/me") return { user: profile("student") } as T
      throw new Error("unexpected")
    },
  }
  const auth = createAuthService(gateway)
  const [one, two] = await Promise.all([
    firstInstance.refresh(firstSnapshot!, auth.refresh),
    secondInstance.refresh(secondSnapshot!, auth.refresh),
  ])
  assert.equal(refreshes, 1)
  assert.equal(one.session.refreshToken, "refresh-two")
  assert.equal(two.session.refreshToken, "refresh-two")
})

test("route protection is role-aware and unsupported parent routes close in real modes", () => {
  assert.equal(protectPath("/student/dashboard", "mock", null).action, "allow")
  assert.deepEqual(protectPath("/student/dashboard", "disabled", null), { action: "redirect", destination: "/student/login" })
  assert.deepEqual(protectPath("/admin/dashboard", "integration", session("student")), { action: "redirect", destination: "/student/dashboard" })
  assert.deepEqual(protectPath("/parent/dashboard", "integration", null), { action: "redirect", destination: "/cbt" })
  assert.equal(protectPath("/admin/dashboard", "integration", session("admin")).action, "allow")
  assert.equal(protectPath("/student/exam/42", "integration", session("student")).action, "allow")
  assert.equal(protectPath("/student/exam/42/instructions", "integration", session("student")).action, "allow")
  assert.equal(protectPath("/student/exam/42/submitted", "integration", session("student")).action, "allow")
  assert.deepEqual(protectPath("/student/results", "integration", session("student")), { action: "redirect", destination: "/student/dashboard" })
  assert.equal(protectPath("/admin/questions", "integration", session("admin")).action, "allow")
  assert.deepEqual(protectPath("/admin/settings", "integration", session("admin")), { action: "redirect", destination: "/admin/dashboard" })
})

test("opaque session cookies do not contain access or refresh tokens", async () => {
  const manager = new SessionManager(new InMemorySessionStore(), secret)
  const current = session()
  const cookie = await manager.create(current)
  assert.equal(cookie.includes(current.accessToken), false)
  assert.equal(cookie.includes(current.refreshToken), false)
  assert.equal(readSessionCookieProfile(cookie, secret)?.role, "student")
  assert.equal(readSessionCookieProfile(cookie.replace(".student.", ".admin."), secret), null)
  assert.equal((await manager.readCookie(cookie))?.session.id, current.id)
  assert.equal(await manager.readCookie(`${cookie}tampered`), null)
})

test("logout during refresh prevents the rotated session from being committed", async () => {
  const store = new InMemorySessionStore()
  const manager = new SessionManager(store, secret)
  const cookie = await manager.create(session())
  const snapshot = await manager.readCookie(cookie)
  assert.ok(snapshot)
  let release!: () => void
  const paused = new Promise<void>((resolve) => { release = resolve })
  const refreshing = manager.refresh(snapshot!, async (current) => {
    await paused
    return { ...current, accessToken: "rotated" }
  })
  await new Promise((resolve) => setTimeout(resolve, 5))
  await manager.delete(snapshot!.session.id)
  release()
  await assert.rejects(refreshing, (error: unknown) => (error as { code?: string }).code === "SESSION_CHANGED")
  assert.equal(await manager.readCookie(cookie), null)
})

test("a failed refresh releases its lease so a later refresh can succeed", async () => {
  const manager = new SessionManager(new InMemorySessionStore(), secret)
  const cookie = await manager.create(session())
  const snapshot = await manager.readCookie(cookie)
  await assert.rejects(manager.refresh(snapshot!, async () => { throw new Error("provider rejected refresh") }), /provider rejected/)
  const next = await manager.refresh(snapshot!, async (current) => ({ ...current, accessToken: "recovered" }))
  assert.equal(next.session.accessToken, "recovered")
})

test("expired and revoked server-side sessions fail closed", async () => {
  const store = new InMemorySessionStore()
  const future = Date.now() + (9 * 60 * 60 * 1000)
  const manager = new SessionManager(store, secret, () => future)
  const current = session()
  const cookie = await manager.create(current)
  assert.equal(await manager.readCookie(cookie), null)
  const activeManager = new SessionManager(store, secret)
  const active = session()
  const activeCookie = await activeManager.create(active)
  await activeManager.delete(active.id)
  assert.equal(await activeManager.readCookie(activeCookie), null)
})

test("a temporary session-store interruption never falls back to local token state", async () => {
  const backing = new InMemorySessionStore()
  let interrupted = true
  const store = {
    create: backing.create.bind(backing),
    read: async (id: string) => { if (interrupted) throw new Error("store interrupted"); return backing.read(id) },
    acquireRefresh: backing.acquireRefresh.bind(backing),
    commitRefresh: backing.commitRefresh.bind(backing),
    releaseRefresh: backing.releaseRefresh.bind(backing),
    delete: backing.delete.bind(backing),
  }
  const manager = new SessionManager(store, secret)
  const cookie = await manager.create(session())
  await assert.rejects(manager.readCookie(cookie), /store interrupted/)
  interrupted = false
  assert.ok(await manager.readCookie(cookie))
})

test("request IDs preserve only safe incoming values and reach the backend", async () => {
  const incoming = "web-request_1234"
  assert.equal(requestIdFor(new Request("https://portal.test", { headers: { "x-request-id": incoming } })), incoming)
  assert.notEqual(requestIdFor(new Request("https://portal.test", { headers: { "x-request-id": "bad id value" } })), "bad id value")
  let propagated = ""
  const gateway = createBackendGateway("http://127.0.0.1:5107", async (_url, init) => {
    propagated = new Headers(init?.headers).get("x-request-id") || ""
    return Response.json({ ok: true }, { headers: { "x-request-id": incoming } })
  }, incoming)
  await gateway.request("/api/student/server-time")
  assert.equal(propagated, incoming)
})

test("explicit action mappings reject arbitrary paths and preserve approved pagination", () => {
  assert.throws(() => resolveAction("https://evil.example/api/admin/students"), /Unknown BFF action/)
  assert.throws(() => resolveAction("student-attempt-get", { params: { attemptId: "../admin" } }), /invalid/)
  assert.equal(
    resolveAction("admin-students-list", { params: { page: 2, limit: 25, unexpected: "secret" } }).path,
    "/api/admin/students?page=2&limit=25",
  )
})

test("the backend gateway does not retry failures and normalizes outages and conflicts", async () => {
  let calls = 0
  const conflictGateway = createBackendGateway("http://127.0.0.1:5107", async () => {
    calls += 1
    return Response.json({ message: "Historical questions are locked.", code: "QUESTION_HISTORY_LOCKED" }, { status: 409 })
  })
  await assert.rejects(
    conflictGateway.request("/api/admin/questions/q-1", { method: "DELETE" }),
    (error: unknown) => error instanceof ApiError && error.status === 409 && error.code === "QUESTION_HISTORY_LOCKED",
  )
  assert.equal(calls, 1)

  const outageGateway = createBackendGateway("http://127.0.0.1:5107", async () => {
    throw new Error("socket details must not escape")
  })
  await assert.rejects(
    outageGateway.request("/api/student/dashboard"),
    (error: unknown) => error instanceof ApiError && error.status === 503 && !error.message.includes("socket"),
  )
})

test("answer acknowledgement cannot mark a stale save as current", () => {
  const tracker = new SaveAcknowledgementTracker()
  const first = tracker.issue()
  const second = tracker.issue()
  assert.equal(tracker.acknowledge(first), false)
  assert.equal(tracker.saved, false)
  assert.equal(tracker.acknowledge(second), true)
  assert.equal(tracker.saved, true)
})

test("result and timer presentation preserve backend authority", () => {
  assert.deepEqual(presentResultPolicy({ grade: null, passed: null }), { grade: null, outcome: null })
  assert.deepEqual(presentResultPolicy({ grade: "A", passed: true }), { grade: "A", outcome: "Passed" })
  assert.equal(serverRemainingSeconds("2026-11-22T10:00:05.000Z", Date.parse("2026-11-22T10:00:00.000Z")), 5)
  assert.equal(serverRemainingSeconds("invalid"), null)
})

test("upload preparation enforces filenames, MIME types and size limits", () => {
  assert.doesNotThrow(() => validateUpload({ name: "students.csv", type: "text/csv", size: 100 }, "csv"))
  assert.throws(() => validateUpload({ name: "../students.csv", type: "text/csv", size: 100 }, "csv"), /filename/)
  assert.throws(() => validateUpload({ name: "payload.exe", type: "application/octet-stream", size: 100 }, "question-image"), /type/)
  assert.throws(() => validateUpload({ name: "large.csv", type: "text/csv", size: 11 * 1024 * 1024 }, "csv"), /size/)
})

test("multipart transport maps only approved operations and preserves the browser FormData boundary", () => {
  const data = new FormData()
  data.set("csv_file", new File(["name,student_id\nAda,S-1"], "students.csv", { type: "text/csv" }))
  const prepared = prepareUpload("students-csv", data)
  assert.equal(prepared.path, "/api/admin/students/import-csv")
  assert.equal(prepared.body, data)
  assert.throws(() => prepareUpload("unknown", data), /Unknown upload/)
  assert.throws(() => resolveDownload("exam-results", { examId: "../private" }), /invalid/)
  assert.equal(resolveDownload("bundle-results", { bundleId: 4 }), "/api/admin/bundles/4/export")
})

test("download transport streams backend bytes with a safe filename and request ID", async () => {
  const gateway = createBackendGateway("http://127.0.0.1:5107", async () => new Response("a,b\r\n1,2", {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": "attachment; filename=results.csv", "x-request-id": "backend-trace-1" },
  }))
  const response = await gateway.requestRaw!("/api/admin/exams/1/export-results", { token: "access" })
  assert.equal(await response.text(), "a,b\r\n1,2")
  const headers = safeDownloadHeaders(response.headers, "bff-trace-1")
  assert.equal(headers["content-disposition"], "attachment; filename=results.csv")
  assert.equal(headers["x-request-id"], "backend-trace-1")
})

test("dashboard loaders use only the role-specific backend contracts", async () => {
  const calls: string[] = []
  const gateway: BackendGateway = {
    async request<T>(path: string) {
      calls.push(path)
      return { source: path } as T
    },
  }
  const student = await loadStudentDashboard(gateway, "student-token", profile("student"))
  assert.equal((student.dashboard as { source: string }).source, "/api/student/dashboard")
  assert.deepEqual(calls, ["/api/student/dashboard", "/api/student/bundles", "/api/student/results-summary"])

  calls.length = 0
  const admin = await loadAdminDashboard(gateway, "admin-token", profile("admin"))
  assert.equal((admin.stats as { source: string }).source, "/api/admin/stats")
  assert.deepEqual(calls, ["/api/admin/stats", "/api/admin/analytics"])
})

test("public enquiry validation forwards only the approved contract", () => {
  const parsed = parsePublicEnquiry({
    full_name: " Ada Student ", email: "ADA@EXAMPLE.TEST", phone: "+2348012345678",
    message: "Please send admission information.", class_interest: "Primary 5", injected: "not forwarded",
  }, "admissions")
  assert.deepEqual(parsed, {
    full_name: "Ada Student", email: "ada@example.test", phone: "+2348012345678",
    message: "Please send admission information.", class_interest: "Primary 5",
  })
  assert.throws(() => parsePublicEnquiry({}, "contact"), /required enquiry fields/)
})

// Stage 11: long exams must not lock when the one-hour access token expires.
test("forwarding refreshes a nearly expired access token once, even for parallel saves", async () => {
  let refreshes = 0
  const store = new InMemorySessionStore()
  const manager = new SessionManager(store, secret)
  const expiring = createSession({ accessToken: "old-access", refreshToken: "refresh-one", expiresAt: Date.now() + 30_000, profile: profile("student") })
  const snapshot = (await manager.readCookie(await manager.create(expiring)))!
  const gateway: BackendGateway = {
    async request<T>(path: string) {
      if (path === "/api/auth/refresh") { refreshes += 1; await new Promise((resolve) => setTimeout(resolve, 20)); return { session: { access_token: "new-access", refresh_token: "refresh-two", expires_in: 3600 } } as T }
      if (path === "/api/me") return { user: profile("student") } as T
      throw new Error(`unexpected ${path}`)
    },
  }
  const used: string[] = []
  const results = await Promise.all(Array.from({ length: 20 }, () => forwardWithSession({ gateway, manager, snapshot, session: snapshot.session }, async (token) => { used.push(token); return token })))
  assert.equal(refreshes, 1, "twenty parallel requests share one refresh")
  assert.ok(results.every((token) => token === "new-access"))
  assert.ok(!used.includes("old-access"))
})

test("forwarding retries once with a refreshed token after a 401, and does not loop", async () => {
  const store = new InMemorySessionStore()
  const manager = new SessionManager(store, secret)
  const fresh = createSession({ accessToken: "revoked-access", refreshToken: "refresh-one", expiresAt: Date.now() + 3_600_000, profile: profile("student") })
  const snapshot = (await manager.readCookie(await manager.create(fresh)))!
  let refreshes = 0
  const gateway: BackendGateway = {
    async request<T>(path: string) {
      if (path === "/api/auth/refresh") { refreshes += 1; return { session: { access_token: `access-${refreshes}`, refresh_token: `refresh-${refreshes + 1}`, expires_in: 3600 } } as T }
      if (path === "/api/me") return { user: profile("student") } as T
      throw new Error(`unexpected ${path}`)
    },
  }
  const freshSnapshot = async () => (await manager.readCookie(await manager.create({ ...fresh, id: crypto.randomUUID() })))!
  const calls: string[] = []
  const result = await forwardWithSession({ gateway, manager, snapshot, session: snapshot.session }, async (token) => {
    calls.push(token)
    if (token === "revoked-access") throw new ApiError("Invalid or expired token", { status: 401 })
    return "saved"
  })
  assert.equal(result, "saved")
  assert.deepEqual(calls, ["revoked-access", "access-1"])

  const alwaysDenied = forwardWithSession({ gateway, manager, snapshot: await freshSnapshot(), session: fresh }, async () => { throw new ApiError("Invalid or expired token", { status: 401 }) })
  await assert.rejects(alwaysDenied, (error: unknown) => error instanceof ApiError && error.status === 401)
  // Other failures are not retried by the forwarding layer.
  let attempts = 0
  await assert.rejects(forwardWithSession({ gateway, manager, snapshot: await freshSnapshot(), session: fresh }, async () => { attempts += 1; throw new ApiError("Conflict", { status: 409 }) }))
  assert.equal(attempts, 1)
})

test("bundle subject submit forwards only a valid attempt_id", () => {
  assert.deepEqual(resolveAction("student-bundle-submit-current", { params: { sessionAttemptId: 88 }, payload: { attempt_id: 345 } }).body, { attempt_id: 345 })
  for (const payload of [undefined, {}, { attempt_id: "x" }, { attempt_id: -1 }, { attempt_id: 1.5 }, { attempt_id: 345, extra: "dropped" }]) {
    const body = resolveAction("student-bundle-submit-current", { params: { sessionAttemptId: 88 }, payload }).body
    assert.ok(body === undefined || (Object.keys(body as object).length === 1 && (body as { attempt_id: number }).attempt_id === 345), JSON.stringify(payload))
  }
})
