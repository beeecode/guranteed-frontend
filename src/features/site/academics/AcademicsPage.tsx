import Link from 'next/link';
import { GoldWave } from '@/components/ui/GoldWave';
import { PageHero } from '../components/PageHero';

const subjects = [
  { num: '01', name: 'Mathematics', level: 'All Classes', desc: 'Number sense, algebra, geometry, statistics and problem-solving through real-world application.' },
  { num: '02', name: 'English Language', level: 'All Classes', desc: 'Reading, writing, comprehension, grammar, literature and confident oral communication.' },
  { num: '03', name: 'Basic Science', level: 'Primary 1–6', desc: 'Practical experiments, nature studies, life processes and early physics and chemistry concepts.' },
  { num: '04', name: 'Social Studies', level: 'Primary 1–6', desc: 'Civic education, Nigerian history, geography, culture and global citizenship.' },
  { num: '05', name: 'Computer Studies', level: 'Primary 2–6', desc: 'Digital literacy, typing, internet safety, coding basics and our CBT examination platform.' },
  { num: '06', name: 'Creative Arts', level: 'All Classes', desc: 'Drawing, painting, sculpting, craft and creative expression across a range of media.' },
  { num: '07', name: 'Music & Drama', level: 'All Classes', desc: 'Singing, instruments, performance, theatrical arts and school productions.' },
  { num: '08', name: 'Physical Education', level: 'All Classes', desc: 'Team sports, athletics, gymnastics, health education and lifelong fitness habits.' },
  { num: '09', name: 'French Language', level: 'Primary 3–6', desc: 'Beginner to intermediate French with cultural appreciation and conversational practice.' },
];

const levels = [
  { num: '01', name: 'Pre-Primary', ages: 'Ages 3–5', desc: 'Foundation play-based learning focused on literacy, numeracy, social skills and creativity.' },
  { num: '02', name: 'Primary 1–3', ages: 'Ages 6–8', desc: 'Core subjects with hands-on activities, reading programmes and early STEM exploration.' },
  { num: '03', name: 'Primary 4–6', ages: 'Ages 9–11', desc: 'Deeper academic engagement with science projects, digital literacy and leadership activities.' },
  { num: '04', name: 'Junior Classes', ages: 'Ages 12–14', desc: 'Comprehensive curriculum preparing students for national examinations with specialist teachers.' },
];

export function AcademicsPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Curriculum"
        title="Academic"
        highlight="Excellence."
        waveWidth={220}
        description="A rich, comprehensive curriculum designed to inspire every learner and build lasting academic foundations."
      />

      {/* Learning Journey */}
      <section className="py-20 lg:py-28" style={{ borderBottom: '1px solid rgba(28,10,4,0.08)' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="section-number mb-4">01 — Our Levels</div>
          <h2 className="font-display font-bold text-[#1C0A04] text-4xl lg:text-5xl mb-2">The Learning Journey.</h2>
          <GoldWave />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px mt-12" style={{ background: 'rgba(28,10,4,0.08)' }}>
            {levels.map((l, i) => (
              <div key={i} className="p-8 relative" style={{ background: '#FEFCE8' }}>
                <div className="font-display font-black text-6xl absolute top-6 right-6" style={{ color: 'rgba(92,16,16,0.05)' }}>{l.num}</div>
                <div className="font-display font-bold text-[#1C0A04] text-2xl mb-2">{l.name}</div>
                <div className="text-[#E8B830] text-xs font-semibold uppercase tracking-widest mb-4">{l.ages}</div>
                <p className="text-[#7A5C3A] text-sm leading-relaxed">{l.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="py-20 lg:py-28" style={{ borderBottom: '1px solid rgba(28,10,4,0.08)' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="section-number mb-4">02 — Subjects We Teach</div>
          <h2 className="font-display font-bold text-[#1C0A04] text-4xl lg:text-5xl mb-2">What We Build With.</h2>
          <GoldWave />
          <div className="space-y-0 mt-12">
            {subjects.map((s, i) => (
              <div key={i} className="group flex flex-col sm:flex-row sm:items-start gap-6 py-8" style={{ borderTop: '1px solid rgba(28,10,4,0.08)' }}>
                <span className="font-display font-black text-5xl flex-shrink-0 w-14 group-hover:opacity-100 transition-opacity" style={{ color: 'rgba(92,16,16,0.07)' }}>{s.num}</span>
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-2">
                    <h3 className="font-display font-bold text-[#1C0A04] text-xl group-hover:text-[#5C1010] transition-colors">{s.name}</h3>
                    <span className="text-[#E8B830] text-xs font-semibold uppercase tracking-widest mt-1.5 flex-shrink-0">{s.level}</span>
                  </div>
                  <p className="text-[#7A5C3A] text-sm leading-relaxed max-w-2xl">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assessment */}
      <section className="py-20 lg:py-28" style={{ borderBottom: '1px solid rgba(28,10,4,0.08)' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="section-number mb-4">03 — Assessment</div>
              <h2 className="font-display font-bold text-[#1C0A04] text-4xl leading-tight mb-2">How We Measure Growth.</h2>
              <GoldWave />
              <p className="text-[#7A5C3A] leading-relaxed mt-5 mb-6 text-sm">
                We use a balanced assessment approach — continuous assessment, class tests, project work and CBT term examinations — to gain a complete picture of every student's progress.
              </p>
              <div className="space-y-0">
                {[
                  { label: 'Continuous Assessment (CA)', value: '40% of term score' },
                  { label: 'CBT Examination', value: '60% of term score' },
                  { label: 'Performance Reports', value: 'Shared with parents each term' },
                  { label: 'Learning Support', value: 'Available for all students' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-4" style={{ borderBottom: '1px solid rgba(28,10,4,0.08)' }}>
                    <span className="text-[#7A5C3A] text-sm">{item.label}</span>
                    <span className="text-[#5C1010] text-sm font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="bg-white p-3 pb-10 shadow-xl" style={{ transform: 'rotate(2deg)' }}>
                <div className="absolute -top-3 left-10 w-20 h-4" style={{ background: 'rgba(255,255,255,0.88)', boxShadow: '0 1px 3px rgba(0,0,0,0.12)', borderRadius: 2 }} />
                <img
                  src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=600&h=400&fit=crop&auto=format"
                  alt="CBT system"
                  className="w-full h-80 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-24 text-center">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <div className="section-number mb-4">Ready To Enroll?</div>
          <h2 className="font-display font-black text-[#1C0A04] text-4xl lg:text-5xl mb-2 leading-tight">Join Our Academic <span style={{ color: '#5C1010' }}>Community.</span></h2>
          <GoldWave width={200} />
          <div className="flex flex-wrap justify-center gap-5 mt-10">
            <Link href="/admissions" className="inline-block px-7 py-3.5 text-sm font-semibold text-white hover:opacity-90 transition-all" style={{ background: '#5C1010', borderRadius: 4 }}>Apply Now →</Link>
            <Link href="/cbt" className="inline-block px-7 py-3.5 text-sm font-semibold transition-all" style={{ border: '1.5px solid #5C1010', color: '#5C1010', borderRadius: 4 }}>Try CBT Portal</Link>
          </div>
        </div>
      </section>
    </>
  );
}
