import type { Metadata } from 'next';
import { AdminShell } from '@/components/layout/AdminShell';
import { CreateBundleWizard } from '@/features/admin/components/CreateBundleWizard';

export const metadata: Metadata = { title: 'Create Exam Bundle' };

export default function CreateBundlePage() {
  return (
    <AdminShell title="Create Exam Bundle" subtitle="Configure a multi-subject examination">
      <CreateBundleWizard />
    </AdminShell>
  );
}
