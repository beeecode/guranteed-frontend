'use client';

import { useRouter } from 'next/navigation';
import type { ExamBundle } from '@/types/exam';
import { useCountdown } from '@/features/exam/hooks/useCountdown';
import { formatClock, sum } from '@/lib/format';

const completeMessages = [
  'Awesome! One subject down! 🎉',
  "You're halfway there! 🌟",
  'Great work — one more to go! 💪',
  "Last subject! You've got this! 🏆",
];

/* ── Subject Complete Screen ─────────────────────────────── */
export function SubjectCompleteScreen({ bundle, currentSubjectIdx, onContinue, onBreak, breakEnabled }: {
  bundle: ExamBundle;
  currentSubjectIdx: number;
  onContinue: () => void;
  onBreak: () => void;
  breakEnabled: boolean;
}) {
  const completedSubject = bundle.subjects[currentSubjectIdx];
  const nextSubject = bundle.subjects[currentSubjectIdx + 1];
  const isLast = currentSubjectIdx === bundle.subjects.length - 1;
  const encouragingMsg = completeMessages[currentSubjectIdx] || 'Amazing progress! Keep it up!';

  if (isLast) return null; // handled by bundle-done phase

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: '#F9F5F1' }}>
      <div className="bg-white w-full max-w-md p-8 text-center shadow-xl" style={{ borderRadius: 32 }}>
        {/* Top strip */}
        <div className="-mx-8 -mt-8 mb-8 py-6 relative overflow-hidden" style={{ background: '#16A34A', borderRadius: '32px 32px 0 0' }}>
          <div className="text-5xl mb-2">🎉</div>
          <div className="font-playful font-bold text-white text-lg">{encouragingMsg}</div>
        </div>

        <div className="text-xs font-bold text-[#B8967A] uppercase tracking-widest mb-2">You completed</div>
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-3xl">{completedSubject.emoji}</span>
          <span className="font-playful font-bold text-[#1C0A04] text-2xl">{completedSubject.name}</span>
        </div>

        <div className="my-5 py-4 px-5" style={{ background: 'rgba(22,163,74,0.06)', borderRadius: 16, border: '1.5px solid rgba(22,163,74,0.2)' }}>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <div className="font-playful font-bold text-[#16A34A] text-xl">{currentSubjectIdx + 1} of {bundle.subjects.length}</div>
              <div className="text-xs text-[#7A5C3A]">Subjects Done</div>
            </div>
            <div>
              <div className="font-playful font-bold text-[#16A34A] text-xl">{completedSubject.totalQuestions}/{completedSubject.totalQuestions}</div>
              <div className="text-xs text-[#7A5C3A]">Questions Answered</div>
            </div>
          </div>
        </div>

        {nextSubject && (
          <div className="mb-6 p-4" style={{ background: 'rgba(178,34,52,0.05)', borderRadius: 16, border: '1.5px solid rgba(178,34,52,0.12)' }}>
            <div className="text-xs text-[#7A5C3A] font-semibold uppercase tracking-wide mb-1">Next Subject</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">{nextSubject.emoji}</span>
              <span className="font-playful font-bold text-[#1C0A04] text-lg">{nextSubject.name}</span>
            </div>
            <div className="text-xs text-[#B8967A] mt-1">{nextSubject.duration} minutes · {nextSubject.totalQuestions} questions</div>
          </div>
        )}

        <p className="text-[#7A5C3A] text-sm mb-6">Take a moment, breathe, then continue when you're ready.</p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onContinue}
            className="py-4 font-playful font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-xl"
            style={{ background: '#B22234', borderRadius: 999, boxShadow: '0 4px 16px rgba(178,34,52,0.3)' }}
          >
            Continue to {nextSubject?.name} →
          </button>
          {breakEnabled && (
            <button
              onClick={onBreak}
              className="py-3 font-playful font-bold text-sm transition-all"
              style={{ border: '2px solid rgba(217,198,178,0.6)', color: '#7A5C3A', borderRadius: 999 }}
            >
              ☕ Take a Short Break
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Break Screen ────────────────────────────────────────── */
export function BreakScreen({ bundle, currentSubjectIdx, breakDuration, onResume }: {
  bundle: ExamBundle;
  currentSubjectIdx: number;
  breakDuration: number;
  onResume: () => void;
}) {
  const { secondsLeft } = useCountdown(breakDuration * 60, { onExpire: onResume });
  const nextSubject = bundle.subjects[currentSubjectIdx + 1];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: '#F9F5F1' }}>
      <div className="bg-white w-full max-w-md p-8 text-center shadow-xl" style={{ borderRadius: 32 }}>
        <div className="text-6xl mb-4">🌟</div>
        <h2 className="font-playful font-bold text-[#1C0A04] text-2xl mb-2">Quick Brain Break!</h2>
        <p className="text-[#7A5C3A] text-sm mb-5">
          Relax! You've completed <strong>{currentSubjectIdx + 1} of {bundle.subjects.length}</strong> subjects.
        </p>

        {/* Completed subjects */}
        <div className="mb-5 space-y-2">
          {bundle.subjects.slice(0, currentSubjectIdx + 1).map((s, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2" style={{ background: 'rgba(22,163,74,0.08)', borderRadius: 12 }}>
              <span className="text-base">✓</span>
              <span className="text-sm font-semibold text-[#16A34A]">{s.emoji} {s.name}</span>
            </div>
          ))}
          {nextSubject && (
            <div className="flex items-center gap-2 px-4 py-2" style={{ background: 'rgba(217,198,178,0.2)', borderRadius: 12 }}>
              <span className="text-base">→</span>
              <span className="text-sm font-semibold text-[#7A5C3A]">{nextSubject.emoji} {nextSubject.name} (next)</span>
            </div>
          )}
        </div>

        {/* Break countdown */}
        <div className="mb-6">
          <div className="text-xs text-[#B8967A] font-semibold uppercase tracking-wide mb-1">Break Time Remaining</div>
          <div className="font-playful font-bold text-[#B22234]" style={{ fontSize: '3rem', lineHeight: 1 }}>
            {formatClock(secondsLeft)}
          </div>
        </div>

        <button
          onClick={onResume}
          className="w-full py-4 font-playful font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-xl"
          style={{ background: '#B22234', borderRadius: 999, boxShadow: '0 4px 16px rgba(178,34,52,0.3)' }}
        >
          Start {nextSubject?.name} Now →
        </button>
      </div>
    </div>
  );
}

/* ── Bundle Done Screen ───────────────────────────────────── */
const doneConfetti = Array.from({ length: 24 }, (_, i) => ({
  left: `${((i * 41 + 7) % 96) + 2}%`,
  top: `${((i * 53) % 25) - 20}px`,
  size: i % 3 === 0 ? 10 : 7,
  borderRadius: i % 2 === 0 ? '50%' : 2,
  background: ['#B22234', '#E8B830', '#D9C6B2', '#fff'][i % 4],
  animationDelay: `${((i * 0.19) % 2.5).toFixed(2)}s`,
  animationDuration: `${(2.5 + (i * 0.13) % 1.5).toFixed(2)}s`,
}));

export function BundleDoneScreen({ bundle }: { bundle: ExamBundle }) {
  const router = useRouter();
  const totalQuestions = sum(bundle.subjects, s => s.totalQuestions);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: '#F9F5F1' }}>
      {/* Confetti dots */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {doneConfetti.map(({ size, ...c }, i) => (
          <div key={i} className="absolute animate-confetti" style={{ ...c, width: size, height: size }} />
        ))}
      </div>

      <div className="relative z-10 bg-white w-full max-w-md shadow-2xl text-center overflow-hidden" style={{ borderRadius: 36 }}>
        {/* Header */}
        <div className="py-8 px-6 relative" style={{ background: '#8B0000', borderRadius: '36px 36px 0 0' }}>
          <div className="text-5xl mb-2 animate-celebrate inline-block">🏆</div>
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 font-playful font-bold text-xs uppercase tracking-widest"
            style={{ background: 'rgba(232,184,48,0.2)', borderRadius: 999, color: '#E8B830', border: '1px solid rgba(232,184,48,0.3)' }}>
            🎉 EXAM COMPLETE!
          </div>
        </div>

        <div className="p-8">
          <h1 className="font-playful font-bold text-[#1C0A04] text-2xl mb-1">Fantastic Work! 🌟</h1>
          <p className="text-[#7A5C3A] text-sm mb-6">You completed all {bundle.subjects.length} subjects. You should be very proud!</p>

          {/* Subject checklist */}
          <div className="mb-6 space-y-2">
            {bundle.subjects.map((s, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ background: 'rgba(22,163,74,0.06)', borderRadius: 14, border: '1.5px solid rgba(22,163,74,0.15)' }}>
                <span className="text-[#16A34A] font-bold text-lg">✓</span>
                <span className="text-xl">{s.emoji}</span>
                <span className="font-playful font-bold text-[#1C0A04] text-sm flex-1 text-left">{s.name}</span>
                <span className="text-xs text-[#16A34A] font-bold">Done</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mb-6 p-4 grid grid-cols-3 gap-3 text-center" style={{ background: 'rgba(217,198,178,0.15)', borderRadius: 16 }}>
            <div>
              <div className="font-playful font-bold text-[#B22234] text-lg">{bundle.subjects.length}/{bundle.subjects.length}</div>
              <div className="text-[10px] text-[#7A5C3A] uppercase tracking-wide">Subjects</div>
            </div>
            <div>
              <div className="font-playful font-bold text-[#B22234] text-lg">{totalQuestions}/{totalQuestions}</div>
              <div className="text-[10px] text-[#7A5C3A] uppercase tracking-wide">Questions</div>
            </div>
            <div>
              <div className="font-playful font-bold text-[#B22234] text-lg">100%</div>
              <div className="text-[10px] text-[#7A5C3A] uppercase tracking-wide">Complete</div>
            </div>
          </div>

          <div className="text-xs text-[#7A5C3A] mb-6 px-4 py-3 font-medium" style={{ background: 'rgba(217,198,178,0.2)', borderRadius: 12 }}>
            🕐 Your results will be released when your teacher publishes them.
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push(`/student/bundle/${bundle.id}/results`)}
              className="py-4 font-playful font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-xl"
              style={{ background: '#B22234', borderRadius: 999, boxShadow: '0 4px 16px rgba(178,34,52,0.3)' }}
            >
              📊 View My Results
            </button>
            <button
              onClick={() => router.push('/student/dashboard')}
              className="py-4 font-playful font-bold transition-all"
              style={{ border: '2px solid rgba(217,198,178,0.6)', color: '#7A5C3A', borderRadius: 999 }}
            >
              🏠 Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
