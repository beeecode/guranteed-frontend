import type { Metadata } from 'next';
import { getBundle } from '@/data/bundles';
import { BundleOverview } from '@/features/bundle/components/BundleOverview';

export const metadata: Metadata = { title: 'Your Exam Journey' };

export default async function BundleOverviewPage({ params }: PageProps<'/student/bundle/[bundleId]/overview'>) {
  const { bundleId } = await params;
  return <BundleOverview bundle={getBundle(bundleId)} />;
}
