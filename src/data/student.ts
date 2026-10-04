import type { Announcement, ExamResult, RecentResult, Student } from '@/types/student';

export const currentStudent: Student = {
  name: 'Amara Johnson',
  id: 'GFMS/2026/042',
  class: 'Primary 5B',
  avatar: 'AJ',
  session: '2025/2026',
};

export const recentResults: RecentResult[] = [
  { subject: 'Mathematics', score: 85, total: 100, grade: 'A', emoji: '➕', date: 'Sept 15, 2026' },
  { subject: 'English Language', score: 78, total: 100, grade: 'B+', emoji: '📘', date: 'Sept 16, 2026' },
  { subject: 'Basic Science', score: 92, total: 100, grade: 'A+', emoji: '🔬', date: 'Sept 18, 2026' },
];

export const announcements: Announcement[] = [
  { title: 'Mid-Term Exam Bundle starts October 12th', time: '2 days ago', emoji: '📋' },
  { title: 'Results for First Term Now Published', time: '1 week ago', emoji: '🏆' },
  { title: 'School Cultural Day — October 20th', time: '3 days ago', emoji: '🎉' },
];

export const dashboardStats = [
  { label: 'Upcoming Exams', value: '1', emoji: '📅', border: '#3B82F6' },
  { label: 'Completed', value: '12', emoji: '✅', border: '#16A34A' },
  { label: 'Results Ready', value: '3', emoji: '📊', border: '#B22234' },
  { label: 'Avg. Score', value: '85%', emoji: '⭐', border: '#E8B830' },
];

export const examResults: ExamResult[] = [
  { subject: 'Mathematics', exam: 'Third Term Examination', score: 85, total: 100, grade: 'A', status: 'Pass', date: 'Sept 15, 2026', color: '#16A34A' },
  { subject: 'English Language', exam: 'Third Term Examination', score: 78, total: 100, grade: 'B+', status: 'Pass', date: 'Sept 16, 2026', color: '#2563EB' },
  { subject: 'Basic Science', exam: 'Third Term Examination', score: 92, total: 100, grade: 'A+', status: 'Pass', date: 'Sept 18, 2026', color: '#16A34A' },
  { subject: 'Social Studies', exam: 'Third Term Examination', score: 71, total: 100, grade: 'B', status: 'Pass', date: 'Sept 19, 2026', color: '#2563EB' },
  { subject: 'Computer Studies', exam: 'Second Term Examination', score: 88, total: 100, grade: 'A', status: 'Pass', date: 'Jun 10, 2026', color: '#16A34A' },
  { subject: 'Creative Arts', exam: 'Second Term Examination', score: 65, total: 100, grade: 'C+', status: 'Pass', date: 'Jun 11, 2026', color: '#D97706' },
];

export const subjectScores = [
  { subject: 'Maths', score: 85 },
  { subject: 'English', score: 78 },
  { subject: 'Science', score: 92 },
  { subject: 'Social', score: 71 },
  { subject: 'Computer', score: 88 },
  { subject: 'Arts', score: 65 },
];

export const termScores = [
  { term: '1st Term', score: 74 },
  { term: '2nd Term', score: 80 },
  { term: '3rd Term', score: 83 },
];

/** Mock per-subject percentages for the bundle results page, keyed by subject index. */
export const bundleScores: Record<number, number> = { 0: 78, 1: 65, 2: 82, 3: 63 };

export const teacherRemark = {
  text: '"Great effort overall! Amara showed strong performance in Basic Science. Focus more on Social Studies next term."',
  author: '— Mrs. N. Adeyemi, Class Teacher',
};
