import type { Metadata } from 'next';
import { AdmissionsPage } from '@/features/site/admissions/AdmissionsPage';

export const metadata: Metadata = { title: 'Admissions' };

export default function Page() {
  return <AdmissionsPage />;
}
