import type { Metadata } from 'next';
import { PortalDashboardShell } from '@/components/layout/PortalDashboardShell';
import { getBundle } from '@/data/bundles';
import { currentParent } from '@/data/parent';
import { announcements, examResults, recentResults } from '@/data/student';
import { summarizeBundleResults } from '@/features/bundle/lib/results';
import {
  ChildProfileCard, LatestExamResultsCard, ParentQuickLinks, ParentWelcomeBanner,
} from '@/features/parent/components/ParentDashboardSections';
import { parentNavItems } from '@/features/parent/navItems';
import { Announcements, DashboardStats, RecentResults } from '@/features/student/components/DashboardSections';
import { sum } from '@/lib/format';

export const metadata: Metadata = { title: 'Parent Dashboard' };

export default function ParentDashboardPage() {
  const parent = currentParent;
  const child = parent.child;
  const bundle = getBundle();
  const { avgPct, overall } = summarizeBundleResults(bundle);

  const average = Math.round(sum(examResults, r => r.score) / examResults.length);
  const passed = examResults.filter(r => r.status === 'Pass').length;
  const stats = [
    { label: 'Results Published', value: String(examResults.length), emoji: '📊', border: '#B22234' },
    { label: 'Avg. Score', value: `${average}%`, emoji: '⭐', border: '#E8B830' },
    { label: 'Exams Passed', value: `${passed}/${examResults.length}`, emoji: '✅', border: '#16A34A' },
    { label: 'Latest Grade', value: overall.grade, emoji: '🏆', border: '#3B82F6' },
  ];

  return (
    <PortalDashboardShell
      portalName="Parent Portal"
      title="Parent Dashboard"
      session={child.session}
      user={{ name: parent.name, avatar: parent.avatar, detail: `Parent of ${child.name.split(' ')[0]}` }}
      navItems={parentNavItems}
    >
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <ParentWelcomeBanner parent={parent} />
        <DashboardStats stats={stats} />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <LatestExamResultsCard bundle={bundle} averagePct={avgPct} grade={overall.grade} />
            <RecentResults results={recentResults} viewAllHref="/parent/results" />
          </div>

          {/* Right column */}
          <div className="space-y-5">
            <ChildProfileCard child={child} relationship={parent.relationship} />
            <ParentQuickLinks />
            <Announcements items={announcements} />
          </div>
        </div>
      </main>
    </PortalDashboardShell>
  );
}
