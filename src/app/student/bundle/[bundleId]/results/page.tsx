import type { Metadata } from 'next';
import { getBundle } from '@/data/bundles';
import { BundleResults } from '@/features/bundle/components/BundleResults';

export const metadata: Metadata = { title: 'Exam Results' };

export default async function BundleResultsPage({ params }: PageProps<'/student/bundle/[bundleId]/results'>) {
  const { bundleId } = await params;
  return <BundleResults bundle={getBundle(bundleId)} />;
}
