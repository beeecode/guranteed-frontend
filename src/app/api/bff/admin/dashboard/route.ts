import { errorResponse, json, requireSession } from "@/server/bff/http"
import { loadAdminDashboard } from "@/server/bff/dashboardService"

export const dynamic = "force-dynamic"
export async function GET(request: Request) {
  try {
    const { gateway, session } = requireSession(request, "admin")
    return json(await loadAdminDashboard(gateway, session.accessToken, session.profile))
  } catch (error) { return errorResponse(error) }
}
