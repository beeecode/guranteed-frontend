import type { Metadata } from "next"
import { ExamSubmitted } from "@/features/exam/components/ExamSubmitted"
import { ExamModeBoundary } from "@/features/exam/integration/ExamModeBoundary"
import { IntegratedExamSubmitted } from "@/features/exam/integration/IntegratedExamSubmitted"

export const metadata: Metadata = { title: "Exam Submitted" }

export default async function ExamSubmittedPage({ searchParams }: PageProps<"/student/exam/[id]/submitted">) {
  const query = await searchParams
  const attemptId = typeof query.attempt === "string" ? query.attempt : undefined
  return <ExamModeBoundary preview={<ExamSubmitted />} integrated={<IntegratedExamSubmitted attemptId={attemptId} />} />
}
