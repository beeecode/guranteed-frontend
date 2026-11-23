import { readBffConfig } from "@/server/bff/config"
import { json } from "@/server/bff/http"
import { requestIdFor } from "@/server/bff/requestId"

export const dynamic = "force-dynamic"
export function GET(request: Request) {
  const requestId = requestIdFor(request)
  try { return json({ mode: readBffConfig().mode }, 200, undefined, requestId) }
  catch { return json({ mode: "disabled" }, 503, undefined, requestId) }
}
