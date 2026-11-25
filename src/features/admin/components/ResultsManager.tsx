"use client"

/**
 * Results — the designed admin screen on live data (Stage 11).
 * Scores, percentages, pass marks and grades all come from the server (lib/scoring.js):
 * the grade column shows only when the school configured a grade scale, and "passed" only
 * exists for bundle subjects (standalone exams have no pass mark). Results load in pages
 * of 200, newest first. Written answers can be marked here; objective answers are marked
 * automatically. Releasing results to students happens on Examinations / Exam Bundles.
 */

import { useCallback, useEffect, useMemo, useState } from "react"
import { Search, Download, Eye, X, BarChart2, TrendingUp, TrendingDown, PenLine, LoaderCircle, AlertTriangle, CheckCircle2, RotateCcw } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { bffClient } from "@/lib/api/bffClient"
import { MathText } from "@/components/exam/MathText"

interface ResultRow {
  id: number; exam_id: number; submitted_at: string | null; score: number | null; session_attempt_id: number | null
  needs_grading: boolean; max_marks: number | null; percentage: number | null; pass_mark: number | null; passed: boolean | null; grade: string | null
  user?: { full_name?: string; student_id?: string; class?: string } | null
  exam?: { title?: string; results_released?: boolean; status?: string; subject?: { name?: string } | null } | null
}
interface ExamOption { id: number; title: string }
interface Answer {
  id: number; answer_text: string | null; marks_obtained: number | null; is_graded: boolean | null
  question?: { question_text?: string; question_type?: string; marks?: number } | null
  selected_option?: { option_text?: string } | null
}
interface Detail {
  attempt: ResultRow & { result?: { percentage: number | null; grade: string | null }; breakdown?: { total_questions: number | null; answered: number; unanswered: number | null; correct: number; partial: number; incorrect: number; pending_manual: number } }
  answers: Answer[]
}

const PAGE_SIZE = 200
const errorText = (reason: unknown, fallback: string) => (reason instanceof Error && reason.message ? reason.message : fallback)
const pctColor = (pct: number | null) => (pct === null ? "#9CA3AF" : pct >= 70 ? "#16A34A" : pct >= 50 ? "#D97706" : "#EF4444")
const fmtDate = (value: string | null) => (value ? new Date(value).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—")
// Question types (server lib/adminInput.js): mcq, truefalse (marked automatically),
// shortanswer, essay (may need marking by hand).
const isWritten = (type?: string) => type === "shortanswer" || type === "essay"

export function ResultsManager() {
  const [rows, setRows] = useState<ResultRow[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [exams, setExams] = useState<ExamOption[]>([])
  const [examId, setExamId] = useState("")
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"table" | "analytics">("table")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [openId, setOpenId] = useState<number | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async (nextPage: number, append: boolean) => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page: nextPage, limit: PAGE_SIZE }
      if (examId) params.examId = examId
      const value = await bffClient.action<{ results?: ResultRow[]; pagination?: { total?: number } }>("admin-results-list", { params })
      setRows((current) => (append ? [...current, ...(value.results ?? [])] : value.results ?? []))
      setTotal(typeof value.pagination?.total === "number" ? value.pagination.total : null)
      setPage(nextPage)
      setError("")
    } catch (reason) { setError(errorText(reason, "Results could not be loaded.")) }
    finally { setLoading(false) }
  }, [examId])
  useEffect(() => { const timer = window.setTimeout(() => { void load(1, false) }, 0); return () => window.clearTimeout(timer) }, [load])
  useEffect(() => {
    void bffClient.action<{ exams?: ExamOption[] }>("admin-exams-list").then((value) => setExams(value.exams ?? [])).catch(() => undefined)
  }, [])

  const filtered = rows.filter((r) => {
    const text = search.trim().toLowerCase()
    if (!text) return true
    return [r.user?.full_name, r.user?.student_id, r.exam?.title, r.exam?.subject?.name].some((value) => value?.toLowerCase().includes(text))
  })
  const scored = filtered.map((r) => r.percentage).filter((value): value is number => value !== null)
  const avg = scored.length ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length) : null
  const needsGrading = filtered.filter((r) => r.needs_grading).length

  const distribution = useMemo(() => {
    const buckets = [["0–19", 0, 20], ["20–39", 20, 40], ["40–59", 40, 60], ["60–79", 60, 80], ["80–100", 80, Infinity]] as const
    return buckets.map(([range, low, high]) => ({ range, students: scored.filter((p) => p >= low && p < high).length }))
  }, [scored])
  const bySubject = useMemo(() => {
    const groups = new Map<string, number[]>()
    filtered.forEach((r) => { if (r.percentage !== null) groups.set(r.exam?.subject?.name ?? "Other", [...(groups.get(r.exam?.subject?.name ?? "Other") ?? []), r.percentage]) })
    return [...groups.entries()].map(([subject, list]) => ({ subject, average: Math.round(list.reduce((a, b) => a + b, 0) / list.length) }))
  }, [filtered])

  const exportResults = async () => {
    if (!examId) return
    setBusy("export"); setError("")
    try {
      const file = await bffClient.download("exam-results", { examId })
      const url = URL.createObjectURL(file.blob)
      Object.assign(document.createElement("a"), { href: url, download: file.filename }).click()
      URL.revokeObjectURL(url)
    } catch (reason) { setError(errorText(reason, "The export failed.")) }
    finally { setBusy(null) }
  }
  const reset = async (row: ResultRow) => {
    if (!window.confirm(`Reset ${row.user?.full_name ?? "this student"}'s attempt on "${row.exam?.title}"?\n\nTheir answers and score are DELETED permanently so they can sit the exam again.`)) return
    setBusy(`reset-${row.id}`); setError(""); setNotice("")
    try {
      await bffClient.action("admin-result-reset", { params: { attemptId: row.id } })
      setNotice("Attempt reset. The student can now take the exam again.")
      await load(1, false)
    } catch (reason) { setError(errorText(reason, "The attempt could not be reset.")) }
    finally { setBusy(null) }
  }

  const cards = [
    { label: "Highest Score", value: scored.length ? `${Math.round(Math.max(...scored))}%` : "—", icon: TrendingUp, color: "#16A34A", bg: "#F0FDF4" },
    { label: "Lowest Score", value: scored.length ? `${Math.round(Math.min(...scored))}%` : "—", icon: TrendingDown, color: "#EF4444", bg: "#FEF2F2" },
    { label: "Average Score", value: avg === null ? "—" : `${avg}%`, icon: BarChart2, color: "#B22234", bg: "#FFF0F0" },
    { label: "Needs Marking", value: String(needsGrading), icon: PenLine, color: "#2563EB", bg: "#EFF6FF" },
  ]

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {cards.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}><s.icon className="w-5 h-5" style={{ color: s.color }} /></div>
            <div className="font-heading text-2xl font-700 text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-3 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by student, ID, exam or subject..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D9C6B2] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#B22234]/30" />
        </div>
        <select value={examId} onChange={(e) => setExamId(e.target.value)} className="px-4 py-3 rounded-xl border border-[#D9C6B2] text-sm bg-white lg:w-64">
          <option value="">All exams</option>
          {exams.map((exam) => <option key={exam.id} value={exam.id}>{exam.title}</option>)}
        </select>
        <div className="flex gap-2">
          {(["table", "analytics"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${view === v ? "bg-[#B22234] text-white" : "bg-white border border-[#D9C6B2] text-gray-600"}`}>{v === "table" ? "Table View" : "Analytics"}</button>
          ))}
          <button onClick={() => void exportResults()} disabled={!examId || busy !== null} title={examId ? "Download this exam's results (CSV)" : "Choose an exam to export"} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#D9C6B2] text-sm bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            {busy === "export" ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Export
          </button>
        </div>
      </div>

      {error ? <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}</div> : null}
      {notice ? <div role="status" className="mb-4 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> {notice}</div> : null}

      {view === "table" ? (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Student", "Exam", "Score", "Grade", "Status", "Submitted", "Actions"].map((h) => <th key={h} className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F9F5F1] transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#B22234] flex items-center justify-center text-white text-xs font-heading font-600 flex-shrink-0">{(r.user?.full_name ?? "?")[0]}</div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{r.user?.full_name ?? "Student"}</div>
                          <div className="text-xs text-gray-400">{[r.user?.student_id, r.user?.class].filter(Boolean).join(" · ")}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <div>{r.exam?.title ?? `Exam ${r.exam_id}`}</div>
                      <div className="text-xs text-gray-400">{r.exam?.subject?.name}{r.session_attempt_id ? " · in a bundle" : ""}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full"><div className="h-full rounded-full" style={{ width: `${Math.min(100, r.percentage ?? 0)}%`, background: pctColor(r.percentage) }} /></div>
                        <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{r.score ?? "—"}/{r.max_marks ?? "—"}{r.percentage !== null ? <span className="text-xs text-gray-400"> ({Math.round(r.percentage)}%)</span> : null}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-heading text-lg font-700" style={{ color: pctColor(r.percentage) }}>{r.grade ?? (r.passed === null ? "—" : r.passed ? "Pass" : "Fail")}</td>
                    <td className="px-4 py-4">
                      {r.needs_grading ? <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">✎ Needs marking</span>
                        : r.exam?.results_released ? <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">✓ Released</span>
                          : <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700">⏳ Not released</span>}
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-400 whitespace-nowrap">{fmtDate(r.submitted_at)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setOpenId(r.id)} title="View answers" className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"><Eye className="w-4 h-4" /></button>
                        {!r.session_attempt_id ? (
                          <button onClick={() => void reset(r)} disabled={busy !== null} title="Reset attempt (student re-sits)" className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50">
                            {busy === `reset-${r.id}` ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {loading ? <div className="p-6 text-center text-sm text-gray-500"><LoaderCircle className="mx-auto mb-1 w-5 h-5 animate-spin text-[#B22234]" /> Loading results…</div>
            : filtered.length === 0 ? <div className="p-10 text-center text-sm text-gray-500">{rows.length ? "No results match your search." : "No submitted results yet."}</div> : null}
          {!loading && total !== null && rows.length < total ? (
            <div className="p-4 text-center border-t border-gray-50">
              <button onClick={() => void load(page + 1, true)} className="px-5 py-2 rounded-xl border border-[#D9C6B2] text-sm text-gray-700 hover:bg-gray-50">Load more ({rows.length} of {total})</button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h3 className="font-heading font-700 text-gray-900 mb-1">Score Distribution</h3>
            <p className="text-xs text-gray-400 mb-4">{scored.length} marked result(s){total !== null && rows.length < total ? ` · first ${rows.length} of ${total} loaded` : ""}</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={distribution} margin={{ top: 5, right: 10, bottom: 5, left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F3F3" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#9A9A9A" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#9A9A9A" }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", fontSize: "12px" }} formatter={(v) => [v, "Results"]} />
                <Bar dataKey="students" fill="#B22234" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h3 className="font-heading font-700 text-gray-900 mb-1">Average by Subject</h3>
            <p className="text-xs text-gray-400 mb-4">Percentage of the maximum marks</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={bySubject} margin={{ top: 5, right: 10, bottom: 5, left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F3F3" />
                <XAxis dataKey="subject" tick={{ fontSize: 11, fill: "#9A9A9A" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#9A9A9A" }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", fontSize: "12px" }} formatter={(v) => [`${v}%`, "Average"]} />
                <Bar dataKey="average" fill="#5C1010" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {openId !== null ? <ResultDetail attemptId={openId} onClose={() => setOpenId(null)} onGraded={() => void load(1, false)} /> : null}
    </>
  )
}

function ResultDetail({ attemptId, onClose, onGraded }: { attemptId: number; onClose: () => void; onGraded: () => void }) {
  const [data, setData] = useState<Detail | null>(null)
  const [error, setError] = useState("")
  const [marks, setMarks] = useState<Record<number, string>>({})
  const [saving, setSaving] = useState<number | null>(null)

  const fetchDetail = useCallback(async () => {
    try { setData(await bffClient.action<Detail>("admin-result-detail", { params: { attemptId } })); setError("") }
    catch (reason) { setError(errorText(reason, "The result could not be loaded.")) }
  }, [attemptId])
  useEffect(() => { const timer = window.setTimeout(() => { void fetchDetail() }, 0); return () => window.clearTimeout(timer) }, [fetchDetail])

  const grade = async (answer: Answer) => {
    const value = Number(marks[answer.id])
    const max = Number(answer.question?.marks) || 0
    if (!Number.isFinite(value) || value < 0 || (max > 0 && value > max)) { setError(`Marks must be between 0 and ${max}.`); return }
    setSaving(answer.id); setError("")
    try {
      await bffClient.action("admin-result-grade", { payload: { attemptId, answerId: answer.id, marks_obtained: value, is_graded: true } })
      await fetchDetail()
      onGraded()
    } catch (reason) { setError(errorText(reason, "The mark could not be saved.")) }
    finally { setSaving(null) }
  }

  const attempt = data?.attempt
  const b = attempt?.breakdown
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl p-7 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-heading text-xl font-700 text-gray-900">{attempt?.user?.full_name ?? "Result"}</h2>
            <p className="text-sm text-gray-500">{[attempt?.user?.student_id, attempt?.exam?.title].filter(Boolean).join(" · ")}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-2 rounded-xl text-gray-400 hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        {error ? <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}</div> : null}
        {!data ? (!error ? <div className="py-10 text-center"><LoaderCircle className="mx-auto w-6 h-6 animate-spin text-[#B22234]" /></div> : null) : (
          <>
            <div className="text-center mb-6 p-5 bg-[#F9F5F1] rounded-2xl">
              <div className="font-heading text-5xl font-700 mb-2" style={{ color: pctColor(attempt?.result?.percentage ?? null) }}>
                {attempt?.result?.grade ?? (attempt?.result?.percentage !== null && attempt?.result?.percentage !== undefined ? `${Math.round(attempt.result.percentage)}%` : "—")}
              </div>
              <div className="text-gray-900 font-medium text-xl">{attempt?.score ?? "—"} marks</div>
              <div className="text-gray-400 text-sm mt-1">{attempt?.needs_grading ? "Written answers still need marking" : attempt?.exam?.results_released ? "Released to the student" : "Not released to the student yet"}</div>
            </div>
            {b ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6 text-center">
                {[["Questions", b.total_questions ?? "—"], ["Correct", b.correct + b.partial], ["Wrong", b.incorrect], ["Unanswered", b.unanswered ?? "—"], ["To mark", b.pending_manual]].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-[#E8D9CB] py-2"><div className="font-heading text-lg font-700 text-gray-900">{value}</div><div className="text-xs text-gray-500">{label}</div></div>
                ))}
              </div>
            ) : null}
            <ol className="space-y-3">
              {data.answers.map((answer, index) => {
                const written = isWritten(answer.question?.question_type)
                const max = Number(answer.question?.marks) || 0
                return (
                  <li key={answer.id} className="rounded-2xl border border-[#E8D9CB] p-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Answer {index + 1}</span><span>{answer.is_graded ? `${answer.marks_obtained ?? 0}/${max} marks` : "not marked yet"}</span></div>
                    <div className="text-sm text-gray-900 mb-2"><MathText text={answer.question?.question_text ?? ""} /></div>
                    {written ? (
                      <>
                        <div className="text-sm rounded-lg bg-gray-50 px-3 py-2 text-gray-700 whitespace-pre-wrap">{answer.answer_text?.trim() ? answer.answer_text : <em className="text-gray-400">No answer</em>}</div>
                        <div className="mt-2 flex items-center gap-2">
                          <input type="number" min={0} max={max || undefined} step="0.5" placeholder={`0–${max}`} value={marks[answer.id] ?? (answer.is_graded ? String(answer.marks_obtained ?? 0) : "")} onChange={(e) => setMarks({ ...marks, [answer.id]: e.target.value })} className="w-24 px-3 py-2 rounded-xl border border-[#D9C6B2] text-sm" />
                          <button onClick={() => void grade(answer)} disabled={saving !== null || marks[answer.id] === undefined} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#B22234] text-white text-xs font-medium disabled:opacity-50">
                            {saving === answer.id ? <LoaderCircle className="w-3.5 h-3.5 animate-spin" /> : <PenLine className="w-3.5 h-3.5" />} Save mark
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className={`text-sm rounded-lg px-3 py-2 ${!answer.selected_option ? "bg-gray-50 text-gray-400" : Number(answer.marks_obtained) > 0 ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                        {answer.selected_option ? <><MathText text={answer.selected_option.option_text ?? ""} /> {Number(answer.marks_obtained) > 0 ? "✓" : "✗"}</> : "No answer"}
                      </div>
                    )}
                  </li>
                )
              })}
              {data.answers.length === 0 ? <li className="text-sm text-gray-500">The student did not answer any question.</li> : null}
            </ol>
          </>
        )}
        <div className="mt-6">
          <button onClick={onClose} className="w-full py-3 border-2 border-[#D9C6B2] text-gray-700 rounded-xl font-medium text-sm">Close</button>
        </div>
      </div>
    </div>
  )
}
