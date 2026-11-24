import type { Metadata } from "next"
import { AdminShell } from "@/components/layout/AdminShell"
import { adminResults } from "@/data/admin"
import { ResultsManager } from "@/features/admin/components/ResultsManager"
import { AdminModeBoundary } from "@/features/admin/integration/AdminModeBoundary"
import { NotConnectedNotice } from "@/features/admin/integration/NotConnectedNotice"

export const metadata: Metadata = { title: "Results Management" }

// Stage 11: fixtures only in mock mode; integration mode shows no sample data.
export default function Page() {
  return (
    <AdminModeBoundary
      preview={
        <AdminShell title="Results Management" subtitle={`${adminResults.length} results this session`}>
          <ResultsManager />
        </AdminShell>
      }
      integrated={
        <AdminShell title="Results Management">
          <NotConnectedNotice feature="Results" />
        </AdminShell>
      }
    />
  )
}
