'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/** Honour-code checkbox plus the Start / Go Back buttons it unlocks. */
export function ExamAgreement({ examId }: { examId: string }) {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);

  return (
    <>
      {/* Agreement */}
      <div className="bg-white mb-6 p-6" style={{ borderRadius: 24 }}>
        <label className="flex items-start gap-4 cursor-pointer">
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="sr-only"
            />
            <div
              className="w-6 h-6 flex items-center justify-center transition-all"
              style={{ background: agreed ? '#B22234' : '#fff', border: `2.5px solid ${agreed ? '#B22234' : '#D9C6B2'}`, borderRadius: 6 }}
              onClick={() => setAgreed(v => !v)}
            >
              {agreed && <span className="text-white text-sm font-bold">✓</span>}
            </div>
          </div>
          <p className="text-[#1C0A04] text-sm leading-relaxed" onClick={() => setAgreed(v => !v)}>
            I have read and fully understood all the instructions above. I agree to follow the examination rules and submit my answers honestly and independently. 🤝
          </p>
        </label>
      </div>

      {/* Start button */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => router.push(`/student/exam/${examId}`)}
          disabled={!agreed}
          className="flex-1 py-4 font-playful font-bold text-lg transition-all duration-200"
          style={{
            background: agreed ? '#B22234' : '#D9C6B2',
            color: agreed ? '#fff' : '#7A5C3A',
            borderRadius: 999,
            cursor: agreed ? 'pointer' : 'not-allowed',
            boxShadow: agreed ? '0 4px 20px rgba(178,34,52,0.35)' : 'none',
            transform: 'none',
          }}
        >
          {agreed ? "Let's Go! I'm Ready! 🚀" : 'Please agree to continue...'}
        </button>
        <Link
          href="/student/dashboard"
          className="flex-1 py-4 font-playful font-bold text-base text-center transition-all"
          style={{ border: '2px solid rgba(217,198,178,0.6)', color: '#7A5C3A', borderRadius: 999 }}
        >
          ← Not Yet, Go Back
        </Link>
      </div>
    </>
  );
}
