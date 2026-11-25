/**
 * Stage 11: one place that tells the page "your sign-in has ended" (password reset by the
 * school, account deactivated, session expired). Every 401 from the BFF raises it, and
 * SessionEndedNotice (mounted in the root layout) offers "Sign in again".
 */
export const SESSION_ENDED_EVENT = "gfms:session-ended"
export const SESSION_ENDED_MESSAGE = "Your sign-in has ended (for example because your password was changed). Please sign in again."

export function announceSessionEnded() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(SESSION_ENDED_EVENT))
}
