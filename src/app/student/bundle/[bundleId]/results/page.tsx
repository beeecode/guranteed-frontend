import type { Metadata } from "next"
import { getBundle } from "@/data/bundles"
import { BundleResults } from "@/features/bundle/components/BundleResults"
import { LiveBundleResults } from "@/features/bundle/live/LiveBundlePages"
import { ExamModeBoundary } from "@/features/exam/integration/ExamModeBoundary"

export const metadata: Metadata = { title: "Exam Results" }

// Stage 11: real mode renders the designed page with live server data.
export default async function Page({ params }: PageProps<"/student/bundle/[bundleId]/results">) {
  const { bundleId } = await params
  return <ExamModeBoundary preview={<BundleResults bundle={getBundle(bundleId)} />} integrated={<LiveBundleResults bundleId={bundleId} />} />
}
