"use client"

/** Stage 11: the designed My Results / My Performance pages on the live results summary. */

import { useCallback, useEffect, useState } from "react"
import { bffClient } from "@/lib/api/bffClient"
import { printResultSheet } from "@/lib/printResultSheet"
import { StatusCard } from "@/features/exam/live/LiveParts"
import { StudentPerformance } from "../components/StudentPerformance"
import { StudentResults } from "../components/StudentResults"
import type { ResultsSummary } from "../types"

function useResultsSummary() {
  const [state, setState] = useState<{ status: "loading" } | { status: "error"; message: string } | { status: "ready"; data: ResultsSummary }>({ status: "loading" })
  const load = useCallback(async () => {
    try { setState({ status: "ready", data: await bffClient.action<ResultsSummary>("student-results-summary") }) }
    catch (reason) { setState({ status: "error", message: reason instanceof Error ? reason.message : "Your results could not be loaded." }) }
  }, [])
  useEffect(() => { const timer = window.setTimeout(() => { void load() }, 0); return () => window.clearTimeout(timer) }, [load])
  return { state, retry: () => { setState({ status: "loading" }); void load() } }
}

export function LiveStudentResults() {
  const { state, retry } = useResultsSummary()
  const [profile, setProfile] = useState<{ full_name?: string; student_id?: string | null } | null>(null)
  useEffect(() => { void bffClient.session<{ full_name?: string; student_id?: string | null }>().then(setProfile).catch(() => undefined) }, [])
  if (state.status === "loading") return <StatusCard loading title="Loading your results" message="Fetching your exams from the school server…" />
  if (state.status === "error") return <StatusCard title="Results unavailable" message={state.message} action={{ label: "Try again", onClick: retry }} />
  const released = state.data.entries.filter((entry) => entry.status === "submitted" && entry.percentage !== null)
  const print = () => {
    const opened = printResultSheet({
      student: { name: profile?.full_name || "Student", studentId: profile?.student_id ?? null },
      scope: "Results released by the school",
      rows: released.map((entry) => ({
        title: entry.title ?? "Exam", subject: entry.subject, bundle: entry.bundle_name, date: entry.submitted_at,
        score: entry.score, max: entry.total_marks, percentage: entry.percentage, passed: entry.passed, status: "released" as const,
      })),
    })
    if (!opened) window.alert("Your browser blocked the print window. Allow pop-ups for this site and try again.")
  }
  return <StudentResults summary={state.data} backHref="/student/dashboard" onPrint={released.length ? print : undefined} />
}

export function LiveStudentPerformance() {
  const { state, retry } = useResultsSummary()
  if (state.status === "loading") return <StatusCard loading title="Loading your performance" message="Fetching your released results…" />
  if (state.status === "error") return <StatusCard title="Performance unavailable" message={state.message} action={{ label: "Try again", onClick: retry }} />
  return <StudentPerformance summary={state.data} backHref="/student/results" />
}
