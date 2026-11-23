import assert from "node:assert/strict"
import test from "node:test"
import { isRetryableSaveError, QuestionSaveRevision, retryDelayMs, secondsUntil, serverOffset, UnsavedDraftStore, validTiming } from "./runtime.ts"

test("server offset corrects a client clock without resetting the deadline", () => {
  assert.equal(serverOffset("2026-01-01T00:00:10.000Z", Date.parse("2026-01-01T00:00:00.000Z")), 10_000)
  assert.equal(secondsUntil(Date.parse("2026-01-01T00:01:00.000Z"), 10_000, Date.parse("2026-01-01T00:00:00.000Z")), 50)
})

test("remaining time never becomes negative", () => assert.equal(secondsUntil(100, 0, 101), 0))
test("invalid or inverted timing is rejected", () => {
  assert.equal(validTiming({ expiresAt: 10, saveGraceEndsAt: 9 }), false)
  assert.equal(validTiming({ expiresAt: 10, saveGraceEndsAt: 11 }), true)
})

test("a stale save acknowledgement cannot mark a newer answer saved", () => {
  const revisions = new QuestionSaveRevision()
  const first = revisions.change(7)
  revisions.change(7)
  revisions.acknowledge(7, first)
  assert.equal(revisions.isSaved(7), false)
  revisions.acknowledge(7, revisions.latest(7))
  assert.equal(revisions.isSaved(7), true)
})

// Stage 11: exam-day save resilience.
test("transient save failures are retried; final client errors are not", () => {
  for (const status of [undefined, 0, 408, 409, 429, 500, 502, 503, 504]) assert.equal(isRetryableSaveError(status), true, String(status))
  for (const status of [400, 401, 403, 404, 410, 423]) assert.equal(isRetryableSaveError(status), false, String(status))
})

test("retry backoff grows, is capped and is jittered", () => {
  assert.equal(retryDelayMs(1, () => 0), 1_000)
  assert.equal(retryDelayMs(3, () => 0), 4_000)
  assert.equal(retryDelayMs(20, () => 0), 15_000)
  assert.equal(retryDelayMs(1, () => 0.999), 1_499)
})

const memoryStorage = () => {
  const data = new Map<string, string>()
  return { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value) }, removeItem: (key: string) => { data.delete(key) }, data }
}
const draft = (questionId: number, option: number | null) => ({ question_id: questionId, selected_option_id: option, answer_text: null, is_marked_for_review: false })

test("unsaved drafts survive a reload and are removed once acknowledged", () => {
  const storage = memoryStorage()
  const store = new UnsavedDraftStore("77", storage)
  store.put(draft(1, 11)); store.put(draft(2, 21)); store.put(draft(1, 12))
  const reloaded = new UnsavedDraftStore("77", storage).load()
  assert.deepEqual(Object.keys(reloaded).map(Number), [1, 2])
  assert.equal(reloaded[1].selected_option_id, 12, "the newest local value wins")
  store.remove(1); store.remove(2)
  assert.equal(storage.data.size, 0, "nothing left once everything is acknowledged")
  assert.deepEqual(new UnsavedDraftStore("78", storage).load(), {}, "drafts are per attempt")
})

test("draft storage failures and corrupt data never break the exam", () => {
  const broken = { getItem: () => { throw new Error("denied") }, setItem: () => { throw new Error("quota") }, removeItem: () => { throw new Error("denied") } }
  const store = new UnsavedDraftStore("1", broken)
  assert.doesNotThrow(() => { store.put(draft(1, 11)); store.remove(1); store.clear() })
  assert.deepEqual(store.load(), {})
  const corrupt = memoryStorage(); corrupt.setItem("cbt-unsaved:1", "{not json")
  assert.deepEqual(new UnsavedDraftStore("1", corrupt).load(), {})
  const mismatched = memoryStorage(); mismatched.setItem("cbt-unsaved:1", JSON.stringify({ 5: draft(6, 1) }))
  assert.deepEqual(new UnsavedDraftStore("1", mismatched).load(), {}, "a key that does not match its draft is ignored")
  assert.deepEqual(new UnsavedDraftStore("1", null).load(), {})
})
