import type { Metadata } from "next"
import { PreviewDataRemoved } from "@/features/admin/integration/PreviewDataRemoved"
import { ExamModeBoundary } from "@/features/exam/integration/ExamModeBoundary"
import { LiveExamScreen } from "@/features/exam/live/LiveExamPages"

export const metadata: Metadata = { title: "Exam in Progress" }

export default async function ExamPage({ params, searchParams }: PageProps<"/student/exam/[id]">) {
  const { id } = await params
  const query = await searchParams
  const attemptId = typeof query.attempt === "string" ? query.attempt : undefined
  return <ExamModeBoundary preview={<main className="min-h-screen bg-[#F9F5F1] px-4 py-16"><PreviewDataRemoved feature="The exam" /></main>} integrated={<LiveExamScreen examId={id} attemptId={attemptId} />} />
}
