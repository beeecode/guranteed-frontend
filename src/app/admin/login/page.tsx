import type { Metadata } from 'next';
import { AdminLogin } from '@/features/auth/components/AdminLogin';

export const metadata: Metadata = { title: 'Admin Login' };

export default function AdminLoginPage() {
  return <AdminLogin />;
}
