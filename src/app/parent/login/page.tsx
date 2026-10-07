import type { Metadata } from 'next';
import { ParentLogin } from '@/features/auth/components/ParentLogin';

export const metadata: Metadata = { title: 'Parent Login' };

export default function ParentLoginPage() {
  return <ParentLogin />;
}
