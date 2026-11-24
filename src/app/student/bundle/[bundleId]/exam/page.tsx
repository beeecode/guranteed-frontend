import type { Metadata } from "next"
import { getBundle } from "@/data/bundles"
import { BundleExamScreen } from "@/features/bundle/components/BundleExamScreen"
import { LiveBundleExamScreen } from "@/features/bundle/live/LiveBundleExamScreen"
import { ExamModeBoundary } from "@/features/exam/integration/ExamModeBoundary"

export const metadata: Metadata = { title: "Exam in Progress" }

// Stage 11: real mode renders the designed exam screen with live server data. The
// server decides the current subject, so the old ?attempt= / ?sessionAttempt= query
// parameters are no longer needed (old links still work; they are ignored).
export default async function BundleExamPage({ params }: PageProps<"/student/bundle/[bundleId]/exam">) {
  const { bundleId } = await params
  return <ExamModeBoundary preview={<BundleExamScreen bundle={getBundle(bundleId)} />} integrated={<LiveBundleExamScreen bundleId={bundleId} />} />
}
