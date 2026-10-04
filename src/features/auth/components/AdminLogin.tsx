import Link from 'next/link';
import { ArrowLeft, GraduationCap, LayoutDashboard, Shield } from 'lucide-react';
import { AdminLoginForm } from './AdminLoginForm';

const features = ['Full exam lifecycle management', 'Real-time student monitoring', 'Comprehensive analytics & reports', 'Multi-role access control'];

export function AdminLogin() {
  return (
    <div className="min-h-screen bg-[#F9F5F1] flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#8B0000] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#B22234]/40 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-white/05 -translate-x-1/2 translate-y-1/2" />
        <Link href="/cbt" className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-heading font-600 text-white text-base">Guaranteed Future Model Schools</div>
            <div className="text-xs text-white/60">Admin Portal</div>
          </div>
        </Link>
        <div className="relative z-10">
          <div className="w-20 h-20 rounded-3xl bg-white/15 flex items-center justify-center mb-6">
            <LayoutDashboard className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-heading text-3xl font-700 text-white mb-3">Administration Portal</h2>
          <p className="text-white/70 text-sm leading-relaxed mb-8">Manage students, create examinations, monitor live tests, and publish results — all from one powerful dashboard.</p>
          <div className="space-y-3">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-2.5 text-white/80 text-sm">
                <div className="w-5 h-5 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-2 bg-white/10 rounded-2xl px-5 py-4">
          <Shield className="w-5 h-5 text-[#D9C6B2] flex-shrink-0" />
          <p className="text-white/70 text-xs">This portal is restricted to authorized school administrators only.</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-[#B22234] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="font-heading font-600 text-[#8B0000]">Guaranteed Future Model Schools</div>
          </div>

          <div className="mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#8B0000]/10 flex items-center justify-center mb-4">
              <LayoutDashboard className="w-7 h-7 text-[#8B0000]" />
            </div>
            <h1 className="font-heading text-3xl font-700 text-gray-900 mb-2">Admin Login</h1>
            <p className="text-gray-500 text-sm">Sign in to access the administration dashboard.</p>
          </div>

          <AdminLoginForm />

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <Link href="/cbt" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#8B0000] transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Portal Selection
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
