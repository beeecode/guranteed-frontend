import type { Metadata } from 'next';
import { getBundle } from '@/data/bundles';
import { BundleResults } from '@/features/bundle/components/BundleResults';

export const metadata: Metadata = { title: 'Exam Breakdown' };

export default async function ParentBundleResultsPage({ params }: PageProps<'/parent/bundle/[bundleId]/results'>) {
  const { bundleId } = await params;
  return <BundleResults bundle={getBundle(bundleId)} backHref="/parent/dashboard" />;
}
