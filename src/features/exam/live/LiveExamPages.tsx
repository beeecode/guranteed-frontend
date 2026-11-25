"use client"

/**
 * Stage 11: the DESIGNED single-subject exam pages (ExamInstructions + ExamAgreement,
 * ExamHeader/QuestionCard/AnswerOptions/QuestionNavigator/SubmitExamModal, ExamSubmitted)
 * on real server data. Exam-day safety (per-question autosave with retry, device backup of
 * unsaved answers, server timer, auto-submit at time-out, single-flight submit) comes from
 * useLiveAttempt, the same logic the bundle screens use.
 */

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AnswerOptions } from "@/components/exam/AnswerOptions"
import { ExamControls } from "@/components/exam/ExamControls"
import { QuestionCard } from "@/components/exam/QuestionCard"
import { optionIdForLetter, toAnswerMap, toQuestion } from "@/features/bundle/live/adapters"
import { ApiError } from "@/lib/api/core"
import { bffClient } from "@/lib/api/bffClient"
import { ExamAgreement } from "../components/ExamAgreement"
import { ExamHeader } from "../components/ExamHeader"
import { ExamInstructions } from "../components/ExamInstructions"
import { ExamProgressBar } from "../components/ExamProgressBar"
import { ExamSubmitted, type SubmittedSummary } from "../components/ExamSubmitted"
import { QuestionNavigatorDrawer, QuestionNavigatorPanel } from "../components/QuestionNavigator"
import { SubmitExamModal } from "../components/SubmitExamModal"
import { useAnswerToast } from "../hooks/useAnswerToast"
import type { ExamPreviewPayload } from "../integration/types"
import { getQuestionStatus, optionLetter } from "../lib/questions"
import { AlertBar, LIVE_TOAST, PassageCard, QuestionImage, SaveIndicator, StatusCard, SubmittingOverlay, WrittenAnswer } from "./LiveParts"
import { useLiveAttempt } from "./useLiveAttempt"

const examPath = (examId: string) => `/student/exam/${encodeURIComponent(examId)}`
const submittedPath = (examId: string, attemptId: string | number) => `${examPath(examId)}/submitted?attempt=${encodeURIComponent(String(attemptId))}`

/** What the submitted page shows before the result is released (kept for this tab only). */
interface SubmissionNote { subject: string; answered: number; total: number; submittedAt: string }
const noteKey = (attemptId: string | number) => `gfms-submitted-${attemptId}`
const saveNote = (attemptId: number, note: SubmissionNote) => { try { window.sessionStorage.setItem(noteKey(attemptId), JSON.stringify(note)) } catch { /* optional */ } }
const readNote = (attemptId: string): SubmissionNote | null => { try { const raw = window.sessionStorage.getItem(noteKey(attemptId)); return raw ? JSON.parse(raw) as SubmissionNote : null } catch { return null } }

/* ── Instructions ─────────────────────────────────────────── */

export function LiveExamInstructions({ examId }: { examId: string }) {
  const router = useRouter()
  const [state, setState] = useState<{ status: "loading" } | { status: "error"; message: string } | { status: "ready"; data: ExamPreviewPayload }>({ status: "loading" })
  const [starting, setStarting] = useState(false)
  const [startError, setStartError] = useState("")

  const load = useCallback(async () => {
    try { setState({ status: "ready", data: await bffClient.action<ExamPreviewPayload>("student-exam-preview", { params: { examId } }) }) }
    catch (reason) { setState({ status: "error", message: reason instanceof Error ? reason.message : "The exam could not be loaded." }) }
  }, [examId])
  useEffect(() => { const timer = window.setTimeout(() => { void load() }, 0); return () => window.clearTimeout(timer) }, [load])

  if (state.status === "loading") return <StatusCard loading title="Checking your exam" message="Confirming you can take this exam. Your timer has not started." />
  if (state.status === "error") return <StatusCard title="Exam unavailable" message={state.message} action={{ label: "Try again", onClick: () => { setState({ status: "loading" }); void load() } }} />

  const { exam, questionCount, canStart, reason, existingAttempt } = state.data
  const resumable = existingAttempt?.status === "ongoing"
  const begin = async () => {
    setStarting(true); setStartError("")
    try {
      const data = await bffClient.action<{ attempt: { id: number } }>("student-attempt-start", { payload: { examId: Number(examId) } })
      router.push(`${examPath(examId)}?attempt=${encodeURIComponent(String(data.attempt.id))}`)
    } catch (error) {
      if (error instanceof ApiError && error.code === "EXAM_ALREADY_SUBMITTED" && existingAttempt) router.push(submittedPath(examId, existingAttempt.id))
      else { setStartError(error instanceof Error ? error.message : "The exam could not be started."); setStarting(false) }
    }
  }
  const stats = [
    { label: "Duration", value: `${exam.duration_mins} min`, emoji: "⏱️" },
    { label: "Questions", value: String(questionCount), emoji: "❓" },
    { label: "Total Marks", value: String(exam.total_marks), emoji: "💯" },
  ]
  const footer = canStart
    ? <ExamAgreement onStart={() => void begin()} starting={starting} startLabel={resumable ? "Continue My Exam 🚀" : "Let's Go! I'm Ready! 🚀"} error={startError} />
    : existingAttempt && existingAttempt.status !== "ongoing"
      ? <AlertBar message="You have already submitted this exam." />
      : <AlertBar message={reason || "This exam cannot be started right now. Ask your supervisor."} />
  return <ExamInstructions subject={exam.subject?.name || "Exam"} title={exam.title} stats={stats} footer={footer} />
}

/* ── Exam ─────────────────────────────────────────────────── */

export function LiveExamScreen({ examId, attemptId }: { examId: string; attemptId?: string }) {
  if (!attemptId) return <StatusCard title="No exam attempt" message="Open the exam from your dashboard so the server can start or resume your attempt." />
  return <LiveExamAttempt key={attemptId} examId={examId} attemptId={attemptId} />
}

function LiveExamAttempt({ examId, attemptId }: { examId: string; attemptId: string }) {
  const router = useRouter()
  const [studentName, setStudentName] = useState("")
  const [current, setCurrent] = useState(0)
  const [navOpen, setNavOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const { toast, celebrate } = useAnswerToast(LIVE_TOAST)
  const attempt = useLiveAttempt(attemptId, {
    submit: (id) => bffClient.action("student-attempt-submit", { params: { attemptId: id } }),
    onSubmitted: () => router.replace(submittedPath(examId, attemptId)),
  })
  useEffect(() => {
    void bffClient.session<{ full_name?: string }>().then((user) => setStudentName(user?.full_name ?? "")).catch(() => undefined)
  }, [])

  const liveQuestions = useMemo(() => attempt.data?.questions ?? [], [attempt.data])
  const questions = useMemo(() => liveQuestions.map(toQuestion), [liveQuestions])
  const answerMap = useMemo(() => toAnswerMap(liveQuestions, attempt.answers), [liveQuestions, attempt.answers])
  const flagged = useMemo(() => new Set(Object.values(attempt.answers).filter((answer) => answer.is_marked_for_review).map((answer) => answer.question_id)), [attempt.answers])

  if (attempt.status === "loading") return <StatusCard loading title="Loading your paper" message="Restoring your saved answers and the server timer…" />
  if (attempt.status === "error") return <StatusCard title="Paper unavailable" message={attempt.error} action={{ label: "Try again", onClick: () => window.location.reload() }} />
  if (attempt.status === "finished") return <StatusCard loading title="Exam submitted" message="Your answers were submitted. Opening your summary…" />

  const total = liveQuestions.length
  const liveQuestion = liveQuestions[current]
  const question = questions[current]
  if (!liveQuestion || !question) return <StatusCard title="No questions available" message="The server did not return questions for this exam. Tell your supervisor." />

  const answered = Object.keys(answerMap).length
  const progress = { answered, unanswered: total - answered, flagged: flagged.size, percent: total ? Math.round((answered / total) * 100) : 0 }
  const statusOf = (index: number) => getQuestionStatus(index, current, questions[index], answerMap, flagged)
  const passage = attempt.data?.passages.find((item) => item.id === liveQuestion.passage_id)
  const draft = attempt.answers[liveQuestion.id]
  const subject = attempt.data?.attempt.exam?.title || "Exam"
  const navigatorProps = { questions, statusOf, onSelect: setCurrent, progress }

  const selectAnswer = (option: string) => {
    if (attempt.locked) return
    attempt.change(liveQuestion.id, { selected_option_id: optionIdForLetter(liveQuestion, optionLetter(option)), answer_text: null })
    celebrate()
  }
  const confirmSubmit = () => {
    setConfirming(false)
    void attempt.submit().then((ok) => { if (ok) saveNote(Number(attemptId), { subject, answered, total, submittedAt: new Date().toISOString() }) })
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F9F5F1" }}>
      <ExamHeader
        subject={subject}
        studentName={studentName}
        secondsLeft={attempt.seconds}
        warning={attempt.seconds < 600}
        critical={attempt.seconds < 300}
        currentNumber={current + 1}
        total={total}
        onOpenNavigator={() => setNavOpen(true)}
        onSubmit={() => { if (!attempt.locked && !attempt.submitting) setConfirming(true) }}
      />
      <ExamProgressBar percent={progress.percent} />

      <div className="flex flex-1">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <div className="max-w-2xl mx-auto">
            {attempt.notice ? <AlertBar message={attempt.notice} onDismiss={attempt.locked ? undefined : () => attempt.setNotice("")} /> : null}
            {attempt.locked && attempt.seconds > 0 && !attempt.submitting ? (
              <button type="button" onClick={() => window.location.reload()} className="mb-4 px-5 py-2.5 font-playful font-bold text-white text-sm" style={{ background: "#B22234", borderRadius: 999 }}>
                Check again
              </button>
            ) : null}

            {passage ? <PassageCard passage={passage} /> : null}
            <QuestionCard
              number={current + 1}
              total={total}
              text={question.text}
              flagged={flagged.has(liveQuestion.id)}
              onToggleFlag={() => attempt.change(liveQuestion.id, { is_marked_for_review: !flagged.has(liveQuestion.id) })}
            />
            {liveQuestion.image_url ? <QuestionImage src={liveQuestion.image_url} number={current + 1} /> : null}

            {liveQuestion.options?.length ? (
              <AnswerOptions question={question} selectedLetter={answerMap[liveQuestion.id]} toast={toast} animateSelected onSelect={selectAnswer} />
            ) : (
              <WrittenAnswer question={liveQuestion} value={draft?.answer_text ?? ""} disabled={attempt.locked} onChange={(text) => attempt.change(liveQuestion.id, { answer_text: text, selected_option_id: null })} />
            )}

            <SaveIndicator state={attempt.saveStates[liveQuestion.id] ?? "saved"} onRetry={() => attempt.retrySave(liveQuestion.id)} />

            <ExamControls
              onPrev={() => setCurrent((value) => Math.max(0, value - 1))}
              onClear={() => attempt.change(liveQuestion.id, { selected_option_id: null, answer_text: null })}
              onNext={() => setCurrent((value) => Math.min(total - 1, value + 1))}
              prevDisabled={current === 0}
              nextDisabled={current === total - 1}
              notAllowedWhenDisabled
            />
          </div>
        </main>
        <QuestionNavigatorPanel {...navigatorProps} />
      </div>

      {navOpen ? <QuestionNavigatorDrawer {...navigatorProps} onClose={() => setNavOpen(false)} /> : null}
      {confirming ? <SubmitExamModal unanswered={progress.unanswered} onCancel={() => setConfirming(false)} onConfirm={confirmSubmit} /> : null}
      {attempt.submitting ? <SubmittingOverlay label="your exam" /> : null}
    </div>
  )
}

/* ── Submitted ────────────────────────────────────────────── */

interface ResultPayload {
  attempt: { score: number | null; submitted_at?: string | null; exam?: { title?: string; subject?: { name?: string } | null } }
  result: { max_marks: number | null; percentage: number | null; pass_mark: number | null; passed: boolean | null; grade: string | null }
  breakdown: { total_questions: number | null; answered: number }
}

export function LiveExamSubmitted({ attemptId }: { attemptId?: string }) {
  const [state, setState] = useState<{ status: "loading" } | { status: "error"; message: string } | { status: "ready"; summary: SubmittedSummary }>({ status: "loading" })

  const load = useCallback(async () => {
    if (!attemptId) { setState({ status: "error", message: "No exam attempt was given. Open your results from the dashboard." }); return }
    const note = readNote(attemptId)
    const date = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : undefined)
    try {
      const data = await bffClient.action<ResultPayload>("student-attempt-results", { params: { attemptId } })
      const { attempt, result, breakdown } = data
      setState({ status: "ready", summary: {
        subject: attempt.exam?.subject?.name || attempt.exam?.title || note?.subject || "Exam",
        dateLabel: date(attempt.submitted_at ?? note?.submittedAt),
        answered: breakdown.answered,
        totalQuestions: breakdown.total_questions,
        result: { percentage: result.percentage, scoreLabel: attempt.score === null || result.max_marks === null ? "—" : `${attempt.score} / ${result.max_marks}`, passed: result.passed, passMark: result.pass_mark, grade: result.grade },
        pendingMessage: "",
      } })
    } catch (error) {
      if (error instanceof ApiError && (error.status === 403 || error.status === 409)) {
        setState({ status: "ready", summary: {
          subject: note?.subject || "Your exam",
          dateLabel: date(note?.submittedAt),
          answered: note?.answered ?? null,
          totalQuestions: note?.total ?? null,
          result: null,
          pendingMessage: error.status === 409
            ? "Some of your answers are being marked by your teacher. Your result will appear once marking is finished and the school releases it."
            : "Your official result will be released by the school. Check back later!",
        } })
        return
      }
      setState({ status: "error", message: error instanceof Error ? error.message : "Your submission could not be confirmed." })
    }
  }, [attemptId])
  useEffect(() => { const timer = window.setTimeout(() => { void load() }, 0); return () => window.clearTimeout(timer) }, [load])

  if (state.status === "loading") return <StatusCard loading title="Confirming your submission" message="Checking with the school server…" />
  if (state.status === "error") return <StatusCard title="Status unavailable" message={state.message} action={{ label: "Check again", onClick: () => { setState({ status: "loading" }); void load() } }} />
  return <ExamSubmitted summary={state.summary} onCheckAgain={() => { setState({ status: "loading" }); void load() }} />
}
