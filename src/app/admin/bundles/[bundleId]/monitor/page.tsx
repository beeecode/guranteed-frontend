import type { Metadata } from "next"
import { AdminShell } from "@/components/layout/AdminShell"
import { AdminModeBoundary } from "@/features/admin/integration/AdminModeBoundary"
import { PreviewDataRemoved } from "@/features/admin/integration/PreviewDataRemoved"
import { LiveBundleMonitor } from "@/features/admin/live/LiveBundleMonitor"

export const metadata: Metadata = { title: "Live Exam Monitor" }

export default async function BundleMonitorPage({ params }: PageProps<"/admin/bundles/[bundleId]/monitor">) {
  const { bundleId } = await params
  return (
    <AdminModeBoundary
      preview={<AdminShell title="Live Exam Monitor"><PreviewDataRemoved feature="The live monitor" /></AdminShell>}
      integrated={<AdminShell title="Live Exam Monitor" subtitle="Refreshes every 10 seconds"><LiveBundleMonitor bundleId={bundleId} /></AdminShell>}
    />
  )
}
