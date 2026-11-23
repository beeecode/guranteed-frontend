import type { Metadata } from "next"
import { getBundle } from "@/data/bundles"
import { BundleExamScreen } from "@/features/bundle/components/BundleExamScreen"
import { IntegratedBundleExam } from "@/features/bundle/integration/IntegratedBundleExam"
import { ExamModeBoundary } from "@/features/exam/integration/ExamModeBoundary"

export const metadata: Metadata = { title: "Exam in Progress" }

export default async function BundleExamPage({
  params,
  searchParams,
}: PageProps<"/student/bundle/[bundleId]/exam">) {
  const { bundleId } = await params
  const query = await searchParams
  const attempt = typeof query.attempt === "string" ? query.attempt : undefined
  const sessionAttempt = typeof query.sessionAttempt === "string" ? query.sessionAttempt : undefined
  return <ExamModeBoundary preview={<BundleExamScreen bundle={getBundle(bundleId)} />} integrated={<IntegratedBundleExam bundleId={bundleId} attemptId={attempt} sessionAttemptId={sessionAttempt} />} />
}
