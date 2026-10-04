import type { Metadata } from 'next';
import { getExam } from '@/data/exams';
import { currentStudent } from '@/data/student';
import { ExamScreen } from '@/features/exam/components/ExamScreen';

export const metadata: Metadata = { title: 'Exam in Progress' };

export default async function ExamPage({ params }: PageProps<'/student/exam/[id]'>) {
  const { id } = await params;
  return <ExamScreen examId={id} exam={getExam(id)} studentName={currentStudent.name} />;
}
