import type { Metadata } from "next"
import { PreviewDataRemoved } from "@/features/admin/integration/PreviewDataRemoved"
import { ExamModeBoundary } from "@/features/exam/integration/ExamModeBoundary"
import { LiveBundleOverview } from "@/features/bundle/live/LiveBundlePages"

export const metadata: Metadata = { title: "Your Exam Journey" }

export default async function Page({ params }: PageProps<"/student/bundle/[bundleId]/overview">) {
  const { bundleId } = await params
  return <ExamModeBoundary preview={<main className="min-h-screen bg-[#F9F5F1] px-4 py-16"><PreviewDataRemoved feature="The exam" /></main>} integrated={<LiveBundleOverview bundleId={bundleId} />} />
}
