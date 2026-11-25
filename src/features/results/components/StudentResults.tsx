import Link from "next/link"
import { BookOpen, CheckCircle, ChevronRight, Star } from "lucide-react"
import { SimplePortalHeader } from "@/components/layout/SimplePortalHeader"
import { scoreColor, type ResultsSummary, type ResultEntry } from "../types"

/**
 * Summary tiles plus the list of the student's exams (Stage 11: live data). Scores show
 * only for results the school has released; everything else says why it is hidden.
 */
interface StudentResultsProps {
  summary: ResultsSummary
  /** Shown when given: prints released results for the parent. */
  onPrint?: () => void
  title?: string
  backHref?: string
  performanceHref?: string
}

const dateOf = (value: string | null) => (value ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "")
const linkFor = (r: ResultEntry) => (r.kind === "bundle_subject" && r.bundle_id
  ? `/student/bundle/${r.bundle_id}/results`
  : r.status === "submitted" && r.exam_id ? `/student/exam/${r.exam_id}/submitted?attempt=${r.id}` : null)

export function StudentResults({
  summary: data,
  onPrint,
  title = "My Results",
  backHref,
  performanceHref = "/student/performance",
}: StudentResultsProps) {
  const results = data.entries.filter((r) => r.status === "submitted")
  const summary = [
    {
      label: "Average Score",
      value: data.stats.released ? `${Math.round(data.stats.average)}%` : "—",
      icon: Star,
      color: "#B22234",
      bg: "#FFF0F0",
    },
    {
      label: "Exams Taken",
      value: String(data.stats.completed),
      icon: BookOpen,
      color: "#2563EB",
      bg: "#EFF6FF",
    },
    {
      label: "Results Released",
      value: String(data.stats.released),
      icon: CheckCircle,
      color: "#16A34A",
      bg: "#F0FDF4",
    },
  ]

  return (
    <div className="min-h-screen bg-[#F9F5F1]">
      <SimplePortalHeader
        title={title}
        backHref={backHref}
        maxWidthClassName="max-w-4xl"
        backLinkClassName="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#8B0000] transition-colors"
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {summary.map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm text-center"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: s.bg }}
              >
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div className="font-heading text-2xl font-700 text-gray-900">
                {s.value}
              </div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-heading font-700 text-gray-900">
              Examination Results
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {results.length === 0 ? <div className="px-6 py-10 text-center text-sm text-gray-500">You have not submitted any exam yet.</div> : null}
            {results.map((r) => {
              const href = linkFor(r)
              const pct = r.percentage
              const color = pct === null ? "#9CA3AF" : scoreColor(pct)
              return (
              <div
                key={r.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-[#F9F5F1] transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#B22234]/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-[#B22234]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-heading font-600 text-gray-900 text-sm">
                    {r.subject}
                  </div>
                  <div className="text-xs text-gray-400">
                    {[r.bundle_name, r.title, dateOf(r.submitted_at)].filter(Boolean).join(" · ")}
                  </div>
                </div>
                {pct !== null ? (
                  <>
                    {/* Score bar */}
                    <div className="hidden sm:block w-24">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.min(100, pct)}%`, background: color }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-center">
                        {r.score}/{r.total_marks}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className="font-heading text-xl font-700"
                        style={{ color }}
                      >
                        {r.grade ?? `${Math.round(pct)}%`}
                      </div>
                      {r.passed !== null ? (
                        <div
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            r.passed
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {r.passed ? "Pass" : "Not passed"}
                        </div>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 whitespace-nowrap">
                    {r.results_released && r.pending_manual ? "✎ Being marked" : "⏳ Awaiting release"}
                  </span>
                )}
                {href ? (
                  <Link href={href} aria-label={`Open ${r.subject}`} className="p-2 rounded-xl text-gray-400 hover:text-[#B22234] hover:bg-[#FFF0F0] transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : <span className="w-8" />}
              </div>
              )
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {onPrint ? (
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-[#D9C6B2] text-gray-700 hover:bg-gray-50 rounded-xl font-medium text-sm transition-all duration-200 shadow-sm"
            >
              🖨️ Print my results
            </button>
          ) : null}
          <Link
            href={performanceHref}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#B22234] hover:bg-[#8B0000] text-white rounded-xl font-medium text-sm transition-all duration-200 shadow-md"
          >
            View Performance Analytics
          </Link>
        </div>
      </main>
    </div>
  )
}
