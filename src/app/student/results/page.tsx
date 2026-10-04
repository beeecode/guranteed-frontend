import type { Metadata } from 'next';
import { examResults } from '@/data/student';
import { StudentResults } from '@/features/results/components/StudentResults';

export const metadata: Metadata = { title: 'My Results' };

export default function StudentResultsPage() {
  return <StudentResults results={examResults} />;
}
