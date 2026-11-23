import type { AttemptTiming } from "./types"

export const serverOffset = (serverTime: string, observedAt = Date.now()) => {
  const parsed = Date.parse(serverTime)
  return Number.isFinite(parsed) ? parsed - observedAt : 0
}

export const secondsUntil = (epochMs: number, offsetMs: number, now = Date.now()) =>
  Math.max(0, Math.ceil((epochMs - (now + offsetMs)) / 1000))

export const validTiming = (value: unknown): value is AttemptTiming => {
  const timing = value as AttemptTiming
  return Number.isFinite(timing?.expiresAt)
    && Number.isFinite(timing?.saveGraceEndsAt)
    && timing.saveGraceEndsAt >= timing.expiresAt
}

export class QuestionSaveRevision {
  private revisions = new Map<number, number>()
  private acknowledged = new Map<number, number>()

  change(questionId: number) {
    const next = (this.revisions.get(questionId) ?? 0) + 1
    this.revisions.set(questionId, next)
    return next
  }

  acknowledge(questionId: number, revision: number) {
    this.acknowledged.set(questionId, Math.max(revision, this.acknowledged.get(questionId) ?? 0))
  }

  latest(questionId: number) { return this.revisions.get(questionId) ?? 0 }
  isSaved(questionId: number) { return this.latest(questionId) === (this.acknowledged.get(questionId) ?? 0) }
}

/**
 * Stage 11 (exam-day safety). A save that failed for a transient reason (network drop,
 * timeout, 5xx, rate limit, concurrent session refresh) is retried automatically.
 * Previously one blip left the answer "failed" until the student noticed and clicked
 * retry, so it could be lost at time-out. Client errors that will not change on retry
 * (validation, forbidden, submitted, paused) are not retried.
 */
export const isRetryableSaveError = (status?: number) =>
  status === undefined || status === 0 || status === 408 || status === 409 || status === 425 || status === 429 || status >= 500

/** Exponential backoff capped at 15 s, with jitter so 20 clients recovering from the same
 * outage do not retry in lock-step. */
export const retryDelayMs = (failures: number, random: () => number = Math.random) =>
  Math.min(15_000, 1_000 * 2 ** Math.max(0, failures - 1)) + Math.floor(random() * 500)

export interface DraftLike { question_id: number; selected_option_id: number | null; answer_text: string | null; is_marked_for_review: boolean }
type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">

/**
 * Local copy of answers the server has not acknowledged yet, keyed by attempt. Survives a
 * crashed tab, a closed laptop lid or an expired sign-in: on reload the drafts are
 * re-sent. Only unacknowledged drafts are kept; storage failures (private mode, quota)
 * degrade to server-only behaviour instead of breaking the exam.
 */
export class UnsavedDraftStore {
  private readonly key: string
  private readonly storage: StorageLike | null
  constructor(attemptId: string, storage: StorageLike | null) { this.key = `cbt-unsaved:${attemptId}`; this.storage = storage }

  load(): Record<number, DraftLike> {
    try {
      const parsed = JSON.parse(this.storage?.getItem(this.key) || "{}") as Record<string, DraftLike>
      return Object.fromEntries(Object.entries(parsed)
        .filter(([key, draft]) => Number(key) === draft?.question_id && Number.isInteger(draft.question_id))
        .map(([key, draft]) => [Number(key), draft]))
    } catch { return {} }
  }

  put(draft: DraftLike) { this.write({ ...this.load(), [draft.question_id]: draft }) }

  remove(questionId: number) {
    const next = this.load()
    if (!(questionId in next)) return
    delete next[questionId]
    this.write(next)
  }

  clear() { try { this.storage?.removeItem(this.key) } catch { /* storage unavailable */ } }

  private write(value: Record<number, DraftLike>) {
    try {
      if (Object.keys(value).length) this.storage?.setItem(this.key, JSON.stringify(value))
      else this.storage?.removeItem(this.key)
    } catch { /* storage unavailable: the server copy remains authoritative */ }
  }
}
