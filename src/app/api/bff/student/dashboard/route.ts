import { errorResponse, json, requireSession } from "@/server/bff/http"
import { loadStudentDashboard } from "@/server/bff/dashboardService"
import { requestIdFor } from "@/server/bff/requestId"

export const dynamic = "force-dynamic"
export async function GET(request: Request) {
  const requestId = requestIdFor(request)
  try {
    const { gateway, session } = await requireSession(request, "student", requestId)
    return json(await loadStudentDashboard(gateway, session.accessToken, session.profile), 200, undefined, requestId)
  } catch (error) { return errorResponse(error, undefined, requestId) }
}
