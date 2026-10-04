import { DoodleStar } from '@/components/ui/DoodleStar';
import { GoldWave } from '@/components/ui/GoldWave';
import { RoundBtn } from './HomeDecor';
import { galleryItems } from './content';

/** Gallery — scrapbook strip */
export function SchoolLifeSection() {
  return (
    <section className="py-16 lg:py-20 relative">
      <DoodleStar size={24} color="#E8B830" className="absolute top-8 right-12 opacity-50 animate-float-slow hidden lg:block" />
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <div className="section-number mb-3">03 — School Life</div>
            <h2 className="font-playful font-bold text-[#1C0A04] mb-1" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.5rem)' }}>
              Life At <span style={{ color: '#B22234' }}>GFMS.</span>
            </h2>
            <GoldWave bold width={130} />
          </div>
          <RoundBtn href="/gallery" primary={false}>See All Photos 📸</RoundBtn>
        </div>

        {/* Scrapbook row */}
        <div className="flex gap-5 overflow-x-auto pb-4">
          {galleryItems.map((item, i) => (
            <div
              key={i}
              className="flex-shrink-0 bg-white p-2.5 pb-9 shadow-lg transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl cursor-pointer relative"
              style={{ width: i === 2 ? 260 : 210, transform: `rotate(${item.rotate}deg)`, borderRadius: 4 }}
            >
              {/* Tape */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-white/85 shadow-sm rounded-sm" style={{ transform: 'rotate(-0.5deg)' }} />
              <img
                src={`https://images.unsplash.com/${item.src}?w=300&h=230&fit=crop&auto=format`}
                alt={item.caption}
                className="w-full object-cover"
                style={{ height: i === 2 ? 180 : 148 }}
              />
              <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] font-bold text-[#7A5C3A] font-playful">{item.caption}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
