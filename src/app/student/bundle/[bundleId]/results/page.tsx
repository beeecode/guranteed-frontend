import type { Metadata } from "next"
import { getBundle } from "@/data/bundles"
import { BundleResults } from "@/features/bundle/components/BundleResults"
import { IntegratedBundleResults } from "@/features/bundle/integration/IntegratedBundleResults"
import { ExamModeBoundary } from "@/features/exam/integration/ExamModeBoundary"

export const metadata: Metadata = { title: "Exam Results" }

export default async function BundleResultsPage({
  params,
}: PageProps<"/student/bundle/[bundleId]/results">) {
  const { bundleId } = await params
  return <ExamModeBoundary preview={<BundleResults bundle={getBundle(bundleId)} />} integrated={<IntegratedBundleResults bundleId={bundleId} />} />
}
