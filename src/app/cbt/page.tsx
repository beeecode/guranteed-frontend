import type { Metadata } from 'next';
import { PortalSelection } from '@/features/auth/components/PortalSelection';

export const metadata: Metadata = { title: 'CBT Portal' };

export default function CbtPage() {
  return <PortalSelection />;
}
