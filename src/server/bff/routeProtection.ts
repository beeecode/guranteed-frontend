import type { BffMode } from "./config.ts"
import type { BffSession } from "./session.ts"
import { PARENT_PORTAL_ENABLED } from "../../lib/features.ts"

export type RouteDecision = { action: "allow" } | { action: "redirect"; destination: string }
export function protectPath(path: string, mode: BffMode, session: BffSession | null): RouteDecision {
  // Parent portal postponed (lib/features.ts): closed in every mode, including mock.
  if (path.startsWith("/parent/") && !PARENT_PORTAL_ENABLED) return { action: "redirect", destination: "/cbt" }
  if (mode === "mock") return { action: "allow" }
  if (path.startsWith("/parent/")) return { action: "redirect", destination: "/cbt" }
  const role = path.startsWith("/student/") ? "student" : path.startsWith("/admin/") ? "admin" : null
  const isLogin = path === "/student/login" || path === "/admin/login"
  if (!role || isLogin) return { action: "allow" }
  if (mode === "disabled" || !session) return { action: "redirect", destination: `/${role}/login` }
  if (session.profile.role !== role) return { action: "redirect", destination: `/${session.profile.role}/dashboard` }
  const integratedPage = path === "/student/dashboard"
    || path === "/admin/dashboard"
    || ["/admin/students", "/admin/classes", "/admin/admissions", "/admin/questions", "/admin/exams", "/admin/results", "/admin/bundles", "/admin/bundles/create"].includes(path)
    || /^\/admin\/bundles\/[0-9]+\/monitor$/.test(path)
    || /^\/student\/exam\/[A-Za-z0-9-]+(?:\/instructions|\/submitted)?$/.test(path)
    || /^\/student\/bundle\/[A-Za-z0-9-]+\/(?:overview|exam|results)$/.test(path)
  if (mode === "integration" && !integratedPage) {
    return { action: "redirect", destination: `/${role}/dashboard` }
  }
  return { action: "allow" }
}
