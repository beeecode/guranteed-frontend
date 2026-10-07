import Link from 'next/link';
import { Home } from 'lucide-react';
import { StudentPageHeader } from '@/components/layout/StudentPageHeader';
import { teacherRemark } from '@/data/student';
import { sum } from '@/lib/format';
import type { ExamBundle } from '@/types/exam';
import { summarizeBundleResults } from '../lib/results';
import { SubjectResultsAccordion } from './SubjectResultsAccordion';

/** Results summary for a completed bundle, with per-subject drill-down. */
export function BundleResults({ bundle, backHref = '/student/dashboard' }: { bundle: ExamBundle; backHref?: string }) {
  const { subjectResults, avgPct, overall, bestSubject } = summarizeBundleResults(bundle);
  const totalAnswered = sum(bundle.subjects, s => s.totalQuestions);

  const quickStats = [
    { label: 'Overall Avg', value: `${avgPct}%`, emoji: '📊' },
    { label: 'Best Subject', value: bestSubject.name.split(' ')[0], emoji: '🏆' },
    { label: 'Questions Done', value: `${totalAnswered}/${totalAnswered}`, emoji: '✅' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#F9F5F1' }}>
      <StudentPageHeader
        title={`${bundle.name} — Results`}
        subtitle={`${bundle.class} · ${bundle.session}`}
        backHref={backHref}
        backLinkClassName="text-sm text-[#7A5C3A] hover:text-[#8B0000] font-medium"
      />

      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* Overall header card */}
        <div className="relative overflow-hidden mb-6 text-center p-8" style={{ background: '#8B0000', borderRadius: 28 }}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 translate-x-1/3 -translate-y-1/3" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 mb-4 font-playful font-bold text-xs uppercase tracking-widest"
              style={{ background: 'rgba(232,184,48,0.2)', borderRadius: 999, color: '#E8B830', border: '1px solid rgba(232,184,48,0.3)' }}>
              {bundle.name} Results
            </div>
            <div className="flex justify-center mb-4">
              <div className="w-28 h-28 flex flex-col items-center justify-center" style={{ borderRadius: '50%', border: '5px solid #E8B830', background: 'rgba(255,255,255,0.12)' }}>
                <div className="font-playful font-bold text-white" style={{ fontSize: '2rem', lineHeight: 1 }}>{avgPct}%</div>
                <div className="text-white/60 text-xs">Average</div>
              </div>
            </div>
            <div className="font-playful font-bold text-white text-3xl mb-1">{overall.grade}</div>
            <div className="text-white/65 text-sm">{overall.emoji} Overall Grade</div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {quickStats.map((stat, i) => (
            <div key={i} className="bg-white text-center py-4 px-2" style={{ borderRadius: 18, border: '1.5px solid rgba(217,198,178,0.4)' }}>
              <div className="text-xl mb-1">{stat.emoji}</div>
              <div className="font-playful font-bold text-[#B22234] text-lg leading-tight">{stat.value}</div>
              <div className="text-[10px] text-[#7A5C3A] font-semibold uppercase tracking-wide mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Subject results */}
        <div className="mb-6">
          <div className="text-xs font-bold text-[#7A5C3A] uppercase tracking-widest mb-4 px-1">📋 Subject Results</div>
          <SubjectResultsAccordion results={subjectResults} />
        </div>

        {/* Teacher remark */}
        <div className="mb-6 p-5" style={{ background: '#fff', borderRadius: 20, border: '1.5px solid rgba(217,198,178,0.4)' }}>
          <div className="text-xs font-bold text-[#7A5C3A] uppercase tracking-widest mb-2">👩‍🏫 Teacher's Remark</div>
          <p className="text-[#1C0A04] text-sm italic">{teacherRemark.text}</p>
          <div className="text-xs text-[#B8967A] mt-2">{teacherRemark.author}</div>
        </div>

        <Link href={backHref} className="flex items-center justify-center gap-2 py-4 font-playful font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-xl" style={{ background: '#B22234', borderRadius: 999, boxShadow: '0 4px 16px rgba(178,34,52,0.3)' }}>
          <Home className="w-4 h-4" /> Return to Dashboard
        </Link>
      </main>
    </div>
  );
}
