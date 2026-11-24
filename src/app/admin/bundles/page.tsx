import type { Metadata } from "next"
import { AdminShell } from "@/components/layout/AdminShell"
import { BundlesManager } from "@/features/admin/components/BundlesManager"
import { AdminModeBoundary } from "@/features/admin/integration/AdminModeBoundary"
import { PreviewDataRemoved } from "@/features/admin/integration/PreviewDataRemoved"

export const metadata: Metadata = { title: "Exam Bundles" }

export default function Page() {
  return (
    <AdminModeBoundary
      preview={<AdminShell title="Exam Bundles"><PreviewDataRemoved feature="Exam bundles" /></AdminShell>}
      integrated={<AdminShell title="Exam Bundles" subtitle="Multi-subject exams: create, publish, monitor, release results"><BundlesManager /></AdminShell>}
    />
  )
}
