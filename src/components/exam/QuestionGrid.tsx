import type { Question, QuestionStatus } from '@/types/exam';
import { questionStatusStyle } from '@/features/exam/lib/questions';

interface QuestionGridProps {
  questions: Question[];
  statusOf: (idx: number) => QuestionStatus;
  onSelect: (idx: number) => void;
  gridClassName: string;
  buttonClassName: string;
  radius: number;
}

/** Numbered question navigator buttons coloured by answer status. */
export function QuestionGrid({ questions, statusOf, onSelect, gridClassName, buttonClassName, radius }: QuestionGridProps) {
  return (
    <div className={gridClassName}>
      {questions.map((q, idx) => (
        <button
          key={q.id}
          onClick={() => onSelect(idx)}
          className={buttonClassName}
          style={{ borderRadius: radius, ...questionStatusStyle(statusOf(idx)) }}
        >
          {idx + 1}
        </button>
      ))}
    </div>
  );
}
