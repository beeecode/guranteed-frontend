import { NextResponse, type NextRequest } from "next/server"
import { readBffConfig } from "@/server/bff/config"
import { readSessionCookieProfile, SESSION_COOKIE, type BffSession } from "@/server/bff/session"
import { protectPath } from "@/server/bff/routeProtection"

export function proxy(request: NextRequest) {
  let config
  try { config = readBffConfig() }
  catch { config = { mode: "disabled" as const, secureCookies: false } }
  const value = request.cookies.get(SESSION_COOKIE)?.value
  const cookieProfile = value && config.sessionSecret ? readSessionCookieProfile(value, config.sessionSecret) : null
  const session = cookieProfile ? { profile: { role: cookieProfile.role } } as BffSession : null
  const decision = protectPath(request.nextUrl.pathname, config.mode, session)
  if (decision.action === "redirect") return NextResponse.redirect(new URL(decision.destination, request.url))
  const response = NextResponse.next()
  if (request.nextUrl.pathname.startsWith("/student/") || request.nextUrl.pathname.startsWith("/admin/")) response.headers.set("cache-control", "private, no-store")
  return response
}

export const config = { matcher: ["/student/:path*", "/admin/:path*", "/parent/:path*"] }
