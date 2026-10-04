'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnswerOptions } from '@/components/exam/AnswerOptions';
import { ExamControls } from '@/components/exam/ExamControls';
import { QuestionCard } from '@/components/exam/QuestionCard';
import type { Exam } from '@/types/exam';
import { useAnswerToast } from '../hooks/useAnswerToast';
import { useCountdown } from '../hooks/useCountdown';
import { useExamSession } from '../hooks/useExamSession';
import { ExamHeader } from './ExamHeader';
import { ExamProgressBar } from './ExamProgressBar';
import { QuestionNavigatorDrawer, QuestionNavigatorPanel } from './QuestionNavigator';
import { SubmitExamModal } from './SubmitExamModal';

interface ExamScreenProps {
  examId: string;
  exam: Exam;
  studentName: string;
}

/** Live single-subject CBT exam: timer, question, options, navigator and submit flow. */
export function ExamScreen({ examId, exam, studentName }: ExamScreenProps) {
  const router = useRouter();
  const submittedPath = `/student/exam/${examId}/submitted`;

  const session = useExamSession(exam.questions);
  const { toast, celebrate } = useAnswerToast();
  const { secondsLeft } = useCountdown(exam.durationMinutes * 60, {
    onExpire: () => router.push(submittedPath),
  });
  const [navOpen, setNavOpen] = useState(false);
  const [submitModal, setSubmitModal] = useState(false);

  const { question, progress } = session;
  const total = exam.questions.length;

  const selectAnswer = (option: string) => {
    session.selectAnswer(option);
    celebrate();
  };

  const navigatorProps = { questions: exam.questions, statusOf: session.statusOf, onSelect: session.goTo, progress };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F9F5F1' }}>
      <ExamHeader
        subject={exam.subject}
        studentName={studentName}
        secondsLeft={secondsLeft}
        warning={secondsLeft < 600}
        critical={secondsLeft < 300}
        currentNumber={session.current + 1}
        total={total}
        onOpenNavigator={() => setNavOpen(true)}
        onSubmit={() => setSubmitModal(true)}
      />

      <ExamProgressBar percent={progress.percent} />

      <div className="flex flex-1">
        {/* ── Main Question Area ─────────────────── */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <div className="max-w-2xl mx-auto">
            <QuestionCard
              number={session.current + 1}
              total={total}
              text={question.text}
              flagged={session.flagged.has(question.id)}
              onToggleFlag={session.toggleFlag}
            />

            <AnswerOptions
              question={question}
              selectedLetter={session.answers[question.id]}
              toast={toast}
              animateSelected={session.lastAnswered === question.id}
              onSelect={selectAnswer}
            />

            <ExamControls
              onPrev={session.goPrev}
              onClear={session.clearAnswer}
              onNext={session.goNext}
              prevDisabled={session.isFirst}
              nextDisabled={session.isLast}
              notAllowedWhenDisabled
            />
          </div>
        </main>

        <QuestionNavigatorPanel {...navigatorProps} />
      </div>

      {navOpen && <QuestionNavigatorDrawer {...navigatorProps} onClose={() => setNavOpen(false)} />}

      {submitModal && (
        <SubmitExamModal
          unanswered={progress.unanswered}
          onCancel={() => setSubmitModal(false)}
          onConfirm={() => router.push(submittedPath)}
        />
      )}
    </div>
  );
}
