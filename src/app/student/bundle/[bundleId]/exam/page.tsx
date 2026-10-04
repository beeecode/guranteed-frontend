import type { Metadata } from 'next';
import { getBundle } from '@/data/bundles';
import { BundleExamScreen } from '@/features/bundle/components/BundleExamScreen';

export const metadata: Metadata = { title: 'Exam in Progress' };

export default async function BundleExamPage({ params }: PageProps<'/student/bundle/[bundleId]/exam'>) {
  const { bundleId } = await params;
  return <BundleExamScreen bundle={getBundle(bundleId)} />;
}
