import type { Metadata } from "next"
import { getExam } from "@/data/exams"
import { currentStudent } from "@/data/student"
import { ExamScreen } from "@/features/exam/components/ExamScreen"
import { ExamModeBoundary } from "@/features/exam/integration/ExamModeBoundary"
import { IntegratedExamScreen } from "@/features/exam/integration/IntegratedExamScreen"

export const metadata: Metadata = { title: "Exam in Progress" }

export default async function ExamPage({
  params,
  searchParams,
}: PageProps<"/student/exam/[id]">) {
  const { id } = await params
  const query = await searchParams
  const attemptId = typeof query.attempt === "string" ? query.attempt : undefined
  return (
    <ExamModeBoundary
      preview={<ExamScreen examId={id} exam={getExam(id)} studentName={currentStudent.name} />}
      integrated={<IntegratedExamScreen examId={id} attemptId={attemptId} />}
    />
  )
}
