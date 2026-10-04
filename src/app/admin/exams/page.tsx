import type { Metadata } from 'next';
import { AdminShell } from '@/components/layout/AdminShell';
import { singleExams } from '@/data/admin';
import { ExamsManager } from '@/features/admin/components/ExamsManager';

export const metadata: Metadata = { title: 'Examinations' };

export default function AdminExamsPage() {
  return (
    <AdminShell title="Examinations" subtitle={`${singleExams.length} exams this session`}>
      <ExamsManager />
    </AdminShell>
  );
}
