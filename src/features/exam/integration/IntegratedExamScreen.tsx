"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, Bookmark, Check, ChevronLeft, ChevronRight, LoaderCircle, Menu, Save, Send, X } from "lucide-react"
import { ApiError } from "@/lib/api/core"
import { bffClient } from "@/lib/api/bffClient"
import { isRetryableSaveError, QuestionSaveRevision, retryDelayMs, secondsUntil, serverOffset, UnsavedDraftStore, validTiming } from "./runtime"
import type { AnswerDraft, AttemptPayload, SaveState } from "./types"

type LoadState = { status: "loading" } | { status: "error"; message: string; completed?: boolean } | { status: "ready"; data: AttemptPayload }

interface SubmissionStrategy {
  action: "student-attempt-submit" | "student-bundle-submit-current"
  params: Record<string, unknown>
  successPath: (result: unknown) => string
  reconciledPath: string
  recoveryPath?: string
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))
const browserStorage = () => { try { return typeof window === "undefined" ? null : window.localStorage } catch { return null } }
const LOCKING_STATUSES = [400, 401, 410, 423]

export function IntegratedExamScreen({ examId, attemptId, submission }: { examId: string; attemptId?: string; submission?: SubmissionStrategy }) {
  const router = useRouter()
  const [state, setState] = useState<LoadState>({ status: "loading" })
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, AnswerDraft>>({})
  const [saveStates, setSaveStates] = useState<Record<number, SaveState>>({})
  const [seconds, setSeconds] = useState(0)
  const [offset, setOffset] = useState(0)
  const [timing, setTiming] = useState<AttemptPayload["timing"] | null>(null)
  const [locked, setLocked] = useState(false)
  const [notice, setNotice] = useState("")
  const [navOpen, setNavOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uncertainSubmit, setUncertainSubmit] = useState(false)
  const submittedPath = submission?.reconciledPath ?? `/student/exam/${encodeURIComponent(examId)}/submitted?attempt=${encodeURIComponent(attemptId || "")}`
  const recoveryPath = submission?.recoveryPath ?? `/student/exam/${encodeURIComponent(examId)}/instructions`
  const drafts = useRef<Record<number, AnswerDraft>>({})
  const revisions = useRef(new QuestionSaveRevision())
  const inFlight = useRef(new Set<number>())
  // Stage 11 (exam-day safety): refs read inside long-running async loops, where React
  // state would be stale.
  const mounted = useRef(true)
  const submittingRef = useRef(false)
  const expiryHandled = useRef(false)
  const timingRef = useRef<{ timing: AttemptPayload["timing"] | null; offset: number }>({ timing: null, offset: 0 })
  const draftStore = useRef<UnsavedDraftStore | null>(null)

  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  useEffect(() => { timingRef.current = { timing, offset } }, [timing, offset])

  const load = useCallback(async (): Promise<LoadState> => {
    if (!attemptId) return { status: "error", message: "No server-issued attempt was supplied." }
    try {
      const data = await bffClient.action<AttemptPayload>("student-attempt-get", { params: { attemptId } })
      if (!validTiming(data.timing)) throw new Error("The server returned invalid examination timing.")
      return { status: "ready", data }
    } catch (error) {
      const completed = error instanceof ApiError && (error.code === "EXAM_ALREADY_SUBMITTED" || error.status === 410)
      return { status: "error", message: error instanceof Error ? error.message : "The attempt could not be loaded.", completed }
    }
  }, [attemptId])

  const reconcileAttempt = useCallback(async () => {
    if (!attemptId) return
    try {
      await bffClient.action("student-attempt-get", { params: { attemptId } })
      setNotice("The server still reports this attempt as active. Review saved answers before choosing Submit again.")
      setUncertainSubmit(false)
    } catch (error) {
      if (error instanceof ApiError && (error.code === "EXAM_ALREADY_SUBMITTED" || error.status === 410)) {
        draftStore.current?.clear()
        router.replace(submittedPath)
      } else setNotice(error instanceof Error ? error.message : "The attempt status could not be confirmed.")
    }
  }, [attemptId, router, submittedPath])

  // One save loop per question: sends the latest draft, retries transient failures with
  // backoff until the server acknowledges the newest revision, and keeps the local copy
  // until then. A stale acknowledgement never marks a newer answer as saved.
  const saveQuestion = useCallback(async (questionId: number) => {
    if (!attemptId || inFlight.current.has(questionId)) return
    inFlight.current.add(questionId)
    let failures = 0
    try {
      while (mounted.current && !revisions.current.isSaved(questionId)) {
        const revision = revisions.current.latest(questionId)
        const answer = drafts.current[questionId]
        setSaveStates((value) => ({ ...value, [questionId]: failures ? "failed" : "saving" }))
        try {
          await bffClient.action("student-answers-save", { params: { attemptId }, payload: { answers: [answer] } })
          failures = 0
          revisions.current.acknowledge(questionId, revision)
          const saved = revisions.current.isSaved(questionId)
          if (saved) draftStore.current?.remove(questionId)
          setSaveStates((value) => ({ ...value, [questionId]: saved ? "saved" : "unsaved" }))
        } catch (error) {
          const status = error instanceof ApiError ? error.status : undefined
          setSaveStates((value) => ({ ...value, [questionId]: "failed" }))
          if (!isRetryableSaveError(status)) {
            if (status !== undefined && LOCKING_STATUSES.includes(status)) {
              setLocked(true)
              setNotice(status === 401
                ? "Your sign-in has expired. Answers not yet saved are kept on this device; sign in again to continue."
                : error instanceof Error ? error.message : "Saving is no longer possible for this attempt.")
            }
            break
          }
          failures += 1
          await sleep(retryDelayMs(failures))
        }
      }
    } finally { inFlight.current.delete(questionId) }
  }, [attemptId])

  useEffect(() => {
    if (!attemptId) { router.replace(recoveryPath); return }
    draftStore.current = new UnsavedDraftStore(attemptId, browserStorage())
    let active = true
    void load().then((next) => {
      if (!active) return
      let restored: AnswerDraft[] = []
      if (next.status === "ready") {
        const initial: Record<number, AnswerDraft> = Object.fromEntries(next.data.answers.map((answer) => [answer.question_id, answer]))
        // Answers changed on this device but never acknowledged (crash, reload, expired
        // sign-in) are restored over the server copy and re-sent.
        const questionIds = new Set(next.data.questions.map((question) => question.id))
        restored = Object.values(draftStore.current?.load() ?? {}).filter((draft) => questionIds.has(draft.question_id))
        for (const draft of restored) { initial[draft.question_id] = draft; revisions.current.change(draft.question_id) }
        drafts.current = initial
        setAnswers(initial)
        setSaveStates({
          ...Object.fromEntries(next.data.questions.map((question) => [question.id, "saved" as SaveState])),
          ...Object.fromEntries(restored.map((draft) => [draft.question_id, "unsaved" as SaveState])),
        })
        setTiming(next.data.timing)
        setOffset(serverOffset(next.data.serverTime))
      } else if (next.status === "error" && next.completed) draftStore.current?.clear()
      setState(next)
      for (const draft of restored) void saveQuestion(draft.question_id)
    })
    return () => { active = false }
  }, [attemptId, load, recoveryPath, router, saveQuestion])

  const performSubmit = useCallback(async (automatic: boolean) => {
    if (!attemptId || submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true); setUncertainSubmit(false)
    if (!automatic) setNotice("")
    try {
      // attempt_id lets the server treat a retry of an already-submitted bundle subject
      // as a no-op instead of submitting the next subject.
      const result = await bffClient.action<unknown>(submission?.action ?? "student-attempt-submit", {
        params: submission?.params ?? { attemptId },
        payload: { attempt_id: Number(attemptId) },
      })
      draftStore.current?.clear()
      router.replace(submission?.successPath(result) ?? submittedPath)
    } catch (error) {
      submittingRef.current = false
      if (error instanceof ApiError && (error.code === "EXAM_ALREADY_SUBMITTED" || error.status === 410)) { draftStore.current?.clear(); router.replace(submittedPath); return }
      if (error instanceof ApiError && error.status === 503) { setNotice("Submission could not be confirmed. It was not replayed automatically."); setUncertainSubmit(true) }
      else setNotice(error instanceof Error ? error.message : "Submission could not be confirmed.")
      setSubmitting(false); setConfirming(false)
      if (automatic) void reconcileAttempt()
    }
  }, [attemptId, reconcileAttempt, router, submission, submittedPath])

  // Time-out: stop new edits, let outstanding saves finish (they keep retrying, and the
  // server accepts saves during its grace window), then submit. Previously the page only
  // locked, leaving the student on a frozen screen until the grace period ended.
  const finishAtExpiry = useCallback(async () => {
    if (expiryHandled.current) return
    expiryHandled.current = true
    setNotice("Time is up. Saving your last answers and submitting…")
    const deadline = () => {
      const { timing: current, offset: skew } = timingRef.current
      return current ? current.saveGraceEndsAt - skew - 5_000 : Date.now()
    }
    const pending = () => Object.keys(drafts.current).some((id) => !revisions.current.isSaved(Number(id)))
    while (mounted.current && pending() && inFlight.current.size > 0 && Date.now() < deadline()) await sleep(500)
    if (mounted.current) await performSubmit(true)
  }, [performSubmit])

  useEffect(() => {
    if (!timing || locked) return
    const update = () => {
      const remaining = secondsUntil(timing.expiresAt, offset)
      setSeconds(remaining)
      if (remaining === 0) { setLocked(true); void finishAtExpiry() }
    }
    update(); const interval = window.setInterval(update, 1000)
    return () => window.clearInterval(interval)
  }, [timing, offset, locked, finishAtExpiry])

  useEffect(() => {
    if (!attemptId || state.status !== "ready" || locked) return
    let active = true; let busy = false
    const beat = async () => {
      if (busy) return
      busy = true
      try {
        const result = await bffClient.action<{ serverTime: string; timing: AttemptPayload["timing"] }>("student-heartbeat", { params: { attemptId } })
        if (active && validTiming(result.timing)) { setTiming(result.timing); setOffset(serverOffset(result.serverTime)) }
      } catch (error) {
        if (active && error instanceof ApiError && LOCKING_STATUSES.includes(error.status)) { setLocked(true); setNotice(error.message) }
      } finally { busy = false }
    }
    const interval = window.setInterval(() => { void beat() }, 15_000)
    return () => { active = false; window.clearInterval(interval) }
  }, [attemptId, state.status, locked])

  useEffect(() => {
    if (!attemptId || state.status !== "ready") return
    const visibility = () => { if (document.hidden) void bffClient.action("student-security-event", { params: { attemptId }, payload: { event_type: "tab_hidden", detail: "visibilitychange" } }).catch(() => undefined) }
    document.addEventListener("visibilitychange", visibility)
    return () => document.removeEventListener("visibilitychange", visibility)
  }, [attemptId, state.status])

  const change = (questionId: number, update: Partial<AnswerDraft>) => {
    if (locked) return
    const previous = drafts.current[questionId] ?? { question_id: questionId, selected_option_id: null, answer_text: null, is_marked_for_review: false }
    const next = { ...previous, ...update }
    drafts.current = { ...drafts.current, [questionId]: next }
    draftStore.current?.put(next)
    setAnswers(drafts.current)
    revisions.current.change(questionId)
    setSaveStates((value) => ({ ...value, [questionId]: "unsaved" }))
    void saveQuestion(questionId)
  }

  const submit = async () => {
    if (!attemptId || submittingRef.current) return
    if (Object.values(saveStates).some((value) => value !== "saved")) { setNotice("Wait for every answer to show Saved, or retry any failed save, before submitting."); setConfirming(false); return }
    await performSubmit(false)
  }

  if (state.status === "loading") return <ExamStatus title="Loading secure attempt" message="Restoring server-saved answers and authoritative timing…" loading />
  if (state.status === "error") return <ExamStatus title={state.completed ? "Attempt no longer active" : "Attempt unavailable"} message={state.message} action={state.completed ? () => router.replace(submittedPath) : () => { setState({ status: "loading" }); void load().then(setState) }} actionLabel={state.completed ? "Check progress" : "Try again"} />
  const { questions, attempt, passages } = state.data
  const question = questions[current]
  if (!question) return <ExamStatus title="No questions available" message="The server did not return a question set for this attempt." />
  const answer = answers[question.id]
  const saveState = saveStates[question.id] ?? "saved"
  const answered = questions.filter((item) => { const value = answers[item.id]; return value?.selected_option_id != null || Boolean(value?.answer_text?.trim()) }).length
  const flagged = questions.filter((item) => answers[item.id]?.is_marked_for_review).length
  const passage = passages.find((item) => item.id === question.passage_id)
  return <div className="min-h-screen bg-[#F9F5F1] text-gray-950"><header className="sticky top-0 z-30 flex items-center gap-3 bg-[#8B0000] px-4 py-3 text-white shadow-md sm:px-6"><button type="button" onClick={() => setNavOpen(true)} className="rounded-xl p-2 hover:bg-white/10 lg:hidden" aria-label="Open question navigator"><Menu /></button><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{attempt.exam?.title || "Examination"}</p><p className="text-xs text-white/65">Question {current + 1} of {questions.length}</p></div><div className={`rounded-xl px-3 py-2 font-mono text-lg font-bold ${seconds < 300 ? "bg-red-600" : "bg-white/10"}`}>{formatTime(seconds)}</div><button type="button" disabled={locked || submitting} onClick={() => setConfirming(true)} className="hidden min-h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-bold text-[#8B0000] disabled:opacity-50 sm:inline-flex"><Send className="h-4 w-4" /> Submit</button></header>
    <div className="h-1 bg-[#E8D9CB]"><div className="h-full bg-emerald-600 transition-all" style={{ width: `${questions.length ? (answered / questions.length) * 100 : 0}%` }} /></div>
    {notice ? <div role="alert" className="mx-auto mt-4 flex max-w-4xl items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><AlertTriangle className="h-5 w-5 shrink-0" /><span className="flex-1">{notice}{uncertainSubmit ? <button type="button" onClick={() => void reconcileAttempt()} className="ml-2 font-bold underline">Check attempt status</button> : null}</span><button onClick={() => { setNotice(""); setUncertainSubmit(false) }} aria-label="Dismiss"><X className="h-4 w-4" /></button></div> : null}
    <div className="mx-auto flex max-w-7xl"><main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-3xl">{passage ? <section className="mb-4 rounded-3xl border border-[#E8D9CB] bg-[#FFFDF9] p-6"><h2 className="font-bold">{passage.title || "Passage"}</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-700">{passage.content || passage.passage_text}</p></section> : null}<section className="rounded-3xl border border-[#E8D9CB] bg-white p-6 shadow-sm sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-[#8B1D2C]">Question {current + 1} · {question.marks} mark{question.marks === 1 ? "" : "s"}</p><h1 className="mt-3 whitespace-pre-wrap text-lg font-semibold leading-8">{question.question_text}</h1></div><button type="button" onClick={() => change(question.id, { is_marked_for_review: !answer?.is_marked_for_review })} disabled={locked} aria-pressed={Boolean(answer?.is_marked_for_review)} className={`rounded-xl p-2 ${answer?.is_marked_for_review ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`} title="Mark for review"><Bookmark className="h-5 w-5" /></button></div>{question.image_url ? <img src={question.image_url} alt="Question illustration" className="mt-5 max-h-80 w-full rounded-2xl object-contain" /> : null}<div className="mt-6">{question.options?.length ? <div className="space-y-3">{question.options.map((option, index) => <button key={option.id} type="button" disabled={locked} onClick={() => change(question.id, { selected_option_id: option.id, answer_text: null })} className={`flex min-h-14 w-full items-center gap-4 rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-[#8B1D2C] ${answer?.selected_option_id === option.id ? "border-[#8B1D2C] bg-[#FFF0F0]" : "border-[#E8D9CB] bg-white hover:border-[#B8967A]"}`}><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${answer?.selected_option_id === option.id ? "bg-[#8B1D2C] text-white" : "bg-gray-100 text-gray-600"}`}>{String.fromCharCode(65 + index)}</span><span className="flex-1">{option.option_text}</span>{answer?.selected_option_id === option.id ? <Check className="h-5 w-5 text-[#8B1D2C]" /> : null}</button>)}</div> : <textarea disabled={locked} value={answer?.answer_text ?? ""} onChange={(event) => change(question.id, { answer_text: event.target.value, selected_option_id: null })} rows={question.question_type === "essay" ? 10 : 4} maxLength={10_000} className="w-full rounded-2xl border border-[#D9C6B2] p-4 leading-7 outline-none focus:border-[#8B1D2C] focus:ring-2 focus:ring-[#8B1D2C]/20" placeholder="Type your answer…" />}</div><div className={`mt-5 flex items-center gap-2 text-xs font-semibold ${saveState === "failed" ? "text-red-700" : saveState === "saved" ? "text-emerald-700" : "text-amber-700"}`}>{saveState === "saving" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : saveState === "saved" ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />} {saveState === "failed" ? <button type="button" onClick={() => void saveQuestion(question.id)} className="underline">Save failed — retry</button> : saveState === "saving" ? "Saving…" : saveState === "unsaved" ? "Waiting to save…" : "Saved"}</div></section>
      <div className="mt-5 flex items-center justify-between"><button type="button" onClick={() => setCurrent((value) => Math.max(0, value - 1))} disabled={current === 0} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#D9C6B2] bg-white px-5 text-sm font-bold disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Previous</button>{current + 1 < questions.length ? <button type="button" onClick={() => setCurrent((value) => Math.min(questions.length - 1, value + 1))} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#B22234] px-5 text-sm font-bold text-white">Next <ChevronRight className="h-4 w-4" /></button> : <button type="button" disabled={locked} onClick={() => setConfirming(true)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#B22234] px-5 text-sm font-bold text-white disabled:opacity-50">Review & submit <Send className="h-4 w-4" /></button>}</div></div></main><Navigator questions={questions} current={current} answers={answers} saveStates={saveStates} onSelect={setCurrent} answered={answered} flagged={flagged} className="hidden lg:block" /></div>
    {navOpen ? <div className="fixed inset-0 z-50 flex bg-black/45 lg:hidden"><button className="flex-1" onClick={() => setNavOpen(false)} aria-label="Close navigator" /><Navigator questions={questions} current={current} answers={answers} saveStates={saveStates} onSelect={(index) => { setCurrent(index); setNavOpen(false) }} answered={answered} flagged={flagged} className="w-80 max-w-[88vw]" /></div> : null}
    {confirming ? <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"><section role="dialog" aria-modal="true" className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl"><h2 className="text-xl font-bold">Submit examination?</h2><p className="mt-3 text-sm leading-6 text-gray-600">You answered {answered} of {questions.length} questions. Submission is final and will be confirmed by the server.</p><div className="mt-6 flex gap-3"><button type="button" onClick={() => setConfirming(false)} className="min-h-11 flex-1 rounded-full border border-[#D9C6B2] font-bold">Keep reviewing</button><button type="button" onClick={() => void submit()} disabled={submitting} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#B22234] font-bold text-white disabled:opacity-50">{submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Confirm</button></div></section></div> : null}</div>
}

function Navigator({ questions, current, answers, saveStates, onSelect, answered, flagged, className }: { questions: AttemptPayload["questions"]; current: number; answers: Record<number, AnswerDraft>; saveStates: Record<number, SaveState>; onSelect: (index: number) => void; answered: number; flagged: number; className?: string }) { return <aside className={`min-h-full border-l border-[#E8D9CB] bg-white p-5 ${className || ""}`}><h2 className="font-bold">Question navigator</h2><p className="mt-1 text-xs text-gray-500">{answered} answered · {flagged} marked</p><div className="mt-5 grid grid-cols-5 gap-2">{questions.map((question, index) => { const answer = answers[question.id]; const hasAnswer = answer?.selected_option_id != null || Boolean(answer?.answer_text?.trim()); return <button key={question.id} type="button" onClick={() => onSelect(index)} className={`relative h-10 rounded-xl text-xs font-bold ${index === current ? "bg-[#8B1D2C] text-white ring-2 ring-[#8B1D2C]/25 ring-offset-2" : hasAnswer ? "bg-emerald-100 text-emerald-900" : "bg-gray-100 text-gray-600"}`}>{index + 1}{answer?.is_marked_for_review ? <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-500" /> : null}{saveStates[question.id] === "failed" ? <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-600" /> : null}</button> })}</div><p className="mt-6 text-xs leading-5 text-gray-500">Only answers showing Saved are recoverable after a refresh.</p></aside> }
function ExamStatus({ title, message, loading = false, action, actionLabel = "Try again" }: { title: string; message: string; loading?: boolean; action?: () => void; actionLabel?: string }) { return <main className="min-h-screen bg-[#F9F5F1] px-4 py-16"><section className="mx-auto max-w-xl rounded-3xl border border-[#E8D9CB] bg-white p-8 text-center shadow-sm">{loading ? <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-[#8B1D2C]" /> : <AlertTriangle className="mx-auto h-8 w-8 text-amber-600" />}<h1 className="mt-4 text-2xl font-bold">{title}</h1><p className="mt-3 text-sm leading-6 text-gray-600">{message}</p>{action ? <button type="button" onClick={action} className="mt-6 rounded-full bg-[#8B1D2C] px-5 py-3 text-sm font-bold text-white">{actionLabel}</button> : null}</section></main> }
const formatTime = (value: number) => `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`
