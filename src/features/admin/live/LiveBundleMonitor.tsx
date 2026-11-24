"use client"

/**
 * Stage 11: the designed live exam monitor on real data. Refreshes the server state every
 * 10 seconds (and right after an action); timers count down every second against the
 * server clock. Students of the class who have not started are listed too, so the
 * invigilator can see who is missing. "Connected" means the student's exam page reported
 * in during the last 45 seconds (heartbeats/saves every 15 s).
 */

import { useCallback, useEffect, useMemo, useState } from "react"
import { AlertTriangle, LoaderCircle } from "lucide-react"
import { bffClient } from "@/lib/api/bffClient"
import type { BundlePayload } from "@/features/bundle/integration/types"
import { orderedLinks, toExamBundle } from "@/features/bundle/live/adapters"
import { BundleMonitor } from "../components/BundleMonitor"
import type { MonitorAction } from "../components/MonitorStudentTable"
import type { MonitorStudent } from "@/types/student"

interface SubjectAttempt { id: number; session_exam_id: number; status: string; submitted_at: string | null; last_seen_at: string | null; expires_at: string | null; time_extension_seconds: number | null; answered_count?: number; question_count?: number }
interface Participant { id: number; status: string; current_session_exam_id: number | null; last_seen_at: string | null; student?: { id: string; full_name: string; student_id: string } | null; attempts: SubjectAttempt[] }
interface MonitorData { bundle: { status: string }; participants: Participant[]; serverTime: string }
interface ClassStudent { id: string; full_name: string; student_id: string; is_active: boolean }

const REFRESH_MS = 10_000
const ONLINE_MS = 45_000
const STATUS: Record<string, MonitorStudent["status"]> = { in_progress: "writing", between_subjects: "break", on_break: "break", paused: "paused", completed: "done", force_submitted: "done", not_started: "notStarted" }

export function LiveBundleMonitor({ bundleId }: { bundleId: string }) {
  const [bundle, setBundle] = useState<BundlePayload["bundle"] | null>(null)
  const [classStudents, setClassStudents] = useState<ClassStudent[]>([])
  const [monitor, setMonitor] = useState<MonitorData | null>(null)
  const [offset, setOffset] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)
  const [error, setError] = useState("")

  const refresh = useCallback(async () => {
    try {
      const data = await bffClient.action<MonitorData>("admin-bundle-monitor", { params: { bundleId } })
      setMonitor(data)
      const server = Date.parse(data.serverTime)
      if (Number.isFinite(server)) setOffset(server - Date.now())
      setUpdatedAt(Date.now())
      setError("")
    } catch (reason) { setError(reason instanceof Error ? reason.message : "The monitor could not be refreshed.") }
  }, [bundleId])

  useEffect(() => {
    let active = true
    void bffClient.action<{ bundle: BundlePayload["bundle"] & { class_level_id?: number } }>("admin-bundle-get", { params: { bundleId } })
      .then(async (value) => {
        if (!active) return
        setBundle(value.bundle)
        if (value.bundle.class_level_id) {
          const list = await bffClient.action<{ students?: ClassStudent[] }>("admin-students-list", { params: { class_level_id: value.bundle.class_level_id, status: "active" } })
          if (active) setClassStudents(list.students ?? [])
        }
      })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "The bundle could not be loaded.") })
    return () => { active = false }
  }, [bundleId])

  useEffect(() => {
    let timer: number | undefined
    let stopped = false
    const loop = async () => { await refresh(); if (!stopped) timer = window.setTimeout(() => void loop(), REFRESH_MS) }
    timer = window.setTimeout(() => void loop(), 0)
    return () => { stopped = true; window.clearTimeout(timer) }
  }, [refresh])

  useEffect(() => { const tick = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(tick) }, [])

  const examBundle = useMemo(() => (bundle ? toExamBundle({ bundle, sessionAttempt: null }) : null), [bundle])
  const links = useMemo(() => (bundle ? orderedLinks({ bundle, sessionAttempt: null }) : []), [bundle])

  const students: MonitorStudent[] = useMemo(() => {
    if (!monitor) return []
    const serverNow = now + offset
    const indexOf = (sessionExamId: number | null) => Math.max(0, links.findIndex((link) => link.id === sessionExamId))
    const rows = monitor.participants.map((participant): MonitorStudent => {
      const attempts = participant.attempts || []
      const current = attempts.find((attempt) => attempt.session_exam_id === participant.current_session_exam_id && attempt.status === "ongoing")
      const deadline = current?.expires_at ? Date.parse(current.expires_at) + (Number(current.time_extension_seconds) || 0) * 1000 : NaN
      const seen = [participant.last_seen_at, ...attempts.map((attempt) => attempt.last_seen_at)].map((value) => (value ? Date.parse(value) : 0))
      const submitted = attempts.filter((attempt) => attempt.status === "submitted").sort((a, b) => Date.parse(b.submitted_at ?? "") - Date.parse(a.submitted_at ?? ""))
      return {
        id: participant.student?.student_id ?? String(participant.id),
        name: participant.student?.full_name ?? "Student",
        sessionAttemptId: participant.id,
        status: STATUS[participant.status] ?? "writing",
        currentSubjectIdx: indexOf(participant.current_session_exam_id),
        currentQuestion: 0,
        timeLeft: Number.isFinite(deadline) ? Math.max(0, Math.floor((deadline - serverNow) / 1000)) : 0,
        connected: Math.max(...seen) > serverNow - ONLINE_MS,
        subjectsCompleted: submitted.length,
        answers: Object.fromEntries(attempts.map((attempt) => [indexOf(attempt.session_exam_id), attempt.answered_count ?? 0])),
        questionCounts: Object.fromEntries(attempts.map((attempt) => [indexOf(attempt.session_exam_id), attempt.question_count ?? 0])),
        lastSubmittedAttemptId: submitted[0]?.id ?? null,
      }
    })
    const started = new Set(monitor.participants.map((participant) => participant.student?.id))
    const missing = classStudents.filter((student) => !started.has(student.id)).map((student): MonitorStudent => ({
      id: student.student_id, name: student.full_name, status: "notStarted", currentSubjectIdx: 0, currentQuestion: 0, timeLeft: 0,
      connected: false, subjectsCompleted: 0, answers: {}, questionCounts: {},
    }))
    return [...rows, ...missing]
  }, [monitor, classStudents, links, now, offset])

  const onAction = useCallback(async (student: MonitorStudent, action: MonitorAction) => {
    if (!student.sessionAttemptId) throw new Error("This student has not started the bundle.")
    const payload: Record<string, unknown> = { action }
    if (action === "extend") payload.seconds = 600
    if (action === "reopen_subject") { payload.attempt_id = student.lastSubmittedAttemptId; payload.seconds = 900 }
    if (action === "pause") payload.reason = "Paused by invigilator"
    await bffClient.action("admin-bundle-intervene", { params: { bundleId, sessionAttemptId: student.sessionAttemptId }, payload })
    await refresh()
  }, [bundleId, refresh])

  if (!examBundle || !monitor) {
    return error
      ? <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}</div>
      : <div className="bg-white rounded-3xl shadow-sm p-12 text-center text-sm text-gray-500"><LoaderCircle className="mx-auto mb-2 w-6 h-6 animate-spin text-[#B22234]" /> Loading the live monitor…</div>
  }
  const ago = updatedAt ? Math.max(0, Math.round((now - updatedAt) / 1000)) : null
  return (
    <>
      {error ? <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> Refresh failed ({error}). Showing the last data; retrying every 10 s.</div> : null}
      <BundleMonitor
        bundle={examBundle}
        students={students}
        onAction={onAction}
        backHref="/admin/bundles"
        backLabel="← Back to Exam Bundles"
        liveNote={ago === null ? undefined : `updated ${ago}s ago`}
        isLive={["live", "ongoing", "scheduled"].includes(monitor.bundle.status)}
      />
    </>
  )
}
