import { DoodleStar } from '@/components/ui/DoodleStar';
import { GoldWave } from '@/components/ui/GoldWave';
import { DoodlePaperPlane, DoodlePencil, DoodleBooks, PlayfulBadge, RoundBtn, FloatingCard } from './HomeDecor';

/** Hero */
export function HeroSection() {
  return (
    <section className="pt-28 pb-20 lg:pt-36 lg:pb-28 relative">
      {/* Background doodles */}
      <DoodleStar size={28} color="#E8B830" className="absolute top-32 right-16 opacity-60 animate-float hidden lg:block" />
      <DoodleStar size={16} color="#B22234" className="absolute top-48 right-52 opacity-40 animate-float-d1 hidden lg:block" />
      <DoodlePaperPlane size={36} style={{ position: 'absolute', top: 120, left: '10%', opacity: 0.5 }} className="animate-float-d2 hidden lg:block" />
      <DoodleStar size={20} color="#D9C6B2" className="absolute bottom-24 left-20 opacity-50 animate-float-slow hidden lg:block" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ── Photo side ── */}
          <div className="relative order-2 lg:order-1">
            {/* Main photo — blob frame */}
            <div
              className="relative mx-auto lg:mx-0 bg-white p-2.5 shadow-2xl"
              style={{ maxWidth: 480, transform: 'rotate(-2deg)', borderRadius: '42% 58% 45% 55% / 48% 42% 58% 52%', overflow: 'hidden' }}
            >
              <img
                src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=700&h=560&fit=crop&auto=format"
                alt="Students at GFMS"
                className="w-full object-cover"
                style={{ height: 400, borderRadius: '40% 56% 44% 54% / 46% 40% 56% 50%' }}
              />
            </div>

            {/* Tape strips */}
            <div className="absolute top-6 left-12 w-24 h-5 bg-white/80 shadow-sm -rotate-2 rounded-sm" />
            <div className="absolute bottom-12 right-8 w-20 h-5 bg-white/80 shadow-sm rotate-1 rounded-sm" />

            {/* Secondary small polaroid behind */}
            <div
              className="absolute -bottom-4 -right-2 bg-white p-2 pb-7 shadow-lg hidden sm:block"
              style={{ width: 160, transform: 'rotate(5deg)', zIndex: -1, borderRadius: 4 }}
            >
              <img src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=300&h=220&fit=crop&auto=format" className="w-full h-24 object-cover" alt="School life" />
              <p className="text-center text-[9px] font-bold mt-2 text-[#7A5C3A] font-playful">Fun at School! 🎉</p>
            </div>

            {/* Floating mini cards */}
            <FloatingCard emoji="⭐" text="500+ Happy Learners" style={{ position: 'absolute', top: -12, right: -16 }} rotate={3} className="animate-float" />
            <FloatingCard emoji="💻" text="Digital Classrooms" style={{ position: 'absolute', bottom: 60, left: -20 }} rotate={-2} className="animate-float-d1" />
            <FloatingCard emoji="🏆" text="Award-Winning School" style={{ position: 'absolute', bottom: -10, right: 40 }} rotate={2} className="animate-float-d2 hidden sm:flex" />

            {/* Floating doodles around photo */}
            <DoodlePencil size={22} className="animate-wiggle" style={{ position: 'absolute', top: 30, right: -28, opacity: 0.75 }} />
            <DoodleBooks size={32} className="animate-float-slow" style={{ position: 'absolute', bottom: 100, right: -30, opacity: 0.7 }} />
            <DoodleStar size={18} color="#B22234" className="animate-float-d3" style={{ position: 'absolute', bottom: 30, left: 20, opacity: 0.7 }} />
          </div>

          {/* ── Copy side ── */}
          <div className="order-1 lg:order-2">
            <PlayfulBadge>Welcome to Guaranteed Future Model Schools</PlayfulBadge>

            <h1 className="font-playful leading-tight text-[#1C0A04] mb-3" style={{ fontSize: 'clamp(2.4rem,5vw,3.6rem)', fontWeight: 700 }}>
              Where Little Minds<br />
              <span style={{ color: '#B22234' }}>Dream, Learn</span>{' '}
              &amp; <span style={{ color: '#8B0000' }}>Shine.</span>
            </h1>
            <GoldWave bold width={220} />

            <p className="text-[#7A5C3A] text-base leading-relaxed mt-5 mb-8 max-w-md">
              At GFMS we create a joyful, nurturing environment where every child discovers their gift, builds strong values, and grows into a confident future leader.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <RoundBtn href="/admissions">Explore Our School ✨</RoundBtn>
              <RoundBtn href="/cbt" primary={false}>Start CBT Exam →</RoundBtn>
            </div>

            {/* Mini trust strip */}
            <div className="flex flex-wrap gap-4">
              {[
                { e: '✅', t: 'Safe & Caring' },
                { e: '📱', t: 'Digital Learning' },
                { e: '🎓', t: 'Proven Results' },
              ].map((b, i) => (
                <span key={i} className="flex items-center gap-1.5 text-xs font-semibold text-[#7A5C3A]">
                  <span>{b.e}</span>{b.t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
