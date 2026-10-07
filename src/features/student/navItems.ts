import type { PortalNavItem } from '@/components/layout/PortalDashboardShell';

export const studentNavItems: PortalNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', emoji: '🏠', path: '/student/dashboard' },
  { id: 'results', label: 'Results', emoji: '📊', path: '/student/results' },
  { id: 'performance', label: 'Performance', emoji: '📈', path: '/student/performance' },
  { id: 'notifications', label: 'Notifications', emoji: '🔔', path: '/student/dashboard' },
  { id: 'profile', label: 'My Profile', emoji: '👤', path: '/student/dashboard' },
];
