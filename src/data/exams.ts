import type { Exam } from '@/types/exam';

/** Single-subject exam used by /student/exam/[id]/* (every id resolves to it, as before). */
export const englishExam: Exam = {
  subject: 'English Language',
  title: 'Third Term CBT Examination',
  durationLabel: '45 Minutes',
  durationMinutes: 45,
  questionCount: 40,
  totalMarks: 100,
  passmark: 50,
  questions: [
    { id: 1, text: 'Which of the following is a proper noun?', options: ['A. city', 'B. Lagos', 'C. country', 'D. school'], answer: 'B' },
    { id: 2, text: 'Choose the word that is spelled correctly:', options: ['A. recieve', 'B. beleive', 'C. achieve', 'D. freind'], answer: 'C' },
    { id: 3, text: 'The plural of "child" is:', options: ['A. childs', 'B. childes', 'C. children', 'D. childrens'], answer: 'C' },
    { id: 4, text: 'Which sentence is grammatically correct?', options: ['A. She go to school every day.', 'B. She goes to school every day.', 'C. She gone to school every day.', 'D. She going to school every day.'], answer: 'B' },
    { id: 5, text: 'What is the opposite of "ancient"?', options: ['A. Old', 'B. Modern', 'C. Antique', 'D. Historical'], answer: 'B' },
    { id: 6, text: 'A word that describes a noun is called a/an:', options: ['A. Adverb', 'B. Verb', 'C. Pronoun', 'D. Adjective'], answer: 'D' },
    { id: 7, text: 'Which punctuation mark ends a question?', options: ['A. Full stop', 'B. Comma', 'C. Question mark', 'D. Exclamation mark'], answer: 'C' },
    { id: 8, text: 'Choose the correct article: "I saw ___ elephant at the zoo."', options: ['A. a', 'B. an', 'C. the', 'D. no article needed'], answer: 'B' },
    { id: 9, text: '"The book is on the table." The word "on" is a:', options: ['A. Verb', 'B. Preposition', 'C. Adjective', 'D. Conjunction'], answer: 'B' },
    { id: 10, text: 'What is the past tense of "run"?', options: ['A. runned', 'B. runs', 'C. running', 'D. ran'], answer: 'D' },
  ],
};

export function getExam(_examId?: string): Exam {
  return englishExam;
}

export const examInstructions = [
  { emoji: '👀', text: 'Read every question carefully before selecting your answer.' },
  { emoji: '☝️', text: 'Select only ONE answer for each question unless stated otherwise.' },
  { emoji: '🚫', text: 'Do NOT close, refresh, or navigate away from this tab during the exam.' },
  { emoji: '💾', text: 'Your answers are saved automatically as you select them.' },
  { emoji: '🚩', text: 'You can flag questions to revisit before final submission.' },
  { emoji: '⏰', text: 'Submit before the timer expires. The system will auto-submit when time runs out.' },
  { emoji: '📶', text: 'Make sure you have a stable internet connection before starting.' },
  { emoji: '🆘', text: 'Contact your teacher or admin if you have any technical difficulties.' },
];

/** Simulated submission summary shown on /student/exam/[id]/submitted. */
export const submittedExamSummary = {
  score: 85,
  total: 100,
  answered: 38,
  totalQuestions: 40,
  subject: 'English Language',
  date: 'October 6, 2026',
};
