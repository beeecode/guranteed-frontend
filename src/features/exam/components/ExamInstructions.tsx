import { StudentPageHeader } from '@/components/layout/StudentPageHeader';
import { examInstructions } from '@/data/exams';
import type { Exam } from '@/types/exam';
import { ExamAgreement } from './ExamAgreement';

/** Pre-exam screen: exam facts, numbered rules and the agreement gate. */
export function ExamInstructions({ examId, exam }: { examId: string; exam: Exam }) {
  const stats = [
    { label: 'Duration', value: exam.durationLabel, emoji: '⏱️' },
    { label: 'Questions', value: String(exam.questionCount), emoji: '❓' },
    { label: 'Total Marks', value: String(exam.totalMarks), emoji: '💯' },
    { label: 'Pass Mark', value: `${exam.passmark}/100`, emoji: '🎯' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#F9F5F1' }}>
      <StudentPageHeader
        title={exam.subject}
        subtitle={exam.title}
        backLinkClassName="text-sm text-[#7A5C3A] hover:text-[#8B0000] transition-colors font-medium font-playful"
      />

      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* Hero encouragement */}
        <div className="text-center mb-8 p-8 relative overflow-hidden" style={{ background: '#8B0000', borderRadius: 28 }}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 translate-x-1/4 -translate-y-1/4" />
          <div className="relative z-10">
            <div className="text-5xl mb-4">🚀</div>
            <h1 className="font-playful font-bold text-white leading-tight mb-2" style={{ fontSize: 'clamp(1.6rem,4vw,2.2rem)' }}>
              You're Almost Ready!
            </h1>
            <p className="text-white/65 text-sm">Read the instructions below carefully, then let's go. You've got this!</p>
          </div>
        </div>

        {/* Exam stats */}
        <div className="bg-white mb-5 p-6" style={{ borderRadius: 24 }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="text-3xl">📖</div>
            <div>
              <h2 className="font-playful font-bold text-[#1C0A04] text-lg">{exam.subject}</h2>
              <p className="text-[#7A5C3A] text-sm">{exam.title}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((info, i) => (
              <div key={i} className="flex flex-col items-center py-4 gap-1.5" style={{ background: 'rgba(178,34,52,0.06)', borderRadius: 16 }}>
                <span className="text-xl">{info.emoji}</span>
                <div className="font-playful font-bold text-[#1C0A04] text-lg">{info.value}</div>
                <div className="text-xs text-[#7A5C3A] font-semibold uppercase tracking-wide">{info.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white mb-5 p-6" style={{ borderRadius: 24 }}>
          <h2 className="font-playful font-bold text-[#1C0A04] text-lg mb-5 flex items-center gap-2">
            📋 Exam Instructions
          </h2>
          <div className="space-y-4">
            {examInstructions.map((inst, i) => (
              <div key={i} className="flex gap-4 items-start p-3" style={{ borderRadius: 12, background: i % 2 === 0 ? 'transparent' : 'rgba(217,198,178,0.1)' }}>
                <div className="text-xl flex-shrink-0 mt-0.5">{inst.emoji}</div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-[#B22234] font-playful mr-2">Step {i + 1}.</span>
                  <span className="text-[#1C0A04] text-sm leading-relaxed">{inst.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <ExamAgreement examId={examId} />
      </main>
    </div>
  );
}
