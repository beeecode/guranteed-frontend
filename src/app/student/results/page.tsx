import type { Metadata } from "next"
import { PreviewDataRemoved } from "@/features/admin/integration/PreviewDataRemoved"
import { ExamModeBoundary } from "@/features/exam/integration/ExamModeBoundary"
import { LiveStudentResults } from "@/features/results/live/LiveStudentResults"

export const metadata: Metadata = { title: "My Results" }

export default function StudentResultsPage() {
  return <ExamModeBoundary preview={<main className="min-h-screen bg-[#F9F5F1] px-4 py-16"><PreviewDataRemoved feature="My Results" /></main>} integrated={<LiveStudentResults />} />
}
