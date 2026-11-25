"use client"

/**
 * Student details (Stage 11, owner request 2026-11-24): profile, login, edit name/class and
 * the full exam history. Passwords cannot be viewed — they are stored only as secure
 * hashes — so "Generate new password" issues a new one and shows it once (owner decision).
 */

import { useCallback, useEffect, useState } from "react"
import { AlertTriangle, CheckCircle2, Copy, KeyRound, LoaderCircle, Lock, Printer, X } from "lucide-react"
import { bffClient } from "@/lib/api/bffClient"
import { printResultSheet } from "@/lib/printResultSheet"

interface Level { id: number; name: string; code: string; is_active?: boolean }
interface Profile {
  id: string; full_name: string; student_id: string; is_active: boolean; created_at: string | null
  class_level_id: number | null; class_level?: { id: number; name: string; code: string } | null; last_sign_in_at: string | null
}
interface HistoryRow {
  id: number; kind: "single" | "bundle_subject"; title: string | null; subject: string | null; bundle_name: string | null
  status: string; started_at: string | null; submitted_at: string | null; score: number | null; max_marks: number | null
  percentage: number | null; passed: boolean | null; pending_manual: boolean; results_released: boolean
}

const errorText = (reason: unknown, fallback: string) => (reason instanceof Error && reason.message ? reason.message : fallback)
const when = (value: string | null) => (value ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—")
const pctColor = (pct: number | null) => (pct === null ? "#9CA3AF" : pct >= 70 ? "#16A34A" : pct >= 50 ? "#D97706" : "#EF4444")

export function StudentDetailsModal({ studentId, levels, onClose, onChanged, onNewPassword }: {
  studentId: string
  levels: Level[]
  onClose: () => void
  onChanged: () => void
  onNewPassword: (student: { id: string; full_name: string; student_id: string }) => void
}) {
  const [data, setData] = useState<{ student: Profile; history: HistoryRow[] } | null>(null)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [name, setName] = useState("")
  const [levelId, setLevelId] = useState("")
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const load = useCallback(async () => {
    try {
      const value = await bffClient.action<{ student: Profile; history: HistoryRow[] }>("admin-student-get", { params: { studentId } })
      setData(value)
      setName(value.student.full_name)
      setLevelId(value.student.class_level_id ? String(value.student.class_level_id) : "")
      setError("")
    } catch (reason) { setError(errorText(reason, "The student could not be loaded.")) }
  }, [studentId])
  useEffect(() => { const timer = window.setTimeout(() => { void load() }, 0); return () => window.clearTimeout(timer) }, [load])

  const student = data?.student
  const nameChanged = Boolean(student) && name.trim().replace(/\s+/g, " ") !== student?.full_name
  const classChanged = Boolean(student) && levelId !== (student?.class_level_id ? String(student.class_level_id) : "")

  const save = async () => {
    if (!student) return
    if (name.trim().length < 2) { setError("Enter the student name (at least 2 characters)."); return }
    setSaving(true); setError(""); setNotice("")
    try {
      const payload: Record<string, unknown> = {}
      if (nameChanged) payload.full_name = name.trim()
      if (classChanged) payload.class_level_id = Number(levelId)
      await bffClient.action("admin-student-update", { params: { studentId }, payload })
      setNotice("Saved. The student ID (their login) is unchanged.")
      await load()
      onChanged()
    } catch (reason) { setError(errorText(reason, "The changes could not be saved.")) }
    finally { setSaving(false) }
  }

  const copyId = async () => {
    if (!student) return
    try { await navigator.clipboard.writeText(student.student_id); setCopied(true); window.setTimeout(() => setCopied(false), 1500) } catch { /* clipboard unavailable */ }
  }

  const submitted = data?.history.filter((row) => row.status === "submitted") ?? []

  /** Printable sheet for parents: every submitted exam, unreleased ones marked provisional. */
  const printSheet = () => {
    if (!data) return
    const opened = printResultSheet({
      student: { name: data.student.full_name, studentId: data.student.student_id, className: data.student.class_level?.name },
      scope: "All submitted exams (results not yet released are marked provisional)",
      rows: submitted.map((row) => ({
        title: row.title ?? "Exam", subject: row.subject, bundle: row.bundle_name, date: row.submitted_at,
        score: row.score, max: row.max_marks, percentage: row.percentage, passed: row.passed,
        status: row.pending_manual ? "marking" : row.results_released ? "released" : "provisional",
      })),
    })
    if (!opened) setError("Your browser blocked the print window. Allow pop-ups for this site and press Print again.")
  }
  const scored = submitted.map((row) => row.percentage).filter((value): value is number => value !== null)
  const average = scored.length ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4">
          {student ? (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#B22234] flex items-center justify-center font-heading font-700 text-white text-lg">
                {student.full_name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("")}
              </div>
              <div>
                <h2 className="font-heading text-xl font-700 text-gray-900">{student.full_name}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                  <span className="font-mono">{student.student_id}</span>
                  <span>·</span>
                  <span>{student.class_level?.name ?? "No class"}</span>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${student.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{student.is_active ? "● Active" : "○ Inactive"}</span>
                </div>
              </div>
            </div>
          ) : <h2 className="font-heading text-xl font-700 text-gray-900">Student details</h2>}
          <button onClick={onClose} aria-label="Close" className="p-2 rounded-xl text-gray-400 hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          {error ? <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}</div> : null}
          {notice ? <div role="status" className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> {notice}</div> : null}

          {!student ? (!error ? <div className="py-12 text-center"><LoaderCircle className="mx-auto w-6 h-6 animate-spin text-[#B22234]" /></div> : null) : (
            <>
              {/* Login */}
              <section className="rounded-2xl border border-[#E8D9CB] p-5">
                <h3 className="font-heading font-700 text-gray-900 mb-3">Login details</h3>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Student ID (used to sign in)</div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base text-gray-900">{student.student_id}</span>
                      <button onClick={() => void copyId()} className="p-1.5 rounded-lg text-gray-400 hover:text-[#B22234] hover:bg-red-50" title="Copy student ID">
                        {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Password</div>
                    <div className="flex items-center gap-2 text-gray-700"><Lock className="w-4 h-4 text-gray-400" /> Hidden for security</div>
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500 leading-relaxed">
                  Passwords are stored in a form nobody can read — not even the school. If the student (or parent) forgot it, generate a new one:
                  it is shown once to copy or print, and the old password stops working.
                </p>
                <button
                  onClick={() => onNewPassword(student)}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-50 text-orange-700 border border-orange-200 text-sm font-medium hover:bg-orange-100"
                >
                  <KeyRound className="w-4 h-4" /> Generate new password
                </button>
              </section>

              {/* Profile + edit */}
              <section className="rounded-2xl border border-[#E8D9CB] p-5">
                <h3 className="font-heading font-700 text-gray-900 mb-3">Profile</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="student-name" className="block text-xs text-gray-500 mb-1">Full name</label>
                    <input id="student-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} className="w-full px-4 py-2.5 rounded-xl border border-[#D9C6B2] text-sm focus:outline-none focus:ring-2 focus:ring-[#B22234]/30" />
                  </div>
                  <div>
                    <label htmlFor="student-class" className="block text-xs text-gray-500 mb-1">Class</label>
                    <select id="student-class" value={levelId} onChange={(e) => setLevelId(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[#D9C6B2] text-sm bg-white">
                      {!levelId ? <option value="">No class</option> : null}
                      {student.class_level && !levels.some((level) => level.id === student.class_level?.id)
                        ? <option value={student.class_level.id}>{student.class_level.name} (inactive)</option>
                        : null}
                      {levels.map((level) => <option key={level.id} value={level.id}>{level.name}</option>)}
                    </select>
                  </div>
                </div>
                {classChanged ? <p className="mt-2 text-xs text-amber-700">Moving the student changes which exams and bundles they can see. The student ID stays the same.</p> : null}
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-gray-500">
                  <div>Added: <span className="text-gray-800">{when(student.created_at)}</span></div>
                  <div>Last sign-in: <span className="text-gray-800">{student.last_sign_in_at ? when(student.last_sign_in_at) : "Never"}</span></div>
                </div>
                <button onClick={() => void save()} disabled={saving || (!nameChanged && !classChanged)} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B22234] text-white text-sm font-medium disabled:opacity-50">
                  {saving ? <LoaderCircle className="w-4 h-4 animate-spin" /> : null} Save changes
                </button>
              </section>

              {/* Exam history */}
              <section className="rounded-2xl border border-[#E8D9CB] p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <h3 className="font-heading font-700 text-gray-900">Exam history</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{submitted.length} submitted{average !== null ? ` · average ${average}%` : ""}</span>
                    <button onClick={printSheet} disabled={!submitted.length} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D9C6B2] text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50" title={submitted.length ? "Print a result sheet for the parent" : "No submitted exams yet"}>
                      <Printer className="w-3.5 h-3.5" /> Print result sheet
                    </button>
                  </div>
                </div>
                {data.history.length === 0 ? <p className="text-sm text-gray-500">This student has not taken any exam yet.</p> : (
                  <div className="divide-y divide-gray-100">
                    {data.history.map((row) => (
                      <div key={row.id} className="py-3 flex flex-wrap items-center gap-3">
                        <div className="flex-1 min-w-[12rem]">
                          <div className="text-sm font-medium text-gray-900">{row.title ?? "Exam"}</div>
                          <div className="text-xs text-gray-400">{[row.subject, row.bundle_name ? `Bundle: ${row.bundle_name}` : "", when(row.submitted_at ?? row.started_at)].filter(Boolean).join(" · ")}</div>
                        </div>
                        {row.status !== "submitted" ? (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">✏️ In progress</span>
                        ) : row.pending_manual ? (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">✎ Needs marking</span>
                        ) : (
                          <div className="text-right">
                            <div className="text-sm font-heading font-700" style={{ color: pctColor(row.percentage) }}>
                              {row.score ?? "—"}/{row.max_marks ?? "—"}{row.percentage !== null ? ` (${Math.round(row.percentage)}%)` : ""}
                            </div>
                            <div className="text-xs text-gray-400">{row.passed === null ? "" : row.passed ? "Passed · " : "Not passed · "}{row.results_released ? "released" : "not released to student"}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
