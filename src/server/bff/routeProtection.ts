import type { BffMode } from "./config.ts"
import type { BffSession } from "./session.ts"

export type RouteDecision = { action: "allow" } | { action: "redirect"; destination: string }
export function protectPath(path: string, mode: BffMode, session: BffSession | null): RouteDecision {
  if (mode === "mock") return { action: "allow" }
  if (path.startsWith("/parent/")) return { action: "redirect", destination: "/cbt" }
  const role = path.startsWith("/student/") ? "student" : path.startsWith("/admin/") ? "admin" : null
  const isLogin = path === "/student/login" || path === "/admin/login"
  if (!role || isLogin) return { action: "allow" }
  if (mode === "disabled" || !session) return { action: "redirect", destination: `/${role}/login` }
  if (session.profile.role !== role) return { action: "redirect", destination: `/${session.profile.role}/dashboard` }
  const integratedPage = path === "/student/dashboard"
    || path === "/admin/dashboard"
    || /^\/student\/exam\/[A-Za-z0-9-]+(?:\/instructions|\/submitted)?$/.test(path)
  if (mode === "integration" && !integratedPage) {
    return { action: "redirect", destination: `/${role}/dashboard` }
  }
  return { action: "allow" }
}
