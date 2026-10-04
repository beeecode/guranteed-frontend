import { DoodleStar } from '@/components/ui/DoodleStar';
import { GoldWave } from '@/components/ui/GoldWave';
import { DoodlePaperPlane, PlayfulBadge, RoundBtn } from './HomeDecor';

/** Admissions CTA */
export function AdmissionsCtaSection() {
  return (
    <section className="py-20 lg:py-28 relative">
      <DoodleStar size={22} color="#E8B830" className="absolute top-10 left-16 opacity-50 animate-float hidden lg:block" />
      <DoodlePaperPlane size={30} className="animate-float-d2 hidden lg:block" style={{ position: 'absolute', top: 60, right: 80, opacity: 0.4 }} />

      <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
        <div className="inline-block mb-6">
          <PlayfulBadge>06 — Applications Open Now!</PlayfulBadge>
        </div>
        <h2 className="font-playful font-bold text-[#1C0A04] leading-tight mb-3" style={{ fontSize: 'clamp(2rem,4.5vw,3.2rem)' }}>
          Ready to Begin<br />
          <span style={{ color: '#B22234' }}>an Amazing Journey?</span>
        </h2>
        <GoldWave bold width={180} />
        <p className="text-[#7A5C3A] text-base mt-5 mb-10 max-w-lg mx-auto leading-relaxed">
          Join hundreds of families who trust GFMS. Applications for the 2026/2027 academic session are open — spaces are limited!
        </p>
        <div className="flex flex-wrap justify-center gap-5">
          <RoundBtn href="/admissions">Apply Now ✨</RoundBtn>
          <RoundBtn href="/contact" primary={false}>Talk to Us 💬</RoundBtn>
        </div>

        {/* Fun trust strip */}
        <div className="flex flex-wrap justify-center gap-6 mt-10">
          {['⭐ Top-Rated School', '📱 Modern CBT System', '❤️ Safe Environment', '🏆 Award Winners'].map((t, i) => (
            <span key={i} className="text-xs font-semibold text-[#7A5C3A] font-playful">{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
