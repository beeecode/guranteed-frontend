import Link from 'next/link';
import { BookOpen, ChevronRight, Star } from 'lucide-react';
import { SimplePortalHeader } from '@/components/layout/SimplePortalHeader';
import { sum } from '@/lib/format';
import type { ExamResult } from '@/types/student';

/** Summary tiles plus the list of published exam results. */
export function StudentResults({ results }: { results: ExamResult[] }) {
  const avg = Math.round(sum(results, r => r.score) / results.length);

  const summary = [
    { label: 'Average Score', value: `${avg}%`, icon: Star, color: '#B22234', bg: '#FFF0F0' },
    { label: 'Total Exams', value: results.length.toString(), icon: BookOpen, color: '#2563EB', bg: '#EFF6FF' },
    { label: 'Pass Rate', value: '100%', icon: ChevronRight, color: '#16A34A', bg: '#F0FDF4' },
  ];

  return (
    <div className="min-h-screen bg-[#F9F5F1]">
      <SimplePortalHeader
        title="My Results"
        maxWidthClassName="max-w-4xl"
        backLinkClassName="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#8B0000] transition-colors"
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {summary.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm text-center">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: s.bg }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div className="font-heading text-2xl font-700 text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-heading font-700 text-gray-900">Examination Results</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-[#F9F5F1] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#B22234]/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-[#B22234]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-heading font-600 text-gray-900 text-sm">{r.subject}</div>
                  <div className="text-xs text-gray-400">{r.exam} · {r.date}</div>
                </div>
                {/* Score bar */}
                <div className="hidden sm:block w-24">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${r.score}%`, background: r.color }} />
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-center">{r.score}/{r.total}</div>
                </div>
                <div className="text-right">
                  <div className="font-heading text-xl font-700" style={{ color: r.color }}>{r.grade}</div>
                  <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {r.status}
                  </div>
                </div>
                <button className="p-2 rounded-xl text-gray-400 hover:text-[#B22234] hover:bg-[#FFF0F0] transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/student/performance" className="inline-flex items-center gap-2 px-6 py-3 bg-[#B22234] hover:bg-[#8B0000] text-white rounded-xl font-medium text-sm transition-all duration-200 shadow-md">
            View Performance Analytics
          </Link>
        </div>
      </main>
    </div>
  );
}
