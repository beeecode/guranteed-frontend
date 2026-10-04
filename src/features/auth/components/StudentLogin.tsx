import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { DoodleStar } from '@/components/ui/DoodleStar';
import { Logo } from '@/components/ui/Logo';
import { StudentLoginForm } from './StudentLoginForm';

function FloatingChip({ emoji, text, style }: { emoji: string; text: string; style?: React.CSSProperties }) {
  return (
    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/25 px-3 py-2 shadow-lg"
      style={{ borderRadius: 12, ...style }}>
      <span className="text-base leading-none">{emoji}</span>
      <span className="text-white text-xs font-bold whitespace-nowrap font-playful">{text}</span>
    </div>
  );
}

export function StudentLogin() {
  return (
    <div className="min-h-screen flex" style={{ background: '#FFFDEB' }}>
      {/* ── Left Panel ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[48%] flex-col justify-between p-12 relative overflow-hidden" style={{ background: '#8B0000' }}>
        {/* Background circles */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/5 translate-x-1/2 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-[#B22234]/40 -translate-x-1/3 translate-y-1/3" />

        {/* Decorative stars */}
        <DoodleStar size={22} color="rgba(232,184,48,0.5)" style={{ position: 'absolute', top: 100, right: 60 }} />
        <DoodleStar size={14} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', top: 200, right: 120 }} />
        <DoodleStar size={16} color="rgba(232,184,48,0.35)" style={{ position: 'absolute', bottom: 130, right: 40 }} />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/cbt" className="flex items-center gap-3">
            <Logo className="w-12 h-12 object-contain flex-shrink-0" />
            <div>
              <div className="font-playful font-bold text-white text-base leading-tight">Guaranteed Future Model Schools</div>
              <div className="text-white/55 text-xs font-playful">Student Portal</div>
            </div>
          </Link>
        </div>

        {/* Hero photo — blob frame */}
        <div className="relative z-10">
          <div
            className="relative mb-8"
            style={{ borderRadius: '55% 45% 60% 40% / 50% 55% 45% 50%', overflow: 'hidden', background: 'rgba(255,255,255,0.12)' }}
          >
            <img
              src="https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=520&h=360&fit=crop&auto=format"
              alt="Student ready for exam"
              className="w-full h-64 object-cover opacity-90"
            />
          </div>

          {/* Floating chips */}
          <FloatingChip emoji="🔒" text="100% Secure" style={{ position: 'absolute', top: 16, right: -12, transform: 'rotate(3deg)' }} />
          <FloatingChip emoji="⚡" text="Instant Results" style={{ position: 'absolute', bottom: 90, left: -8, transform: 'rotate(-2deg)' }} />

          <h2 className="font-playful font-bold text-white leading-tight mb-2" style={{ fontSize: '2rem' }}>
            You've Got This! 🌟
          </h2>
          <p className="text-white/65 text-sm leading-relaxed">
            Log in to access your exams, check your scores, and track how well you're doing every term.
          </p>
        </div>

        {/* Safety note */}
        <div className="relative z-10 flex items-start gap-3 bg-white/10 px-5 py-4" style={{ borderRadius: 16 }}>
          <Shield className="w-5 h-5 text-[#D9C6B2] flex-shrink-0 mt-0.5" />
          <p className="text-white/60 text-xs leading-relaxed">Never share your login details with anyone. Your account is yours alone.</p>
        </div>
      </div>

      {/* ── Right Panel ────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 relative">
        {/* Subtle background doodles */}
        <DoodleStar size={18} color="rgba(178,34,52,0.12)" style={{ position: 'absolute', top: 60, right: 60 }} />
        <DoodleStar size={12} color="rgba(232,184,48,0.2)" style={{ position: 'absolute', bottom: 80, left: 60 }} />

        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <Logo className="w-11 h-11 object-contain" />
            <div className="font-playful font-bold text-[#8B0000] text-sm leading-tight">Guaranteed Future Model Schools</div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div
              className="inline-flex items-center gap-1.5 px-4 py-2 mb-4"
              style={{ background: '#B22234', borderRadius: 999, transform: 'rotate(-1deg)' }}
            >
              <span className="text-lg">📚</span>
              <span className="text-white text-xs font-bold uppercase tracking-widest font-playful">Student Login</span>
            </div>
            <h1 className="font-playful font-bold text-[#1C0A04] leading-tight mb-2" style={{ fontSize: '2rem' }}>
              Welcome Back! 👋
            </h1>
            <p className="text-[#7A5C3A] text-sm">Enter your Student ID and password to continue.</p>
          </div>

          <StudentLoginForm />

          <div className="mt-8 pt-6 text-center" style={{ borderTop: '1px solid rgba(217,198,178,0.3)' }}>
            <Link href="/cbt" className="inline-flex items-center gap-1.5 text-sm text-[#B8967A] hover:text-[#8B0000] transition-colors font-medium">
              <ArrowLeft className="w-4 h-4" /> Back to Portal Selection
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
