import Link from 'next/link';
import { MonitorSmartphone, LayoutDashboard, ArrowLeft, Shield, Clock, Zap } from 'lucide-react';
import { GoldWave } from '@/components/ui/GoldWave';
import { Logo } from '@/components/ui/Logo';

/** /cbt — choose between the student and admin portals. */
export function PortalSelection() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FEFCE8' }}>
      {/* Header */}
      <header className="py-5 px-6 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(28,10,4,0.07)', background: 'rgba(254,252,232,0.95)' }}>
        <div className="flex items-center gap-2.5">
          <Logo className="w-9 h-9 object-contain" />
          <div>
            <span className="font-display font-bold text-[#5C1010] text-sm">GFMS</span>
            <span className="text-[#B8967A] text-xs tracking-widest ml-2 uppercase font-medium">CBT Portal</span>
          </div>
        </div>
        <div className="flex gap-5 items-center">
          <Link href="/" className="flex items-center gap-1.5 text-xs font-medium text-[#7A5C3A] hover:text-[#5C1010] uppercase tracking-widest transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Website
          </Link>
          <a href="#" className="text-xs font-medium text-[#7A5C3A] hover:text-[#5C1010] uppercase tracking-widest transition-colors">Help</a>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center mb-14 max-w-2xl">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-green-700 text-xs font-semibold uppercase tracking-widest">Portal Active</span>
          </div>
          <h1 className="font-display font-black text-[#1C0A04] leading-tight mb-2" style={{ fontSize: 'clamp(2.4rem,5vw,3.6rem)' }}>
            Computer-Based <span style={{ color: '#5C1010' }}>Testing.</span>
          </h1>
          <GoldWave width={180} />
          <p className="text-[#7A5C3A] text-base mt-4">
            Secure, modern examinations. Select your portal below.
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl w-full mx-auto">
          {/* Student Portal */}
          <div className="bg-white p-10 relative shadow-md" style={{ border: '1px solid rgba(28,10,4,0.08)', borderRadius: 4 }}>
            <div className="absolute -top-3 left-8 w-20 h-4" style={{ background: 'rgba(255,255,255,0.9)', boxShadow: '0 1px 3px rgba(0,0,0,0.12)', borderRadius: 2, transform: 'rotate(-1deg)' }} />
            <div className="w-12 h-12 flex items-center justify-center mb-6" style={{ background: '#5C1010', borderRadius: 4 }}>
              <MonitorSmartphone className="w-6 h-6 text-white" />
            </div>
            <div className="section-number mb-3">Student Portal</div>
            <h2 className="font-display font-bold text-[#1C0A04] text-2xl mb-4">Student Login</h2>
            <p className="text-[#7A5C3A] text-sm leading-relaxed mb-8">
              Access your scheduled tests and examinations. View your results, performance analytics and exam history.
            </p>
            <div className="space-y-2 mb-10">
              {['Take scheduled examinations', 'View published results', 'Track your performance'].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs" style={{ color: '#7A5C3A' }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#5C1010' }} />
                  {f}
                </div>
              ))}
            </div>
            <Link href="/student/login" className="inline-block px-8 py-3.5 text-sm font-semibold text-white hover:opacity-90 transition-all" style={{ background: '#5C1010', borderRadius: 4 }}>
              Student Login →
            </Link>
          </div>

          {/* Admin Portal */}
          <div className="p-10 relative" style={{ background: '#FBF8D6', border: '1px solid rgba(28,10,4,0.08)', borderRadius: 4 }}>
            <div className="absolute -top-3 right-8 w-16 h-4" style={{ background: 'rgba(255,255,255,0.88)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: 2, transform: 'rotate(1.5deg)' }} />
            <div className="w-12 h-12 flex items-center justify-center mb-6" style={{ border: '1.5px solid rgba(28,10,4,0.2)', borderRadius: 4 }}>
              <LayoutDashboard className="w-6 h-6" style={{ color: '#7A5C3A' }} />
            </div>
            <div className="section-number mb-3">Administration</div>
            <h2 className="font-display font-bold text-[#1C0A04] text-2xl mb-4">Admin Login</h2>
            <p className="text-[#7A5C3A] text-sm leading-relaxed mb-8">
              Manage examinations, students, question banks, results and full system settings. Restricted access only.
            </p>
            <div className="space-y-2 mb-10">
              {['Create & schedule examinations', 'Manage students & classes', 'Publish & analyse results'].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs" style={{ color: '#7A5C3A' }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#B8967A' }} />
                  {f}
                </div>
              ))}
            </div>
            <Link href="/admin/login" className="inline-block px-8 py-3.5 text-sm font-semibold transition-all hover:bg-[#5C1010] hover:text-white" style={{ border: '1.5px solid #5C1010', color: '#5C1010', borderRadius: 4 }}>
              Admin Login →
            </Link>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-8 mt-12">
          {[
            { icon: Shield, label: 'Secure & Encrypted' },
            { icon: Clock, label: 'Auto-Saved Progress' },
            { icon: Zap, label: 'Instant Submission' },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-2">
              <b.icon className="w-3.5 h-3.5" style={{ color: '#B8967A' }} />
              <span className="text-xs font-medium uppercase tracking-widest" style={{ color: '#B8967A' }}>{b.label}</span>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-5 text-center" style={{ borderTop: '1px solid rgba(28,10,4,0.07)' }}>
        <p className="text-xs font-medium uppercase tracking-widest" style={{ color: '#B8967A' }}>© 2026 Guaranteed Future Model Schools · Computer-Based Testing System</p>
      </footer>
    </div>
  );
}
