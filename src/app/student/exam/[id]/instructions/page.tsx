import type { Metadata } from "next"
import { PreviewDataRemoved } from "@/features/admin/integration/PreviewDataRemoved"
import { ExamModeBoundary } from "@/features/exam/integration/ExamModeBoundary"
import { LiveExamInstructions } from "@/features/exam/live/LiveExamPages"

export const metadata: Metadata = { title: "Exam Instructions" }

export default async function ExamInstructionsPage({ params }: PageProps<"/student/exam/[id]/instructions">) {
  const { id } = await params
  return <ExamModeBoundary preview={<main className="min-h-screen bg-[#F9F5F1] px-4 py-16"><PreviewDataRemoved feature="The exam" /></main>} integrated={<LiveExamInstructions examId={id} />} />
}
