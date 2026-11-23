import type { Metadata } from "next"
import { AdminShell } from "@/components/layout/AdminShell"
import { AdminOverview } from "@/features/admin/components/AdminOverview"
import { DashboardModeBoundary } from "@/features/integration/DashboardModeBoundary"

export const metadata: Metadata = { title: "Admin Dashboard" }

export default function AdminDashboardPage() {
  return <DashboardModeBoundary role="admin" preview={(
    <AdminShell title="Dashboard" subtitle="Welcome back, Mrs. Adeyemi">
      <AdminOverview />
    </AdminShell>
  )} />
}
