import { GoldWave } from '@/components/ui/GoldWave';

interface PageHeroProps {
  eyebrow: string;
  title: string;
  /** Second, maroon-coloured part of the heading. */
  highlight: string;
  waveWidth: number;
  description: string;
  descriptionMaxWidthClassName?: string;
  /** Optional content above the eyebrow (e.g. the "Admissions Open" pill). */
  children?: React.ReactNode;
}

/** Large editorial header used at the top of the inner public pages. */
export function PageHero({ eyebrow, title, highlight, waveWidth, description, descriptionMaxWidthClassName = 'max-w-2xl', children }: PageHeroProps) {
  return (
    <section className="pt-32 pb-16" style={{ borderBottom: '1px solid rgba(28,10,4,0.08)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {children}
        <div className="section-number mb-4">{eyebrow}</div>
        <h1 className="font-display font-black text-[#1C0A04] leading-tight mb-2" style={{ fontSize: 'clamp(2.8rem,6vw,5rem)' }}>
          {title} <span style={{ color: '#5C1010' }}>{highlight}</span>
        </h1>
        <GoldWave width={waveWidth} />
        <p className={`text-[#7A5C3A] text-lg ${descriptionMaxWidthClassName} mt-5`}>{description}</p>
      </div>
    </section>
  );
}
