import type { Metadata } from 'next';
import { currentParent } from '@/data/parent';
import { subjectScores, termScores } from '@/data/student';
import { StudentPerformance } from '@/features/results/components/StudentPerformance';

export const metadata: Metadata = { title: "Child's Performance" };

export default function ParentPerformancePage() {
  const firstName = currentParent.child.name.split(' ')[0];
  return (
    <StudentPerformance
      subjectScores={subjectScores}
      termScores={termScores}
      title={`${firstName}'s Performance`}
      backHref="/parent/dashboard"
    />
  );
}
