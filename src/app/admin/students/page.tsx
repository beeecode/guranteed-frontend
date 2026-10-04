import type { Metadata } from 'next';
import { AdminShell } from '@/components/layout/AdminShell';
import { adminStudents } from '@/data/admin';
import { StudentsManager } from '@/features/admin/components/StudentsManager';

export const metadata: Metadata = { title: 'Students' };

export default function AdminStudentsPage() {
  return (
    <AdminShell title="Students" subtitle={`${adminStudents.length} total students`}>
      <StudentsManager />
    </AdminShell>
  );
}
