import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = { title: "Child Results" }

// The parent portal is postponed (lib/features.ts: PARENT_PORTAL_ENABLED = false); parents
// use their child's login for now. Route protection already redirects; this keeps the
// route in place for the future without sample data.
export default function Page() {
  redirect("/cbt")
}
