"use client"

/**
 * Exam bundles hub (Stage 11) in the admin design: every bundle with its class, subjects,
 * schedule and status, and the actions for its life cycle — publish, open the live monitor,
 * close, release/hide results and download the results CSV.
 */

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { AlertTriangle, CheckCircle2, Download, Eye, EyeOff, Layers, LoaderCircle, Lock, MonitorPlay, Plus, Send, Trash2 } from "lucide-react"
import { bffClient } from "@/lib/api/bffClient"
import { ApiError } from "@/lib/api/core"
import { subjectEmoji } from "@/features/bundle/live/adapters"

interface BundleRow {
  id: number; session_name: string; status: string; results_released: boolean; published_at: string | null
  starts_at: string | null; ends_at: string | null; term?: string | null; academic_session?: string | null
  class_level?: { name: string } | null
  session_exams?: Array<{ id: number; sort_order: number; exam?: { title?: string; status?: string; subject?: { name?: string } | null } | null }>
}

const STATUS_LOOK: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-gray-100 text-gray-600" },
  scheduled: { label: "Scheduled", className: "bg-blue-100 text-blue-700" },
  live: { label: "● Live", className: "bg-green-100 text-green-700" },
  ongoing: { label: "● Live", className: "bg-green-100 text-green-700" },
  closed: { label: "Closed", className: "bg-amber-100 text-amber-700" },
}
const when = (value: string | null) => (value ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : null)
const errorText = (reason: unknown, fallback: string) => (reason instanceof Error && reason.message ? reason.message : fallback)

export function BundlesManager() {
  const [bundles, setBundles] = useState<BundleRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    try { setBundles((await bffClient.action<{ bundles?: BundleRow[] }>("admin-bundles-list")).bundles ?? []); setError("") }
    catch (reason) { setError(errorText(reason, "Bundles could not be loaded.")) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { const timer = window.setTimeout(() => { void load() }, 0); return () => window.clearTimeout(timer) }, [load])

  /** Deleting a bundle that students took erases their results: the server asks for the exact name first. */
  const removeBundle = (bundle: { id: number; session_name: string }) => run(`delete-${bundle.id}`, `Delete the bundle "${bundle.session_name}"? Its subject exams are kept.`, async () => {
    try {
      await bffClient.action("admin-bundle-delete", { params: { bundleId: bundle.id }, payload: {} })
      return "Bundle deleted."
    } catch (reason) {
      if (!(reason instanceof ApiError && reason.code === "BUNDLE_HAS_ATTEMPTS")) throw reason
      const typed = window.prompt(`${reason.message}\n\nThis cannot be undone. To delete it, type the bundle name exactly:\n${bundle.session_name}`)
      if (typed === null) return "Nothing was deleted."
      const result = await bffClient.action<{ deleted_students?: number }>("admin-bundle-delete", { params: { bundleId: bundle.id }, payload: { confirm: typed } })
      return `Bundle deleted, with the results of ${result.deleted_students ?? 0} student(s).`
    }
  })

  const run = async (key: string, confirmText: string | null, task: () => Promise<string>) => {
    if (confirmText && !window.confirm(confirmText)) return
    setBusy(key); setError(""); setNotice("")
    try { setNotice(await task()); await load() }
    catch (reason) { setError(errorText(reason, "The action could not be completed.")) }
    finally { setBusy(null) }
  }

  const exportCsv = (bundle: BundleRow) => run(`export-${bundle.id}`, null, async () => {
    const file = await bffClient.download("bundle-results", { bundleId: bundle.id })
    const url = URL.createObjectURL(file.blob)
    Object.assign(document.createElement("a"), { href: url, download: file.filename }).click()
    URL.revokeObjectURL(url)
    return `Results of "${bundle.session_name}" downloaded.`
  })

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <p className="text-sm text-gray-500 max-w-xl">A bundle is a multi-subject exam for one class: students sit the subjects in order, with their own timers. Publish it to make it visible, watch it live, then close it and release the results.</p>
        <Link href="/admin/bundles/create" className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#B22234] text-white text-sm font-medium hover:bg-[#8B0000] transition-colors shadow-md">
          <Plus className="w-4 h-4" /> New Bundle
        </Link>
      </div>

      {error ? <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}</div> : null}
      {notice ? <div role="status" className="mb-4 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> {notice}</div> : null}

      {loading ? (
        <div className="bg-white rounded-3xl shadow-sm p-12 text-center text-sm text-gray-500"><LoaderCircle className="mx-auto mb-2 w-6 h-6 animate-spin text-[#B22234]" /> Loading bundles…</div>
      ) : bundles.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm p-12 text-center">
          <Layers className="mx-auto mb-3 w-10 h-10 text-[#B22234]" />
          <div className="font-semibold text-gray-900">No exam bundles yet</div>
          <p className="text-sm text-gray-500 mt-1">Create one with New Bundle.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bundles.map((bundle) => {
            const look = STATUS_LOOK[bundle.status] ?? { label: bundle.status, className: "bg-gray-100 text-gray-600" }
            const links = [...(bundle.session_exams ?? [])].sort((a, b) => a.sort_order - b.sort_order)
            const inactive = links.filter((link) => link.exam?.status && link.exam.status !== "active")
            const isDraft = bundle.status === "draft"
            const isOpen = ["scheduled", "live", "ongoing"].includes(bundle.status)
            return (
              <div key={bundle.id} className="bg-white rounded-3xl shadow-sm p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{bundle.session_name}</h3>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${look.className}`}>{look.label}</span>
                      {bundle.results_released ? <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">Results released</span> : null}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {[bundle.class_level?.name, bundle.academic_session, bundle.term].filter(Boolean).join(" · ")}
                      {bundle.starts_at ? ` · opens ${when(bundle.starts_at)}` : ""}{bundle.ends_at ? ` · closes ${when(bundle.ends_at)}` : ""}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {links.map((link, i) => (
                        <span key={link.id} className="text-xs px-2.5 py-1 rounded-full bg-[#F9F5F1] text-[#7A5C3A]">{i + 1}. {subjectEmoji(link.exam?.subject?.name ?? "")} {link.exam?.subject?.name ?? link.exam?.title ?? "Subject"}</span>
                      ))}
                    </div>
                    {inactive.length ? <p className="mt-2 text-xs text-amber-700">⚠ {inactive.length} subject exam(s) not active — students cannot start them until activated.</p> : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {isDraft ? (
                      <button onClick={() => void run(`publish-${bundle.id}`, `Publish "${bundle.session_name}"? Students in the class will see it.`, async () => { await bffClient.action("admin-bundle-publish", { params: { bundleId: bundle.id } }); return "Bundle published." })} disabled={busy !== null} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#16A34A] text-white text-sm font-medium disabled:opacity-50">
                        {busy === `publish-${bundle.id}` ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Publish
                      </button>
                    ) : (
                      <Link href={`/admin/bundles/${bundle.id}/monitor`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B22234] text-white text-sm font-medium"><MonitorPlay className="w-4 h-4" /> Live Monitor</Link>
                    )}
                    {isOpen ? (
                      <button onClick={() => void run(`close-${bundle.id}`, `Close "${bundle.session_name}"? No new students can start it, and students still writing are submitted now with the answers they have saved, and marked.`, async () => { const result = await bffClient.action<{ finalized?: number; failed?: number[] }>("admin-bundle-close", { params: { bundleId: bundle.id } }); return `Bundle closed.${result.finalized ? ` ${result.finalized} unfinished student(s) were submitted and marked.` : ""}${result.failed?.length ? ` ${result.failed.length} could not be finished — open the live monitor and use “Force Submit Full Bundle” for them.` : ""}` })} disabled={busy !== null} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#D9C6B2] text-sm text-gray-700 disabled:opacity-50">
                        {busy === `close-${bundle.id}` ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />} Close
                      </button>
                    ) : null}
                    {!isDraft ? (
                      <button onClick={() => void run(`release-${bundle.id}`, bundle.results_released ? "Hide these results from students again?" : "Release the results? Students will see their scores.", async () => { await bffClient.action("admin-bundle-release", { params: { bundleId: bundle.id }, payload: { released: !bundle.results_released } }); return bundle.results_released ? "Results hidden from students." : "Results released to students." })} disabled={busy !== null} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#D9C6B2] text-sm text-gray-700 disabled:opacity-50">
                        {busy === `release-${bundle.id}` ? <LoaderCircle className="w-4 h-4 animate-spin" /> : bundle.results_released ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} {bundle.results_released ? "Hide Results" : "Release Results"}
                      </button>
                    ) : null}
                    {!isDraft ? (
                      <button onClick={() => void exportCsv(bundle)} disabled={busy !== null} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#D9C6B2] text-sm text-gray-700 disabled:opacity-50">
                        {busy === `export-${bundle.id}` ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Export CSV
                      </button>
                    ) : null}
                    <button onClick={() => void removeBundle(bundle)} disabled={busy !== null} title={isOpen ? "Close the bundle before deleting it if students have taken it" : "Delete this bundle"} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50">
                      {busy === `delete-${bundle.id}` ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
