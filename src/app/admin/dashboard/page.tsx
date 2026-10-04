import type { Metadata } from 'next';
import { AdminShell } from '@/components/layout/AdminShell';
import { AdminOverview } from '@/features/admin/components/AdminOverview';

export const metadata: Metadata = { title: 'Admin Dashboard' };

export default function AdminDashboardPage() {
  return (
    <AdminShell title="Dashboard" subtitle="Welcome back, Mrs. Adeyemi">
      <AdminOverview />
    </AdminShell>
  );
}
