// Mock data for the admin portal.

export const adminProfile = { name: 'Mrs. N. Adeyemi', role: 'Super Admin', initials: 'NA' };

export type ExamStatus = 'live' | 'scheduled' | 'completed' | 'draft' | 'cancelled';

// ── Dashboard ─────────────────────────────────────────────────
export const classScores = [
  { class: 'Nur 1', score: 82 },
  { class: 'Nur 2', score: 78 },
  { class: 'Prim 1', score: 75 },
  { class: 'Prim 2', score: 80 },
  { class: 'Prim 3', score: 77 },
  { class: 'Prim 4', score: 83 },
  { class: 'Prim 5', score: 81 },
  { class: 'Prim 6', score: 79 },
];

export const passFailRate = [
  { name: 'Passed', value: 82, color: '#16A34A' },
  { name: 'Failed', value: 18, color: '#EF4444' },
];

export const recentExams: { subject: string; class: string; date: string; status: ExamStatus; students: number }[] = [
  { subject: 'Mathematics', class: 'Primary 5', date: 'Oct 5, 2026', status: 'scheduled', students: 32 },
  { subject: 'English Language', class: 'Primary 5', date: 'Oct 6, 2026', status: 'live', students: 31 },
  { subject: 'Basic Science', class: 'Primary 4', date: 'Oct 3, 2026', status: 'completed', students: 28 },
  { subject: 'Computer Studies', class: 'Primary 6', date: 'Sept 28, 2026', status: 'completed', students: 35 },
];

export const bundleWidgets = [
  { label: 'Active Bundles', value: '2', emoji: '📚', color: '#B22234', bg: '#FFF0F0' },
  { label: 'Students Writing Now', value: '30', emoji: '✏️', color: '#16A34A', bg: '#F0FDF4' },
  { label: 'Subjects Active', value: '3', emoji: '🔬', color: '#2563EB', bg: '#EFF6FF' },
  { label: 'On Break', value: '4', emoji: '☕', color: '#D97706', bg: '#FFFBEB' },
];

// ── Students ──────────────────────────────────────────────────
export interface AdminStudent {
  id: string;
  name: string;
  class: string;
  gender: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  avatar: string;
}

export const adminStudents: AdminStudent[] = [
  { id: 'BMA/2026/001', name: 'Amara Johnson', class: 'Primary 5B', gender: 'Female', status: 'active', lastLogin: '2 hrs ago', avatar: 'AJ' },
  { id: 'BMA/2026/002', name: 'Emeka Obi', class: 'Primary 3A', gender: 'Male', status: 'active', lastLogin: '1 day ago', avatar: 'EO' },
  { id: 'BMA/2026/003', name: 'Fatima Hassan', class: 'Primary 6B', gender: 'Female', status: 'active', lastLogin: '5 hrs ago', avatar: 'FH' },
  { id: 'BMA/2026/004', name: 'Chidera Nwosu', class: 'Primary 4A', gender: 'Male', status: 'inactive', lastLogin: '1 week ago', avatar: 'CN' },
  { id: 'BMA/2026/005', name: 'Adaeze Eze', class: 'Primary 1C', gender: 'Female', status: 'active', lastLogin: '3 hrs ago', avatar: 'AE' },
  { id: 'BMA/2026/006', name: 'Taiwo Abiodun', class: 'Primary 2B', gender: 'Male', status: 'active', lastLogin: 'Today', avatar: 'TA' },
  { id: 'BMA/2026/007', name: 'Ngozi Chukwu', class: 'Primary 6A', gender: 'Female', status: 'active', lastLogin: '1 hr ago', avatar: 'NC' },
  { id: 'BMA/2026/008', name: 'Ibrahim Bello', class: 'Primary 5A', gender: 'Male', status: 'inactive', lastLogin: '2 weeks ago', avatar: 'IB' },
];

// ── Question bank ─────────────────────────────────────────────
export interface BankQuestion {
  id: number;
  text: string;
  subject: string;
  class: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: string;
  marks: number;
  status: 'active' | 'draft';
}

export const bankQuestions: BankQuestion[] = [
  { id: 1, text: 'Which of the following is a proper noun?', subject: 'English', class: 'Primary 5', topic: 'Nouns', difficulty: 'Easy', type: 'MCQ', marks: 2, status: 'active' },
  { id: 2, text: 'The plural of "child" is:', subject: 'English', class: 'Primary 5', topic: 'Grammar', difficulty: 'Easy', type: 'MCQ', marks: 2, status: 'active' },
  { id: 3, text: 'Solve: 24 ÷ 6 + 3 × 2 =', subject: 'Mathematics', class: 'Primary 5', topic: 'BODMAS', difficulty: 'Medium', type: 'MCQ', marks: 3, status: 'active' },
  { id: 4, text: 'What is the SI unit of electric current?', subject: 'Basic Science', class: 'Primary 6', topic: 'Electricity', difficulty: 'Hard', type: 'MCQ', marks: 3, status: 'active' },
  { id: 5, text: 'The capital of Nigeria is Lagos. True or False?', subject: 'Social Studies', class: 'Primary 4', topic: 'Civics', difficulty: 'Easy', type: 'True/False', marks: 1, status: 'active' },
  { id: 6, text: 'Photosynthesis takes place in the _____.', subject: 'Basic Science', class: 'Primary 5', topic: 'Plants', difficulty: 'Medium', type: 'MCQ', marks: 2, status: 'draft' },
  { id: 7, text: 'Name the first President of Nigeria.', subject: 'Social Studies', class: 'Primary 6', topic: 'History', difficulty: 'Medium', type: 'MCQ', marks: 2, status: 'active' },
];

// ── Examinations ──────────────────────────────────────────────
export interface AdminExam {
  id: number | string;
  title: string;
  subject: string;
  class: string;
  questions: number;
  duration: string;
  date: string;
  time: string;
  status: ExamStatus;
  attempts: number;
  type: 'single' | 'bundle';
}

export const singleExams: AdminExam[] = [
  { id: 1, title: 'Third Term Mathematics Exam', subject: 'Mathematics', class: 'Primary 5B', questions: 40, duration: '45 mins', date: 'Oct 5, 2026', time: '9:00 AM', status: 'scheduled', attempts: 0, type: 'single' },
  { id: 2, title: 'Third Term English Exam', subject: 'English Language', class: 'Primary 5B', questions: 40, duration: '45 mins', date: 'Oct 6, 2026', time: '10:30 AM', status: 'live', attempts: 31, type: 'single' },
  { id: 3, title: 'Third Term Basic Science Exam', subject: 'Basic Science', class: 'Primary 4A', questions: 35, duration: '40 mins', date: 'Oct 3, 2026', time: '9:00 AM', status: 'completed', attempts: 28, type: 'single' },
  { id: 4, title: 'Second Term Computer Studies Exam', subject: 'Computer Studies', class: 'Primary 6A', questions: 30, duration: '35 mins', date: 'Sept 28, 2026', time: '2:00 PM', status: 'completed', attempts: 35, type: 'single' },
  { id: 5, title: 'Social Studies Mid-Term Test', subject: 'Social Studies', class: 'Primary 3B', questions: 25, duration: '30 mins', date: 'Oct 12, 2026', time: '9:00 AM', status: 'draft', attempts: 0, type: 'single' },
];

export const bundleExams: AdminExam[] = [
  { id: 'primary5-midterm-2026', title: 'Mid-Term Examination', subject: '4 Subjects: Eng · Maths · Science · Social', class: 'Primary 5', questions: 160, duration: '2 hrs 30 mins', date: 'Oct 1, 2026', time: '9:00 AM', status: 'live', attempts: 30, type: 'bundle' },
  { id: 'primary4-midterm-2026', title: 'Mid-Term Examination', subject: '3 Subjects: Eng · Maths · Science', class: 'Primary 4', questions: 105, duration: '1 hr 45 mins', date: 'Oct 2, 2026', time: '9:00 AM', status: 'scheduled', attempts: 0, type: 'bundle' },
];

export const liveMonitorStats = [
  { label: 'Assigned', value: '32', color: '#6B7280' },
  { label: 'Online', value: '31', color: '#2563EB' },
  { label: 'Started', value: '28', color: '#D97706' },
  { label: 'Completed', value: '3', color: '#16A34A' },
  { label: 'Not Started', value: '1', color: '#EF4444' },
];

export const liveMonitorStudents = [
  { name: 'Amara Johnson', id: 'BMA/001', progress: 28, total: 40, status: 'In Progress', connection: 'strong' },
  { name: 'Emeka Obi', id: 'BMA/002', progress: 40, total: 40, status: 'Submitted', connection: 'strong' },
  { name: 'Fatima Hassan', id: 'BMA/003', progress: 15, total: 40, status: 'In Progress', connection: 'weak' },
  { name: 'Chidera Nwosu', id: 'BMA/004', progress: 0, total: 40, status: 'Not Started', connection: 'offline' },
];

// ── Results ───────────────────────────────────────────────────
export interface AdminResult {
  student: string;
  id: string;
  class: string;
  exam: string;
  subject: string;
  score: number;
  total: number;
  grade: string;
  status: 'published' | 'pending';
  date: string;
}

export const adminResults: AdminResult[] = [
  { student: 'Amara Johnson', id: 'BMA/001', class: 'Primary 5B', exam: 'Third Term Math', subject: 'Mathematics', score: 85, total: 100, grade: 'A', status: 'published', date: 'Sept 15' },
  { student: 'Emeka Obi', id: 'BMA/002', class: 'Primary 3A', exam: 'Third Term English', subject: 'English', score: 72, total: 100, grade: 'B', status: 'published', date: 'Sept 16' },
  { student: 'Fatima Hassan', id: 'BMA/003', class: 'Primary 6B', exam: 'Third Term Science', subject: 'Basic Science', score: 91, total: 100, grade: 'A+', status: 'published', date: 'Sept 18' },
  { student: 'Chidera Nwosu', id: 'BMA/004', class: 'Primary 4A', exam: 'Third Term Math', subject: 'Mathematics', score: 58, total: 100, grade: 'C+', status: 'pending', date: 'Sept 15' },
  { student: 'Adaeze Eze', id: 'BMA/005', class: 'Primary 1C', exam: 'Third Term English', subject: 'English', score: 44, total: 100, grade: 'F', status: 'pending', date: 'Sept 16' },
  { student: 'Taiwo Abiodun', id: 'BMA/006', class: 'Primary 2B', exam: 'Third Term Social', subject: 'Social Studies', score: 76, total: 100, grade: 'B+', status: 'published', date: 'Sept 19' },
];

export const scoreDistribution = [
  { range: '0-49', students: 3 },
  { range: '50-59', students: 7 },
  { range: '60-69', students: 14 },
  { range: '70-79', students: 22 },
  { range: '80-89', students: 18 },
  { range: '90-100', students: 8 },
];

export const gradeDistribution = [
  { name: 'A/A+', value: 26, color: '#16A34A' },
  { name: 'B/B+', value: 36, color: '#2563EB' },
  { name: 'C/C+', value: 21, color: '#D97706' },
  { name: 'D', value: 10, color: '#9333EA' },
  { name: 'F', value: 7, color: '#EF4444' },
];
