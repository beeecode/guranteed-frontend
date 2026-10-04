import Link from 'next/link';
import { FileText, Home } from 'lucide-react';
import { DoodleStar } from '@/components/ui/DoodleStar';
import { submittedExamSummary as summary } from '@/data/exams';

type FeedbackTier = { emoji: string; heading: string; sub: string; badge: string; color: string };

function getFeedback(score: number): FeedbackTier {
  if (score >= 90) return {
    emoji: '🏆',
    heading: 'OUTSTANDING! You\'re a Champion!',
    sub: 'Absolutely incredible! You nailed this exam. Your hard work is showing!',
    badge: '🌟 TOP SCORER',
    color: '#E8B830',
  };
  if (score >= 75) return {
    emoji: '⭐',
    heading: 'Excellent Work! You Did Amazing!',
    sub: 'Wow, what a great performance! You should be very proud of yourself.',
    badge: '🎯 GREAT JOB',
    color: '#16A34A',
  };
  if (score >= 50) return {
    emoji: '😊',
    heading: 'Well Done! You Passed!',
    sub: 'Good effort — you cleared the pass mark. Keep pushing and you\'ll do even better next time!',
    badge: '✅ PASSED',
    color: '#3B82F6',
  };
  return {
    emoji: '💪',
    heading: 'Keep Practising! You\'ll Get There!',
    sub: 'Don\'t worry — every great learner started somewhere. Study hard and you\'ll ace it next time!',
    badge: '🔁 TRY AGAIN',
    color: '#F97316',
  };
}

/* Deterministic confetti so server and client render the same pieces */
const confetti = Array.from({ length: 28 }, (_, i) => ({
  left: `${((i * 37 + 13) % 97) + 1.5}%`,
  delay: `${((i * 0.23) % 3).toFixed(2)}s`,
  duration: `${(2.5 + (i * 0.17) % 2).toFixed(2)}s`,
  size: i % 3 === 0 ? 10 : i % 3 === 1 ? 7 : 5,
  color: ['#B22234', '#E8B830', '#D9C6B2', '#8B0000', '#fff', '#A0522D'][i % 6],
  shape: i % 4 < 2 ? 'circle' : 'square',
  top: `${((i * 53) % 30) - 30}px`,
}));

/** Celebration screen shown after a single-subject exam is submitted. */
export function ExamSubmitted() {
  const feedback = getFeedback(summary.score);
  const pct = Math.round((summary.score / summary.total) * 100);

  const details = [
    { emoji: '📖', label: 'Subject', value: summary.subject },
    { emoji: '📅', label: 'Date', value: summary.date },
    { emoji: '✅', label: 'Answered', value: `${summary.answered} of ${summary.totalQuestions} questions` },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden" style={{ background: '#F9F5F1' }}>

      {/* ── Confetti ──────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {confetti.map((c, i) => (
          <div
            key={i}
            className="absolute animate-confetti"
            style={{
              left: c.left,
              top: c.top,
              width: c.size,
              height: c.size,
              background: c.color,
              borderRadius: c.shape === 'circle' ? '50%' : 2,
              animationDelay: c.delay,
              animationDuration: c.duration,
              opacity: 0.85,
            }}
          />
        ))}
      </div>

      {/* ── Decorative bg doodles ─────────────── */}
      <DoodleStar size={28} color="rgba(232,184,48,0.25)" style={{ position: 'absolute', top: 60, left: 60 }} />
      <DoodleStar size={18} color="rgba(178,34,52,0.2)" style={{ position: 'absolute', top: 100, right: 80 }} />
      <DoodleStar size={22} color="rgba(217,198,178,0.35)" style={{ position: 'absolute', bottom: 80, left: 100 }} />
      <DoodleStar size={14} color="rgba(232,184,48,0.2)" style={{ position: 'absolute', bottom: 60, right: 60 }} />

      {/* ── Main Card ─────────────────────────── */}
      <div className="relative z-10 bg-white w-full max-w-md shadow-2xl text-center" style={{ borderRadius: 36 }}>

        {/* Top maroon strip with celebration */}
        <div className="py-8 px-6 relative overflow-hidden" style={{ background: '#8B0000', borderRadius: '36px 36px 0 0' }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 translate-x-1/4 -translate-y-1/4" />
          <div className="relative z-10">
            <div className="text-6xl mb-3 animate-celebrate inline-block">{feedback.emoji}</div>
            <div
              className="inline-flex items-center gap-1.5 px-4 py-1.5 mb-3 font-playful font-bold text-xs uppercase tracking-widest"
              style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 999, color: '#E8B830', border: '1px solid rgba(232,184,48,0.3)' }}
            >
              {feedback.badge}
            </div>
          </div>
        </div>

        <div className="p-8">
          <h1 className="font-playful font-bold text-[#1C0A04] leading-tight mb-2" style={{ fontSize: 'clamp(1.3rem,4vw,1.7rem)' }}>
            {feedback.heading}
          </h1>
          <p className="text-[#7A5C3A] text-sm leading-relaxed mb-6">{feedback.sub}</p>

          {/* Score circle */}
          <div className="flex justify-center mb-6">
            <div
              className="w-28 h-28 flex flex-col items-center justify-center shadow-lg"
              style={{ borderRadius: '50%', border: `5px solid ${feedback.color}`, background: '#fff' }}
            >
              <div className="font-playful font-bold text-[#1C0A04]" style={{ fontSize: '1.9rem', lineHeight: 1 }}>{pct}%</div>
              <div className="text-xs text-[#7A5C3A] font-semibold mt-0.5">Score</div>
            </div>
          </div>

          {/* Score bar */}
          <div className="mb-6">
            <div className="h-3 rounded-full overflow-hidden mb-1" style={{ background: 'rgba(217,198,178,0.4)' }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${pct}%`, background: feedback.color }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-semibold text-[#B8967A]">
              <span>0</span>
              <span>Pass: 50</span>
              <span>100</span>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-5 space-y-2.5" style={{ background: 'rgba(217,198,178,0.15)', borderRadius: 16, padding: '16px 20px' }}>
            {details.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-base">{item.emoji}</span>
                <div className="flex-1 flex justify-between">
                  <span className="text-xs text-[#7A5C3A] font-medium">{item.label}</span>
                  <span className="text-xs font-bold text-[#1C0A04]">{item.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pending results note */}
          <div className="text-xs text-[#7A5C3A] mb-6 px-4 py-3 font-medium" style={{ background: 'rgba(217,198,178,0.2)', borderRadius: 12 }}>
            🕐 Your official result will be released by your teacher. Check back soon!
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link
              href="/student/results"
              className="py-4 font-playful font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-xl flex items-center justify-center gap-2"
              style={{ background: '#B22234', borderRadius: 999, boxShadow: '0 4px 16px rgba(178,34,52,0.3)' }}
            >
              <FileText className="w-4 h-4" /> View My Results 📊
            </Link>
            <Link
              href="/student/dashboard"
              className="py-4 font-playful font-bold transition-all flex items-center justify-center gap-2"
              style={{ border: '2px solid rgba(217,198,178,0.6)', color: '#7A5C3A', borderRadius: 999 }}
            >
              <Home className="w-4 h-4" /> Back to Dashboard 🏠
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
