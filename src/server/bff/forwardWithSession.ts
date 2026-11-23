import { ApiError } from "../../lib/api/core.ts"
import { createAuthService } from "./authService.ts"
import type { BackendGateway } from "./backend.ts"
import type { BffSession, SessionManager, SessionSnapshot } from "./session.ts"

/**
 * Refresh margin before the access token's own expiry. Supabase access tokens default
 * to one hour; without proactive refresh every exam request started failing with 401
 * about an hour after sign-in, which locked the exam screen mid-subject (Stage 11 audit).
 */
export const ACCESS_REFRESH_MARGIN_MS = 120_000

export interface ForwardContext {
  gateway: BackendGateway
  manager: Pick<SessionManager, "refresh">
  snapshot: SessionSnapshot
  session: BffSession
}

/**
 * Calls the backend with a fresh access token. Refreshes first when the token is close
 * to expiry, and refreshes once and retries once when the backend still answers 401
 * (clock skew, or a token revoked by a concurrent refresh on another instance).
 * SessionManager.refresh is single-flight across instances, so twenty parallel answer
 * saves rotate the refresh token only once.
 */
export async function forwardWithSession<T>(
  context: ForwardContext,
  call: (accessToken: string) => Promise<T>,
  now: () => number = Date.now,
): Promise<T> {
  const auth = createAuthService(context.gateway, now)
  let snapshot = context.snapshot
  let session = context.session
  if (session.accessExpiresAt - now() < ACCESS_REFRESH_MARGIN_MS) {
    snapshot = await context.manager.refresh(snapshot, auth.refresh)
    session = snapshot.session
  }
  try {
    return await call(session.accessToken)
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error
    const refreshed = await context.manager.refresh(snapshot, auth.refresh)
    return call(refreshed.session.accessToken)
  }
}
