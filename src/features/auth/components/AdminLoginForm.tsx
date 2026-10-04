'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { useMockLogin } from '../hooks/useMockLogin';

export function AdminLoginForm() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const { loading, error, submit } = useMockLogin({
    isValid: () => Boolean(form.email && form.password),
    onSuccess: () => router.push('/admin/dashboard'),
    errorMessage: 'Please enter your email and password.',
  });

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
        <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3.5 rounded-xl border border-[#D9C6B2] focus:outline-none focus:ring-2 focus:ring-[#8B0000]/30 focus:border-[#8B0000] text-sm transition-all" placeholder="admin@gfms.edu.ng" />
      </div>
      <div>
        <div className="flex justify-between mb-1.5">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <a href="#" className="text-xs text-[#8B0000] hover:underline">Forgot Password?</a>
        </div>
        <div className="relative">
          <input type={show ? 'text' : 'password'} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-3.5 pr-12 rounded-xl border border-[#D9C6B2] focus:outline-none focus:ring-2 focus:ring-[#8B0000]/30 focus:border-[#8B0000] text-sm transition-all" placeholder="Enter your password" />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="remember" className="w-4 h-4 rounded accent-[#8B0000]" />
        <label htmlFor="remember" className="text-sm text-gray-600">Keep me signed in</label>
      </div>
      <button type="submit" disabled={loading} className="w-full py-3.5 bg-[#8B0000] hover:bg-[#6B0000] disabled:bg-[#8B0000]/60 text-white rounded-xl font-medium text-base transition-all duration-200 shadow-md flex items-center justify-center gap-2">
        {loading ? (
          <><Spinner />Signing in...</>
        ) : 'Sign In to Admin Portal'}
      </button>
    </form>
  );
}
