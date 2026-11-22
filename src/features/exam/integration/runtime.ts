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
