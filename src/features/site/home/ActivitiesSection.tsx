import { DoodleStar } from '@/components/ui/DoodleStar';
import { GoldWave } from '@/components/ui/GoldWave';
import { ActivityCard } from './HomeDecor';
import { activities } from './content';

/** Learning activities — colourful tiles */
export function ActivitiesSection() {
  return (
    <section className="py-20 lg:py-28 relative">
      {/* Decorative background doodles */}
      <DoodleStar size={20} color="#E8B830" className="absolute top-8 left-8 opacity-40 animate-float hidden lg:block" />
      <DoodleStar size={14} color="#B22234" className="absolute bottom-8 right-8 opacity-30 animate-float-d2 hidden lg:block" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-12">
          <div className="section-number mb-3">01 — What We Offer</div>
          <h2 className="font-playful font-bold text-[#1C0A04] mb-2" style={{ fontSize: 'clamp(2rem,4vw,2.8rem)' }}>
            Learning Can Be <span style={{ color: '#B22234' }}>Fun!</span>
          </h2>
          <GoldWave bold width={160} />
          <p className="text-[#7A5C3A] italic text-sm mt-3">Six amazing ways we make every school day exciting.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((a, i) => (
            <ActivityCard key={i} emoji={a.emoji} title={a.title} desc={a.desc} rotate={a.rotate} />
          ))}
        </div>
      </div>
    </section>
  );
}
