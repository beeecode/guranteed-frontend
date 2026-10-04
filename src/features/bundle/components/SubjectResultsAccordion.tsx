'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { BundleSubject } from '@/types/exam';
import type { GradeInfo } from '../lib/grades';

export type SubjectResult = BundleSubject & GradeInfo & { pct: number };

/** Expandable per-subject result rows. */
export function SubjectResultsAccordion({ results }: { results: SubjectResult[] }) {
  const [openSubject, setOpenSubject] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {results.map((result, i) => (
        <div key={i} className="bg-white overflow-hidden transition-all" style={{ borderRadius: 20, border: '1.5px solid rgba(217,198,178,0.4)' }}>
          {/* Subject row */}
          <button
            className="w-full flex items-center gap-4 p-5 text-left transition-all hover:bg-[rgba(217,198,178,0.05)]"
            onClick={() => setOpenSubject(openSubject === i ? null : i)}
          >
            <div className="w-12 h-12 flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'rgba(217,198,178,0.2)', borderRadius: 14 }}>
              {result.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-playful font-bold text-[#1C0A04] text-base">{result.name}</div>
              {/* Score bar */}
              <div className="mt-2">
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(217,198,178,0.3)' }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${result.pct}%`, background: result.color }} />
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-playful font-bold text-2xl" style={{ color: result.color }}>{result.grade}</div>
              <div className="text-xs text-[#7A5C3A]">{result.pct}%</div>
            </div>
            {openSubject === i ? <ChevronDown className="w-4 h-4 text-[#7A5C3A] flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-[#7A5C3A] flex-shrink-0" />}
          </button>

          {/* Expanded detail */}
          {openSubject === i && <SubjectResultDetail result={result} />}
        </div>
      ))}
    </div>
  );
}

function SubjectResultDetail({ result }: { result: SubjectResult }) {
  const passed = result.pct >= result.passmark;
  const items = [
    { label: 'Score', value: `${result.pct}%`, color: result.color },
    { label: 'Questions', value: `${result.totalQuestions}/${result.totalQuestions}`, color: '#16A34A' },
    { label: 'Pass Mark', value: `${result.passmark}/${result.totalMarks}`, color: '#7A5C3A' },
  ];

  return (
    <div className="px-5 pb-5 pt-1" style={{ borderTop: '1px solid rgba(217,198,178,0.3)' }}>
      <div className="grid grid-cols-3 gap-3 mt-3">
        {items.map((item, j) => (
          <div key={j} className="text-center py-3" style={{ background: 'rgba(217,198,178,0.12)', borderRadius: 12 }}>
            <div className="font-playful font-bold text-base" style={{ color: item.color }}>{item.value}</div>
            <div className="text-[10px] text-[#7A5C3A] font-semibold uppercase tracking-wide">{item.label}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 px-3 py-2" style={{ background: passed ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)', borderRadius: 10 }}>
        <span>{passed ? '✅' : '❌'}</span>
        <span className="text-xs font-semibold" style={{ color: passed ? '#16A34A' : '#DC2626' }}>
          {passed ? `Passed with ${result.pct - result.passmark}% above pass mark` : 'Below pass mark — study harder next time!'}
        </span>
      </div>
    </div>
  );
}
