import type { Metadata } from 'next';
import { subjectScores, termScores } from '@/data/student';
import { StudentPerformance } from '@/features/results/components/StudentPerformance';

export const metadata: Metadata = { title: 'My Performance' };

export default function StudentPerformancePage() {
  return <StudentPerformance subjectScores={subjectScores} termScores={termScores} />;
}
