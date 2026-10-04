import type { Metadata } from 'next';
import { ExamSubmitted } from '@/features/exam/components/ExamSubmitted';

export const metadata: Metadata = { title: 'Exam Submitted' };

export default function ExamSubmittedPage() {
  return <ExamSubmitted />;
}
