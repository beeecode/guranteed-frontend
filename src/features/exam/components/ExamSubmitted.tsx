import Link from "next/link"
import { Home, RefreshCw } from "lucide-react"
import { DoodleStar } from "@/components/ui/DoodleStar"

/**
 * Stage 11: everything shown comes from the server. A score appears only once the school
 * has released the result; "passed" only when the server decided it (bundle subjects have
 * a pass mark, standalone exams do not) — the screen never invents a pass mark.
 */
export interface SubmittedSummary {
  subject: string
  dateLabel?: string
  answered?: number | null
  totalQuestions?: number | null
  result: { percentage: number | null; scoreLabel: string; passed: boolean | null; passMark: number | null; grade: string | null } | null
  pendingMessage: string
}

type FeedbackTier = {
  emoji: string
  heading: string
  sub: string
  badge: string
  color: string
}

function getFeedback(result: SubmittedSummary["result"]): FeedbackTier {
  if (!result || result.percentage === null)
    return {
      emoji: "🎉",
      heading: "Exam Submitted!",
      sub: "Your answers are safely saved on the school server.",
      badge: "✅ SUBMITTED",
      color: "#16A34A",
    }
  const pct = result.percentage
  const badge = result.passed === true ? "✅ PASSED" : result.passed === false ? "🔁 NOT PASSED" : result.grade ? `📊 GRADE ${result.grade}` : "📊 YOUR RESULT"
  if (pct >= 75)
    return { emoji: "⭐", heading: "Excellent Work!", sub: "What a great performance! You should be very proud of yourself.", badge, color: "#16A34A" }
  if (pct >= 50)
    return { emoji: "😊", heading: "Well Done!", sub: "Good effort — keep pushing and you'll do even better next time!", badge, color: "#3B82F6" }
  return { emoji: "💪", heading: "Keep Practising! You'll Get There!", sub: "Every great learner started somewhere. Study hard and you'll ace it next time!", badge, color: "#F97316" }
}

/* Deterministic confetti so server and client render the same pieces */
const confetti = Array.from({ length: 28 }, (_, i) => ({
  left: `${((i * 37 + 13) % 97) + 1.5}%`,
  delay: `${((i * 0.23) % 3).toFixed(2)}s`,
  duration: `${(2.5 + ((i * 0.17) % 2)).toFixed(2)}s`,
  size: i % 3 === 0 ? 10 : i % 3 === 1 ? 7 : 5,
  color: ["#B22234", "#E8B830", "#D9C6B2", "#8B0000", "#fff", "#A0522D"][i % 6],
  shape: i % 4 < 2 ? "circle" : "square",
  top: `${((i * 53) % 30) - 30}px`,
}))

/** Celebration screen shown after a single-subject exam is submitted. */
export function ExamSubmitted({ summary, onCheckAgain }: { summary: SubmittedSummary; onCheckAgain?: () => void }) {
  const feedback = getFeedback(summary.result)
  const pct = summary.result?.percentage === null || summary.result?.percentage === undefined ? null : Math.round(summary.result.percentage)

  const details = [
    { emoji: "📖", label: "Subject", value: summary.subject },
    ...(summary.dateLabel ? [{ emoji: "📅", label: "Date", value: summary.dateLabel }] : []),
    ...(typeof summary.answered === "number" && typeof summary.totalQuestions === "number"
      ? [{ emoji: "✅", label: "Answered", value: `${summary.answered} of ${summary.totalQuestions} questions` }]
      : []),
    ...(summary.result ? [{ emoji: "💯", label: "Score", value: summary.result.scoreLabel }] : []),
  ]

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: "#F9F5F1" }}
    >
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
              borderRadius: c.shape === "circle" ? "50%" : 2,
              animationDelay: c.delay,
              animationDuration: c.duration,
              opacity: 0.85,
            }}
          />
        ))}
      </div>

      {/* ── Decorative bg doodles ─────────────── */}
      <DoodleStar
        size={28}
        color="rgba(232,184,48,0.25)"
        style={{ position: "absolute", top: 60, left: 60 }}
      />
      <DoodleStar
        size={18}
        color="rgba(178,34,52,0.2)"
        style={{ position: "absolute", top: 100, right: 80 }}
      />
      <DoodleStar
        size={22}
        color="rgba(217,198,178,0.35)"
        style={{ position: "absolute", bottom: 80, left: 100 }}
      />
      <DoodleStar
        size={14}
        color="rgba(232,184,48,0.2)"
        style={{ position: "absolute", bottom: 60, right: 60 }}
      />

      {/* ── Main Card ─────────────────────────── */}
      <div
        className="relative z-10 bg-white w-full max-w-md shadow-2xl text-center"
        style={{ borderRadius: 36 }}
      >
        {/* Top maroon strip with celebration */}
        <div
          className="py-8 px-6 relative overflow-hidden"
          style={{ background: "#8B0000", borderRadius: "36px 36px 0 0" }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 translate-x-1/4 -translate-y-1/4" />
          <div className="relative z-10">
            <div className="text-6xl mb-3 animate-celebrate inline-block">
              {feedback.emoji}
            </div>
            <div
              className="inline-flex items-center gap-1.5 px-4 py-1.5 mb-3 font-playful font-bold text-xs uppercase tracking-widest"
              style={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: 999,
                color: "#E8B830",
                border: "1px solid rgba(232,184,48,0.3)",
              }}
            >
              {feedback.badge}
            </div>
          </div>
        </div>

        <div className="p-8">
          <h1
            className="font-playful font-bold text-[#1C0A04] leading-tight mb-2"
            style={{ fontSize: "clamp(1.3rem,4vw,1.7rem)" }}
          >
            {feedback.heading}
          </h1>
          <p className="text-[#7A5C3A] text-sm leading-relaxed mb-6">
            {feedback.sub}
          </p>

          {pct !== null ? (<>
          {/* Score circle */}
          <div className="flex justify-center mb-6">
            <div
              className="w-28 h-28 flex flex-col items-center justify-center shadow-lg"
              style={{
                borderRadius: "50%",
                border: `5px solid ${feedback.color}`,
                background: "#fff",
              }}
            >
              <div
                className="font-playful font-bold text-[#1C0A04]"
                style={{ fontSize: "1.9rem", lineHeight: 1 }}
              >
                {pct}%
              </div>
              <div className="text-xs text-[#7A5C3A] font-semibold mt-0.5">
                Score
              </div>
            </div>
          </div>

          {/* Score bar */}
          <div className="mb-6">
            <div
              className="h-3 rounded-full overflow-hidden mb-1"
              style={{ background: "rgba(217,198,178,0.4)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, pct ?? 0)}%`, background: feedback.color }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-semibold text-[#B8967A]">
              <span>0</span>
              {summary.result?.passMark !== null && summary.result?.passMark !== undefined ? <span>Pass: {summary.result.passMark}</span> : null}
              <span>100</span>
            </div>
          </div>
          </>) : null}

          {/* Summary */}
          <div
            className="mb-5 space-y-2.5"
            style={{
              background: "rgba(217,198,178,0.15)",
              borderRadius: 16,
              padding: "16px 20px",
            }}
          >
            {details.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-base">{item.emoji}</span>
                <div className="flex-1 flex justify-between">
                  <span className="text-xs text-[#7A5C3A] font-medium">
                    {item.label}
                  </span>
                  <span className="text-xs font-bold text-[#1C0A04]">
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pending results note */}
          {summary.result ? null : (
            <div
              className="text-xs text-[#7A5C3A] mb-6 px-4 py-3 font-medium"
              style={{ background: "rgba(217,198,178,0.2)", borderRadius: 12 }}
            >
              🕐 {summary.pendingMessage}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {onCheckAgain && !summary.result ? (
              <button
                type="button"
                onClick={onCheckAgain}
                className="py-4 font-playful font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-xl flex items-center justify-center gap-2"
                style={{
                  background: "#B22234",
                  borderRadius: 999,
                  boxShadow: "0 4px 16px rgba(178,34,52,0.3)",
                }}
              >
                <RefreshCw className="w-4 h-4" /> Check for my result
              </button>
            ) : null}
            <Link
              href="/student/dashboard"
              className="py-4 font-playful font-bold transition-all flex items-center justify-center gap-2"
              style={{
                border: "2px solid rgba(217,198,178,0.6)",
                color: "#7A5C3A",
                borderRadius: 999,
              }}
            >
              <Home className="w-4 h-4" /> Back to Dashboard 🏠
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
