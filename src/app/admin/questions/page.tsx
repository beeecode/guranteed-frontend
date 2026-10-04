import type { Metadata } from 'next';
import { AdminShell } from '@/components/layout/AdminShell';
import { bankQuestions } from '@/data/admin';
import { QuestionBank } from '@/features/admin/components/QuestionBank';

export const metadata: Metadata = { title: 'Question Bank' };

export default function AdminQuestionsPage() {
  return (
    <AdminShell title="Question Bank" subtitle={`${bankQuestions.length} questions across all subjects`}>
      <QuestionBank />
    </AdminShell>
  );
}
