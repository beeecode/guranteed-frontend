"use client"

/**
 * Stage 11: the DESIGNED multi-subject exam screen (BundleExamHeader, QuestionCard,
 * AnswerOptions, SubjectNavigator, SubmitSubjectModal, phase screens) driven by real
 * server data. Exam-safety behaviour comes from useLiveAttempt; the bundle phase comes
 * from the server via useLiveBundleExam. Additions to the design (save indicator,
 * written answers, passages, images, alerts) use the design's own styling.
 */

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AnswerOptions } from "@/components/exam/AnswerOptions"
import { ExamControls } from "@/components/exam/ExamControls"
import { QuestionCard } from "@/components/exam/QuestionCard"
import { useAnswerToast } from "@/features/exam/hooks/useAnswerToast"
import { getQuestionStatus, optionLetter } from "@/features/exam/lib/questions"
import { useLiveAttempt } from "@/features/exam/live/useLiveAttempt"
import { AlertBar, FloatingNotice, LIVE_TOAST, PassageCard, QuestionImage, SaveIndicator, StatusCard, SubmittingOverlay, WrittenAnswer } from "@/features/exam/live/LiveParts"
import type { ExamBundle } from "@/types/exam"
import { BundleExamHeader } from "../components/BundleExamHeader"
import { BundleProgressBars } from "../components/BundleProgressBars"
import { BreakScreen, BundleDoneScreen, SubjectCompleteScreen } from "../components/PhaseScreens"
import { SubjectNavigatorDrawer, SubjectNavigatorPanel } from "../components/SubjectNavigator"
import { SubmitSubjectModal } from "../components/SubmitSubjectModal"
import { optionIdForLetter, toAnswerMap, toQuestion } from "./adapters"
import { useLiveBundleExam } from "./useLiveBundleExam"

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

            {passage ? <PassageCard passage={passage} /> : null}

            <QuestionCard number={current + 1} total={questionCount} text={question.text} flagged={flagged.has(liveQuestion.id)} onToggleFlag={() => attempt.change(liveQuestion.id, { is_marked_for_review: !flagged.has(liveQuestion.id) })} headerSpacingClassName="mb-4" />

            {liveQuestion.image_url ? <QuestionImage src={liveQuestion.image_url} number={current + 1} /> : null}

            {hasOptions ? (
              <AnswerOptions question={question} selectedLetter={answerMap[liveQuestion.id]} toast={toast} animateSelected onSelect={selectAnswer} />
            ) : (
              <WrittenAnswer question={liveQuestion} value={draft?.answer_text ?? ""} disabled={attempt.locked} onChange={(text) => attempt.change(liveQuestion.id, { answer_text: text, selected_option_id: null })} />
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

      {attempt.submitting ? <SubmittingOverlay label={subject.name} /> : null}
    </div>
  )
}
