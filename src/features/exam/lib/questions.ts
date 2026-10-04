import type { AnswerMap, ExamProgress, Question, QuestionStatus } from '@/types/exam';

/** "B. Lagos" → "B" */
export const optionLetter = (option: string) => option[0];

/** "B. Lagos" → "Lagos" */
export const optionLabel = (option: string) => option.slice(3);

export function getQuestionStatus(
  idx: number,
  currentIdx: number,
  question: Question,
  answers: AnswerMap,
  flagged: Set<number>,
): QuestionStatus {
  if (idx === currentIdx) return 'current';
  if (flagged.has(question.id)) return 'flagged';
  if (answers[question.id]) return 'answered';
  return 'unanswered';
}

const statusStyles: Record<QuestionStatus, React.CSSProperties> = {
  current: { background: '#B22234', color: '#fff', outline: '3px solid rgba(178,34,52,0.35)', outlineOffset: 2 },
  flagged: { background: '#F97316', color: '#fff' },
  answered: { background: '#16A34A', color: '#fff' },
  unanswered: { background: '#fff', color: '#7A5C3A', border: '2px solid rgba(217,198,178,0.6)' },
};

export const questionStatusStyle = (status: QuestionStatus) => statusStyles[status];

export function getProgress(questionCount: number, answers: AnswerMap, flagged: Set<number>): ExamProgress {
  const answered = Object.keys(answers).length;
  return {
    answered,
    unanswered: questionCount - answered,
    flagged: flagged.size,
    percent: Math.round((answered / questionCount) * 100),
  };
}

/** Immutable toggle for a Set of question ids. */
export function toggleInSet(set: Set<number>, id: number): Set<number> {
  const next = new Set(set);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}
