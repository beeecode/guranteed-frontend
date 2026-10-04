import { GoldWave } from '@/components/ui/GoldWave';
import { journeyStages } from './content';

/** Learning journey — dotted adventure path */
export function JourneySection() {
  return (
    <section className="py-20 lg:py-28" style={{ borderTop: '1px solid rgba(217,198,178,0.3)', borderBottom: '1px solid rgba(217,198,178,0.3)' }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-14">
          <div className="section-number mb-3">02 — The Journey</div>
          <h2 className="font-playful font-bold text-[#1C0A04] mb-2" style={{ fontSize: 'clamp(2rem,4vw,2.8rem)' }}>
            Your Child's <span style={{ color: '#B22234' }}>Adventure</span> Awaits.
          </h2>
          <GoldWave bold width={180} />
        </div>

        {/* Journey stages */}
        <div className="relative">
          {/* Dotted connector (desktop only) */}
          <div className="absolute left-0 right-0 top-14 hidden lg:block" style={{ height: 2 }}>
            <svg width="100%" height="4" viewBox="0 0 800 4" preserveAspectRatio="none">
              <line x1="80" y1="2" x2="720" y2="2" stroke="#D9C6B2" strokeWidth="2.5" strokeDasharray="8 6" />
            </svg>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {journeyStages.map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                {/* Stage circle */}
                <div
                  className="w-28 h-28 flex flex-col items-center justify-center mb-5 shadow-md transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl relative z-10"
                  style={{ background: '#fff', borderRadius: '50%', border: `3px solid ${i === 0 ? '#B22234' : i === 3 ? '#8B0000' : '#D9C6B2'}` }}
                >
                  <span className="text-3xl mb-1">{s.emoji}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wide font-playful" style={{ color: '#7A5C3A' }}>{s.ages}</span>
                </div>
                <h3 className="font-playful font-bold text-[#1C0A04] text-base mb-1">{s.name}</h3>
                <p className="text-[#7A5C3A] text-xs leading-relaxed">{s.desc}</p>
                {/* Small down arrow (mobile only) */}
                {i < journeyStages.length - 1 && (
                  <div className="text-[#D9C6B2] text-xl mt-4 lg:hidden">↓</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
