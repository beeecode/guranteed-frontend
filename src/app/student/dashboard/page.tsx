import type { Metadata } from "next"
import { PreviewDataRemoved } from "@/features/admin/integration/PreviewDataRemoved"
import { DashboardModeBoundary } from "@/features/integration/DashboardModeBoundary"

export const metadata: Metadata = { title: "My Dashboard" }

// Live data only (Stage 11): integration mode renders StudentDashboardLive.
export default function StudentDashboardPage() {
  return <DashboardModeBoundary role="student" preview={<main className="min-h-screen bg-[#F9F5F1] px-4 py-16"><PreviewDataRemoved feature="The dashboard" /></main>} />
}
