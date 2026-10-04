'use client';

import { useState } from 'react';
import type { AnswerMap, Question } from '@/types/exam';
import { getProgress, getQuestionStatus, optionLetter, toggleInSet } from '../lib/questions';

/** Answer / flag / navigation state for a single-subject exam. */
export function useExamSession(questions: Question[]) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [lastAnswered, setLastAnswered] = useState<number | null>(null);

  const question = questions[current];

  return {
    current,
    question,
    answers,
    flagged,
    lastAnswered,
    progress: getProgress(questions.length, answers, flagged),
    isFirst: current === 0,
    isLast: current === questions.length - 1,
    statusOf: (idx: number) => getQuestionStatus(idx, current, questions[idx], answers, flagged),

    goTo: setCurrent,
    goPrev: () => setCurrent(c => Math.max(0, c - 1)),
    goNext: () => setCurrent(c => Math.min(questions.length - 1, c + 1)),
    selectAnswer: (option: string) => {
      setAnswers(prev => ({ ...prev, [question.id]: optionLetter(option) }));
      setLastAnswered(question.id);
    },
    clearAnswer: () => setAnswers(prev => {
      const next = { ...prev };
      delete next[question.id];
      return next;
    }),
    toggleFlag: () => setFlagged(prev => toggleInSet(prev, question.id)),
  };
}
