import type { Metadata } from 'next';
import { currentParent } from '@/data/parent';
import { examResults } from '@/data/student';
import { StudentResults } from '@/features/results/components/StudentResults';

export const metadata: Metadata = { title: "Child's Results" };

export default function ParentResultsPage() {
  const firstName = currentParent.child.name.split(' ')[0];
  return (
    <StudentResults
      results={examResults}
      title={`${firstName}'s Results`}
      backHref="/parent/dashboard"
      performanceHref="/parent/performance"
    />
  );
}
