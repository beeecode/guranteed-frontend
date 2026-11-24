import type { Metadata } from "next"
import { AdminShell } from "@/components/layout/AdminShell"
import { ClassesManager } from "@/features/admin/components/ClassesManager"
import { AdminModeBoundary } from "@/features/admin/integration/AdminModeBoundary"
import { PreviewDataRemoved } from "@/features/admin/integration/PreviewDataRemoved"

export const metadata: Metadata = { title: "Classes" }

export default function Page() {
  return (
    <AdminModeBoundary
      preview={<AdminShell title="Classes"><PreviewDataRemoved feature="Class management" /></AdminShell>}
      integrated={<AdminShell title="Classes" subtitle="School and lesson classes (JAMB, WAEC, NECO)"><ClassesManager /></AdminShell>}
    />
  )
}
