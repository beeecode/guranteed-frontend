"use client"

/**
 * Examinations — the designed admin screen on live data (Stage 11).
 * An exam is one subject paper for a class: either a fixed set of questions copied from the
 * question bank, or a random draw of N bank questions per student. Exams are used on their
 * own or as subjects inside an exam bundle (then they are taken only through the bundle).
 * Status: draft (being prepared) → active (can be taken) → closed (results can be released).
 */

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Plus, Eye, Edit, Trash2, Clock, Users, BookOpen, Layers, Play, Pause, Lock, Download, Send,
  LoaderCircle, AlertTriangle, CheckCircle2, X, Search,
} from "lucide-react"
import { bffClient } from "@/lib/api/bffClient"
import { MathText } from "@/components/exam/MathText"

interface Level { id: number; name: string; is_active?: boolean }
interface Subject { id: number; name: string }
interface Exam {
  id: number; title: string; status: string; is_paused: boolean; results_released: boolean; duration_mins: number; total_marks: number
  subject_id: number; class_level_id: number | null; random_draw_count: number | null; shuffle_options: boolean | null; created_at: string
  subject?: { name?: string } | null
}
interface BankQuestion { id: number; question_text: string; question_type: string; marks: number; options?: Array<{ option_text: string; is_correct: boolean }> }

const statusConfig: Record<string, { label: string; classes: string }> = {
  active: { label: "🟢 Active", classes: "bg-green-100 text-green-700" },
  draft: { label: "Draft", classes: "bg-yellow-100 text-yellow-700" },
  closed: { label: "Closed", classes: "bg-gray-100 text-gray-600" },
}
const FILTERS = ["All", "Active", "Draft", "Closed", "In bundles"] as const
const errorText = (reason: unknown, fallback: string) => (reason instanceof Error && reason.message ? reason.message : fallback)
const inputClass = "w-full px-4 py-3 rounded-xl border border-[#D9C6B2] text-sm focus:outline-none focus:ring-2 focus:ring-[#B22234]/30"

export function ExamsManager() {
  const [exams, setExams] = useState<Exam[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [bundleExamIds, setBundleExamIds] = useState<Set<number>>(new Set())
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [busy, setBusy] = useState<string | null>(null)
  const [editing, setEditing] = useState<Exam | "new" | null>(null)
  const [previewId, setPreviewId] = useState<number | null>(null)

  const load = useCallback(async () => {
    try {
      const [examList, bundleList] = await Promise.all([
        bffClient.action<{ exams?: Exam[] }>("admin-exams-list"),
        bffClient.action<{ bundles?: Array<{ status: string; session_exams?: Array<{ exam_id: number }> }> }>("admin-bundles-list").catch(() => ({ bundles: [] })),
      ])
      setExams(examList.exams ?? [])
      setBundleExamIds(new Set((bundleList.bundles ?? []).flatMap((bundle) => (bundle.session_exams ?? []).map((link) => Number(link.exam_id)))))
      setError("")
    } catch (reason) { setError(errorText(reason, "Exams could not be loaded.")) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { const timer = window.setTimeout(() => { void load() }, 0); return () => window.clearTimeout(timer) }, [load])
  useEffect(() => {
    void bffClient.action<{ levels?: Level[] }>("admin-class-levels").then((value) => setLevels(value.levels ?? [])).catch(() => undefined)
    void bffClient.action<{ subjects?: Subject[] }>("admin-subjects-list").then((value) => setSubjects([...(value.subjects ?? [])].sort((a, b) => a.name.localeCompare(b.name)))).catch(() => undefined)
  }, [])

  const levelName = (id: number | null) => levels.find((level) => level.id === id)?.name ?? "—"
  const shown = exams.filter((exam) => {
    if (filter === "All") return true
    if (filter === "In bundles") return bundleExamIds.has(exam.id)
    return exam.status === filter.toLowerCase()
  })

  const run = async (key: string, confirmText: string | null, task: () => Promise<string>) => {
    if (confirmText && !window.confirm(confirmText)) return
    setBusy(key); setError(""); setNotice("")
    try { setNotice(await task()); await load() }
    catch (reason) { setError(errorText(reason, "The action could not be completed.")) }
    finally { setBusy(null) }
  }
  const setStatus = (exam: Exam, status: string, confirmText: string | null) => run(`status-${exam.id}`, confirmText, async () => {
    await bffClient.action("admin-exam-update", { params: { examId: exam.id }, payload: { formData: { status } } })
    return `"${exam.title}" is now ${status}.`
  })
  const exportResults = (exam: Exam) => run(`export-${exam.id}`, null, async () => {
    const file = await bffClient.download("exam-results", { examId: exam.id })
    const url = URL.createObjectURL(file.blob)
    Object.assign(document.createElement("a"), { href: url, download: file.filename }).click()
    URL.revokeObjectURL(url)
    return "Results downloaded."
  })

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${f === filter ? "bg-[#B22234] text-white shadow-md" : "bg-white text-gray-600 border border-[#D9C6B2] hover:border-[#B22234]"}`}>
              {f === "In bundles" ? "📚 In bundles" : f}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Link href="/admin/bundles/create" className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#5C1010] text-white text-sm font-medium hover:bg-[#3d0909] transition-colors shadow-md">
            <Layers className="w-4 h-4" /> Create Bundle
          </Link>
          <button onClick={() => setEditing("new")} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#B22234] text-white text-sm font-medium hover:bg-[#8B0000] transition-colors shadow-md">
            <Plus className="w-4 h-4" /> Create Exam
          </button>
        </div>
      </div>

      {error ? <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}</div> : null}
      {notice ? <div role="status" className="mb-4 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> {notice}</div> : null}

      {loading ? (
        <div className="bg-white rounded-3xl shadow-sm p-12 text-center text-sm text-gray-500"><LoaderCircle className="mx-auto mb-2 w-6 h-6 animate-spin text-[#B22234]" /> Loading exams…</div>
      ) : shown.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm p-12 text-center text-sm text-gray-500">{exams.length ? "No exams match this filter." : "No exams yet. Use Create Exam (questions come from the Question Bank)."}</div>
      ) : (
        <div className="space-y-4">
          {shown.map((exam) => {
            const st = statusConfig[exam.status] ?? { label: exam.status, classes: "bg-gray-100 text-gray-600" }
            const inBundle = bundleExamIds.has(exam.id)
            return (
              <div key={exam.id} className="bg-white rounded-3xl p-5 shadow-sm hover:shadow-md transition-all border border-transparent hover:border-[#D9C6B2]">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-[#B22234] flex items-center justify-center flex-shrink-0"><BookOpen className="w-6 h-6 text-white" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-heading font-600 text-gray-900 text-base">{exam.title}</h3>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${st.classes}`}>{st.label}</span>
                        {exam.is_paused ? <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">Paused</span> : null}
                        {inBundle ? <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#5C1010]/10 text-[#5C1010]">IN A BUNDLE</span> : <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">SINGLE SUBJECT</span>}
                        {exam.results_released ? <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">Results released</span> : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {exam.subject?.name ?? "Subject"}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {levelName(exam.class_level_id)}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {exam.duration_mins} min</span>
                        <span>{exam.total_marks} marks</span>
                        {exam.random_draw_count ? <span>random {exam.random_draw_count} questions</span> : null}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    {exam.status === "draft" ? (
                      <button onClick={() => void setStatus(exam, "active", `Activate "${exam.title}"? ${inBundle ? "Students can then take it inside its bundle." : "Students of the class can then start it."}`)} disabled={busy !== null} className="flex items-center gap-1.5 px-3 py-2 bg-[#B22234]/10 text-[#B22234] rounded-xl text-xs font-medium hover:bg-[#B22234]/20 transition-colors disabled:opacity-50">
                        <Play className="w-3.5 h-3.5" /> Activate
                      </button>
                    ) : null}
                    {exam.status === "active" ? (
                      <>
                        <button onClick={() => void run(`pause-${exam.id}`, null, async () => { await bffClient.action("admin-exam-pause", { params: { examId: exam.id }, payload: { is_paused: !exam.is_paused } }); return exam.is_paused ? "Exam resumed." : "Exam paused: students cannot continue until resumed." })} disabled={busy !== null} className="flex items-center gap-1.5 px-3 py-2 bg-orange-50 text-orange-700 rounded-xl text-xs font-medium hover:bg-orange-100 transition-colors border border-orange-200 disabled:opacity-50">
                          {exam.is_paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />} {exam.is_paused ? "Resume" : "Pause"}
                        </button>
                        <button onClick={() => void setStatus(exam, "closed", `Close "${exam.title}"? Ongoing attempts are submitted when students next contact the server.`)} disabled={busy !== null} className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-medium hover:bg-gray-100 transition-colors disabled:opacity-50">
                          <Lock className="w-3.5 h-3.5" /> Close
                        </button>
                      </>
                    ) : null}
                    {exam.status === "closed" && !exam.results_released && !inBundle ? (
                      <button onClick={() => void run(`release-${exam.id}`, `Release the results of "${exam.title}"? Students will see their scores. This cannot be undone.`, async () => { await bffClient.action("admin-exam-release", { params: { examId: exam.id }, payload: {} }); return "Results released." })} disabled={busy !== null} className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 rounded-xl text-xs font-medium hover:bg-purple-100 transition-colors disabled:opacity-50">
                        <Send className="w-3.5 h-3.5" /> Release Results
                      </button>
                    ) : null}
                    {exam.status !== "draft" ? (
                      <button onClick={() => void exportResults(exam)} disabled={busy !== null} title="Download results (CSV)" className="p-2 rounded-xl text-gray-400 hover:text-[#B22234] hover:bg-red-50 transition-colors disabled:opacity-50">
                        {busy === `export-${exam.id}` ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      </button>
                    ) : null}
                    <button onClick={() => setPreviewId(exam.id)} title="Preview questions" className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => setEditing(exam)} title="Edit" className="p-2 rounded-xl text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => void run(`delete-${exam.id}`, `Delete "${exam.title}"? Exams that students have already taken cannot be deleted.`, async () => { await bffClient.action("admin-exam-delete", { params: { examId: exam.id } }); return "Exam deleted." })} disabled={busy !== null} title="Delete" className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
                      {busy === `delete-${exam.id}` ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editing ? <ExamModal exam={editing === "new" ? null : editing} levels={levels.filter((level) => level.is_active !== false)} subjects={subjects} onClose={() => setEditing(null)} onSaved={(message) => { setEditing(null); setNotice(message); void load() }} /> : null}
      {previewId !== null ? <PreviewModal examId={previewId} onClose={() => setPreviewId(null)} /> : null}
    </>
  )
}

const STEPS = ["Details", "Questions", "Settings", "Review"]

function ExamModal({ exam, levels, subjects, onClose, onSaved }: { exam: Exam | null; levels: Level[]; subjects: Subject[]; onClose: () => void; onSaved: (message: string) => void }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    title: exam?.title ?? "", subject_id: exam?.subject_id ? String(exam.subject_id) : "", class_level_id: exam?.class_level_id ? String(exam.class_level_id) : "",
    duration_mins: String(exam?.duration_mins ?? 30), total_marks: String(exam?.total_marks ?? ""), status: exam?.status ?? "draft",
    shuffle_options: exam?.shuffle_options ?? true, mode: exam?.random_draw_count ? "random" : "fixed", random_draw_count: String(exam?.random_draw_count ?? ""),
  })
  const [bank, setBank] = useState<BankQuestion[]>([])
  const [bankLoading, setBankLoading] = useState(false)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [search, setSearch] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // Existing exam: preselect the bank questions it was built from.
  useEffect(() => {
    if (!exam) return
    let active = true
    void bffClient.action<{ questions?: Array<{ bank_question_id?: number | null }> }>("admin-exam-get", { params: { examId: exam.id } })
      .then((value) => { if (active) setSelected(new Set((value.questions ?? []).map((q) => Number(q.bank_question_id)).filter((id) => id > 0))) })
      .catch(() => undefined)
    return () => { active = false }
  }, [exam])

  useEffect(() => {
    if (!form.subject_id) return
    let active = true
    const timer = window.setTimeout(() => {
      setBankLoading(true)
      void bffClient.action<{ questions?: BankQuestion[] }>("admin-questions-list", { params: { subjectId: form.subject_id, all: "true", limit: 1000 } })
        .then((value) => { if (active) setBank(value.questions ?? []) })
        .catch(() => { if (active) setBank([]) })
        .finally(() => { if (active) setBankLoading(false) })
    }, 0)
    return () => { active = false; window.clearTimeout(timer) }
  }, [form.subject_id])

  const visibleBank = useMemo(() => bank.filter((q) => !search || q.question_text.toLowerCase().includes(search.toLowerCase())), [bank, search])
  const selectedMarks = bank.filter((q) => selected.has(q.id)).reduce((sum, q) => sum + Number(q.marks || 0), 0)
  const toggle = (id: number) => setSelected((value) => { const next = new Set(value); if (next.has(id)) next.delete(id); else next.add(id); return next })

  const problem = (() => {
    if (step === 0) {
      if (!form.title.trim()) return "Enter the exam title."
      if (!form.subject_id) return "Choose the subject."
      if (!form.class_level_id) return "Choose the class."
      const duration = Number(form.duration_mins)
      if (!Number.isInteger(duration) || duration < 1 || duration > 480) return "Duration must be 1–480 minutes."
    }
    if (step === 1) {
      if (form.mode === "fixed" && selected.size === 0) return "Select at least one question."
      if (form.mode === "random" && !(Number(form.random_draw_count) > 0)) return "Enter how many questions to draw."
      if (form.mode === "random" && Number(form.random_draw_count) > bank.length) return `The bank has only ${bank.length} questions for this subject.`
    }
    if (step === 2 && !(Number(form.total_marks) > 0)) return "Enter the total marks."
    return ""
  })()

  const next = () => {
    if (step === 1 && !form.total_marks) {
      const marks = form.mode === "fixed" ? selectedMarks : Math.round((bank.reduce((sum, q) => sum + Number(q.marks || 0), 0) / Math.max(1, bank.length)) * Number(form.random_draw_count || 0))
      setForm((value) => ({ ...value, total_marks: marks ? String(marks) : value.total_marks }))
    }
    setStep((value) => value + 1)
  }

  const save = async () => {
    setSaving(true); setError("")
    const formData = {
      title: form.title.trim(), subject_id: Number(form.subject_id), class_level_id: Number(form.class_level_id),
      duration_mins: Number(form.duration_mins), total_marks: Number(form.total_marks), status: form.status, shuffle_options: form.shuffle_options,
      random_draw_count: form.mode === "random" ? Number(form.random_draw_count) : null,
    }
    const selectedQuestionIds = form.mode === "fixed" ? [...selected] : []
    try {
      if (exam) await bffClient.action("admin-exam-update", { params: { examId: exam.id }, payload: { formData, selectedQuestionIds } })
      else await bffClient.action("admin-exam-create", { payload: { formData, selectedQuestionIds } })
      onSaved(exam ? "Exam updated." : "Exam created.")
    } catch (reason) { setError(errorText(reason, "The exam could not be saved.")); setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <h2 className="font-heading text-xl font-700 text-gray-900">{exam ? "Edit Examination" : "Create Examination"}</h2>
            <button onClick={onClose} aria-label="Close" className="p-1 text-gray-400"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex items-center">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-heading font-700 transition-all ${i === step ? "bg-[#B22234] text-white shadow-md" : i < step ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"}`}>{i < step ? "✓" : i + 1}</div>
                <div className="hidden sm:block ml-2 flex-shrink-0"><div className={`text-xs font-medium ${i === step ? "text-[#B22234]" : "text-gray-400"}`}>{s}</div></div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? "bg-green-500" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Exam Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="e.g. First Term Mathematics Examination" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject *</label>
                  <select value={form.subject_id} onChange={(e) => { setForm({ ...form, subject_id: e.target.value }); setSelected(new Set()) }} className={`${inputClass} bg-white`}>
                    <option value="">Select subject</option>
                    {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Class *</label>
                  <select value={form.class_level_id} onChange={(e) => setForm({ ...form, class_level_id: e.target.value })} className={`${inputClass} bg-white`}>
                    <option value="">Select class</option>
                    {levels.map((level) => <option key={level.id} value={level.id}>{level.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (minutes) *</label>
                <input type="number" min={1} max={480} value={form.duration_mins} onChange={(e) => setForm({ ...form, duration_mins: e.target.value })} className={inputClass} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {([["fixed", "Choose questions", "Everyone gets the same paper"], ["random", "Random draw", "Each student gets N random questions"]] as const).map(([value, title, desc]) => (
                  <button key={value} type="button" onClick={() => setForm({ ...form, mode: value })} className={`p-4 rounded-xl border-2 text-left ${form.mode === value ? "border-[#B22234] bg-[#B22234]/5" : "border-[#D9C6B2]"}`}>
                    <div className={`text-sm font-medium ${form.mode === value ? "text-[#B22234]" : "text-gray-900"}`}>{title}</div>
                    <div className="text-xs text-gray-500">{desc}</div>
                  </button>
                ))}
              </div>
              {bankLoading ? <div className="py-8 text-center text-sm text-gray-500"><LoaderCircle className="mx-auto mb-2 w-5 h-5 animate-spin text-[#B22234]" /> Loading the question bank…</div> : bank.length === 0 ? (
                <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">This subject has no questions in the Question Bank yet. Add or import questions there first.</p>
              ) : form.mode === "random" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Questions per student (bank has {bank.length})</label>
                  <input type="number" min={1} max={bank.length} value={form.random_draw_count} onChange={(e) => setForm({ ...form, random_draw_count: e.target.value })} className={inputClass} />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search questions…" className={`${inputClass} pl-9`} />
                    </div>
                    <button type="button" onClick={() => setSelected(new Set(visibleBank.map((q) => q.id)))} className="text-xs font-medium text-[#B22234] underline">Select all</button>
                    <button type="button" onClick={() => setSelected(new Set())} className="text-xs text-gray-500 underline">Clear</button>
                  </div>
                  <div className="text-xs text-gray-500">{selected.size} selected · {selectedMarks} marks</div>
                  <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                    {visibleBank.map((q, index) => (
                      <label key={q.id} className={`flex items-start gap-3 rounded-xl border px-3 py-2 text-sm cursor-pointer ${selected.has(q.id) ? "border-[#B22234] bg-[#B22234]/5" : "border-[#E8D9CB]"}`}>
                        <input type="checkbox" checked={selected.has(q.id)} onChange={() => toggle(q.id)} className="mt-1 accent-[#B22234]" />
                        <span className="text-xs text-gray-400 w-6">{index + 1}.</span>
                        <span className="flex-1 line-clamp-2"><MathText text={q.question_text} /></span>
                        <span className="text-xs text-gray-400">{q.marks}m</span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Total Marks *</label>
                <input type="number" min={1} value={form.total_marks} onChange={(e) => setForm({ ...form, total_marks: e.target.value })} className={inputClass} />
                <p className="mt-1 text-xs text-gray-400">Percentages are calculated against this total.</p>
              </div>
              <label className="flex items-center gap-3 p-3 rounded-xl border border-[#D9C6B2] cursor-pointer">
                <input type="checkbox" checked={form.shuffle_options} onChange={(e) => setForm({ ...form, shuffle_options: e.target.checked })} className="w-4 h-4 accent-[#B22234]" />
                <span className="text-sm text-gray-700">Shuffle answer options (each student sees A–D in a different order)</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={`${inputClass} bg-white`}>
                  <option value="draft">Draft — not visible to students yet</option>
                  <option value="active">Active — students can take it</option>
                  {exam ? <option value="closed">Closed</option> : null}
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2 text-sm">
              {[["Title", form.title], ["Subject", subjects.find((s) => String(s.id) === form.subject_id)?.name ?? ""], ["Class", levels.find((l) => String(l.id) === form.class_level_id)?.name ?? ""], ["Duration", `${form.duration_mins} minutes`], ["Questions", form.mode === "random" ? `${form.random_draw_count} random per student (from ${bank.length})` : `${selected.size} chosen`], ["Total marks", form.total_marks], ["Shuffle options", form.shuffle_options ? "Yes" : "No"], ["Status", form.status]].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-gray-50 py-2"><span className="text-gray-500">{label}</span><span className="font-medium text-gray-900 text-right">{value}</span></div>
              ))}
            </div>
          )}

          {error ? <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}</div> : null}
          {problem ? <p className="mt-4 text-sm text-[#B22234]">{problem}</p> : null}
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-between">
          {step > 0 ? <button onClick={() => setStep((s) => s - 1)} className="px-5 py-2.5 border-2 border-[#D9C6B2] text-gray-700 rounded-xl text-sm font-medium">← Back</button> : <button onClick={onClose} className="px-5 py-2.5 border-2 border-[#D9C6B2] text-gray-700 rounded-xl text-sm font-medium">Cancel</button>}
          {step < STEPS.length - 1 ? (
            <button onClick={next} disabled={Boolean(problem)} className="px-5 py-2.5 bg-[#B22234] text-white rounded-xl text-sm font-medium disabled:opacity-50">Next →</button>
          ) : (
            <button onClick={() => void save()} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium disabled:opacity-50">
              {saving ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} {exam ? "Save Changes" : "Create Exam"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function PreviewModal({ examId, onClose }: { examId: number; onClose: () => void }) {
  const [data, setData] = useState<{ exam: Exam; questions: BankQuestion[] } | null>(null)
  const [error, setError] = useState("")
  useEffect(() => {
    let active = true
    void bffClient.action<{ exam: Exam; questions: BankQuestion[] }>("admin-exam-get", { params: { examId } })
      .then((value) => { if (active) setData(value) })
      .catch((reason) => { if (active) setError(errorText(reason, "The exam could not be loaded.")) })
    return () => { active = false }
  }, [examId])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="font-heading text-xl font-700 text-gray-900">{data?.exam.title ?? "Exam preview"}</h2>
          <button onClick={onClose} aria-label="Close" className="p-1 text-gray-400"><X className="w-5 h-5" /></button>
        </div>
        {error ? <p className="text-sm text-red-700">{error}</p> : !data ? <div className="py-10 text-center"><LoaderCircle className="mx-auto w-6 h-6 animate-spin text-[#B22234]" /></div> : data.exam.random_draw_count ? (
          <p className="text-sm text-gray-600">Random-draw exam: each student receives {data.exam.random_draw_count} random questions from the subject&apos;s question bank.</p>
        ) : (
          <ol className="space-y-4">
            {data.questions.map((q, index) => (
              <li key={q.id} className="rounded-2xl border border-[#E8D9CB] p-4">
                <div className="text-xs text-gray-400 mb-1">Question {index + 1} · {q.marks} mark{q.marks === 1 ? "" : "s"}</div>
                <div className="text-sm text-gray-900 mb-2"><MathText text={q.question_text} /></div>
                {q.options?.length ? (
                  <ul className="space-y-1">
                    {q.options.map((option, i) => (
                      <li key={i} className={`text-sm px-3 py-1.5 rounded-lg ${option.is_correct ? "bg-green-50 text-green-800" : "text-gray-700"}`}>{String.fromCharCode(65 + i)}. <MathText text={option.option_text} />{option.is_correct ? " ✓" : ""}</li>
                    ))}
                  </ul>
                ) : <p className="text-xs text-gray-500">Written answer</p>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}
