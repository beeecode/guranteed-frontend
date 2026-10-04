import Link from 'next/link';
import { StudentPageHeader } from '@/components/layout/StudentPageHeader';
import { formatDuration, sum } from '@/lib/format';
import type { BundleSubject, ExamBundle } from '@/types/exam';

function SubjectJourneyItem({ subject, idx, isLast }: { subject: BundleSubject; idx: number; isLast: boolean }) {
  const stats = [
    { label: 'Questions', value: subject.totalQuestions },
    { label: 'Duration', value: `${subject.duration} min` },
    { label: 'Pass Mark', value: `${subject.passmark}/${subject.totalMarks}` },
  ];

  return (
    <div className="flex items-stretch gap-3">
      {/* Connector line */}
      <div className="flex flex-col items-center w-10 flex-shrink-0">
        <div
          className="w-10 h-10 flex items-center justify-center font-playful font-bold text-white text-sm flex-shrink-0"
          style={{ background: idx === 0 ? '#B22234' : '#D9C6B2', borderRadius: '50%' }}
        >
          {idx + 1}
        </div>
        {!isLast && (
          <div className="flex-1 w-0.5 my-1" style={{ background: 'rgba(217,198,178,0.5)', minHeight: 12 }} />
        )}
      </div>

      {/* Subject card */}
      <div
        className="flex-1 bg-white p-5 mb-1 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
        style={{ borderRadius: 18, border: idx === 0 ? '2px solid rgba(178,34,52,0.3)' : '1.5px solid rgba(217,198,178,0.4)' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: idx === 0 ? 'rgba(178,34,52,0.08)' : 'rgba(217,198,178,0.2)', borderRadius: 14 }}
            >
              {subject.emoji}
            </div>
            <div>
              <div className="font-playful font-bold text-[#1C0A04] text-base">{subject.name}</div>
              {idx === 0 ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold font-playful px-2 py-0.5 mt-1" style={{ background: 'rgba(178,34,52,0.1)', color: '#B22234', borderRadius: 999 }}>
                  ● First Up
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium font-playful px-2 py-0.5 mt-1" style={{ background: 'rgba(217,198,178,0.3)', color: '#7A5C3A', borderRadius: 999 }}>
                  ○ Coming up
                </span>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xs text-[#7A5C3A] font-semibold">{subject.duration} mins</div>
            <div className="text-xs text-[#B8967A]">{subject.totalMarks} marks</div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {stats.map((info, j) => (
            <div key={j} className="text-center py-2" style={{ background: 'rgba(217,198,178,0.12)', borderRadius: 10 }}>
              <div className="font-playful font-bold text-[#1C0A04] text-sm">{info.value}</div>
              <div className="text-[10px] text-[#B8967A] font-medium">{info.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Pre-exam journey map listing every subject in the bundle. */
export function BundleOverview({ bundle }: { bundle: ExamBundle }) {
  const totalQuestions = sum(bundle.subjects, s => s.totalQuestions);
  const durationLabel = formatDuration(sum(bundle.subjects, s => s.duration));

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F9F5F1' }}>
      <StudentPageHeader title={bundle.name} subtitle={`${bundle.class} · ${bundle.session}`} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">

        {/* Hero encouragement */}
        <div className="text-center mb-8 p-8 relative overflow-hidden" style={{ background: '#8B0000', borderRadius: 28 }}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 translate-x-1/3 -translate-y-1/3" />
          <div className="relative z-10">
            <div className="text-5xl mb-3">🗺️</div>
            <h1 className="font-playful font-bold text-white leading-tight mb-2" style={{ fontSize: 'clamp(1.6rem,4vw,2.2rem)' }}>
              Your Exam Journey
            </h1>
            <p className="text-white/65 text-sm leading-relaxed max-w-md mx-auto">
              You have <strong className="text-white">{bundle.subjects.length} subjects</strong> to complete today.
              Finish one subject and we'll take you straight to the next one. You've totally got this! 🌟
            </p>
          </div>
        </div>

        {/* Subject Journey */}
        <div className="mb-6">
          <div className="text-xs font-bold text-[#7A5C3A] uppercase tracking-widest mb-4 px-1">📋 Your Exam Journey</div>
          <div className="space-y-3">
            {bundle.subjects.map((subject, idx) => (
              <SubjectJourneyItem key={subject.id} subject={subject} idx={idx} isLast={idx === bundle.subjects.length - 1} />
            ))}
          </div>
        </div>

        {/* Break notice if enabled */}
        {bundle.breakEnabled && (
          <div className="mb-5 px-5 py-4 flex items-start gap-3" style={{ background: 'rgba(232,184,48,0.1)', borderRadius: 16, border: '1.5px solid rgba(232,184,48,0.25)' }}>
            <span className="text-xl flex-shrink-0">☕</span>
            <p className="text-sm text-[#7A5C3A]">
              <strong className="text-[#1C0A04]">Short break available!</strong> After each subject you'll get a {bundle.breakDuration}-minute break before the next one begins.
            </p>
          </div>
        )}

        {/* Summary */}
        <div className="mb-8 p-5" style={{ background: '#fff', borderRadius: 20, border: '1.5px solid rgba(217,198,178,0.4)' }}>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: bundle.subjects.length, label: 'Total Subjects' },
              { value: totalQuestions, label: 'Total Questions' },
              { value: durationLabel, label: 'Est. Duration' },
            ].map(item => (
              <div key={item.label}>
                <div className="font-playful font-bold text-[#B22234] text-2xl">{item.value}</div>
                <div className="text-xs text-[#7A5C3A] font-semibold uppercase tracking-wide">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Start button */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={`/student/bundle/${bundle.id}/exam`}
            className="flex-1 py-4 font-playful font-bold text-lg text-white text-center transition-all hover:-translate-y-1 hover:shadow-2xl"
            style={{ background: '#B22234', borderRadius: 999, boxShadow: '0 4px 20px rgba(178,34,52,0.35)' }}
          >
            I'm Ready — Start Exam 🚀
          </Link>
          <Link
            href="/student/dashboard"
            className="flex-1 py-4 font-playful font-bold text-base text-center transition-all"
            style={{ border: '2px solid rgba(217,198,178,0.6)', color: '#7A5C3A', borderRadius: 999 }}
          >
            ← Not Yet
          </Link>
        </div>
      </main>
    </div>
  );
}
