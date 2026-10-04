import type { ExamBundle, Question } from '@/types/exam';
import type { MonitorStudent } from '@/types/student';

const englishQuestions: Question[] = [
  { id: 1, text: 'Which of the following is a proper noun?', options: ['A. city', 'B. Lagos', 'C. country', 'D. school'], answer: 'B' },
  { id: 2, text: 'Choose the correctly spelled word:', options: ['A. recieve', 'B. beleive', 'C. achieve', 'D. freind'], answer: 'C' },
  { id: 3, text: 'The plural of "child" is:', options: ['A. childs', 'B. childes', 'C. children', 'D. childrens'], answer: 'C' },
  { id: 4, text: 'Which sentence is grammatically correct?', options: ['A. She go to school every day.', 'B. She goes to school every day.', 'C. She gone to school every day.', 'D. She going to school every day.'], answer: 'B' },
  { id: 5, text: 'The opposite of "ancient" is:', options: ['A. Old', 'B. Modern', 'C. Antique', 'D. Historical'], answer: 'B' },
  { id: 6, text: 'A word that describes a noun is called a/an:', options: ['A. Adverb', 'B. Verb', 'C. Pronoun', 'D. Adjective'], answer: 'D' },
  { id: 7, text: 'Which punctuation mark ends a question?', options: ['A. Full stop', 'B. Comma', 'C. Question mark', 'D. Exclamation mark'], answer: 'C' },
  { id: 8, text: 'Choose the correct article: "I saw ___ elephant at the zoo."', options: ['A. a', 'B. an', 'C. the', 'D. no article needed'], answer: 'B' },
  { id: 9, text: 'What part of speech is the word "on" in: "The book is on the table"?', options: ['A. Verb', 'B. Preposition', 'C. Adjective', 'D. Conjunction'], answer: 'B' },
  { id: 10, text: 'What is the past tense of "run"?', options: ['A. runned', 'B. runs', 'C. running', 'D. ran'], answer: 'D' },
];

const mathQuestions: Question[] = [
  { id: 1, text: 'What is 24 × 5?', options: ['A. 100', 'B. 110', 'C. 120', 'D. 130'], answer: 'C' },
  { id: 2, text: 'Which fraction is the largest?', options: ['A. 1/2', 'B. 3/8', 'C. 2/5', 'D. 3/4'], answer: 'D' },
  { id: 3, text: 'What is the perimeter of a square with side 7 cm?', options: ['A. 14 cm', 'B. 21 cm', 'C. 28 cm', 'D. 49 cm'], answer: 'C' },
  { id: 4, text: 'Simplify: 36 ÷ 4 + 5', options: ['A. 14', 'B. 11', 'C. 9', 'D. 41'], answer: 'A' },
  { id: 5, text: 'What is 15% of 200?', options: ['A. 25', 'B. 30', 'C. 35', 'D. 40'], answer: 'B' },
  { id: 6, text: 'How many faces does a cube have?', options: ['A. 4', 'B. 5', 'C. 6', 'D. 8'], answer: 'C' },
  { id: 7, text: 'What is the value of 7²?', options: ['A. 14', 'B. 42', 'C. 49', 'D. 56'], answer: 'C' },
  { id: 8, text: 'Round 3,472 to the nearest hundred:', options: ['A. 3,400', 'B. 3,500', 'C. 3,000', 'D. 3,470'], answer: 'B' },
  { id: 9, text: 'What is the LCM of 4 and 6?', options: ['A. 2', 'B. 8', 'C. 12', 'D. 24'], answer: 'C' },
  { id: 10, text: 'A bag contains 5 red, 3 blue, and 2 green balls. What is the probability of picking red?', options: ['A. 1/2', 'B. 1/3', 'C. 5/10', 'D. 3/10'], answer: 'C' },
];

const scienceQuestions: Question[] = [
  { id: 1, text: 'Which organ pumps blood around the body?', options: ['A. Lungs', 'B. Liver', 'C. Heart', 'D. Kidney'], answer: 'C' },
  { id: 2, text: 'Plants make their food through a process called:', options: ['A. Respiration', 'B. Photosynthesis', 'C. Digestion', 'D. Transpiration'], answer: 'B' },
  { id: 3, text: 'What state of matter has a definite shape and volume?', options: ['A. Gas', 'B. Liquid', 'C. Plasma', 'D. Solid'], answer: 'D' },
  { id: 4, text: 'What is the chemical symbol for water?', options: ['A. H2O', 'B. CO2', 'C. O2', 'D. NaCl'], answer: 'A' },
  { id: 5, text: 'Which planet is closest to the Sun?', options: ['A. Venus', 'B. Earth', 'C. Mercury', 'D. Mars'], answer: 'C' },
  { id: 6, text: 'Sound travels fastest through:', options: ['A. Air', 'B. Water', 'C. Vacuum', 'D. Solid'], answer: 'D' },
  { id: 7, text: 'Which of these is NOT a mammal?', options: ['A. Bat', 'B. Whale', 'C. Eagle', 'D. Human'], answer: 'C' },
  { id: 8, text: 'What part of the plant absorbs water from the soil?', options: ['A. Stem', 'B. Leaf', 'C. Root', 'D. Flower'], answer: 'C' },
  { id: 9, text: 'Light from the Sun takes about ___ to reach Earth:', options: ['A. 8 minutes', 'B. 8 hours', 'C. 8 seconds', 'D. 8 days'], answer: 'A' },
  { id: 10, text: 'Which gas do humans exhale when breathing out?', options: ['A. Oxygen', 'B. Nitrogen', 'C. Carbon dioxide', 'D. Hydrogen'], answer: 'C' },
];

const socialStudiesQuestions: Question[] = [
  { id: 1, text: 'What is the capital city of Nigeria?', options: ['A. Lagos', 'B. Abuja', 'C. Kano', 'D. Ibadan'], answer: 'B' },
  { id: 2, text: 'Which continent is Nigeria located in?', options: ['A. Asia', 'B. Europe', 'C. Africa', 'D. South America'], answer: 'C' },
  { id: 3, text: 'The River Nile is the world\'s ___:', options: ['A. Widest river', 'B. Shortest river', 'C. Longest river', 'D. Deepest river'], answer: 'C' },
  { id: 4, text: 'Which of these is a right every child has?', options: ['A. Right to education', 'B. Right to work full-time', 'C. Right to vote', 'D. Right to own land'], answer: 'A' },
  { id: 5, text: 'What is a community?', options: ['A. A group of people living and working together', 'B. A type of forest', 'C. A government office', 'D. A marketplace'], answer: 'A' },
  { id: 6, text: 'Which of these is a natural resource?', options: ['A. Car', 'B. Computer', 'C. Water', 'D. House'], answer: 'C' },
  { id: 7, text: 'The head of a family is usually called a:', options: ['A. Chief', 'B. Head of household', 'C. Elder', 'D. Mayor'], answer: 'B' },
  { id: 8, text: 'Nigeria gained independence in:', options: ['A. 1960', 'B. 1963', 'C. 1970', 'D. 1914'], answer: 'A' },
  { id: 9, text: 'What do we call the rules that govern a country?', options: ['A. Culture', 'B. Constitution', 'C. Community', 'D. Customs'], answer: 'B' },
  { id: 10, text: 'Which of these is an example of teamwork?', options: ['A. Working alone on a project', 'B. Students cleaning the school together', 'C. Fighting with classmates', 'D. Ignoring school rules'], answer: 'B' },
];

export const mockBundle: ExamBundle = {
  id: 'primary5-midterm-2026',
  name: 'Mid-Term Examination',
  class: 'Primary 5',
  session: '2025/2026',
  term: 'Second Term',
  date: 'Monday, October 12, 2026',
  time: '9:00 AM',
  transitionMode: 'manual',
  autoCountdownSecs: 10,
  breakEnabled: true,
  breakDuration: 5,
  canReturnToCompleted: false,
  subjects: [
    { id: 0, name: 'English Language', emoji: '📘', duration: 30, totalQuestions: 10, totalMarks: 40, passmark: 20, questions: englishQuestions },
    { id: 1, name: 'Mathematics', emoji: '➕', duration: 30, totalQuestions: 10, totalMarks: 40, passmark: 20, questions: mathQuestions },
    { id: 2, name: 'Basic Science', emoji: '🔬', duration: 30, totalQuestions: 10, totalMarks: 40, passmark: 20, questions: scienceQuestions },
    { id: 3, name: 'Social Studies', emoji: '🌍', duration: 30, totalQuestions: 10, totalMarks: 40, passmark: 20, questions: socialStudiesQuestions },
  ],
};

// Mock students for live monitoring
export const mockMonitorStudents: MonitorStudent[] = [
  { id: 'P5-001', name: 'Amara Johnson', currentSubjectIdx: 1, currentQuestion: 8, timeLeft: 1335, status: 'writing', connected: true, subjectsCompleted: 1, answers: { 0: 10, 1: 8 } },
  { id: 'P5-002', name: 'Daniel James', currentSubjectIdx: 1, currentQuestion: 12, timeLeft: 1121, status: 'writing', connected: true, subjectsCompleted: 1, answers: { 0: 10, 1: 12 } },
  { id: 'P5-003', name: 'Chidinma Eze', currentSubjectIdx: 0, currentQuestion: 6, timeLeft: 1540, status: 'writing', connected: true, subjectsCompleted: 0, answers: { 0: 6 } },
  { id: 'P5-004', name: 'Emeka Obi', currentSubjectIdx: 2, currentQuestion: 3, timeLeft: 1680, status: 'writing', connected: true, subjectsCompleted: 2, answers: { 0: 10, 1: 10, 2: 3 } },
  { id: 'P5-005', name: 'Fatima Abdullahi', currentSubjectIdx: 1, currentQuestion: 5, timeLeft: 900, status: 'break', connected: true, subjectsCompleted: 1, answers: { 0: 10 } },
  { id: 'P5-006', name: 'Kelechi Nwosu', currentSubjectIdx: 3, currentQuestion: 7, timeLeft: 1245, status: 'writing', connected: true, subjectsCompleted: 3, answers: { 0: 10, 1: 10, 2: 10, 3: 7 } },
  { id: 'P5-007', name: 'Aisha Bello', currentSubjectIdx: 3, currentQuestion: 10, timeLeft: 980, status: 'done', connected: true, subjectsCompleted: 4, answers: { 0: 10, 1: 10, 2: 10, 3: 10 } },
  { id: 'P5-008', name: 'Obiora Chukwu', currentSubjectIdx: 0, currentQuestion: 0, timeLeft: 1800, status: 'notStarted', connected: false, subjectsCompleted: 0, answers: {} },
];

/** Every bundle URL currently resolves to the mock bundle (same as the original app). */
export function getBundle(_bundleId?: string): ExamBundle {
  return mockBundle;
}
