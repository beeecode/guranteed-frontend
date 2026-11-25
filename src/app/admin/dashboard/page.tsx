import type { Metadata } from "next"
import { AdminShell } from "@/components/layout/AdminShell"
import { PreviewDataRemoved } from "@/features/admin/integration/PreviewDataRemoved"
import { DashboardModeBoundary } from "@/features/integration/DashboardModeBoundary"

export const metadata: Metadata = { title: "Admin Dashboard" }

// Live data only (Stage 11): integration mode renders the designed AdminOverview.
export default function AdminDashboardPage() {
  return <DashboardModeBoundary role="admin" preview={<AdminShell title="Dashboard"><PreviewDataRemoved feature="The dashboard" /></AdminShell>} />
}
