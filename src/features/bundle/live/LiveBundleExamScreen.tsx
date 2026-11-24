"use client"

/**
 * Stage 11: the DESIGNED multi-subject exam screen (BundleExamHeader, QuestionCard,
 * AnswerOptions, SubjectNavigator, SubmitSubjectModal, phase screens) driven by real
 * server data. Exam-safety behaviour comes from useLiveAttempt; the bundle phase comes
 * from the server via useLiveBundleExam. Additions to the design (save indicator,
 * written answers, passages, images, alerts) use the design's own styling.
 */

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, Check, CloudOff, LoaderCircle, RefreshCw } from "lucide-react"
import { AnswerOptions } from "@/components/exam/AnswerOptions"
import { ExamControls } from "@/components/exam/ExamControls"
import { MathText } from "@/components/exam/MathText"
import { QuestionCard } from "@/components/exam/QuestionCard"
import { useAnswerToast } from "@/features/exam/hooks/useAnswerToast"
import { getQuestionStatus, optionLetter } from "@/features/exam/lib/questions"
import { useLiveAttempt } from "@/features/exam/live/useLiveAttempt"
import type { SaveState } from "@/features/exam/integration/types"
import type { ExamBundle } from "@/types/exam"
import { BundleExamHeader } from "../components/BundleExamHeader"
import { BundleProgressBars } from "../components/BundleProgressBars"
import { BreakScreen, BundleDoneScreen, SubjectCompleteScreen } from "../components/PhaseScreens"
import { SubjectNavigatorDrawer, SubjectNavigatorPanel } from "../components/SubjectNavigator"
import { SubmitSubjectModal } from "../components/SubmitSubjectModal"
import { optionIdForLetter, toAnswerMap, toQuestion } from "./adapters"
import { useLiveBundleExam } from "./useLiveBundleExam"

/** Neutral: praise such as "You got it!" could be read as "your answer is correct". */
const LIVE_TOAST = ["Answer selected ✓"]

function StatusCard({ title, message, loading = false, action }: { title: string; message: string; loading?: boolean; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "#F9F5F1" }}>
      <div className="bg-white w-full max-w-md p-8 text-center shadow-xl" style={{ borderRadius: 32 }}>
        <div className="mx-auto mb-4 w-14 h-14 flex items-center justify-center" style={{ borderRadius: 18, background: "rgba(178,34,52,0.08)", color: "#B22234" }}>
          {loading ? <LoaderCircle className="w-7 h-7 animate-spin" /> : <AlertTriangle className="w-7 h-7" />}
        </div>
        <h1 className="font-playful font-bold text-[#1C0A04] text-xl mb-2">{title}</h1>
        <p className="text-[#7A5C3A] text-sm leading-relaxed">{message}</p>
        {action ? (
          <button type="button" onClick={action.onClick} className="mt-6 inline-flex items-center gap-2 px-6 py-3 font-playful font-bold text-white text-sm" style={{ background: "#B22234", borderRadius: 999 }}>
            <RefreshCw className="w-4 h-4" /> {action.label}
          </button>
        ) : null}
      </div>
    </div>
  )
}

function AlertBar({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <div role="alert" className="flex items-start gap-3 p-4 mb-4 text-sm font-medium" style={{ borderRadius: 18, background: "rgba(249,115,22,0.10)", border: "2px solid rgba(249,115,22,0.35)", color: "#9A3412" }}>
      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onDismiss ? <button type="button" onClick={onDismiss} className="font-playful font-bold text-xs underline">Dismiss</button> : null}
    </div>
  )
}

function FloatingNotice({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  if (!message) return null
  return <div className="fixed bottom-4 inset-x-4 z-50 max-w-xl mx-auto"><AlertBar message={message} onDismiss={onDismiss} /></div>
}

/** Per-question save status: students must be able to see that an answer reached the server. */
function SaveIndicator({ state, onRetry }: { state: SaveState; onRetry: () => void }) {
  const look: Record<SaveState, { text: string; color: string; icon: ReactNode }> = {
    saved: { text: "Saved", color: "#16A34A", icon: <Check className="w-3.5 h-3.5" /> },
    saving: { text: "Saving…", color: "#7A5C3A", icon: <LoaderCircle className="w-3.5 h-3.5 animate-spin" /> },
    unsaved: { text: "Waiting to save…", color: "#7A5C3A", icon: <LoaderCircle className="w-3.5 h-3.5 animate-spin" /> },
    failed: { text: "Connection problem — retrying automatically", color: "#EA580C", icon: <CloudOff className="w-3.5 h-3.5" /> },
  }
  const { text, color, icon } = look[state]
  return (
    <div className="flex items-center gap-2 mb-4 text-xs font-bold font-playful" style={{ color }} aria-live="polite">
      {icon} {text}
      {state === "failed" ? <button type="button" onClick={onRetry} className="underline">Retry now</button> : null}
    </div>
  )
}

/** Break countdown from the server's (or the student's chosen) break end. Mounted per end time. */
function LiveBreak({ bundle, subjectIdx, endsAt, fallbackMinutes, onResume }: { bundle: ExamBundle; subjectIdx: number; endsAt: number | null; fallbackMinutes: number; onResume: () => void }) {
  const [minutes] = useState(() => (endsAt ? Math.max(0, (endsAt - Date.now()) / 60_000) : fallbackMinutes))
  return <BreakScreen bundle={bundle} currentSubjectIdx={subjectIdx} breakDuration={minutes} onResume={onResume} />
}

export function LiveBundleExamScreen({ bundleId }: { bundleId: string }) {
  const router = useRouter()
  const live = useLiveBundleExam(bundleId)
  const overview = `/student/bundle/${encodeURIComponent(bundleId)}/overview`

  if (live.load.status === "loading") return <StatusCard loading title="Restoring your exam" message="Loading your saved answers and the server timer…" />
  if (live.load.status === "error") return <StatusCard title="Exam unavailable" message={live.load.message} action={{ label: "Try again", onClick: live.retry }} />
  const bundle = live.examBundle
  if (!bundle) return null
  const notice = <FloatingNotice message={live.notice} onDismiss={() => live.setNotice("")} />

  switch (live.phase) {
    case "not-started":
      return <StatusCard title="This exam has not started" message="Open the bundle page and press Start when your supervisor tells you to." action={{ label: "Go to the bundle page", onClick: () => router.replace(overview) }} />
    case "bundle-done":
      return <BundleDoneScreen bundle={bundle} showQuestionCount={false} />
    case "paused":
      return <StatusCard title="Paused by your supervisor" message="Your saved answers are safe. Wait for your supervisor, then press Check again." action={{ label: "Check again", onClick: () => void live.refresh() }} />
    case "subject-complete":
      return <>{notice}<SubjectCompleteScreen bundle={bundle} currentSubjectIdx={live.subjectIdx} breakEnabled={bundle.breakEnabled} onContinue={() => void live.startNextSubject()} onBreak={live.takeBreak} /></>
    case "break":
      return <>{notice}<LiveBreak key={String(live.breakEndsAt)} bundle={bundle} subjectIdx={live.subjectIdx} endsAt={live.breakEndsAt} fallbackMinutes={Math.max(1, bundle.breakDuration || 5)} onResume={() => void live.startNextSubject()} /></>
    default: {
      const attempt = live.currentAttempt
      if (!attempt) return <>{notice}<StatusCard title="Ready for your next subject" message="Press Start when you are ready. The timer starts on the server when you do." action={{ label: live.busy ? "Starting…" : "Start subject", onClick: () => void live.startBundle() }} /></>
      if (attempt.status !== "ongoing") return <StatusCard loading title="Subject submitted" message="Checking the next step with the server…" action={{ label: "Check again", onClick: () => void live.refresh() }} />
      const sessionExamId = attempt.session_exam_id
      return (
        <LiveSubjectExam
          key={attempt.id}
          bundle={bundle}
          subjectIdx={live.subjectIdx}
          completedSubjects={live.completedSubjects}
          attemptId={attempt.id}
          submit={live.submitSubject}
          onSubmitted={() => void live.refresh()}
          onQuestionCount={(count) => live.recordQuestionCount(sessionExamId, count)}
        />
      )
    }
  }
}

function LiveSubjectExam({ bundle, subjectIdx, completedSubjects, attemptId, submit, onSubmitted, onQuestionCount }: {
  bundle: ExamBundle
  subjectIdx: number
  completedSubjects: Set<number>
  attemptId: number
  submit: (attemptId: number) => Promise<unknown>
  onSubmitted: () => void
  onQuestionCount: (count: number) => void
}) {
  const attempt = useLiveAttempt(String(attemptId), { submit, onSubmitted })
  const [current, setCurrent] = useState(0)
  const [navOpen, setNavOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const { toast, celebrate } = useAnswerToast(LIVE_TOAST)

  const liveQuestions = useMemo(() => attempt.data?.questions ?? [], [attempt.data])
  const questions = useMemo(() => liveQuestions.map(toQuestion), [liveQuestions])
  const answerMap = useMemo(() => toAnswerMap(liveQuestions, attempt.answers), [liveQuestions, attempt.answers])
  const flagged = useMemo(() => new Set(Object.values(attempt.answers).filter((answer) => answer.is_marked_for_review).map((answer) => answer.question_id)), [attempt.answers])
  const questionCount = liveQuestions.length
  useEffect(() => { if (attempt.status === "ready") onQuestionCount(questionCount) }, [attempt.status, questionCount, onQuestionCount])

  if (attempt.status === "loading") return <StatusCard loading title="Loading your paper" message="Restoring your saved answers and the server timer…" />
  if (attempt.status === "error") return <StatusCard title="Paper unavailable" message={attempt.error} action={{ label: "Try again", onClick: () => window.location.reload() }} />
  if (attempt.status === "finished") return <StatusCard loading title="Subject submitted" message="Your answers were submitted. Moving to the next step…" />

  const liveQuestion = liveQuestions[current]
  const question = questions[current]
  if (!liveQuestion || !question) return <StatusCard title="No questions available" message="The server did not return questions for this subject. Tell your supervisor." />

  const subject = { ...bundle.subjects[subjectIdx], totalQuestions: questionCount, questions }
  const subjects = bundle.subjects.map((item, index) => (index === subjectIdx ? subject : item))
  const isLastSubject = subjectIdx === bundle.subjects.length - 1
  const subjectAnswered = Object.keys(answerMap).length
  const subjectProgress = questionCount ? Math.round((subjectAnswered / questionCount) * 100) : 0
  const overallProgress = Math.round(((completedSubjects.size + (questionCount ? subjectAnswered / questionCount : 0)) / Math.max(1, bundle.subjects.length)) * 100)
  const statusOf = (index: number) => getQuestionStatus(index, current, questions[index], answerMap, flagged)
  const passage = attempt.data?.passages.find((item) => item.id === liveQuestion.passage_id)
  const draft = attempt.answers[liveQuestion.id]
  const hasOptions = Boolean(liveQuestion.options?.length)

  const navigatorProps = { subjects, subjectIdx, completedSubjects, questions, statusOf, onSelect: setCurrent }
  const selectAnswer = (option: string) => {
    if (attempt.locked) return
    attempt.change(liveQuestion.id, { selected_option_id: optionIdForLetter(liveQuestion, optionLetter(option)), answer_text: null })
    celebrate()
  }
  const openSubmit = () => { if (!attempt.locked && !attempt.submitting) setConfirming(true) }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F9F5F1" }}>
      <BundleExamHeader subjects={subjects} subjectIdx={subjectIdx} completedSubjects={completedSubjects} secondsLeft={attempt.seconds} isLastSubject={isLastSubject} onOpenNavigator={() => setNavOpen(true)} onSubmit={openSubmit} />
      <BundleProgressBars subject={subject} subjectProgress={subjectProgress} overallProgress={overallProgress} />

      <div className="flex flex-1">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <div className="max-w-2xl mx-auto">
            {attempt.notice ? <AlertBar message={attempt.notice} onDismiss={attempt.locked ? undefined : () => attempt.setNotice("")} /> : null}

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2 px-4 py-2 font-playful font-bold text-white text-sm" style={{ background: "#B22234", borderRadius: 999 }}>
                <span>{subject.emoji}</span>
                {subject.name} — Subject {subjectIdx + 1} of {bundle.subjects.length}
              </div>
            </div>

            {passage ? (
              <div className="bg-white p-6 mb-5 shadow-sm" style={{ borderRadius: 24, border: "2px solid rgba(217,198,178,0.4)" }}>
                <div className="font-playful font-bold text-[#B22234] text-xs uppercase tracking-wide mb-2">📄 {passage.title || "Read the passage"}</div>
                <p className="text-[#1C0A04] text-sm leading-relaxed"><MathText text={passage.content || passage.passage_text || ""} /></p>
              </div>
            ) : null}

            <QuestionCard number={current + 1} total={questionCount} text={question.text} flagged={flagged.has(liveQuestion.id)} onToggleFlag={() => attempt.change(liveQuestion.id, { is_marked_for_review: !flagged.has(liveQuestion.id) })} headerSpacingClassName="mb-4" />

            {liveQuestion.image_url ? (
              <div className="bg-white p-4 mb-5 shadow-sm" style={{ borderRadius: 24 }}>
                <img src={liveQuestion.image_url} alt={`Illustration for question ${current + 1}`} className="max-h-80 w-full object-contain" style={{ borderRadius: 16 }} />
              </div>
            ) : null}

            {hasOptions ? (
              <AnswerOptions question={question} selectedLetter={answerMap[liveQuestion.id]} toast={toast} animateSelected onSelect={selectAnswer} />
            ) : (
              <div className="mb-6">
                <textarea
                  value={draft?.answer_text ?? ""}
                  disabled={attempt.locked}
                  onChange={(event) => attempt.change(liveQuestion.id, { answer_text: event.target.value, selected_option_id: null })}
                  rows={liveQuestion.question_type === "essay" ? 10 : 4}
                  maxLength={10_000}
                  placeholder="Type your answer here…"
                  className="w-full p-5 text-sm sm:text-base text-[#1C0A04] outline-none"
                  style={{ borderRadius: 18, border: "2px solid rgba(217,198,178,0.6)", background: "#fff" }}
                />
              </div>
            )}

            <SaveIndicator state={attempt.saveStates[liveQuestion.id] ?? "saved"} onRetry={() => attempt.retrySave(liveQuestion.id)} />

            <ExamControls
              onPrev={() => setCurrent((value) => Math.max(0, value - 1))}
              onClear={() => attempt.change(liveQuestion.id, { selected_option_id: null, answer_text: null })}
              onNext={() => setCurrent((value) => Math.min(questionCount - 1, value + 1))}
              prevDisabled={current === 0}
              nextDisabled={current === questionCount - 1}
            />
          </div>
        </main>

        <SubjectNavigatorPanel {...navigatorProps} subjectAnswered={subjectAnswered} flaggedCount={flagged.size} overallProgress={overallProgress} />
      </div>

      {navOpen ? <SubjectNavigatorDrawer {...navigatorProps} onSelect={(index) => { setCurrent(index); setNavOpen(false) }} onClose={() => setNavOpen(false)} /> : null}

      {confirming ? (
        <SubmitSubjectModal
          subject={subject}
          answers={answerMap}
          totalQ={questionCount}
          isLast={isLastSubject}
          nextSubjectName={bundle.subjects[subjectIdx + 1]?.name}
          onCancel={() => setConfirming(false)}
          onSubmit={() => { setConfirming(false); void attempt.submit() }}
        />
      ) : null}

      {attempt.submitting ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white px-8 py-6 text-center shadow-2xl" style={{ borderRadius: 28 }}>
            <LoaderCircle className="mx-auto mb-3 w-8 h-8 animate-spin text-[#B22234]" />
            <div className="font-playful font-bold text-[#1C0A04]">Submitting {subject.name}…</div>
            <div className="text-xs text-[#7A5C3A] mt-1">Please keep this page open.</div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
