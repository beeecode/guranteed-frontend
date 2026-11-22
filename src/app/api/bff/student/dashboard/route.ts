import { errorResponse, json, requireSession } from "@/server/bff/http"
import { loadStudentDashboard } from "@/server/bff/dashboardService"

export const dynamic = "force-dynamic"
export async function GET(request: Request) {
  try {
    const { gateway, session } = requireSession(request, "student")
    return json(await loadStudentDashboard(gateway, session.accessToken, session.profile))
  } catch (error) { return errorResponse(error) }
}
