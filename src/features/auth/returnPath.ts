/**
 * After signing in again, return to the page the user was on (?next=…), but only to a
 * path inside the same portal — never another site or another portal (open redirect).
 */
export function returnPath(portalPrefix: "/admin" | "/student", fallback: string, search = typeof window === "undefined" ? "" : window.location.search) {
  const next = new URLSearchParams(search).get("next") || ""
  const safe = next.startsWith(`${portalPrefix}/`) && !next.startsWith("//") && !next.includes("\\") && !/^\/[^/]*\/login/.test(next) && /^[\w\-/.?=&%]*$/.test(next)
  return safe ? next : fallback
}
