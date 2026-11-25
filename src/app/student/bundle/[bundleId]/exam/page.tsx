import type { Metadata } from "next"
import { PreviewDataRemoved } from "@/features/admin/integration/PreviewDataRemoved"
import { ExamModeBoundary } from "@/features/exam/integration/ExamModeBoundary"
import { LiveBundleExamScreen } from "@/features/bundle/live/LiveBundleExamScreen"

export const metadata: Metadata = { title: "Exam in Progress" }

// The server decides the current subject, so old ?attempt= / ?sessionAttempt= query
// parameters are not needed (old links still work; they are ignored).
export default async function BundleExamPage({ params }: PageProps<"/student/bundle/[bundleId]/exam">) {
  const { bundleId } = await params
  return <ExamModeBoundary preview={<main className="min-h-screen bg-[#F9F5F1] px-4 py-16"><PreviewDataRemoved feature="The exam" /></main>} integrated={<LiveBundleExamScreen bundleId={bundleId} />} />
}
