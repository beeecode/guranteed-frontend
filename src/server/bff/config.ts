import { validateServerBaseUrl } from "../../lib/api/core.ts"

export type BffMode = "mock" | "disabled" | "integration"
export interface BffConfig { mode: BffMode; backendUrl?: string; sessionSecret?: string; secureCookies: boolean; environmentId?: string }

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
  const backendUrl = validateServerBaseUrl(env.GFMS_BACKEND_URL)
  return {
    mode: "integration",
    backendUrl,
    sessionSecret: env.GFMS_SESSION_SECRET,
    environmentId: env.GFMS_INTEGRATION_ENVIRONMENT_ID,
    secureCookies: new URL(backendUrl).protocol === "https:" || env.NODE_ENV === "production",
  }
}
