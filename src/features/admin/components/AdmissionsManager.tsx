"use client"

/**
 * Admission applications review (Stage 11) in the admin design. Parents apply on the
 * public website; the school reviews the details and documents, then rejects or accepts.
 * Accept creates the student account (generated ID + one-time password shown here).
 * Older website enquiries appear too, marked "Enquiry".
 */

import { useCallback, useEffect, useState } from "react"
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Eye, FileText, LoaderCircle, Search, UserPlus, X } from "lucide-react"
import { bffClient } from "@/lib/api/bffClient"
import { CredentialsModal, type Credential } from "./StudentsManager"

interface Enquiry {
  id: number; status: string; created_at: string; full_name: string; phone: string; email: string; message: string
  class_interest: string; applicant_name: string | null; class_level_id: number | null
  submission_type: string | null; reference_code: string | null; date_of_birth: string | null; gender: string | null
  previous_school: string | null; home_address: string | null; medical_notes: string | null; guardian_relationship: string | null
  student_user_id: string | null; decided_at: string | null
}
interface DocumentInfo { id: number; kind: string; file_name: string; mime_type: string; size_bytes: number; created_at: string }
interface Level { id: number; name: string; is_active?: boolean }
interface ListData { enquiries: Enquiry[]; pagination?: { page: number; limit: number; total: number | null; total_pages: number | null } }

const STATUS_FILTERS = [
  { value: "", label: "All statuses" }, { value: "new", label: "New" }, { value: "reviewing", label: "Reviewing" },
  { value: "accepted", label: "Accepted" }, { value: "rejected", label: "Rejected" }, { value: "archived", label: "Archived" },
]
const STATUS_LOOK: Record<string, string> = {
  new: "bg-blue-100 text-blue-700", reviewing: "bg-amber-100 text-amber-700", in_progress: "bg-amber-100 text-amber-700",
  accepted: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700", resolved: "bg-gray-100 text-gray-600", archived: "bg-gray-100 text-gray-500",
}
const statusLabel = (status: string) => (status === "in_progress" ? "Reviewing" : status.charAt(0).toUpperCase() + status.slice(1))
const DOC_LABEL: Record<string, string> = { birth_certificate: "Birth certificate", passport_photo: "Passport photograph", school_report: "School report", other: "Other document" }
const date = (value?: string | null) => (value ? new Date(value).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—")
const errorText = (reason: unknown, fallback: string) => (reason instanceof Error && reason.message ? reason.message : fallback)
const PAGE_SIZE = 20

export function AdmissionsManager() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const [data, setData] = useState<ListData>({ enquiries: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [openId, setOpenId] = useState<number | null>(null)
  const [levels, setLevels] = useState<Level[]>([])
  const [credentials, setCredentials] = useState<Credential[] | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try { setData(await bffClient.action<ListData>("admin-admission-enquiries", { params: { page, limit: PAGE_SIZE, search, status } })); setError("") }
    catch (reason) { setError(errorText(reason, "Applications could not be loaded.")) }
    finally { setLoading(false) }
  }, [page, search, status])
  useEffect(() => { const timer = window.setTimeout(() => { void load() }, 250); return () => window.clearTimeout(timer) }, [load])
  useEffect(() => {
    void bffClient.action<{ levels?: Level[] }>("admin-class-levels").then((value) => setLevels((value.levels ?? []).filter((level) => level.is_active !== false))).catch(() => undefined)
  }, [])

  const rows = data.enquiries ?? []
  const totalPages = Math.max(1, data.pagination?.total_pages ?? 1)

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search parent name, email or phone..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D9C6B2] focus:outline-none focus:ring-2 focus:ring-[#B22234]/30 text-sm bg-white" />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} aria-label="Filter by status" className="px-4 py-3 rounded-xl border border-[#D9C6B2] text-sm bg-white focus:outline-none">
          {STATUS_FILTERS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </div>

      {error ? <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}</div> : null}

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {["Reference", "Child", "Parent / guardian", "Submitted", "Status", ""].map((heading) => (
                  <th key={heading} className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide first:pl-5">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && rows.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-500"><LoaderCircle className="mx-auto mb-2 w-6 h-6 animate-spin text-[#B22234]" /> Loading applications…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-500">{search || status ? "Nothing matches these filters." : "No applications yet. They appear here when parents apply on the website."}</td></tr>
              ) : rows.map((row) => (
                <tr key={row.id} onClick={() => setOpenId(row.id)} className={`hover:bg-[#F9F5F1] transition-colors cursor-pointer ${loading ? "opacity-60" : ""}`}>
                  <td className="pl-5 px-4 py-4 font-mono text-xs text-gray-500">
                    {row.reference_code ?? `#${row.id}`}
                    {row.submission_type !== "application" ? <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 font-sans text-[10px] text-gray-500">Enquiry</span> : null}
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">{row.applicant_name ?? "—"}</div>
                    <div className="text-xs text-gray-400">{row.class_interest}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-800">{row.full_name}</div>
                    <div className="text-xs text-gray-400">{row.phone}</div>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-500">{date(row.created_at)}</td>
                  <td className="px-4 py-4"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_LOOK[row.status] ?? "bg-gray-100 text-gray-600"}`}>{statusLabel(row.status)}</span></td>
                  <td className="px-4 py-4 text-right"><Eye className="inline w-4 h-4 text-gray-400" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">Showing {rows.length} of {data.pagination?.total ?? rows.length}</span>
          <div className="flex items-center gap-2">
            <button aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="p-2 rounded-xl border border-[#D9C6B2] disabled:opacity-40"><ChevronLeft className="w-4 h-4 text-gray-500" /></button>
            <span className="min-w-9 h-9 px-2 rounded-xl bg-[#B22234] text-white flex items-center justify-center text-sm">{page} / {totalPages}</span>
            <button aria-label="Next page" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="p-2 rounded-xl border border-[#D9C6B2] disabled:opacity-40"><ChevronRight className="w-4 h-4 text-gray-500" /></button>
          </div>
        </div>
      </div>

      {openId !== null ? (
        <ApplicationModal
          id={openId}
          levels={levels}
          onClose={() => setOpenId(null)}
          onChanged={() => void load()}
          onAccepted={(credential) => { setOpenId(null); setCredentials([credential]); void load() }}
        />
      ) : null}
      {credentials ? <CredentialsModal title="Student account created" items={credentials} onClose={() => setCredentials(null)} /> : null}
    </>
  )
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-gray-400">{label}</div>
      <div className="text-sm text-gray-900 whitespace-pre-wrap">{value?.toString().trim() ? value : "—"}</div>
    </div>
  )
}

function ApplicationModal({ id, levels, onClose, onChanged, onAccepted }: { id: number; levels: Level[]; onClose: () => void; onChanged: () => void; onAccepted: (credential: Credential) => void }) {
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null)
  const [documents, setDocuments] = useState<DocumentInfo[]>([])
  const [error, setError] = useState("")
  const [busy, setBusy] = useState<string | null>(null)
  const [acceptClass, setAcceptClass] = useState("")

  const load = useCallback(async () => {
    try {
      const result = await bffClient.action<{ enquiry: Enquiry; documents: DocumentInfo[] }>("admin-admission-get", { params: { enquiryId: id } })
      setEnquiry(result.enquiry); setDocuments(result.documents ?? [])
      setAcceptClass((value) => value || (result.enquiry.class_level_id ? String(result.enquiry.class_level_id) : ""))
    } catch (reason) { setError(errorText(reason, "The application could not be loaded.")) }
  }, [id])
  useEffect(() => { const timer = window.setTimeout(() => { void load() }, 0); return () => window.clearTimeout(timer) }, [load])

  const setStatus = async (status: string) => {
    setBusy(status); setError("")
    try { await bffClient.action("admin-admission-status", { params: { enquiryId: id }, payload: { status } }); await load(); onChanged() }
    catch (reason) { setError(errorText(reason, "The status could not be changed.")) }
    finally { setBusy(null) }
  }

  const openDocument = async (doc: DocumentInfo) => {
    setBusy(`doc-${doc.id}`); setError("")
    // Open the tab synchronously (popup blockers), then point it at the short-lived link.
    const tab = window.open("", "_blank")
    try {
      const result = await bffClient.action<{ url: string }>("admin-admission-document-url", { params: { enquiryId: id, documentId: doc.id } })
      if (tab) tab.location.href = result.url
      else window.location.assign(result.url)
    } catch (reason) {
      tab?.close()
      setError(errorText(reason, "The document could not be opened."))
    } finally { setBusy(null) }
  }

  const accept = async () => {
    if (!enquiry) return
    if (!acceptClass) { setError("Choose the class for the new student."); return }
    if (!window.confirm(`Accept ${enquiry.applicant_name} and create a student account in this class?`)) return
    setBusy("accept"); setError("")
    try {
      const result = await bffClient.action<{ credentials: { student_id: string; temp_password: string } }>("admin-admission-accept", { params: { enquiryId: id }, payload: { class_level_id: Number(acceptClass) } })
      onAccepted({ name: enquiry.applicant_name ?? "New student", ...result.credentials })
    } catch (reason) { setError(errorText(reason, "The application could not be accepted.")); await load() }
    finally { setBusy(null) }
  }

  const isApplication = enquiry?.submission_type === "application"
  const decided = enquiry?.status === "accepted" || Boolean(enquiry?.student_user_id)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl p-7 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="font-heading text-xl font-700 text-gray-900">{enquiry?.applicant_name ?? "Application"}</h2>
            <p className="text-xs text-gray-500">{enquiry ? `${enquiry.reference_code ?? `Enquiry #${enquiry.id}`} · submitted ${date(enquiry.created_at)}` : "Loading…"}</p>
          </div>
          <div className="flex items-center gap-3">
            {enquiry ? <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_LOOK[enquiry.status] ?? "bg-gray-100 text-gray-600"}`}>{statusLabel(enquiry.status)}</span> : null}
            <button onClick={onClose} aria-label="Close" className="p-1 text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {error ? <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}</div> : null}
        {!enquiry ? (
          error ? null : <div className="py-12 text-center"><LoaderCircle className="mx-auto w-6 h-6 animate-spin text-[#B22234]" /></div>
        ) : (
          <div className="space-y-5">
            <section className="rounded-2xl bg-[#F9F5F1] p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[#B22234] mb-3">Child</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Field label="Full name" value={enquiry.applicant_name} />
                <Field label="Date of birth" value={enquiry.date_of_birth ? date(enquiry.date_of_birth) : null} />
                <Field label="Gender" value={enquiry.gender ? enquiry.gender[0].toUpperCase() + enquiry.gender.slice(1) : null} />
                <Field label="Class applied for" value={enquiry.class_interest} />
                <Field label="Previous school" value={enquiry.previous_school} />
                <Field label="Medical information" value={enquiry.medical_notes} />
              </div>
            </section>
            <section className="rounded-2xl bg-[#F9F5F1] p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[#B22234] mb-3">Parent / guardian</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Field label="Name" value={enquiry.full_name} />
                <Field label="Relationship" value={enquiry.guardian_relationship ? enquiry.guardian_relationship[0].toUpperCase() + enquiry.guardian_relationship.slice(1) : null} />
                <Field label="Phone" value={enquiry.phone} />
                <Field label="Email" value={enquiry.email} />
                <div className="col-span-2"><Field label="Home address" value={enquiry.home_address} /></div>
              </div>
            </section>
            {enquiry.message ? <section className="rounded-2xl bg-[#F9F5F1] p-5"><Field label="Message" value={enquiry.message} /></section> : null}

            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[#B22234] mb-3">Documents</h3>
              {documents.length === 0 ? <p className="text-sm text-gray-500">No documents were uploaded.</p> : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 rounded-xl border border-[#E8D9CB] px-4 py-3">
                      <FileText className="w-5 h-5 text-[#B22234]" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{DOC_LABEL[doc.kind] ?? doc.kind}</div>
                        <div className="text-xs text-gray-400 truncate">{doc.file_name} · {Math.max(1, Math.round(doc.size_bytes / 1024))} KB</div>
                      </div>
                      <button onClick={() => void openDocument(doc)} disabled={busy !== null} className="inline-flex items-center gap-1 rounded-xl border border-[#D9C6B2] px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                        {busy === `doc-${doc.id}` ? <LoaderCircle className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />} Open
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {decided ? (
              <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> Accepted {enquiry.decided_at ? `on ${date(enquiry.decided_at)}` : ""}. The student account was created; find it under Students (use Reset password there if the login details were lost).
              </div>
            ) : (
              <section className="rounded-2xl border border-[#E8D9CB] p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[#B22234] mb-3">Decision</h3>
                {isApplication && enquiry.applicant_name ? (
                  <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-4">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Class for the new student</label>
                      <select value={acceptClass} onChange={(e) => setAcceptClass(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-[#D9C6B2] bg-white text-sm focus:outline-none">
                        <option value="">Select class</option>
                        {levels.map((level) => <option key={level.id} value={level.id}>{level.name}</option>)}
                      </select>
                    </div>
                    <button onClick={() => void accept()} disabled={busy !== null} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#B22234] text-white text-sm font-medium hover:bg-[#8B0000] shadow-md disabled:opacity-60">
                      {busy === "accept" ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Accept &amp; create student
                    </button>
                  </div>
                ) : (
                  <p className="mb-4 text-sm text-gray-500">This is a general enquiry (no full application), so it cannot be turned into a student account. Contact the parent, then mark it resolved or archived.</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {(isApplication ? [["reviewing", "Mark as reviewing"], ["rejected", "Reject"], ["archived", "Archive"]] : [["in_progress", "In progress"], ["resolved", "Resolved"], ["archived", "Archive"]]).map(([value, text]) => (
                    <button key={value} onClick={() => void setStatus(value)} disabled={busy !== null || enquiry.status === value} className={`px-4 py-2 rounded-xl border text-sm font-medium disabled:opacity-50 ${value === "rejected" ? "border-red-200 text-red-700 hover:bg-red-50" : "border-[#D9C6B2] text-gray-700 hover:bg-gray-50"}`}>
                      {busy === value ? <LoaderCircle className="inline w-3.5 h-3.5 mr-1 animate-spin" /> : null}{text}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
