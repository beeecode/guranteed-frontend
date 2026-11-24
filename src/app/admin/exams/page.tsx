import type { Metadata } from "next"
import { AdminShell } from "@/components/layout/AdminShell"
import { ExamsManager } from "@/features/admin/components/ExamsManager"
import { AdminModeBoundary } from "@/features/admin/integration/AdminModeBoundary"
import { PreviewDataRemoved } from "@/features/admin/integration/PreviewDataRemoved"

export const metadata: Metadata = { title: "Examinations" }

export default function Page() {
  return (
    <AdminModeBoundary
      preview={<AdminShell title="Examinations"><PreviewDataRemoved feature="Examinations" /></AdminShell>}
      integrated={<AdminShell title="Examinations" subtitle="Subject papers built from the question bank"><ExamsManager /></AdminShell>}
    />
  )
}
