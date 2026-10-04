import Link from 'next/link';
import { DoodleStar } from '@/components/ui/DoodleStar';
import { FloatingCard } from './HomeDecor';

/** CBT CTA — child-friendly */
export function CbtCtaSection() {
  return (
    <section className="py-20 lg:py-24 relative overflow-hidden" style={{ background: '#8B0000' }}>
      {/* Decorative elements on dark bg */}
      <DoodleStar size={40} color="rgba(232,184,48,0.3)" className="absolute top-8 left-8 animate-spin-slow hidden lg:block" />
      <DoodleStar size={24} color="rgba(232,184,48,0.2)" className="absolute bottom-8 right-16 animate-float hidden lg:block" />
      <DoodleStar size={18} color="rgba(255,255,255,0.15)" className="absolute top-16 right-32 animate-float-d1 hidden lg:block" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6" style={{ background: 'rgba(232,184,48,0.2)', borderRadius: 999, border: '1.5px solid rgba(232,184,48,0.4)' }}>
              <DoodleStar size={12} color="#E8B830" />
              <span className="text-[#E8B830] text-xs font-bold uppercase tracking-widest font-playful">05 — Digital Examinations</span>
            </div>
            <h2 className="font-playful font-bold text-white leading-tight mb-4" style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>
              Ready for Your Test?<br />
              <span style={{ color: '#E8B830' }}>You've Got This! 🌟</span>
            </h2>
            <p className="text-white/65 text-sm leading-relaxed mb-8 max-w-md">
              Log in to your CBT portal and show us what you've learned. Our secure, friendly exam system is designed to help you do your best.
            </p>
            <Link
              href="/cbt"
              className="inline-flex items-center gap-2 px-8 py-4 font-bold font-playful transition-all duration-200 hover:-translate-y-1.5 hover:shadow-2xl"
              style={{ background: '#E8B830', color: '#1C0A04', borderRadius: 999, fontSize: '0.95rem', boxShadow: '0 4px 20px rgba(232,184,48,0.35)' }}
            >
              Start My Exam →
            </Link>
          </div>

          <div className="relative hidden lg:block">
            <div className="bg-white/10 p-3 pb-10" style={{ transform: 'rotate(2deg)', borderRadius: 4 }}>
              <div className="absolute -top-4 left-12 w-24 h-5 bg-white/20 shadow-sm rounded-sm -rotate-1" />
              <img
                src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=600&h=380&fit=crop&auto=format"
                alt="CBT exam"
                className="w-full h-64 object-cover"
                style={{ borderRadius: 2 }}
              />
              <p className="text-center text-xs font-bold text-white/60 mt-2 font-playful">Let's ace this exam! 💪</p>
            </div>
            <FloatingCard emoji="💻" text="Secure System" style={{ position: 'absolute', top: -16, right: -16 }} rotate={3} className="animate-float" />
            <FloatingCard emoji="⚡" text="Instant Results" style={{ position: 'absolute', bottom: 20, left: -20 }} rotate={-2} className="animate-float-d1" />
          </div>
        </div>
      </div>
    </section>
  );
}
