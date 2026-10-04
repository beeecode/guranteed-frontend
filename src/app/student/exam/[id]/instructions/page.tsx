import type { Metadata } from 'next';
import { getExam } from '@/data/exams';
import { ExamInstructions } from '@/features/exam/components/ExamInstructions';

export const metadata: Metadata = { title: 'Exam Instructions' };

export default async function ExamInstructionsPage({ params }: PageProps<'/student/exam/[id]/instructions'>) {
  const { id } = await params;
  return <ExamInstructions examId={id} exam={getExam(id)} />;
}
