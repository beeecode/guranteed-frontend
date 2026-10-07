export interface Student {
  name: string;
  id: string;
  class: string;
  avatar: string;
  session: string;
}

export interface RecentResult {
  subject: string;
  score: number;
  total: number;
  grade: string;
  emoji: string;
  date: string;
}

export interface ExamResult {
  subject: string;
  exam: string;
  score: number;
  total: number;
  grade: string;
  status: 'Pass' | 'Fail';
  date: string;
  color: string;
}

export interface Announcement {
  title: string;
  time: string;
  emoji: string;
}

export interface MonitorStudent {
  id: string;
  name: string;
  currentSubjectIdx: number;
  currentQuestion: number;
  /** Seconds left in the current subject. */
  timeLeft: number;
  status: 'writing' | 'break' | 'done' | 'notStarted';
  connected: boolean;
  subjectsCompleted: number;
  /** Answered-question count keyed by subject index. */
  answers: Record<number, number>;
}

/** A parent account; each parent login is linked to a single child. */
export interface Parent {
  name: string;
  avatar: string;
  relationship: string;
  child: Student;
}
