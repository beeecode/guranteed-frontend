import { AlertCircle, Star, TrendingUp } from "lucide-react"
import { SimplePortalHeader } from "@/components/layout/SimplePortalHeader"
import { scoreColor, type ResultsSummary } from "../types"
import { PerformanceCharts } from "./PerformanceCharts"

interface StudentPerformanceProps {
  summary: ResultsSummary
  title?: string
  backHref?: string
}

/**
 * Performance analytics from RELEASED results only (Stage 11: live data): overview cards,
 * score by subject, the score trend over time and per-subject progress bars.
 */
export function StudentPerformance({
  summary,
  title = "My Performance",
  backHref,
}: StudentPerformanceProps) {
  const subjectScores = summary.subjects
    .filter((s) => s.average !== null)
    .map((s) => ({ subject: s.name, score: Math.round(s.average ?? 0) }))
  const trend = summary.entries
    .filter((e) => e.percentage !== null && e.submitted_at)
    .sort((a, b) => Date.parse(a.submitted_at ?? "") - Date.parse(b.submitted_at ?? ""))
    .map((e) => ({ term: new Date(e.submitted_at ?? "").toLocaleDateString(undefined, { day: "numeric", month: "short" }), score: Math.round(e.percentage ?? 0) }))
  const best = subjectScores[0]
  const weakest = subjectScores.length > 1 ? subjectScores[subjectScores.length - 1] : undefined
  const overviewCards = [
    { label: "Average Score", value: summary.stats.released ? `${Math.round(summary.stats.average)}%` : "—", sub: `From ${summary.stats.released} released result(s)`, icon: Star, color: "#B22234" },
    { label: "Best Subject", value: best?.subject ?? "—", sub: best ? `${best.score}% average` : "No released results yet", icon: TrendingUp, color: "#16A34A" },
    { label: "Needs Improvement", value: weakest?.subject ?? "—", sub: weakest ? `${weakest.score}% — keep going!` : "Needs two or more subjects", icon: AlertCircle, color: "#D97706" },
  ]

  if (subjectScores.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9F5F1]">
        <SimplePortalHeader title={title} backHref={backHref} maxWidthClassName="max-w-5xl" backLinkClassName="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#8B0000]" />
        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="bg-white rounded-3xl p-10 shadow-sm text-center text-sm text-gray-500">📈 Your performance appears here once the school releases your results.</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9F5F1]">
      <SimplePortalHeader
        title={title}
        backHref={backHref}
        maxWidthClassName="max-w-5xl"
        backLinkClassName="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#8B0000]"
      />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Overview cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {overviewCards.map((card, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
              <div
                className="w-9 h-9 rounded-xl mb-3"
                style={{ background: card.color + "15" }}
              >
                <card.icon
                  className="w-5 h-5 m-2"
                  style={{ color: card.color }}
                />
              </div>
              <div className="font-heading text-sm text-gray-500">
                {card.label}
              </div>
              <div className="font-heading text-lg font-700 text-gray-900 mt-0.5">
                {card.value}
              </div>
              <div className="text-xs text-gray-400 mt-1">{card.sub}</div>
            </div>
          ))}
        </div>

        <PerformanceCharts
          subjectScores={subjectScores}
          termScores={trend}
        />

        {/* Subject progress bars */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="font-heading font-700 text-gray-900 mb-5">
            Subject Progress
          </h3>
          <div className="space-y-5">
            {subjectScores.map((s, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700">
                    {s.subject}
                  </span>
                  <span
                    className="text-sm font-heading font-700"
                    style={{ color: scoreColor(s.score) }}
                  >
                    {s.score}%
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${s.score}%`,
                      background: scoreColor(s.score),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
