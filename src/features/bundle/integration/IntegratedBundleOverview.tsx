"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, ArrowRight, BookOpen, CheckCircle2, Clock3, LoaderCircle, Play } from "lucide-react"
import { ApiError } from "@/lib/api/core"
import { bffClient } from "@/lib/api/bffClient"
import type { BundlePayload } from "./types"

type State = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; data: BundlePayload }
const dateLabel = (value?: string | null) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Not specified"

export function IntegratedBundleOverview({ bundleId }: { bundleId: string }) {
  const router = useRouter()
  const [state, setState] = useState<State>({ status: "loading" })
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState("")
  const load = useCallback(async () => {
    setState({ status: "loading" })
    try { setState({ status: "ready", data: await bffClient.action<BundlePayload>("student-bundle-get", { params: { sessionId: bundleId } }) }) }
    catch (error) { setState({ status: "error", message: error instanceof Error ? error.message : "This bundle could not be loaded." }) }
  }, [bundleId])
  useEffect(() => { void load() }, [load])

  const begin = async (skip = false) => {
    if (state.status !== "ready" || busy) return
    setBusy(true); setNotice("")
    const current = state.data.sessionAttempt
    const action = current && ["on_break", "between_subjects"].includes(current.status) ? "student-bundle-continue" : "student-bundle-start"
    try {
      const data = await bffClient.action<BundlePayload>(action, { params: { sessionId: bundleId }, payload: skip ? { skip: true } : undefined })
      const attempt = data.subjectAttempt ?? data.currentAttempt
      if (attempt?.id && data.sessionAttempt?.id) router.push(`/student/bundle/${encodeURIComponent(bundleId)}/exam?attempt=${encodeURIComponent(attempt.id)}&sessionAttempt=${encodeURIComponent(data.sessionAttempt.id)}`)
      else if (["completed", "force_submitted"].includes(data.sessionAttempt?.status ?? "")) router.push(`/student/bundle/${encodeURIComponent(bundleId)}/results`)
      else { setState({ status: "ready", data }); setNotice("The server updated your bundle state. Continue when the next subject becomes available.") }
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : "The server did not confirm this action. It was not repeated automatically.")
    } finally { setBusy(false) }
  }

  if (state.status === "loading") return <Status loading title="Loading your exam journey" message="Checking eligibility and server-saved progress…" />
  if (state.status === "error") return <Status title="Bundle unavailable" message={state.message} action={() => void load()} />
  const { bundle, sessionAttempt, subjectAttempts = [], availability } = state.data
  const completed = subjectAttempts.filter((item) => item.status === "submitted").length
  const currentLink = bundle.session_exams.find((item) => item.id === sessionAttempt?.current_session_exam_id)
  const finished = ["completed", "force_submitted"].includes(sessionAttempt?.status ?? "")
  const waiting = ["on_break", "between_subjects"].includes(sessionAttempt?.status ?? "")
  const canAct = Boolean(sessionAttempt) || availability?.canStart !== false
  const duration = bundle.session_exams.reduce((sum, item) => sum + Number(item.duration_override ?? item.exam?.duration_mins ?? 0), 0)
  return <main className="min-h-screen bg-[#F9F5F1] px-4 py-8 text-gray-950 sm:px-6 sm:py-12"><div className="mx-auto max-w-5xl"><section className="overflow-hidden rounded-[2rem] bg-[#710E1B] p-6 text-white shadow-xl sm:p-10"><p className="text-xs font-bold uppercase tracking-[0.22em] text-white/65">Multi-subject examination</p><h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">{bundle.session_name}</h1>{bundle.description ? <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">{bundle.description}</p> : null}<div className="mt-7 grid gap-3 sm:grid-cols-3"><Metric icon={<BookOpen />} value={`${bundle.session_exams.length}`} label="Subjects" /><Metric icon={<Clock3 />} value={`${duration || "—"} min`} label="Combined duration" /><Metric icon={<CheckCircle2 />} value={`${completed}/${bundle.session_exams.length}`} label="Completed" /></div></section>
    {notice ? <div role="alert" className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><AlertTriangle className="h-5 w-5 shrink-0" /><span>{notice}</span></div> : null}
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]"><section className="rounded-3xl border border-[#E8D9CB] bg-white p-5 shadow-sm sm:p-7"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-[#8B1D2C]">Your subjects</p><h2 className="mt-1 text-2xl font-bold">Server-controlled order</h2></div><span className="text-sm capitalize text-gray-500">{bundle.status}</span></div><ol className="mt-6 space-y-3">{bundle.session_exams.map((link, index) => { const attempt = subjectAttempts.find((item) => item.session_exam_id === link.id); const active = link.id === sessionAttempt?.current_session_exam_id; return <li key={link.id} className={`flex items-center gap-4 rounded-2xl border p-4 ${active ? "border-[#B22234] bg-[#FFF7F6]" : "border-[#EEE3D8]"}`}><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full font-bold ${attempt?.status === "submitted" ? "bg-emerald-100 text-emerald-800" : active ? "bg-[#8B1D2C] text-white" : "bg-gray-100 text-gray-600"}`}>{attempt?.status === "submitted" ? <CheckCircle2 className="h-5 w-5" /> : index + 1}</span><div className="min-w-0 flex-1"><p className="truncate font-bold">{link.exam?.subject?.name || link.exam?.title || `Subject ${index + 1}`}</p><p className="mt-1 text-xs text-gray-500">{link.exam?.title} · {link.duration_override ?? link.exam?.duration_mins ?? "—"} minutes</p></div>{active ? <span className="rounded-full bg-[#F7DDE0] px-3 py-1 text-xs font-bold text-[#710E1B]">Current</span> : null}</li> })}</ol></section>
      <aside className="h-fit rounded-3xl border border-[#E8D9CB] bg-[#FFFDF9] p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-[#8B1D2C]">Current status</p><h2 className="mt-2 text-xl font-bold capitalize">{(sessionAttempt?.status || (availability?.canStart ? "Ready to start" : "Unavailable")).replace(/_/g, " ")}</h2>{currentLink ? <p className="mt-2 text-sm text-gray-600">Next: {currentLink.exam?.subject?.name || currentLink.exam?.title}</p> : null}<dl className="mt-5 space-y-3 border-y border-[#E8D9CB] py-5 text-sm"><div className="flex justify-between gap-4"><dt className="text-gray-500">Opens</dt><dd className="text-right font-semibold">{dateLabel(bundle.starts_at)}</dd></div><div className="flex justify-between gap-4"><dt className="text-gray-500">Closes</dt><dd className="text-right font-semibold">{dateLabel(bundle.ends_at)}</dd></div></dl>{availability?.reason && !canAct ? <p className="mt-4 text-sm leading-6 text-amber-800">{availability.reason}</p> : null}{finished ? <button type="button" onClick={() => router.push(`/student/bundle/${encodeURIComponent(bundleId)}/results`)} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#8B1D2C] px-5 font-bold text-white">View result status <ArrowRight className="h-4 w-4" /></button> : <button type="button" disabled={!canAct || busy} onClick={() => void begin(false)} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#8B1D2C] px-5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{busy ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}{waiting ? "Continue to next subject" : sessionAttempt ? "Resume current subject" : "Start bundle"}</button>}{waiting && bundle.break_mode === "timed" && bundle.allow_skip_break ? <button type="button" disabled={busy} onClick={() => void begin(true)} className="mt-3 min-h-11 w-full rounded-full border border-[#C9AD93] px-4 text-sm font-bold text-[#710E1B]">Skip permitted break</button> : null}</aside></div></div></main>
}

function Metric({ icon, value, label }: { icon: ReactNode; value: string; label: string }) { return <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4"><span className="[&>svg]:h-5 [&>svg]:w-5">{icon}</span><div><p className="font-bold">{value}</p><p className="text-xs text-white/65">{label}</p></div></div> }
function Status({ loading, title, message, action }: { loading?: boolean; title: string; message: string; action?: () => void }) { return <main className="min-h-screen bg-[#F9F5F1] px-4 py-16"><section className="mx-auto max-w-xl rounded-3xl border border-[#E8D9CB] bg-white p-8 text-center shadow-sm">{loading ? <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-[#8B1D2C]" /> : <AlertTriangle className="mx-auto h-8 w-8 text-amber-600" />}<h1 className="mt-4 text-2xl font-bold">{title}</h1><p className="mt-3 text-sm leading-6 text-gray-600">{message}</p>{action ? <button type="button" onClick={action} className="mt-6 rounded-full bg-[#8B1D2C] px-5 py-3 text-sm font-bold text-white">Try again</button> : null}</section></main> }
