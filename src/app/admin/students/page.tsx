import type { Metadata } from "next"
import { AdminShell } from "@/components/layout/AdminShell"
import { StudentsManager } from "@/features/admin/components/StudentsManager"
import { AdminModeBoundary } from "@/features/admin/integration/AdminModeBoundary"
import { PreviewDataRemoved } from "@/features/admin/integration/PreviewDataRemoved"

export const metadata: Metadata = { title: "Students" }

// Stage 11: the designed StudentsManager now runs on live data; sample data removed.
export default function Page() {
  return (
    <AdminModeBoundary
      preview={<AdminShell title="Students"><PreviewDataRemoved feature="Student management" /></AdminShell>}
      integrated={<AdminShell title="Students" subtitle="Student accounts from the school backend"><StudentsManager /></AdminShell>}
    />
  )
}
