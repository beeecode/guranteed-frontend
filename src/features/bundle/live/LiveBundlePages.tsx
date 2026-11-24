"use client"

/**
 * Stage 11: the DESIGNED bundle overview and results pages driven by live server data.
 * The server decides what the student may do (start, continue, view results) and which
 * scores are released; nothing is computed from fixtures.
 */

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertTriangle, Clock3, LoaderCircle, RefreshCw } from "lucide-react"
import { ApiError } from "@/lib/api/core"
import { bffClient } from "@/lib/api/bffClient"
import { BundleOverview } from "../components/BundleOverview"
import { BundleResults, type LiveBundleResultsData } from "../components/BundleResults"
import type { SubjectResult } from "../components/SubjectResultsAccordion"
import type { BundlePayload } from "../integration/types"
import { bundlePhase, completedSubjectIndexes, currentSubjectIndex, orderedLinks, subjectEmoji, toExamBundle } from "./adapters"

function StatusCard({ title, message, loading = false, icon, children }: { title: string; message: string; loading?: boolean; icon?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "#F9F5F1" }}>
      <div className="bg-white w-full max-w-md p-8 text-center shadow-xl" style={{ borderRadius: 32 }}>
        <div className="mx-auto mb-4 w-14 h-14 flex items-center justify-center" style={{ borderRadius: 18, background: "rgba(178,34,52,0.08)", color: "#B22234" }}>
          {loading ? <LoaderCircle className="w-7 h-7 animate-spin" /> : icon ?? <AlertTriangle className="w-7 h-7" />}
        </div>
        <h1 className="font-playful font-bold text-[#1C0A04] text-xl mb-2">{title}</h1>
        <p className="text-[#7A5C3A] text-sm leading-relaxed">{message}</p>
        {children ? <div className="mt-6 flex flex-col gap-3">{children}</div> : null}
      </div>
    </div>
  )
}
const primaryButton = "flex-1 py-4 font-playful font-bold text-lg text-white text-center transition-all hover:-translate-y-1 hover:shadow-2xl disabled:opacity-60 disabled:hover:translate-y-0"
const primaryStyle = { background: "#B22234", borderRadius: 999, boxShadow: "0 4px 20px rgba(178,34,52,0.35)" }
const secondaryButton = "flex-1 py-4 font-playful font-bold text-base text-center transition-all"
const secondaryStyle = { border: "2px solid rgba(217,198,178,0.6)", color: "#7A5C3A", borderRadius: 999 }

const subtitleOf = (payload: BundlePayload) => {
  const raw = payload.bundle as BundlePayload["bundle"] & { class_level?: { name?: string } | null; academic_session?: string | null; term?: string | null }
  return [raw.class_level?.name, raw.academic_session, raw.term].filter(Boolean).join(" · ") || "Multi-subject examination"
}

export function LiveBundleOverview({ bundleId }: { bundleId: string }) {
  const router = useRouter()
  const [payload, setPayload] = useState<BundlePayload | null>(null)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [busy, setBusy] = useState(false)
  const examPath = `/student/bundle/${encodeURIComponent(bundleId)}/exam`

  const load = useCallback(async () => {
    try { setPayload(await bffClient.action<BundlePayload>("student-bundle-get", { params: { sessionId: bundleId } })); setError("") }
    catch (reason) { setError(reason instanceof Error ? reason.message : "This exam could not be loaded.") }
  }, [bundleId])
  useEffect(() => { const timer = window.setTimeout(() => { void load() }, 0); return () => window.clearTimeout(timer) }, [load])

  const examBundle = useMemo(() => (payload ? toExamBundle(payload) : null), [payload])
  if (error && !payload) return <StatusCard title="Exam unavailable" message={error}><button onClick={() => void load()} className={primaryButton} style={primaryStyle}><RefreshCw className="inline w-4 h-4 mr-2" />Try again</button></StatusCard>
  if (!payload || !examBundle) return <StatusCard loading title="Loading your exam journey" message="Checking your class, the timetable and any saved progress…" />

  const phase = bundlePhase(payload)
  const available = payload.availability?.canStart !== false
  const start = async () => {
    setBusy(true); setNotice("")
    try {
      await bffClient.action<BundlePayload>("student-bundle-start", { params: { sessionId: bundleId } })
      router.push(examPath)
    } catch (reason) {
      setNotice(reason instanceof ApiError || reason instanceof Error ? reason.message : "The exam could not be started.")
      setBusy(false)
      void load()
    }
  }

  let action: React.ReactNode
  if (phase === "bundle-done") {
    action = <div className="flex flex-col sm:flex-row gap-4"><Link href={`/student/bundle/${encodeURIComponent(bundleId)}/results`} className={primaryButton} style={primaryStyle}>View My Results 📊</Link><Link href="/student/dashboard" className={secondaryButton} style={secondaryStyle}>← Dashboard</Link></div>
  } else if (phase === "not-started") {
    action = (
      <div className="flex flex-col sm:flex-row gap-4">
        <button type="button" onClick={() => void start()} disabled={busy || !available} className={primaryButton} style={primaryStyle}>
          {busy ? "Starting…" : available ? "I'm Ready — Start Exam 🚀" : "Not open yet"}
        </button>
        <Link href="/student/dashboard" className={secondaryButton} style={secondaryStyle}>← Not Yet</Link>
      </div>
    )
  } else if (phase === "paused") {
    action = <div className="flex flex-col sm:flex-row gap-4"><button type="button" onClick={() => void load()} className={primaryButton} style={primaryStyle}>Paused by your supervisor — Check again</button></div>
  } else {
    action = <div className="flex flex-col sm:flex-row gap-4"><Link href={examPath} className={primaryButton} style={primaryStyle}>Continue My Exam →</Link><Link href="/student/dashboard" className={secondaryButton} style={secondaryStyle}>← Dashboard</Link></div>
  }

  const reason = !available && phase === "not-started" ? payload.availability?.reason : null
  const message = notice || reason
  return (
    <BundleOverview
      bundle={examBundle}
      live={{
        completed: completedSubjectIndexes(payload),
        currentIdx: phase === "bundle-done" ? null : phase === "not-started" ? 0 : phase === "subject-complete" || phase === "break" ? currentSubjectIndex(payload) + 1 : currentSubjectIndex(payload),
        subtitle: subtitleOf(payload),
        action,
        notice: message ? (
          <div role="alert" className="mb-5 px-5 py-4 flex items-start gap-3 text-sm font-medium" style={{ background: "rgba(249,115,22,0.10)", border: "2px solid rgba(249,115,22,0.35)", borderRadius: 16, color: "#9A3412" }}>
            <AlertTriangle className="w-5 h-5 shrink-0" /> {message}
          </div>
        ) : null,
      }}
    />
  )
}

interface ResultPayload {
  bundle: { id: number; session_name: string }
  subjects: Array<{ attempt_id: number; title?: string; subject: string; score: number | null; total_marks: number; percentage: number | null; pass_mark: number | null; passed: boolean | null; grade: string | null; pending_manual: boolean }>
  pending_manual: boolean
  percentage: number | null
  grade: string | null
}

const resultColor = (passed: boolean | null, pending: boolean) => (pending ? "#B8967A" : passed === false ? "#DC2626" : passed ? "#16A34A" : "#2563EB")

export function LiveBundleResults({ bundleId }: { bundleId: string }) {
  const [state, setState] = useState<{ status: "loading" } | { status: "pending"; message: string } | { status: "error"; message: string } | { status: "ready"; bundle: BundlePayload; result: ResultPayload }>({ status: "loading" })
  const load = useCallback(async () => {
    try {
      const [bundle, result] = await Promise.all([
        bffClient.action<BundlePayload>("student-bundle-get", { params: { sessionId: bundleId } }),
        bffClient.action<ResultPayload>("student-bundle-results", { params: { sessionId: bundleId } }),
      ])
      setState({ status: "ready", bundle, result })
    } catch (reason) {
      if (reason instanceof ApiError && [403, 409].includes(reason.status)) setState({ status: "pending", message: reason.message })
      else setState({ status: "error", message: reason instanceof Error ? reason.message : "Results could not be loaded." })
    }
  }, [bundleId])
  useEffect(() => { const timer = window.setTimeout(() => { void load() }, 0); return () => window.clearTimeout(timer) }, [load])

  if (state.status === "loading") return <StatusCard loading title="Checking your results" message="Only results your school has released are shown…" />
  if (state.status === "pending") {
    return (
      <StatusCard title="Results not released yet" message={state.message || "Your teacher has not published these results yet. Check back later."} icon={<Clock3 className="w-7 h-7" />}>
        <Link href="/student/dashboard" className={primaryButton} style={primaryStyle}>Return to Dashboard</Link>
      </StatusCard>
    )
  }
  if (state.status === "error") return <StatusCard title="Results unavailable" message={state.message}><button onClick={() => void load()} className={primaryButton} style={primaryStyle}>Try again</button></StatusCard>

  const { bundle, result } = state
  const examBundle = toExamBundle(bundle)
  const links = orderedLinks(bundle)
  const subjectResults: SubjectResult[] = result.subjects.map((item, index) => {
    const designed = examBundle.subjects[index] ?? { id: index, name: item.subject, emoji: subjectEmoji(item.subject), duration: 0, totalQuestions: 0, totalMarks: item.total_marks, passmark: 0, questions: [] }
    const pct = Math.round(Number(item.percentage) || 0)
    return {
      ...designed,
      id: links[index]?.id ?? index,
      name: item.subject || designed.name,
      pct,
      grade: item.grade ?? (item.pending_manual ? "" : `${pct}%`),
      color: resultColor(item.passed, item.pending_manual),
      emoji: subjectEmoji(item.subject || designed.name),
      live: {
        pending: item.pending_manual,
        passed: item.passed,
        scoreLabel: item.score === null ? "—" : `${item.score}/${item.total_marks}`,
        passMarkLabel: item.pass_mark === null ? "—" : `${item.pass_mark}%`,
      },
    }
  })
  const withPassMark = result.subjects.filter((item) => item.passed !== null && !item.pending_manual)
  const live: LiveBundleResultsData = {
    subjectResults,
    avgPct: result.percentage === null ? null : Math.round(result.percentage),
    grade: result.grade,
    passedCount: withPassMark.filter((item) => item.passed).length,
    passMarkCount: withPassMark.length,
    pending: result.pending_manual,
  }
  return <BundleResults bundle={{ ...examBundle, name: result.bundle.session_name || examBundle.name, class: subtitleOf(bundle), session: "" }} live={live} />
}
