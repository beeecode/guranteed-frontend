import { GoldWave } from '@/components/ui/GoldWave';
import { TestimonialCarousel } from './TestimonialCarousel';

/** Testimonials */
export function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-24" style={{ borderTop: '1px solid rgba(217,198,178,0.3)' }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-10">
          <div className="section-number mb-3">04 — Parent Voices</div>
          <h2 className="font-playful font-bold text-[#1C0A04] mb-2" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.5rem)' }}>
            What Families <span style={{ color: '#B22234' }}>Say.</span>
          </h2>
          <GoldWave bold width={140} />
        </div>

        <TestimonialCarousel />
      </div>
    </section>
  );
}
