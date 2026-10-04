import type { Metadata } from 'next';
import { getBundle } from '@/data/bundles';
import { announcements, currentStudent, dashboardStats, recentResults } from '@/data/student';
import {
  Announcements, BundleExamCard, DashboardStats, MotivationCard, RecentResults, WelcomeBanner,
} from '@/features/student/components/DashboardSections';
import { StudentDashboardShell } from '@/features/student/components/StudentDashboardShell';

export const metadata: Metadata = { title: 'My Dashboard' };

export default function StudentDashboardPage() {
  const bundle = getBundle();

  return (
    <StudentDashboardShell student={currentStudent}>
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <WelcomeBanner student={currentStudent} />
        <DashboardStats stats={dashboardStats} />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <BundleExamCard bundle={bundle} />
            <RecentResults results={recentResults} />
          </div>

          {/* Right column */}
          <div className="space-y-5">
            <Announcements items={announcements} />
            <MotivationCard />
          </div>
        </div>
      </main>
    </StudentDashboardShell>
  );
}
