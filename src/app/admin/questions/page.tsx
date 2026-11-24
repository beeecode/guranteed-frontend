import type { Metadata } from "next"
import { AdminShell } from "@/components/layout/AdminShell"
import { QuestionBank } from "@/features/admin/components/QuestionBank"
import { AdminModeBoundary } from "@/features/admin/integration/AdminModeBoundary"
import { PreviewDataRemoved } from "@/features/admin/integration/PreviewDataRemoved"

export const metadata: Metadata = { title: "Question Bank" }

// Stage 11: the designed QuestionBank now runs on live data; sample data removed.
export default function Page() {
  return (
    <AdminModeBoundary
      preview={<AdminShell title="Question Bank"><PreviewDataRemoved feature="The question bank" /></AdminShell>}
      integrated={<AdminShell title="Question Bank" subtitle="Questions, passages and bulk import"><QuestionBank /></AdminShell>}
    />
  )
}
