import test from "node:test"
import assert from "node:assert/strict"
import {
  ApiError,
  buildPaginationQuery,
  createBffApiClient,
  normalizeApiError,
  resolveAdapterMode,
} from "./core.ts"

test("normalizes authentication, authorization, conflict, rate and outage errors", () => {
  assert.equal(
    normalizeApiError(401, {}).message,
    "Your session has expired. Please sign in again.",
  )
  assert.equal(normalizeApiError(403, {}).status, 403)
  assert.match(
    normalizeApiError(409, { code: "QUESTION_HISTORY_LOCKED" }).message,
    /replacement question/i,
  )
  assert.equal(normalizeApiError(429, {}).status, 429)
  assert.equal(normalizeApiError(503, {}).status, 503)
  const traced = normalizeApiError(423, { message: "This exam is paused.", request_id: "trace-123456" })
  assert.equal(traced.message, "This exam is paused.")
  assert.equal(traced.requestId, "trace-123456")
})

test("validates pagination and preserves a stable query", () => {
  assert.equal(buildPaginationQuery({ page: 2, limit: 25 }), "?page=2&limit=25")
  assert.equal(buildPaginationQuery({ limit: 200 }, 200), "?limit=200")
  assert.throws(() => buildPaginationQuery({ page: 0 }), /positive integer/)
  assert.throws(() => buildPaginationQuery({ limit: 101 }), /1 to 100/)
})

test("keeps Stage 8 adapters mock-only or disabled", () => {
  assert.equal(resolveAdapterMode(), "mock")
  assert.equal(resolveAdapterMode("disabled"), "disabled")
  assert.throws(() => resolveAdapterMode("real"), /not enabled/)
})

test("retries GET network failures but never retries a mutation", async () => {
  let getCalls = 0
  const getClient = createBffApiClient({
    baseUrl: "http://127.0.0.1:5107",
    getAccessToken: async () => "test-token",
    fetchImpl: async () => {
      getCalls += 1
      if (getCalls === 1) throw new TypeError("network")
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    },
  })
  assert.deepEqual(await getClient<{ ok: boolean }>("/api/health"), {
    ok: true,
  })
  assert.equal(getCalls, 2)

  let postCalls = 0
  const postClient = createBffApiClient({
    baseUrl: "http://127.0.0.1:5107",
    getAccessToken: async () => null,
    fetchImpl: async () => {
      postCalls += 1
      throw new TypeError("network")
    },
  })
  await assert.rejects(
    postClient("/api/student/attempts/1/submit", { method: "POST" }),
    (error: unknown) => error instanceof ApiError && error.status === 503,
  )
  assert.equal(postCalls, 1)
})
