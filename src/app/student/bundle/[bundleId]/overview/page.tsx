import type { Metadata } from "next"
import { getBundle } from "@/data/bundles"
import { BundleOverview } from "@/features/bundle/components/BundleOverview"
import { LiveBundleOverview } from "@/features/bundle/live/LiveBundlePages"
import { ExamModeBoundary } from "@/features/exam/integration/ExamModeBoundary"

export const metadata: Metadata = { title: "Your Exam Journey" }

// Stage 11: real mode renders the designed page with live server data.
export default async function Page({ params }: PageProps<"/student/bundle/[bundleId]/overview">) {
  const { bundleId } = await params
  return <ExamModeBoundary preview={<BundleOverview bundle={getBundle(bundleId)} />} integrated={<LiveBundleOverview bundleId={bundleId} />} />
}
