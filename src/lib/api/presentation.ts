export interface ResultPolicyFields {
  grade?: string | null
  passed?: boolean | null
}

export function presentResultPolicy(result: ResultPolicyFields) {
  return {
    grade: result.grade?.trim() || null,
    outcome: result.passed === true ? "Passed" : result.passed === false ? "Not passed" : null,
  }
}

export function serverRemainingSeconds(serverEndsAt: string, now = Date.now()) {
  const deadline = Date.parse(serverEndsAt)
  if (!Number.isFinite(deadline)) return null
  return Math.max(0, Math.ceil((deadline - now) / 1000))
}

export class SaveAcknowledgementTracker {
  private latestIssued = 0
  private latestAcknowledged = 0

  issue() {
    this.latestIssued += 1
    return this.latestIssued
  }

  acknowledge(sequence: number) {
    if (sequence !== this.latestIssued) return false
    this.latestAcknowledged = sequence
    return true
  }

  get saved() {
    return this.latestAcknowledged === this.latestIssued && this.latestIssued > 0
  }
}
