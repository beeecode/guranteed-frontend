import { validateServerBaseUrl } from "../../lib/api/core.ts"

export type BffMode = "mock" | "disabled" | "integration"
export interface BffConfig { mode: BffMode; backendUrl?: string; sessionSecret?: string; secureCookies: boolean; environmentId?: string; sessionStore?: "memory" | "external" }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const AUTHORIZATION = "ISOLATED_NON_PRODUCTION_SUPABASE"

export function readBffConfig(env: Record<string, string | undefined> = process.env): BffConfig {
  const mode = String(env.GFMS_BFF_MODE || "mock").toLowerCase()
  if (mode === "mock" || mode === "disabled") return { mode, secureCookies: env.NODE_ENV === "production" }
  if (mode !== "integration") throw new Error("GFMS_BFF_MODE must be mock, disabled or integration")
  if (env.GFMS_INTEGRATION_AUTHORIZATION !== AUTHORIZATION) throw new Error("Integration mode requires the isolated-environment authorization declaration")
  if (!UUID.test(String(env.GFMS_INTEGRATION_ENVIRONMENT_ID || ""))) throw new Error("Integration mode requires a validated environment UUID")
  if (!env.GFMS_BACKEND_URL) throw new Error("Integration mode requires GFMS_BACKEND_URL")
  if (!env.GFMS_SESSION_SECRET || env.GFMS_SESSION_SECRET.length < 32) throw new Error("Integration mode requires a session secret of at least 32 characters")
  const sessionStore = String(env.GFMS_SESSION_STORE || "").toLowerCase()
  if (sessionStore !== "memory" && sessionStore !== "external") throw new Error("Integration mode requires an explicit shared session-store selection")
  if (sessionStore === "memory" && (env.NODE_ENV === "production" || env.GFMS_ALLOW_LOCAL_SESSION_STORE !== "true")) throw new Error("The memory session store is permitted only for explicit local integration testing")
  const backendUrl = validateServerBaseUrl(env.GFMS_BACKEND_URL)
  return {
    mode: "integration",
    backendUrl,
    sessionSecret: env.GFMS_SESSION_SECRET,
    environmentId: env.GFMS_INTEGRATION_ENVIRONMENT_ID,
    secureCookies: new URL(backendUrl).protocol === "https:" || env.NODE_ENV === "production",
    sessionStore,
  }
}
