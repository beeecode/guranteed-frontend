"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, CheckCircle2, Clock3, LoaderCircle, RefreshCw, ShieldCheck } from "lucide-react"
import { ApiError } from "@/lib/api/core"
import { bffClient } from "@/lib/api/bffClient"
import type { ExamPreviewPayload } from "./types"

type State = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; data: ExamPreviewPayload }

export function IntegratedExamInstructions({ examId }: { examId: string }) {
  const router = useRouter()
  const [state, setState] = useState<State>({ status: "loading" })
  const [starting, setStarting] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [startError, setStartError] = useState("")
  const load = useCallback(async (): Promise<State> => {
    try {
      const data = await bffClient.action<ExamPreviewPayload>("student-exam-preview", { params: { examId } })
      return { status: "ready", data }
    } catch (error) {
      return { status: "error", message: error instanceof Error ? error.message : "The examination preview could not be loaded." }
    }
  }, [examId])
  useEffect(() => { let active = true; void load().then((next) => { if (active) setState(next) }); return () => { active = false } }, [load])

  const begin = async () => {
    setStarting(true); setStartError("")
    try {
      const data = await bffClient.action<{ attempt: { id: number } }>("student-attempt-start", { payload: { examId: Number(examId) } })
      router.push(`/student/exam/${encodeURIComponent(examId)}?attempt=${encodeURIComponent(String(data.attempt.id))}`)
    } catch (error) {
      if (error instanceof ApiError && error.code === "EXAM_ALREADY_SUBMITTED") router.push(`/student/exam/${encodeURIComponent(examId)}/submitted`)
      else setStartError(error instanceof Error ? error.message : "The attempt could not be started.")
      setStarting(false)
    }
  }

  if (state.status === "loading") return <Status icon={<LoaderCircle className="h-7 w-7 animate-spin" />} title="Checking examination access" message="Confirming eligibility without starting your timer…" />
  if (state.status === "error") return <Status icon={<RefreshCw className="h-7 w-7" />} title="Preview unavailable" message={state.message} action={() => { setState({ status: "loading" }); void load().then(setState) }} />
  const { exam, questionCount, canStart, reason, existingAttempt } = state.data
  const resumable = existingAttempt?.status === "ongoing"
  return <main className="min-h-screen bg-[#F9F5F1] px-4 py-8 sm:px-6"><div className="mx-auto max-w-3xl"><div className="rounded-[2rem] bg-[#8B0000] p-7 text-white shadow-lg sm:p-10"><div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold"><ShieldCheck className="h-4 w-4" /> Secure examination</div><h1 className="text-3xl font-bold leading-tight sm:text-4xl">{exam.title}</h1><p className="mt-2 text-white/70">{exam.subject?.name || "School assessment"}</p></div>
    <section className="mt-5 grid gap-3 sm:grid-cols-3"><Fact icon={<Clock3 />} label="Duration" value={`${exam.duration_mins} minutes`} /><Fact icon={<BookOpen />} label="Questions" value={String(questionCount)} /><Fact icon={<CheckCircle2 />} label="Total marks" value={String(exam.total_marks)} /></section>
    <section className="mt-5 rounded-3xl border border-[#E8D9CB] bg-white p-6 shadow-sm sm:p-8"><h2 className="text-xl font-bold text-gray-950">Before you begin</h2><ul className="mt-5 space-y-3 text-sm leading-6 text-gray-700"><li>• Your timer starts only after the server creates or resumes your attempt.</li><li>• Each answer is saved securely. Wait for the “Saved” indicator before leaving.</li><li>• Keep this page open. Unsaved changes exist only on this page and can be lost.</li><li>• Submission is final. Your result is shown only when the school releases it.</li></ul>
      {!canStart ? <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{reason || "This examination cannot be started right now."}</div> : <><label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700"><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="mt-1 h-4 w-4 accent-[#8B1D2C]" /><span>I have read the instructions and understand that only server-saved answers can be recovered.</span></label>{startError ? <p role="alert" className="mt-4 text-sm font-medium text-red-700">{startError}</p> : null}<button type="button" disabled={!agreed || starting} onClick={begin} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#B22234] px-6 py-3 font-bold text-white shadow-lg transition hover:bg-[#971c2c] focus:outline-none focus:ring-2 focus:ring-[#8B1D2C] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">{starting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}{starting ? "Starting securely…" : resumable ? "Resume examination" : "Start examination"}</button></>}
    </section></div></main>
}

function Fact({ icon, label, value }: { icon: ReactNode; label: string; value: string }) { return <div className="rounded-2xl border border-[#E8D9CB] bg-white p-5 shadow-sm"><div className="mb-3 h-5 w-5 text-[#8B1D2C]">{icon}</div><div className="text-xl font-bold text-gray-950">{value}</div><div className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</div></div> }
function Status({ icon, title, message, action }: { icon: ReactNode; title: string; message: string; action?: () => void }) { return <main className="min-h-screen bg-[#F9F5F1] px-4 py-16"><section className="mx-auto max-w-xl rounded-3xl border border-[#E8D9CB] bg-white p-8 text-center shadow-sm"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0F0] text-[#8B1D2C]">{icon}</div><h1 className="mt-4 text-2xl font-bold">{title}</h1><p className="mt-3 text-sm leading-6 text-gray-600">{message}</p>{action ? <button type="button" onClick={action} className="mt-6 rounded-full bg-[#8B1D2C] px-5 py-3 text-sm font-bold text-white">Try again</button> : null}</section></main> }
