import type { Metadata } from "next"
import { AdminShell } from "@/components/layout/AdminShell"
import { AdmissionsManager } from "@/features/admin/components/AdmissionsManager"
import { AdminModeBoundary } from "@/features/admin/integration/AdminModeBoundary"
import { PreviewDataRemoved } from "@/features/admin/integration/PreviewDataRemoved"

export const metadata: Metadata = { title: "Admissions" }

export default function Page() {
  return (
    <AdminModeBoundary
      preview={<AdminShell title="Admissions"><PreviewDataRemoved feature="Admissions" /></AdminShell>}
      integrated={<AdminShell title="Admissions" subtitle="Applications from parents on the school website"><AdmissionsManager /></AdminShell>}
    />
  )
}
