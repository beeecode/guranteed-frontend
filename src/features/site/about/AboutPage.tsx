import Link from 'next/link';
import { GoldWave } from '@/components/ui/GoldWave';
import { PageHero } from '../components/PageHero';

const timeline = [
  { year: '2004', event: 'Guaranteed Future Model Schools founded with 45 students and 8 passionate staff.' },
  { year: '2008', event: 'Junior Secondary School wing opened, offering full K–JSS3 education.' },
  { year: '2012', event: 'Science and ICT laboratories commissioned with state-of-the-art equipment.' },
  { year: '2016', event: 'Received State Best School Award for academic excellence and student outcomes.' },
  { year: '2020', event: 'Launched Computer-Based Testing (CBT) portal — first in our district.' },
  { year: '2024', event: '850+ students enrolled; over 5,000 alumni across Nigeria and beyond.' },
];

const values = [
  { n: '01', title: 'Excellence', desc: 'High standards in academics, conduct and character across all classes.' },
  { n: '02', title: 'Integrity', desc: 'We teach honesty and accountability as lifelong virtues.' },
  { n: '03', title: 'Innovation', desc: 'Technology and creative thinking are woven into every lesson.' },
  { n: '04', title: 'Inclusion', desc: 'Every child deserves to be seen, valued and given equal opportunities.' },
  { n: '05', title: 'Community', desc: 'We build strong bonds between students, families and the local community.' },
];

const staff = [
  { name: 'Dr. Mrs. Folake Adeleke', role: 'Head Teacher / Principal', img: 'photo-1573497019940-1c28c88b4f3e' },
  { name: 'Mr. Chukwuemeka Eze', role: 'Deputy Principal (Academics)', img: 'photo-1472099645785-5658abf4ff4e' },
  { name: 'Mrs. Amara Okonkwo', role: 'Head of Primary School', img: 'photo-1580489944761-15a19d654956' },
  { name: 'Mr. Seun Adeyemi', role: 'Head of ICT & CBT', img: 'photo-1507003211169-0a1dd7228f2d' },
];

export function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Story"
        title="About"
        highlight="GFMS."
        waveWidth={180}
        description="Two decades of nurturing futures, building character and delivering academic excellence in Lagos State."
      />

      {/* Mission / Vision */}
      <section className="py-20 lg:py-28" style={{ borderBottom: '1px solid rgba(28,10,4,0.08)' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid md:grid-cols-2 gap-px" style={{ background: 'rgba(28,10,4,0.08)' }}>
            <div className="p-10 lg:p-14" style={{ background: '#FEFCE8' }}>
              <div className="section-number mb-4">01 — Mission</div>
              <h2 className="font-display font-bold text-[#1C0A04] text-3xl mb-5">What We Set Out To Do.</h2>
              <p className="text-[#7A5C3A] leading-relaxed text-sm">
                To provide a nurturing, inspiring and technologically-equipped environment where every child discovers their potential, develops strong values and achieves academic excellence — growing into confident, compassionate and capable contributors to society.
              </p>
            </div>
            <div className="p-10 lg:p-14" style={{ background: '#5C1010' }}>
              <div className="text-[#E8B830] text-[11px] font-semibold uppercase tracking-widest mb-4">02 — Vision</div>
              <h2 className="font-display font-bold text-white text-3xl mb-5">Where We Are Going.</h2>
              <p className="text-white/65 leading-relaxed text-sm">
                To be the leading model school in Nigeria, recognised globally for producing graduates who lead with integrity, think critically, and contribute meaningfully to the world's challenges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 lg:py-28" style={{ borderBottom: '1px solid rgba(28,10,4,0.08)' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="section-number mb-4">03 — Core Values</div>
          <h2 className="font-display font-bold text-[#1C0A04] text-4xl lg:text-5xl mb-2">What We Stand For.</h2>
          <GoldWave />
          <div className="space-y-0 mt-12">
            {values.map((v, i) => (
              <div key={i} className="group flex flex-col sm:flex-row gap-6 py-8 hover:pl-2 transition-all" style={{ borderTop: '1px solid rgba(28,10,4,0.08)' }}>
                <span className="font-display font-black text-5xl flex-shrink-0 w-16 transition-colors" style={{ color: 'rgba(92,16,16,0.08)' }}>{v.n}</span>
                <div className="pt-1">
                  <h3 className="font-display font-bold text-[#1C0A04] text-xl mb-2 group-hover:text-[#5C1010] transition-colors">{v.title}</h3>
                  <p className="text-[#7A5C3A] text-sm leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 lg:py-28" style={{ borderBottom: '1px solid rgba(28,10,4,0.08)' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="section-number mb-4">04 — Our Journey</div>
          <h2 className="font-display font-bold text-[#1C0A04] text-4xl lg:text-5xl mb-2">Twenty Years Of Growth.</h2>
          <GoldWave />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px mt-12" style={{ background: 'rgba(28,10,4,0.08)' }}>
            {timeline.map((t, i) => (
              <div key={i} className="p-8" style={{ background: '#FEFCE8' }}>
                <div className="font-display font-black text-5xl mb-4" style={{ color: '#5C1010' }}>{t.year}</div>
                <p className="text-[#7A5C3A] text-sm leading-relaxed">{t.event}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Staff */}
      <section className="py-20 lg:py-28" style={{ background: 'transparent' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="section-number mb-4">05 — Leadership</div>
          <h2 className="font-display font-bold text-[#1C0A04] text-4xl lg:text-5xl mb-2">Meet Our Team.</h2>
          <GoldWave />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {staff.map((s, i) => (
              <div key={i} className="group">
                <div className="relative bg-white p-2 pb-8 shadow-md mb-4 transition-transform duration-300 group-hover:-rotate-1">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-4" style={{ background: 'rgba(255,255,255,0.85)', boxShadow: '0 1px 3px rgba(0,0,0,0.12)', borderRadius: 2 }} />
                  <img
                    src={`https://images.unsplash.com/${s.img}?w=400&h=420&fit=crop&auto=format`}
                    alt={s.name}
                    className="w-full object-cover h-56"
                  />
                </div>
                <h3 className="font-display font-bold text-[#1C0A04] text-base mb-1">{s.name}</h3>
                <p className="text-[#7A5C3A] text-xs">{s.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-24 text-center">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <div className="section-number mb-4">Become Part Of The GFMS Family.</div>
          <h2 className="font-display font-black text-[#1C0A04] text-4xl lg:text-5xl mb-2 leading-tight">Your Child's Journey Starts Here.</h2>
          <GoldWave width={180} />
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <Link href="/admissions" className="inline-block px-7 py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: '#5C1010', borderRadius: 4 }}>Apply Now →</Link>
            <Link href="/contact" className="inline-block px-7 py-3.5 text-sm font-semibold transition-all" style={{ border: '1.5px solid #5C1010', color: '#5C1010', borderRadius: 4 }}>Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
