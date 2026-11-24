"use client"

/**
 * Server-authoritative state for ONE exam attempt (a standalone exam or one bundle
 * subject). Stage 11: this holds the exam-day safety logic that used to live inside the
 * plain IntegratedExamScreen, so the designed screens can be driven by real data:
 *
 *  - one save loop per question; a stale acknowledgement never marks a newer answer
 *    saved (QuestionSaveRevision);
 *  - transient save failures retry automatically with backoff;
 *  - unacknowledged answers are kept on the device and re-sent after a reload/crash;
 *  - the timer follows the server deadline (with clock-offset correction + heartbeat);
 *  - at time-out: lock edits, let pending saves finish within the server grace window,
 *    then submit automatically;
 *  - submit is single-flight and sends attempt_id, so a retry can never submit a
 *    different subject.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { ApiError } from "@/lib/api/core"
import { bffClient } from "@/lib/api/bffClient"
import {
  isRetryableSaveError,
  QuestionSaveRevision,
  retryDelayMs,
  secondsUntil,
  serverOffset,
  UnsavedDraftStore,
  validTiming,
} from "../integration/runtime"
import type { AnswerDraft, AttemptPayload, SaveState } from "../integration/types"

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))
const browserStorage = () => { try { return typeof window === "undefined" ? null : window.localStorage } catch { return null } }
const LOCKING_STATUSES = [400, 401, 410, 423]
const isFinished = (error: unknown) => error instanceof ApiError && (error.code === "EXAM_ALREADY_SUBMITTED" || error.status === 410)

export type LiveAttemptStatus = "loading" | "ready" | "error" | "finished"

export interface LiveAttemptOptions {
  /** Performs the server submit for this attempt (bundle or standalone endpoint). */
  submit: (attemptId: number) => Promise<unknown>
  /** Called once the server has confirmed the attempt is submitted (by us or already). */
  onSubmitted: (result: unknown) => void
}

/** Mount once per attempt (render the consumer with key={attemptId}); state starts fresh. */
export function useLiveAttempt(attemptId: string, options: LiveAttemptOptions) {
  const [status, setStatus] = useState<LiveAttemptStatus>("loading")
  const [error, setError] = useState("")
  const [data, setData] = useState<AttemptPayload | null>(null)
  const [answers, setAnswers] = useState<Record<number, AnswerDraft>>({})
  const [saveStates, setSaveStates] = useState<Record<number, SaveState>>({})
  const [seconds, setSeconds] = useState(0)
  const [offset, setOffset] = useState(0)
  const [timing, setTiming] = useState<AttemptPayload["timing"] | null>(null)
  const [locked, setLocked] = useState(false)
  const [notice, setNotice] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const drafts = useRef<Record<number, AnswerDraft>>({})
  const revisions = useRef(new QuestionSaveRevision())
  const inFlight = useRef(new Set<number>())
  const mounted = useRef(true)
  const submittingRef = useRef(false)
  const expiryHandled = useRef(false)
  const timingRef = useRef<{ timing: AttemptPayload["timing"] | null; offset: number }>({ timing: null, offset: 0 })
  const draftStore = useRef<UnsavedDraftStore | null>(null)
  const optionsRef = useRef(options)
  useEffect(() => { optionsRef.current = options }, [options])
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  useEffect(() => { timingRef.current = { timing, offset } }, [timing, offset])

  const finish = useCallback((result: unknown) => {
    draftStore.current?.clear()
    setStatus("finished")
    optionsRef.current.onSubmitted(result)
  }, [])

  const saveQuestion = useCallback(async (questionId: number) => {
    if (inFlight.current.has(questionId)) return
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
        } catch (reason) {
          const code = reason instanceof ApiError ? reason.status : undefined
          setSaveStates((value) => ({ ...value, [questionId]: "failed" }))
          if (!isRetryableSaveError(code)) {
            if (code !== undefined && LOCKING_STATUSES.includes(code)) {
              setLocked(true)
              setNotice(code === 401
                ? "Your sign-in has expired. Answers not yet saved are kept on this device; sign in again to continue."
                : reason instanceof Error ? reason.message : "Saving is no longer possible for this attempt.")
            }
            break
          }
          failures += 1
          await sleep(retryDelayMs(failures))
        }
      }
    } finally { inFlight.current.delete(questionId) }
  }, [attemptId])

  // Load (or reload) the attempt and restore any unacknowledged local answers.
  useEffect(() => {
    let active = true
    draftStore.current = new UnsavedDraftStore(attemptId, browserStorage())
    void bffClient.action<AttemptPayload>("student-attempt-get", { params: { attemptId } }).then((payload) => {
      if (!active) return
      if (!validTiming(payload.timing)) throw new Error("The server returned invalid examination timing.")
      const initial: Record<number, AnswerDraft> = Object.fromEntries(payload.answers.map((answer) => [answer.question_id, answer]))
      const questionIds = new Set(payload.questions.map((question) => question.id))
      const restored = Object.values(draftStore.current?.load() ?? {}).filter((draft) => questionIds.has(draft.question_id))
      for (const draft of restored) { initial[draft.question_id] = draft; revisions.current.change(draft.question_id) }
      drafts.current = initial
      setAnswers(initial)
      setSaveStates({
        ...Object.fromEntries(payload.questions.map((question) => [question.id, "saved" as SaveState])),
        ...Object.fromEntries(restored.map((draft) => [draft.question_id, "unsaved" as SaveState])),
      })
      setTiming(payload.timing)
      setOffset(serverOffset(payload.serverTime))
      setData(payload)
      setStatus("ready")
      for (const draft of restored) void saveQuestion(draft.question_id)
    }).catch((reason) => {
      if (!active) return
      if (isFinished(reason)) { finish(null); return }
      setError(reason instanceof Error ? reason.message : "The attempt could not be loaded.")
      setStatus("error")
    })
    return () => { active = false }
  }, [attemptId, finish, saveQuestion])

  const performSubmit = useCallback(async (automatic: boolean) => {
    if (submittingRef.current) return false
    submittingRef.current = true
    setSubmitting(true)
    try {
      const result = await optionsRef.current.submit(Number(attemptId))
      finish(result)
      return true
    } catch (reason) {
      submittingRef.current = false
      setSubmitting(false)
      if (isFinished(reason)) { finish(null); return true }
      setNotice(reason instanceof ApiError && reason.status === 503
        ? "Submission could not be confirmed because the connection dropped. Check your connection and press Submit again; a repeat is safe."
        : reason instanceof Error ? reason.message : "Submission could not be confirmed.")
      if (automatic) setLocked(true)
      return false
    }
  }, [attemptId, finish])

  const pendingSaves = useCallback(() => Object.keys(drafts.current).some((id) => !revisions.current.isSaved(Number(id))), [])

  /** Manual submit: waits briefly for answers still being saved; never submits unsaved answers. */
  const submit = useCallback(async () => {
    if (submittingRef.current) return false
    const waitUntil = Date.now() + 15_000
    while (mounted.current && pendingSaves() && inFlight.current.size > 0 && Date.now() < waitUntil) await sleep(400)
    if (pendingSaves()) {
      setNotice("Some answers are not saved yet. Check your connection; they retry automatically. Submit again once every answer shows Saved.")
      return false
    }
    setNotice("")
    return performSubmit(false)
  }, [performSubmit, pendingSaves])

  // Time-out: lock, flush pending saves within the server grace window, then submit.
  const finishAtExpiry = useCallback(async () => {
    if (expiryHandled.current) return
    expiryHandled.current = true
    setNotice("Time is up. Saving your last answers and submitting…")
    const deadline = () => {
      const { timing: current, offset: skew } = timingRef.current
      return current ? current.saveGraceEndsAt - skew - 5_000 : Date.now()
    }
    while (mounted.current && pendingSaves() && inFlight.current.size > 0 && Date.now() < deadline()) await sleep(500)
    if (mounted.current) await performSubmit(true)
  }, [performSubmit, pendingSaves])

  useEffect(() => {
    if (!timing || status !== "ready" || locked) return
    const update = () => {
      const remaining = secondsUntil(timing.expiresAt, offset)
      setSeconds(remaining)
      if (remaining === 0) { setLocked(true); void finishAtExpiry() }
    }
    update()
    const interval = window.setInterval(update, 1000)
    return () => window.clearInterval(interval)
  }, [timing, offset, locked, status, finishAtExpiry])

  // Heartbeat keeps the server clock, extensions and pauses in sync.
  useEffect(() => {
    if (status !== "ready" || locked) return
    let active = true
    let busy = false
    const beat = async () => {
      if (busy) return
      busy = true
      try {
        const result = await bffClient.action<{ serverTime: string; timing: AttemptPayload["timing"] }>("student-heartbeat", { params: { attemptId } })
        if (active && validTiming(result.timing)) { setTiming(result.timing); setOffset(serverOffset(result.serverTime)) }
      } catch (reason) {
        if (!active) return
        if (isFinished(reason)) { finish(null); return }
        if (reason instanceof ApiError && LOCKING_STATUSES.includes(reason.status)) { setLocked(true); setNotice(reason.message) }
      } finally { busy = false }
    }
    const interval = window.setInterval(() => { void beat() }, 15_000)
    return () => { active = false; window.clearInterval(interval) }
  }, [attemptId, status, locked, finish])

  useEffect(() => {
    if (status !== "ready") return
    const visibility = () => { if (document.hidden) void bffClient.action("student-security-event", { params: { attemptId }, payload: { event_type: "tab_hidden", detail: "visibilitychange" } }).catch(() => undefined) }
    document.addEventListener("visibilitychange", visibility)
    return () => document.removeEventListener("visibilitychange", visibility)
  }, [attemptId, status])

  const change = useCallback((questionId: number, update: Partial<AnswerDraft>) => {
    if (locked || status !== "ready") return
    const previous = drafts.current[questionId] ?? { question_id: questionId, selected_option_id: null, answer_text: null, is_marked_for_review: false }
    const next = { ...previous, ...update }
    drafts.current = { ...drafts.current, [questionId]: next }
    draftStore.current?.put(next)
    setAnswers(drafts.current)
    revisions.current.change(questionId)
    setSaveStates((value) => ({ ...value, [questionId]: "unsaved" }))
    void saveQuestion(questionId)
  }, [locked, status, saveQuestion])

  return {
    status, error, data, answers, saveStates, seconds, locked, notice, submitting,
    setNotice,
    change,
    retrySave: (questionId: number) => void saveQuestion(questionId),
    submit,
  }
}

export type LiveAttempt = ReturnType<typeof useLiveAttempt>
