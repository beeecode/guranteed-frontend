import { readBffConfig } from "@/server/bff/config"
import { json } from "@/server/bff/http"

export const dynamic = "force-dynamic"
export function GET() {
  try { return json({ mode: readBffConfig().mode }) }
  catch { return json({ mode: "disabled" }, 503) }
}
