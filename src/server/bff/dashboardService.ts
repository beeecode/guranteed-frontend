import type { BackendGateway } from "./backend.ts"
import type { SessionProfile } from "./session.ts"

export async function loadStudentDashboard(
  gateway: BackendGateway,
  accessToken: string,
  profile: SessionProfile,
) {
  const [dashboard, bundles, results] = await Promise.all([
    gateway.request("/api/student/dashboard", { token: accessToken }),
    gateway.request("/api/student/bundles", { token: accessToken }),
    gateway.request("/api/student/results-summary", { token: accessToken }),
  ])
  return { profile, dashboard, bundles, results }
}

export async function loadAdminDashboard(
  gateway: BackendGateway,
  accessToken: string,
  profile: SessionProfile,
) {
  const [stats, analytics] = await Promise.all([
    gateway.request("/api/admin/stats", { token: accessToken }),
    gateway.request("/api/admin/analytics", { token: accessToken }),
  ])
  return { profile, stats, analytics }
}
