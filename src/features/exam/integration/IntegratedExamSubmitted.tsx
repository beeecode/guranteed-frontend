"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { CheckCircle2, Clock3, Home, LoaderCircle, RefreshCw, ShieldCheck } from "lucide-react"
import { ApiError } from "@/lib/api/core"
import { bffClient } from "@/lib/api/bffClient"

interface ResultPayload {
  attempt: { score: number | null; exam?: { title?: string; total_marks?: number } }
  result: { max_marks: number | null; percentage: number | null; pass_mark: number | null; passed: boolean | null; grade: string | null }
  breakdown: { total_questions: number; answered: number; unanswered: number; correct: number; partial: number; incorrect: number; pending_manual: number; earned_marks: number }
}
type State = { status: "loading" } | { status: "released"; data: ResultPayload } | { status: "pending"; manual: boolean } | { status: "error"; message: string }

export function IntegratedExamSubmitted({ attemptId }: { attemptId?: string }) {
  const load = useCallback(async (): Promise<State> => {
    if (!attemptId) return { status: "error", message: "No server-issued attempt was supplied for result verification." }
    try { return { status: "released", data: await bffClient.action<ResultPayload>("student-attempt-results", { params: { attemptId } }) } }
    catch (error) {
      if (error instanceof ApiError && error.status === 403) return { status: "pending", manual: false }
      if (error instanceof ApiError && error.status === 409) return { status: "pending", manual: true }
      return { status: "error", message: error instanceof Error ? error.message : "The attempt status could not be verified." }
    }
  }, [attemptId])
  const [state, setState] = useState<State>({ status: "loading" })
  useEffect(() => { let active = true; void load().then((next) => { if (active) setState(next) }); return () => { active = false } }, [load])
  if (state.status === "loading") return <Shell icon={<LoaderCircle className="h-10 w-10 animate-spin" />} title="Confirming your attempt" message="Checking the server for submission and result status…" />
  if (state.status === "error") return <Shell icon={<RefreshCw className="h-10 w-10" />} title="Status unavailable" message={state.message} action={() => { setState({ status: "loading" }); void load().then(setState) }} />
  if (state.status === "pending") return <Shell icon={state.manual ? <Clock3 className="h-10 w-10" /> : <ShieldCheck className="h-10 w-10" />} title={state.manual ? "Result being finalized" : "Attempt received"} message={state.manual ? "Your submission is confirmed. One or more answers still require teacher grading, so no score is shown yet." : "Your submission is confirmed. The school has not released this result, so no score or pass status is shown yet."} action={() => { setState({ status: "loading" }); void load().then(setState) }} />
  const { attempt, result, breakdown } = state.data
  return <main className="min-h-screen bg-[#F9F5F1] px-4 py-10 sm:px-6"><section className="mx-auto max-w-2xl overflow-hidden rounded-[2rem] border border-[#E8D9CB] bg-white shadow-xl"><div className="bg-[#8B0000] px-7 py-8 text-center text-white"><CheckCircle2 className="mx-auto h-12 w-12" /><p className="mt-4 text-xs font-bold uppercase tracking-[.2em] text-white/65">Server-verified result</p><h1 className="mt-2 text-3xl font-bold">{attempt.exam?.title || "Examination complete"}</h1></div><div className="p-7 sm:p-9"><div className="text-center"><div className="text-5xl font-bold text-gray-950">{result.percentage == null ? "—" : `${result.percentage}%`}</div><p className="mt-2 text-sm text-gray-500">{attempt.score == null || result.max_marks == null ? "Final score unavailable" : `${attempt.score} of ${result.max_marks} marks`}</p>{result.passed != null ? <span className={`mt-4 inline-flex rounded-full px-4 py-2 text-sm font-bold ${result.passed ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>{result.passed ? "Passed" : "Not passed"}{result.grade ? ` · Grade ${result.grade}` : ""}</span> : result.grade ? <span className="mt-4 inline-flex rounded-full bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700">Grade {result.grade}</span> : null}</div><div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4"><Metric label="Answered" value={breakdown.answered} /><Metric label="Unanswered" value={breakdown.unanswered} /><Metric label="Correct" value={breakdown.correct} /><Metric label="Partial" value={breakdown.partial} /></div><p className="mt-5 text-center text-xs leading-5 text-gray-500">All score, percentage, grade and pass information above was returned by the school server. No threshold was calculated in this browser.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link href="/student/dashboard" className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#B22234] px-5 font-bold text-white"><Home className="h-4 w-4" /> Dashboard</Link></div></div></section></main>
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl bg-gray-50 p-4 text-center"><div className="text-2xl font-bold">{value}</div><div className="mt-1 text-xs text-gray-500">{label}</div></div> }
function Shell({ icon, title, message, action }: { icon: ReactNode; title: string; message: string; action?: () => void }) { return <main className="min-h-screen bg-[#F9F5F1] px-4 py-16"><section className="mx-auto max-w-xl rounded-3xl border border-[#E8D9CB] bg-white p-8 text-center shadow-sm"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF0F0] text-[#8B1D2C]">{icon}</div><h1 className="mt-5 text-2xl font-bold">{title}</h1><p className="mt-3 text-sm leading-6 text-gray-600">{message}</p>{action ? <button type="button" onClick={action} className="mt-6 rounded-full bg-[#8B1D2C] px-5 py-3 text-sm font-bold text-white">Check again</button> : null}<Link href="/student/dashboard" className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#D9C6B2] px-5 text-sm font-bold text-gray-700"><Home className="h-4 w-4" /> Dashboard</Link></section></main> }
