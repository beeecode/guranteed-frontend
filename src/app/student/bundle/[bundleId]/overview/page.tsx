import type { Metadata } from "next"
import { getBundle } from "@/data/bundles"
import { BundleOverview } from "@/features/bundle/components/BundleOverview"
import { IntegratedBundleOverview } from "@/features/bundle/integration/IntegratedBundleOverview"
import { ExamModeBoundary } from "@/features/exam/integration/ExamModeBoundary"

export const metadata: Metadata = { title: "Your Exam Journey" }

export default async function BundleOverviewPage({
  params,
}: PageProps<"/student/bundle/[bundleId]/overview">) {
  const { bundleId } = await params
  return <ExamModeBoundary preview={<BundleOverview bundle={getBundle(bundleId)} />} integrated={<IntegratedBundleOverview bundleId={bundleId} />} />
}
