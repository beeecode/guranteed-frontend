"use client"

/* ── Student action modal ───────────────────────────────────── */ /* Header */ /* Timeline */ /* Actions */

/** Status filter pills, live student table and per-student admin actions. */ /* Filters */ /* Student table */

import { useState } from "react"
import {
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Clock,
  RefreshCw,
  Wifi,
  WifiOff,
  X,
} from "lucide-react"
import { formatClock, sum } from "@/lib/format"
import type { ExamBundle } from "@/types/exam"
import type { MonitorStudent } from "@/types/student"

const statusConfig: Record<MonitorStudent["status"], {
  label: string
  bg: string
  color: string
  dot: string
}> = {
  writing: {
    label: "Writing",
    bg: "rgba(22,163,74,0.1)",
    color: "#16A34A",
    dot: "#16A34A",
  },
  break: {
    label: "On Break",
    bg: "rgba(234,179,8,0.1)",
    color: "#854D0E",
    dot: "#EAB308",
  },
  done: {
    label: "Completed",
    bg: "rgba(107,114,128,0.1)",
    color: "#6B7280",
    dot: "#9CA3AF",
  },
  notStarted: {
    label: "Not Started",
    bg: "rgba(59,130,246,0.1)",
    color: "#1D4ED8",
    dot: "#60A5FA",
  },
  paused: {
    label: "Paused",
    bg: "rgba(249,115,22,0.12)",
    color: "#C2410C",
    dot: "#F97316",
  },
}

/** Stage 11: a real admin action on one student's bundle attempt. */
export type MonitorAction = "extend" | "pause" | "resume" | "advance" | "reopen_subject" | "force_bundle"
type ActionHandler = (student: MonitorStudent, action: MonitorAction) => Promise<void>
type ActionItem = { label: string; action?: MonitorAction; icon: typeof Clock; color: string; dangerous: boolean }

function liveActions(student: MonitorStudent): ActionItem[] {
  const list: ActionItem[] = []
  if (student.status === "writing") list.push({ label: "Extend Current Subject Time (+10 min)", action: "extend", icon: Clock, color: "#2563EB", dangerous: false })
  if (student.status === "paused") list.push({ label: "Resume Student Exam", action: "resume", icon: RefreshCw, color: "#16A34A", dangerous: false })
  else if (student.status === "writing" || student.status === "break") list.push({ label: "Pause Student Exam", action: "pause", icon: AlertTriangle, color: "#D97706", dangerous: false })
  if (student.status === "writing") list.push({ label: "Submit Current Subject & Move On", action: "advance", icon: ChevronRight, color: "#DC2626", dangerous: true })
  if (student.lastSubmittedAttemptId && student.status !== "notStarted") list.push({ label: "Reopen Last Completed Subject (15 min)", action: "reopen_subject", icon: RefreshCw, color: "#DC2626", dangerous: true })
  if (student.status !== "done" && student.status !== "notStarted") list.push({ label: "Force Submit Full Bundle", action: "force_bundle", icon: CheckCircle, color: "#DC2626", dangerous: true })
  return list
}
function StudentActionModal({
  bundle,
  student,
  onClose,
  onAction,
}: {
  bundle: ExamBundle
  student: MonitorStudent
  onClose: () => void
  onAction?: ActionHandler
}) {
  const [confirmAction, setConfirmAction] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const live = onAction ? liveActions(student) : null
  const perform = async (action: MonitorAction) => {
    if (!onAction) return
    setBusy(true); setError("")
    try { await onAction(student, action); onClose() }
    catch (reason) { setError(reason instanceof Error ? reason.message : "The action failed."); setConfirmAction(null) }
    finally { setBusy(false) }
  }
  const currentSubject = bundle.subjects[student.currentSubjectIdx]

  const actions: ActionItem[] = [
    {
      label: "Extend Current Subject Time (+10 min)",
      icon: Clock,
      color: "#2563EB",
      dangerous: false,
    },
    {
      label: "Move to Next Subject",
      icon: ChevronRight,
      color: "#D97706",
      dangerous: false,
    },
    {
      label: "Pause Student Exam",
      icon: AlertTriangle,
      color: "#D97706",
      dangerous: false,
    },
    {
      label: "Reopen Completed Subject",
      icon: RefreshCw,
      color: "#DC2626",
      dangerous: true,
    },
    {
      label: "Force Submit Current Subject",
      icon: CheckCircle,
      color: "#DC2626",
      dangerous: true,
    },
    {
      label: "Force Submit Full Bundle",
      icon: CheckCircle,
      color: "#DC2626",
      dangerous: true,
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className="bg-white w-full max-w-md shadow-2xl"
        style={{ borderRadius: 24 }}
      >
        {}
        <div
          className="flex items-center justify-between p-5"
          style={{ borderBottom: "1px solid rgba(217,198,178,0.3)" }}
        >
          <div>
            <div className="font-semibold text-gray-900">{student.name}</div>
            <div className="text-xs text-gray-500">
              {student.id} · Currently: {currentSubject?.emoji}{" "}
              {currentSubject?.name}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
            style={{ borderRadius: 8 }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {}
        <div
          className="px-5 py-4"
          style={{ borderBottom: "1px solid rgba(217,198,178,0.3)" }}
        >
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
            Exam Timeline
          </div>
          <div className="space-y-1.5">
            {bundle.subjects.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span
                  className={
                    student.subjectsCompleted > i
                      ? "text-green-500"
                      : i === student.currentSubjectIdx
                        ? "text-[#B22234]"
                        : "text-gray-300"
                  }
                >
                  {student.subjectsCompleted > i
                    ? "✓"
                    : i === student.currentSubjectIdx
                      ? "●"
                      : "○"}
                </span>
                <span className="text-lg">{s.emoji}</span>
                <span
                  className={
                    student.subjectsCompleted > i
                      ? "text-green-600 font-medium"
                      : i === student.currentSubjectIdx
                        ? "text-[#B22234] font-bold"
                        : "text-gray-400"
                  }
                >
                  {s.name}
                </span>
                {student.subjectsCompleted > i && (
                  <span className="text-green-500 ml-auto">Completed</span>
                )}
                {i === student.currentSubjectIdx && (
                  <span className="text-[#B22234] ml-auto">In Progress</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {}
        <div className="p-5">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
            Admin Actions
          </div>
          {confirmAction ? (
            <div
              className="p-4"
              style={{
                background: "rgba(220,38,38,0.05)",
                borderRadius: 14,
                border: "1.5px solid rgba(220,38,38,0.2)",
              }}
            >
              <p className="text-sm text-red-700 font-medium mb-3">
                {live ? `${confirmAction} — are you sure? This cannot be undone.` : "Are you sure? This action cannot be undone."}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 py-2.5 text-sm font-semibold"
                  style={{
                    border: "1.5px solid rgba(217,198,178,0.5)",
                    borderRadius: 999,
                    color: "#7A5C3A",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const chosen = live?.find((item) => item.label === confirmAction)
                    if (chosen?.action) void perform(chosen.action)
                    else onClose()
                  }}
                  disabled={busy}
                  className="flex-1 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                  style={{ background: "#DC2626", borderRadius: 999 }}
                >
                  {busy ? "Working…" : "Confirm"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {error ? <p className="text-xs text-red-700 font-medium">{error}</p> : null}
              {live && live.length === 0 ? <p className="text-sm text-gray-500">No actions are available for this student right now.</p> : null}
              {(live ?? actions).map((a, i) => (
                <button
                  key={i}
                  disabled={busy}
                  onClick={() =>
                    a.dangerous ? setConfirmAction(a.label) : a.action && live ? void perform(a.action) : onClose()
                  }
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all text-left"
                  style={{
                    borderRadius: 12,
                    background: `${a.color}10`,
                    color: a.color,
                  }}
                >
                  <a.icon className="w-4 h-4 flex-shrink-0" />
                  {a.label}
                  {a.dangerous && (
                    <span
                      className="ml-auto text-[10px] font-bold px-2 py-0.5"
                      style={{ background: `${a.color}20`, borderRadius: 999 }}
                    >
                      DANGER
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export function MonitorStudentTable({
  bundle,
  students,
  onAction,
}: {
  bundle: ExamBundle
  students: MonitorStudent[]
  /** Stage 11: when given, the action buttons call the server. */
  onAction?: ActionHandler
}) {
  const [selectedStudent, setSelectedStudent] = useState<MonitorStudent | null>(
    null,
  )
  const [filterStatus, setFilterStatus] = useState("all")

  const stats = {
    total: students.length,
    notStarted: students.filter((s) => s.status === "notStarted").length,
    writing: students.filter((s) => s.status === "writing").length,
    onBreak: students.filter((s) => s.status === "break").length,
    completed: students.filter((s) => s.status === "done").length,
    paused: students.filter((s) => s.status === "paused").length,
  }
  const totalQ = sum(bundle.subjects, (sub) => sub.totalQuestions)

  const filtered =
    filterStatus === "all"
      ? students
      : students.filter((s) => s.status === filterStatus)

  return (
    <>
      {}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          ["all", "All"],
          ["writing", "Writing"],
          ["break", "On Break"],
          ["done", "Completed"],
          ["notStarted", "Not Started"],
          ...(onAction ? [["paused", "Paused"]] : []),
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilterStatus(val)}
            className="px-4 py-2 text-xs font-bold transition-all"
            style={{
              borderRadius: 999,
              background: filterStatus === val ? "#B22234" : "#fff",
              color: filterStatus === val ? "#fff" : "#7A5C3A",
              border: `1.5px solid ${
                filterStatus === val ? "#B22234" : "rgba(217,198,178,0.5)"
              }`,
            }}
          >
            {label}{" "}
            {val === "all"
              ? `(${stats.total})`
              : val === "writing"
                ? `(${stats.writing})`
                : val === "break"
                  ? `(${stats.onBreak})`
                  : val === "done"
                    ? `(${stats.completed})`
                    : val === "paused"
                      ? `(${stats.paused})`
                      : `(${stats.notStarted})`}
          </button>
        ))}
      </div>

      {}
      <div
        className="bg-white shadow-sm overflow-hidden"
        style={{ borderRadius: 20 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  background: "#F9F5F1",
                  borderBottom: "1px solid rgba(217,198,178,0.4)",
                }}
              >
                {[
                  "Student",
                  "Current Subject",
                  "Subject Progress",
                  "Overall",
                  "Time Left",
                  "Status",
                  "Conn.",
                  "",
                ].map((h, i) => (
                  <th
                    key={i}
                    className="text-left px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => {
                const cfg =
                  statusConfig[student.status] ?? statusConfig.notStarted
                const currentSubject =
                  bundle.subjects[student.currentSubjectIdx]
                const currentAnswered =
                  student.answers[student.currentSubjectIdx] ?? 0
                // Live rows carry real per-subject question totals; fixtures use the bundle's.
                const currentTotal = student.questionCounts?.[student.currentSubjectIdx] ?? currentSubject?.totalQuestions ?? 0
                const subjectPct = currentTotal ? Math.min(100, Math.round((currentAnswered / currentTotal) * 100)) : 0
                const totalAnswered = sum(
                  Object.values(student.answers),
                  (v) => v,
                )
                const overallPct = student.questionCounts
                  ? Math.min(100, Math.round(((student.subjectsCompleted + (student.status === "done" || !currentTotal ? 0 : currentAnswered / currentTotal)) / Math.max(1, bundle.subjects.length)) * 100))
                  : totalQ ? Math.round((totalAnswered / totalQ) * 100) : 0

                return (
                  <tr
                    key={student.id}
                    className="border-b border-[rgba(217,198,178,0.2)] hover:bg-[rgba(217,198,178,0.05)] transition-colors"
                    style={{
                      opacity: student.status === "notStarted" ? 0.7 : 1,
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 whitespace-nowrap">
                        {student.name}
                      </div>
                      <div className="text-xs text-gray-400">{student.id}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {student.status === "done" ? (
                        <span className="text-green-600 font-medium text-xs">
                          All Done ✓
                        </span>
                      ) : student.status === "notStarted" ? (
                        <span className="text-gray-400 text-xs">
                          Not started
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span>{currentSubject?.emoji}</span>
                          <span className="text-gray-700 text-xs">
                            {currentSubject?.name?.split(" ")[0]}
                          </span>
                          <span className="text-gray-400 text-xs">
                            ({student.currentSubjectIdx + 1}/
                            {bundle.subjects.length})
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-20 h-1.5 rounded-full overflow-hidden"
                          style={{ background: "rgba(217,198,178,0.4)" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${subjectPct}%`,
                              background: "#B22234",
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {subjectPct}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-16 h-1.5 rounded-full overflow-hidden"
                          style={{ background: "rgba(217,198,178,0.4)" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${overallPct}%`,
                              background: "#16A34A",
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {overallPct}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`text-xs font-medium ${
                          student.timeLeft < 300
                            ? "text-red-500"
                            : "text-gray-600"
                        }`}
                      >
                        {student.status === "done" || student.status === "notStarted"
                          ? "—"
                          : formatClock(student.timeLeft)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold"
                        style={{
                          background: cfg.bg,
                          color: cfg.color,
                          borderRadius: 999,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: cfg.dot }}
                        />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {student.connected ? (
                        <Wifi className="w-4 h-4 text-green-500" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-red-400" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="text-xs font-semibold text-[#B22234] hover:underline whitespace-nowrap"
                      >
                        Actions →
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedStudent && (
        <StudentActionModal
          bundle={bundle}
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onAction={onAction}
        />
      )}
    </>
  )
}
