'use client';

import { useState } from 'react';
import type { AnswerMap, BundlePhase, ExamBundle } from '@/types/exam';
import { useCountdown } from '@/features/exam/hooks/useCountdown';
import { getQuestionStatus, optionLetter, toggleInSet } from '@/features/exam/lib/questions';
import { sum } from '@/lib/format';

/**
 * State machine for a multi-subject exam:
 * exam → (submit) → subject-complete → [break] → exam (next subject) … → bundle-done.
 * Each subject has its own timer; answers/flags are kept per subject index.
 */
export function useBundleExam(bundle: ExamBundle) {
  const [phase, setPhase] = useState<BundlePhase>('exam');
  const [subjectIdx, setSubjectIdx] = useState(0);
  const [completedSubjects, setCompletedSubjects] = useState<Set<number>>(new Set());
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [allAnswers, setAllAnswers] = useState<Record<number, AnswerMap>>({});
  const [allFlagged, setAllFlagged] = useState<Record<number, Set<number>>>({});
  const [submitModalOpen, setSubmitModalOpen] = useState(false);

  const subject = bundle.subjects[subjectIdx];
  const questions = subject.questions;
  const question = questions[currentQuestion];
  const subjectAnswers = allAnswers[subjectIdx] ?? {};
  const subjectFlagged = allFlagged[subjectIdx] ?? new Set<number>();
  const isLastSubject = subjectIdx === bundle.subjects.length - 1;

  const submitSubject = () => {
    setCompletedSubjects(prev => new Set(prev).add(subjectIdx));
    setSubmitModalOpen(false);
    setPhase(isLastSubject ? 'bundle-done' : 'subject-complete');
  };

  const timer = useCountdown(bundle.subjects[0].duration * 60, {
    running: phase === 'exam',
    onExpire: submitSubject,
  });

  const advanceToNextSubject = () => {
    const nextIdx = subjectIdx + 1;
    setSubjectIdx(nextIdx);
    setCurrentQuestion(0);
    timer.reset(bundle.subjects[nextIdx].duration * 60);
    setPhase('exam');
  };

  const subjectAnswered = Object.keys(subjectAnswers).length;
  const totalAnswered = sum(Object.values(allAnswers), a => Object.keys(a).length);
  const totalQuestions = sum(bundle.subjects, s => s.totalQuestions);

  return {
    phase,
    subjectIdx,
    subject,
    questions,
    question,
    currentQuestion,
    subjectAnswers,
    subjectFlagged,
    completedSubjects,
    isLastSubject,
    nextSubject: bundle.subjects[subjectIdx + 1],
    secondsLeft: timer.secondsLeft,
    subjectAnswered,
    subjectProgress: Math.round((subjectAnswered / questions.length) * 100),
    overallProgress: Math.round((totalAnswered / totalQuestions) * 100),
    statusOf: (idx: number) => getQuestionStatus(idx, currentQuestion, questions[idx], subjectAnswers, subjectFlagged),
    submitModalOpen,

    goTo: setCurrentQuestion,
    goPrev: () => setCurrentQuestion(c => Math.max(0, c - 1)),
    goNext: () => setCurrentQuestion(c => Math.min(questions.length - 1, c + 1)),
    selectAnswer: (option: string) =>
      setAllAnswers(prev => ({ ...prev, [subjectIdx]: { ...(prev[subjectIdx] ?? {}), [question.id]: optionLetter(option) } })),
    clearAnswer: () => setAllAnswers(prev => {
      const next = { ...prev, [subjectIdx]: { ...(prev[subjectIdx] ?? {}) } };
      delete next[subjectIdx][question.id];
      return next;
    }),
    toggleFlag: () => setAllFlagged(prev => ({ ...prev, [subjectIdx]: toggleInSet(prev[subjectIdx] ?? new Set(), question.id) })),
    openSubmitModal: () => setSubmitModalOpen(true),
    closeSubmitModal: () => setSubmitModalOpen(false),
    submitSubject,
    startBreak: () => setPhase('break'),
    advanceToNextSubject,
  };
}

export type BundleExamState = ReturnType<typeof useBundleExam>;
