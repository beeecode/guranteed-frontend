'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  { q: 'What ages do you admit?', a: 'We admit children from age 3 (Pre-Primary) through to age 14 (Junior Classes). All classes subject to availability.' },
  { q: 'When is the admission deadline?', a: 'Applications for the 2026/2027 session close on 15th October 2026. We recommend applying early as spaces fill quickly.' },
  { q: 'What documents are required?', a: 'Birth certificate, previous school reports (if applicable), passport photographs and medical/immunisation records.' },
  { q: 'Do you offer scholarships?', a: 'Yes, we offer merit-based academic scholarships for exceptional students entering Primary 4 and above.' },
  { q: 'Is there a school bus service?', a: 'We operate a safe, GPS-tracked school bus service across several routes in the local government area.' },
  { q: 'How does the CBT system work?', a: 'All term examinations are conducted through our secure Computer-Based Testing portal — accessible on school computers.' },
];

/** Accordion of admission questions; one answer open at a time. */
export function AdmissionsFaq() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="space-y-0 mt-12">
      {faqs.map((faq, i) => (
        <div key={i} style={{ borderTop: '1px solid rgba(28,10,4,0.08)' }}>
          <button
            onClick={() => setOpenFaq(openFaq === i ? null : i)}
            className="w-full flex items-center justify-between py-6 text-left group"
          >
            <span className="font-display font-bold text-[#1C0A04] text-base group-hover:text-[#5C1010] transition-colors pr-4">{faq.q}</span>
            {openFaq === i ? <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: '#5C1010' }} /> : <ChevronDown className="w-5 h-5 flex-shrink-0 text-[#7A5C3A]" />}
          </button>
          {openFaq === i && (
            <div className="pb-6 text-[#7A5C3A] text-sm leading-relaxed">{faq.a}</div>
          )}
        </div>
      ))}
    </div>
  );
}
