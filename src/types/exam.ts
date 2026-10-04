/** Option letter a student can pick. */
export type AnswerLetter = 'A' | 'B' | 'C' | 'D';

export interface Question {
  id: number;
  text: string;
  /** Pre-labelled options, e.g. "A. Lagos" — the letter is `option[0]`, the label is `option.slice(3)`. */
  options: string[];
  answer: AnswerLetter;
}

/** Selected answers keyed by question id. */
export type AnswerMap = Record<number, string>;

/** How a question looks in the navigator grid. */
export type QuestionStatus = 'current' | 'flagged' | 'answered' | 'unanswered';

export interface ExamProgress {
  answered: number;
  unanswered: number;
  flagged: number;
  /** Whole-number percentage of answered questions. */
  percent: number;
}

/** A single-subject CBT exam. */
export interface Exam {
  subject: string;
  title: string;
  durationLabel: string;
  durationMinutes: number;
  questionCount: number;
  totalMarks: number;
  passmark: number;
  questions: Question[];
}

export interface Subject {
  name: string;
  emoji: string;
}

export interface BundleSubject extends Subject {
  id: number;
  /** Minutes allowed for this subject. */
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  passmark: number;
  questions: Question[];
}

export interface ExamBundle {
  id: string;
  name: string;
  class: string;
  session: string;
  term: string;
  date: string;
  time: string;
  transitionMode: 'manual' | 'auto';
  autoCountdownSecs: number;
  breakEnabled: boolean;
  /** Minutes. */
  breakDuration: number;
  canReturnToCompleted: boolean;
  subjects: BundleSubject[];
}

/** Phases of the multi-subject exam flow. */
export type BundlePhase = 'exam' | 'subject-complete' | 'break' | 'bundle-done';
