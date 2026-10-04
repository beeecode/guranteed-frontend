'use client';

import { useState } from 'react';
import { AnswerOptions } from '@/components/exam/AnswerOptions';
import { ExamControls } from '@/components/exam/ExamControls';
import { QuestionCard } from '@/components/exam/QuestionCard';
import { useAnswerToast } from '@/features/exam/hooks/useAnswerToast';
import type { ExamBundle } from '@/types/exam';
import { useBundleExam } from '../hooks/useBundleExam';
import { BundleExamHeader } from './BundleExamHeader';
import { BundleProgressBars } from './BundleProgressBars';
import { BreakScreen, BundleDoneScreen, SubjectCompleteScreen } from './PhaseScreens';
import { SubjectNavigatorDrawer, SubjectNavigatorPanel } from './SubjectNavigator';
import { SubmitSubjectModal } from './SubmitSubjectModal';

/** Multi-subject exam flow: per-subject exam → subject complete → optional break → … → done. */
export function BundleExamScreen({ bundle }: { bundle: ExamBundle }) {
  const exam = useBundleExam(bundle);
  const { toast, celebrate } = useAnswerToast();
  const [navOpen, setNavOpen] = useState(false);

  // ── Phase rendering ─────────────────────────────────────
  if (exam.phase === 'bundle-done') return <BundleDoneScreen bundle={bundle} />;

  if (exam.phase === 'subject-complete') {
    return (
      <SubjectCompleteScreen
        bundle={bundle}
        currentSubjectIdx={exam.subjectIdx}
        breakEnabled={bundle.breakEnabled}
        onContinue={exam.advanceToNextSubject}
        onBreak={exam.startBreak}
      />
    );
  }

  if (exam.phase === 'break') {
    return (
      <BreakScreen
        bundle={bundle}
        currentSubjectIdx={exam.subjectIdx}
        breakDuration={bundle.breakDuration}
        onResume={exam.advanceToNextSubject}
      />
    );
  }

  // ── EXAM PHASE ──────────────────────────────────────────
  const { subject, questions, question, subjectIdx } = exam;
  const navigatorProps = {
    subjects: bundle.subjects,
    subjectIdx,
    completedSubjects: exam.completedSubjects,
    questions,
    statusOf: exam.statusOf,
    onSelect: exam.goTo,
  };

  const selectAnswer = (option: string) => {
    exam.selectAnswer(option);
    celebrate();
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F9F5F1' }}>
      <BundleExamHeader
        subjects={bundle.subjects}
        subjectIdx={subjectIdx}
        completedSubjects={exam.completedSubjects}
        secondsLeft={exam.secondsLeft}
        isLastSubject={exam.isLastSubject}
        onOpenNavigator={() => setNavOpen(true)}
        onSubmit={exam.openSubmitModal}
      />

      <BundleProgressBars subject={subject} subjectProgress={exam.subjectProgress} overallProgress={exam.overallProgress} />

      <div className="flex flex-1">
        {/* ── Main question area ─────────────────────────── */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <div className="max-w-2xl mx-auto">

            {/* Subject pill */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2 px-4 py-2 font-playful font-bold text-white text-sm" style={{ background: '#B22234', borderRadius: 999 }}>
                <span>{subject.emoji}</span>{subject.name} — Subject {subjectIdx + 1} of {bundle.subjects.length}
              </div>
            </div>

            <QuestionCard
              number={exam.currentQuestion + 1}
              total={questions.length}
              text={question.text}
              flagged={exam.subjectFlagged.has(question.id)}
              onToggleFlag={exam.toggleFlag}
              headerSpacingClassName="mb-4"
            />

            <AnswerOptions
              question={question}
              selectedLetter={exam.subjectAnswers[question.id]}
              toast={toast}
              animateSelected
              onSelect={selectAnswer}
            />

            <ExamControls
              onPrev={exam.goPrev}
              onClear={exam.clearAnswer}
              onNext={exam.goNext}
              prevDisabled={exam.currentQuestion === 0}
              nextDisabled={exam.currentQuestion === questions.length - 1}
            />
          </div>
        </main>

        <SubjectNavigatorPanel
          {...navigatorProps}
          subjectAnswered={exam.subjectAnswered}
          flaggedCount={exam.subjectFlagged.size}
          overallProgress={exam.overallProgress}
        />
      </div>

      {navOpen && <SubjectNavigatorDrawer {...navigatorProps} onClose={() => setNavOpen(false)} />}

      {exam.submitModalOpen && (
        <SubmitSubjectModal
          subject={subject}
          answers={exam.subjectAnswers}
          totalQ={questions.length}
          isLast={exam.isLastSubject}
          nextSubjectName={exam.nextSubject?.name}
          onCancel={exam.closeSubmitModal}
          onSubmit={exam.submitSubject}
        />
      )}
    </div>
  );
}
