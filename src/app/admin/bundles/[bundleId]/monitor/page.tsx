import type { Metadata } from 'next';
import { AdminShell } from '@/components/layout/AdminShell';
import { getBundle, mockMonitorStudents } from '@/data/bundles';
import { BundleMonitor } from '@/features/admin/components/BundleMonitor';

export const metadata: Metadata = { title: 'Live Exam Monitor' };

export default async function BundleMonitorPage({ params }: PageProps<'/admin/bundles/[bundleId]/monitor'>) {
  const { bundleId } = await params;
  const bundle = getBundle(bundleId);

  return (
    <AdminShell title="Live Exam Monitor" subtitle={`${bundle.name} · ${bundle.class}`}>
      <BundleMonitor bundle={bundle} students={mockMonitorStudents} />
    </AdminShell>
  );
}
