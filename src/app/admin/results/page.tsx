import type { Metadata } from 'next';
import { AdminShell } from '@/components/layout/AdminShell';
import { adminResults } from '@/data/admin';
import { ResultsManager } from '@/features/admin/components/ResultsManager';

export const metadata: Metadata = { title: 'Results Management' };

export default function AdminResultsPage() {
  return (
    <AdminShell title="Results Management" subtitle={`${adminResults.length} results this session`}>
      <ResultsManager />
    </AdminShell>
  );
}
