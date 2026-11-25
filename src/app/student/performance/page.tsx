import type { Metadata } from "next"
import { PreviewDataRemoved } from "@/features/admin/integration/PreviewDataRemoved"
import { ExamModeBoundary } from "@/features/exam/integration/ExamModeBoundary"
import { LiveStudentPerformance } from "@/features/results/live/LiveStudentResults"

export const metadata: Metadata = { title: "My Performance" }

export default function StudentPerformancePage() {
  return <ExamModeBoundary preview={<main className="min-h-screen bg-[#F9F5F1] px-4 py-16"><PreviewDataRemoved feature="My Performance" /></main>} integrated={<LiveStudentPerformance />} />
}
