"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { AlertTriangle, Award, CheckCircle2, Clock3, LoaderCircle } from "lucide-react"
import { ApiError } from "@/lib/api/core"
import { bffClient } from "@/lib/api/bffClient"

interface ResultPayload {
  bundle: { id: number; session_name: string }
  subjects: Array<{ attempt_id: number; title?: string; subject: string; score: number | null; total_marks: number; percentage: number | null; pass_mark: number; passed: boolean | null; grade: string | null; pending_manual: boolean }>
  pending_manual: boolean
  percentage: number | null
  grade: string | null
}
type State = { status: "loading" } | { status: "pending"; message: string } | { status: "error"; message: string } | { status: "ready"; data: ResultPayload }

export function IntegratedBundleResults({ bundleId }: { bundleId: string }) {
  const [state, setState] = useState<State>({ status: "loading" })
  const load = useCallback(async () => {
    setState({ status: "loading" })
    try { setState({ status: "ready", data: await bffClient.action<ResultPayload>("student-bundle-results", { params: { sessionId: bundleId } }) }) }
    catch (error) {
      if (error instanceof ApiError && [403, 409].includes(error.status)) setState({ status: "pending", message: error.message })
      else setState({ status: "error", message: error instanceof Error ? error.message : "Results could not be loaded." })
    }
  }, [bundleId])
  useEffect(() => { void load() }, [load])
  if (state.status === "loading") return <Status icon={<LoaderCircle className="animate-spin" />} title="Checking result release" message="Loading only scores authorized by the server…" />
  if (state.status === "pending") return <Status icon={<Clock3 />} title="Results not available yet" message={state.message} footer={<Link href={`/student/bundle/${encodeURIComponent(bundleId)}/overview`} className="font-bold text-[#8B1D2C] underline">Return to bundle</Link>} />
  if (state.status === "error") return <Status icon={<AlertTriangle />} title="Results unavailable" message={state.message} footer={<button type="button" onClick={() => void load()} className="font-bold text-[#8B1D2C] underline">Try again</button>} />
  const result = state.data
  return <main className="min-h-screen bg-[#F9F5F1] px-4 py-10 text-gray-950 sm:px-6"><div className="mx-auto max-w-5xl"><section className="rounded-[2rem] bg-[#710E1B] p-7 text-white shadow-xl sm:p-10"><div className="flex items-start justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-white/65">Released bundle result</p><h1 className="mt-3 text-3xl font-black sm:text-4xl">{result.bundle.session_name}</h1></div><Award className="h-10 w-10 text-[#F0C987]" /></div><div className="mt-7 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-white/10 p-5"><p className="text-xs text-white/65">Overall percentage</p><p className="mt-1 text-3xl font-black">{result.percentage == null ? "Pending" : `${result.percentage}%`}</p></div><div className="rounded-2xl bg-white/10 p-5"><p className="text-xs text-white/65">Grade</p><p className="mt-1 text-3xl font-black">{result.grade ?? "Not defined"}</p></div></div></section>{result.pending_manual ? <div role="status" className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><Clock3 className="h-5 w-5 shrink-0" />Some subjects are awaiting manual grading. Totals may update after grading is complete.</div> : null}<section className="mt-6 rounded-3xl border border-[#E8D9CB] bg-white p-5 shadow-sm sm:p-7"><h2 className="text-2xl font-bold">Subject results</h2><div className="mt-5 space-y-3">{result.subjects.map((subject) => <article key={subject.attempt_id} className="grid gap-3 rounded-2xl border border-[#EEE3D8] p-4 sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="font-bold">{subject.subject}</p><p className="mt-1 text-xs text-gray-500">{subject.title}</p></div><div className="flex flex-wrap items-center gap-3 text-sm"><span className="font-bold">{subject.pending_manual ? "Manual grading pending" : subject.score == null ? "Unavailable" : `${subject.score}/${subject.total_marks}`}</span><span className="rounded-full bg-gray-100 px-3 py-1 font-semibold">{subject.percentage == null ? "—" : `${subject.percentage}%`}</span><span className="rounded-full bg-gray-100 px-3 py-1 font-semibold">{subject.grade ?? "Grade not defined"}</span>{subject.passed == null ? null : subject.passed ? <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-label="Passed" /> : <AlertTriangle className="h-5 w-5 text-amber-600" aria-label="Did not meet pass mark" />}</div></article>)}</div></section></div></main>
}

function Status({ icon, title, message, footer }: { icon: ReactNode; title: string; message: string; footer?: ReactNode }) { return <main className="min-h-screen bg-[#F9F5F1] px-4 py-16"><section className="mx-auto max-w-xl rounded-3xl border border-[#E8D9CB] bg-white p-8 text-center shadow-sm"><span className="mx-auto block w-fit text-[#8B1D2C] [&>svg]:h-8 [&>svg]:w-8">{icon}</span><h1 className="mt-4 text-2xl font-bold">{title}</h1><p className="mt-3 text-sm leading-6 text-gray-600">{message}</p>{footer ? <div className="mt-6">{footer}</div> : null}</section></main> }
