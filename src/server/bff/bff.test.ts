import test from "node:test"
import assert from "node:assert/strict"
import { ApiError } from "../../lib/api/core.ts"
import { SaveAcknowledgementTracker, presentResultPolicy, serverRemainingSeconds } from "../../lib/api/presentation.ts"
import { resolveAction } from "./actions.ts"
import { createAuthService } from "./authService.ts"
import { createBackendGateway, type BackendGateway } from "./backend.ts"
import { readBffConfig } from "./config.ts"
import { assertCsrf, assertSameOrigin } from "./csrf.ts"
import { loadAdminDashboard, loadStudentDashboard } from "./dashboardService.ts"
import { validateUpload } from "./filePolicy.ts"
import { parsePublicEnquiry } from "./publicEnquiry.ts"
import { protectPath } from "./routeProtection.ts"
import {
  clearSessionCookie,
  createSession,
  openSession,
  sealSession,
  serializeSessionCookie,
  type SessionProfile,
} from "./session.ts"

const secret = "stage9-test-secret-that-is-at-least-32-characters"
const profile = (role: "student" | "admin" = "student"): SessionProfile => ({
  id: `${role}-id`, role, is_active: true, full_name: "Test User",
})
const session = (role: "student" | "admin" = "student") => createSession({
  accessToken: "access-one", refreshToken: "refresh-one", expiresAt: Date.now() + 60_000, profile: profile(role),
})

test("integration mode fails closed unless every server-side gate is present", () => {
  assert.equal(readBffConfig({ GFMS_BFF_MODE: "mock" }).mode, "mock")
  assert.throws(() => readBffConfig({ GFMS_BFF_MODE: "integration" }), /authorization/)
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
  })
  assert.equal(config.mode, "integration")
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
  const [one, two] = await Promise.all([auth.refresh(current), auth.refresh(current)])
  assert.equal(refreshes, 1)
  assert.equal(one.refreshToken, "refresh-two")
  assert.equal(two.refreshToken, "refresh-two")
})

test("route protection is role-aware and unsupported parent routes close in real modes", () => {
  assert.equal(protectPath("/student/dashboard", "mock", null).action, "allow")
  assert.deepEqual(protectPath("/student/dashboard", "disabled", null), { action: "redirect", destination: "/student/login" })
  assert.deepEqual(protectPath("/admin/dashboard", "integration", session("student")), { action: "redirect", destination: "/student/dashboard" })
  assert.deepEqual(protectPath("/parent/dashboard", "integration", null), { action: "redirect", destination: "/cbt" })
  assert.equal(protectPath("/admin/dashboard", "integration", session("admin")).action, "allow")
  assert.deepEqual(protectPath("/student/exam/42", "integration", session("student")), { action: "redirect", destination: "/student/dashboard" })
  assert.deepEqual(protectPath("/admin/questions", "integration", session("admin")), { action: "redirect", destination: "/admin/dashboard" })
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
