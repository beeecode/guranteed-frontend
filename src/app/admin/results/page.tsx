import type { Metadata } from "next"
import { AdminShell } from "@/components/layout/AdminShell"
import { ResultsManager } from "@/features/admin/components/ResultsManager"
import { AdminModeBoundary } from "@/features/admin/integration/AdminModeBoundary"
import { PreviewDataRemoved } from "@/features/admin/integration/PreviewDataRemoved"

export const metadata: Metadata = { title: "Results Management" }

export default function Page() {
  return (
    <AdminModeBoundary
      preview={<AdminShell title="Results Management"><PreviewDataRemoved feature="Results" /></AdminShell>}
      integrated={<AdminShell title="Results Management" subtitle="Submitted attempts, newest first"><ResultsManager /></AdminShell>}
    />
  )
}
