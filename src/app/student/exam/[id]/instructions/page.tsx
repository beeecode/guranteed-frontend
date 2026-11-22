import type { Metadata } from "next"
import { getExam } from "@/data/exams"
import { ExamInstructions } from "@/features/exam/components/ExamInstructions"
import { ExamModeBoundary } from "@/features/exam/integration/ExamModeBoundary"
import { IntegratedExamInstructions } from "@/features/exam/integration/IntegratedExamInstructions"

export const metadata: Metadata = { title: "Exam Instructions" }

export default async function ExamInstructionsPage({
  params,
}: PageProps<"/student/exam/[id]/instructions">) {
  const { id } = await params
  return <ExamModeBoundary preview={<ExamInstructions examId={id} exam={getExam(id)} />} integrated={<IntegratedExamInstructions examId={id} />} />
}
