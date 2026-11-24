import type { Metadata } from "next"
import { AdminShell } from "@/components/layout/AdminShell"
import { CreateBundleWizard } from "@/features/admin/components/CreateBundleWizard"
import { AdminModeBoundary } from "@/features/admin/integration/AdminModeBoundary"
import { PreviewDataRemoved } from "@/features/admin/integration/PreviewDataRemoved"

export const metadata: Metadata = { title: "Create Exam Bundle" }

export default function CreateBundlePage() {
  return (
    <AdminModeBoundary
      preview={<AdminShell title="Create Exam Bundle"><PreviewDataRemoved feature="Bundle creation" /></AdminShell>}
      integrated={<AdminShell title="Create Exam Bundle" subtitle="Configure a multi-subject examination"><CreateBundleWizard /></AdminShell>}
    />
  )
}
