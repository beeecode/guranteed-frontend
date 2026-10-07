import type { PortalNavItem } from '@/components/layout/PortalDashboardShell';
import { mockBundle } from '@/data/bundles';

export const parentNavItems: PortalNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', emoji: '🏠', path: '/parent/dashboard' },
  { id: 'results', label: 'Results', emoji: '📊', path: '/parent/results' },
  { id: 'performance', label: 'Performance', emoji: '📈', path: '/parent/performance' },
  { id: 'exam-results', label: 'Exam Breakdown', emoji: '📋', path: `/parent/bundle/${mockBundle.id}/results` },
];
