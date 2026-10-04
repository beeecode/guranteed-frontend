import type { Metadata } from 'next';
import { StudentLogin } from '@/features/auth/components/StudentLogin';

export const metadata: Metadata = { title: 'Student Login' };

export default function StudentLoginPage() {
  return <StudentLogin />;
}
