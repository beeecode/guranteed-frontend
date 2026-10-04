import { AlertCircle, Star, TrendingUp } from 'lucide-react';
import { SimplePortalHeader } from '@/components/layout/SimplePortalHeader';
import { PerformanceCharts } from './PerformanceCharts';

const overviewCards = [
  { label: 'Average Score', value: '80%', sub: 'Across all subjects', icon: Star, color: '#B22234' },
  { label: 'Best Subject', value: 'Basic Science', sub: '92% — Excellent!', icon: TrendingUp, color: '#16A34A' },
  { label: 'Needs Improvement', value: 'Creative Arts', sub: '65% — Keep going!', icon: AlertCircle, color: '#D97706' },
];

const scoreColor = (score: number) => score >= 80 ? '#16A34A' : score >= 60 ? '#D97706' : '#DC2626';

interface StudentPerformanceProps {
  subjectScores: { subject: string; score: number }[];
  termScores: { term: string; score: number }[];
}

/** Performance analytics: overview cards, charts and per-subject progress bars. */
export function StudentPerformance({ subjectScores, termScores }: StudentPerformanceProps) {
  return (
    <div className="min-h-screen bg-[#F9F5F1]">
      <SimplePortalHeader
        title="My Performance"
        maxWidthClassName="max-w-5xl"
        backLinkClassName="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#8B0000]"
      />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Overview cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {overviewCards.map((card, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="w-9 h-9 rounded-xl mb-3" style={{ background: card.color + '15' }}>
                <card.icon className="w-5 h-5 m-2" style={{ color: card.color }} />
              </div>
              <div className="font-heading text-sm text-gray-500">{card.label}</div>
              <div className="font-heading text-lg font-700 text-gray-900 mt-0.5">{card.value}</div>
              <div className="text-xs text-gray-400 mt-1">{card.sub}</div>
            </div>
          ))}
        </div>

        <PerformanceCharts subjectScores={subjectScores} termScores={termScores} />

        {/* Subject progress bars */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="font-heading font-700 text-gray-900 mb-5">Subject Progress</h3>
          <div className="space-y-5">
            {subjectScores.map((s, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700">{s.subject}</span>
                  <span className="text-sm font-heading font-700" style={{ color: scoreColor(s.score) }}>
                    {s.score}%
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${s.score}%`, background: scoreColor(s.score) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
