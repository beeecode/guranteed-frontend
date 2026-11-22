import assert from "node:assert/strict"
import test from "node:test"
import { QuestionSaveRevision, secondsUntil, serverOffset, validTiming } from "./runtime.ts"

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
