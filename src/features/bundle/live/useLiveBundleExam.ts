"use client"

/**
 * Stage 11: server-driven state for the designed multi-subject exam. The server owns the
 * bundle phase (in progress / between subjects / break / paused / completed) and which
 * subject is current; this hook only reflects it and sends the student's choices.
 */

import { useCallback, useEffect, useMemo, useState } from "react"
import { ApiError } from "@/lib/api/core"
import { bffClient } from "@/lib/api/bffClient"
import type { BundlePayload } from "../integration/types"
import { bundlePhase, completedSubjectIndexes, currentSubjectIndex, toExamBundle, type LiveBundlePhase } from "./adapters"

type Load = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; payload: BundlePayload }

export function useLiveBundleExam(bundleId: string) {
  const [load, setLoad] = useState<Load>({ status: "loading" })
  const [questionCounts, setQuestionCounts] = useState<Record<number, number>>({})
  /** A break the student chose on the "subject complete" screen (optional breaks). */
  const [localBreakEndsAt, setLocalBreakEndsAt] = useState<number | null>(null)
  const [notice, setNotice] = useState("")
  const [busy, setBusy] = useState(false)

  const fetchBundle = useCallback(() => bffClient.action<BundlePayload>("student-bundle-get", { params: { sessionId: bundleId } }), [bundleId])

  useEffect(() => {
    let active = true
    void fetchBundle()
      .then((payload) => { if (active) setLoad({ status: "ready", payload }) })
      .catch((reason) => { if (active) setLoad({ status: "error", message: reason instanceof Error ? reason.message : "This bundle could not be loaded." }) })
    return () => { active = false }
  }, [fetchBundle])

  const refresh = useCallback(async () => {
    try { setLoad({ status: "ready", payload: await fetchBundle() }) }
    catch (reason) { setNotice(reason instanceof Error ? reason.message : "The bundle could not be refreshed.") }
  }, [fetchBundle])

  const retry = useCallback(() => {
    setLoad({ status: "loading" })
    void fetchBundle()
      .then((payload) => setLoad({ status: "ready", payload }))
      .catch((reason) => setLoad({ status: "error", message: reason instanceof Error ? reason.message : "This bundle could not be loaded." }))
  }, [fetchBundle])

  const payload = load.status === "ready" ? load.payload : null
  const examBundle = useMemo(() => (payload ? toExamBundle(payload, questionCounts) : null), [payload, questionCounts])
  const serverPhase: LiveBundlePhase | null = payload ? bundlePhase(payload) : null
  const phase: LiveBundlePhase | null = serverPhase === "subject-complete" && localBreakEndsAt ? "break" : serverPhase
  const subjectIdx = payload ? currentSubjectIndex(payload) : 0
  const completedSubjects = useMemo(() => (payload ? completedSubjectIndexes(payload) : new Set<number>()), [payload])
  const currentAttempt = payload?.currentAttempt ?? payload?.subjectAttempt ?? null
  const sessionAttemptId = payload?.sessionAttempt?.id ?? null

  /** Break end (epoch ms): the server's timed break wins over a student-chosen break. */
  const breakEndsAt = (() => {
    const server = payload?.sessionAttempt?.break_ends_at ? Date.parse(payload.sessionAttempt.break_ends_at) : NaN
    if (Number.isFinite(server)) return server
    return localBreakEndsAt
  })()

  const startNextSubject = useCallback(async () => {
    if (busy) return
    setBusy(true); setNotice("")
    try {
      const next = await bffClient.action<BundlePayload>("student-bundle-continue", { params: { sessionId: bundleId }, payload: { skip: true } })
      setLocalBreakEndsAt(null)
      setLoad({ status: "ready", payload: next })
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 409) {
        setNotice(reason.message || "The next subject is not available yet.")
        await refresh()
      } else setNotice(reason instanceof Error ? reason.message : "The next subject could not be started.")
    } finally { setBusy(false) }
  }, [bundleId, busy, refresh])

  /** Starts (or resumes) the bundle when the server has no current subject attempt yet. */
  const startBundle = useCallback(async () => {
    if (busy) return
    setBusy(true); setNotice("")
    try { setLoad({ status: "ready", payload: await bffClient.action<BundlePayload>("student-bundle-start", { params: { sessionId: bundleId } }) }) }
    catch (reason) { setNotice(reason instanceof Error ? reason.message : "The bundle could not be started.") }
    finally { setBusy(false) }
  }, [bundleId, busy])

  const submitSubject = useCallback((attemptId: number) => {
    if (!sessionAttemptId) return Promise.reject(new Error("The bundle attempt is not available."))
    return bffClient.action<unknown>("student-bundle-submit-current", { params: { sessionAttemptId }, payload: { attempt_id: attemptId } })
  }, [sessionAttemptId])

  return {
    load, retry, refresh, notice, setNotice, busy,
    examBundle, phase, subjectIdx, completedSubjects, currentAttempt, sessionAttemptId, breakEndsAt,
    recordQuestionCount: (sessionExamId: number, count: number) => setQuestionCounts((value) => (value[sessionExamId] === count ? value : { ...value, [sessionExamId]: count })),
    takeBreak: () => setLocalBreakEndsAt(Date.now() + Math.max(1, Number(examBundle?.breakDuration) || 5) * 60_000),
    startNextSubject,
    startBundle,
    submitSubject,
  }
}
