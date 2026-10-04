import { CheckCircle } from 'lucide-react';
import { GoldWave } from '@/components/ui/GoldWave';
import { PageHero } from '../components/PageHero';
import { AdmissionsFaq } from './AdmissionsFaq';
import { AdmissionsForm } from './AdmissionsForm';

const steps = [
  { num: '01', title: 'Submit Application', desc: 'Complete our online admission form with your child\'s basic information and supporting documents.' },
  { num: '02', title: 'Assessment Test', desc: 'Your child attends a brief, friendly age-appropriate assessment session at our school.' },
  { num: '03', title: 'Parent Interview', desc: 'A warm, informal meeting with our Head Teacher to understand your family\'s expectations.' },
  { num: '04', title: 'Offer & Enrolment', desc: 'Receive your admission offer and complete enrolment with required documentation and fees.' },
];

export function AdmissionsPage() {
  return (
    <>
      <PageHero
        eyebrow="2026/2027 Session Now Open"
        title="Admissions"
        highlight="2026."
        waveWidth={200}
        description="Begin your child's journey at Guaranteed Future Model Schools. We can't wait to meet your family."
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="text-green-700 text-xs font-semibold uppercase tracking-widest">Admissions Open</span>
        </div>
      </PageHero>

      {/* Process */}
      <section className="py-20 lg:py-28" style={{ borderBottom: '1px solid rgba(28,10,4,0.08)' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="section-number mb-4">01 — The Process</div>
          <h2 className="font-display font-bold text-[#1C0A04] text-4xl lg:text-5xl mb-2">How To Apply.</h2>
          <GoldWave />
          <p className="text-[#7A5C3A] italic text-sm mt-3 mb-12">Four simple steps to welcome your child into the GFMS family.</p>
          <div className="space-y-0">
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-6 py-10" style={{ borderTop: '1px solid rgba(28,10,4,0.08)' }}>
                <div className="font-display font-black text-7xl flex-shrink-0 w-24 leading-none" style={{ color: '#5C1010' }}>{s.num}</div>
                <div className="pt-2">
                  <h3 className="font-display font-bold text-[#1C0A04] text-2xl mb-3">{s.title}</h3>
                  <p className="text-[#7A5C3A] text-sm leading-relaxed max-w-xl">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Classes + Requirements */}
      <section className="py-20 lg:py-28" style={{ borderBottom: '1px solid rgba(28,10,4,0.08)' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Available Classes */}
            <div>
              <div className="section-number mb-4">02 — Available Spaces</div>
              <h2 className="font-display font-bold text-[#1C0A04] text-3xl mb-8">Open Classes.</h2>
              <div className="space-y-0">
                {[
                  { name: 'Pre-Primary (Nursery 1–2)', ages: 'Ages 3–4', slots: '15 spaces' },
                  { name: 'Primary 1', ages: 'Age 5–6', slots: '12 spaces' },
                  { name: 'Primary 2–3', ages: 'Ages 7–8', slots: '10 spaces' },
                  { name: 'Primary 4–6', ages: 'Ages 9–11', slots: '8 spaces' },
                  { name: 'Junior Secondary 1–3', ages: 'Ages 12–14', slots: '5 spaces' },
                ].map((cls, i) => (
                  <div key={i} className="flex items-center justify-between py-5" style={{ borderBottom: '1px solid rgba(28,10,4,0.08)' }}>
                    <div>
                      <div className="font-display font-bold text-[#1C0A04] text-base">{cls.name}</div>
                      <div className="text-[#7A5C3A] text-xs mt-0.5">{cls.ages}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-green-700 text-xs font-semibold">{cls.slots}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <div className="section-number mb-4">03 — Requirements</div>
              <h2 className="font-display font-bold text-[#1C0A04] text-3xl mb-8">What To Bring.</h2>
              <div className="space-y-4 p-8" style={{ background: '#FEFCE8', border: '1px solid rgba(28,10,4,0.1)', borderRadius: 4 }}>
                {[
                  'Original and photocopy of Birth Certificate',
                  'Last school report card (Primary 2 and above)',
                  '4 recent passport photographs (white background)',
                  'Immunisation and vaccination records',
                  'Completed admission application form',
                  'Non-refundable application fee of ₦5,000',
                  'Letter of recommendation from previous school (Junior classes)',
                ].map((req, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#5C1010' }} />
                    <span className="text-[#7A5C3A] text-sm leading-relaxed">{req}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-28" style={{ borderBottom: '1px solid rgba(28,10,4,0.08)' }}>
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="section-number mb-4">04 — FAQ</div>
          <h2 className="font-display font-bold text-[#1C0A04] text-4xl mb-2">Common Questions.</h2>
          <GoldWave width={180} />
          <AdmissionsFaq />
        </div>
      </section>

      {/* Form */}
      <section className="py-20 lg:py-28" style={{ background: 'transparent' }}>
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <div className="section-number mb-4">05 — Start Your Application</div>
          <h2 className="font-display font-bold text-[#1C0A04] text-4xl mb-2">Discuss Your Admission.</h2>
          <GoldWave width={200} />
          <p className="text-[#7A5C3A] text-sm mt-3 mb-10">Fill out this form and our admissions team will contact you within 24 hours.</p>

          <AdmissionsForm />
        </div>
      </section>
    </>
  );
}
