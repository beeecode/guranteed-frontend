'use client';

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { axisTick, chartTooltipStyle, gridStroke } from '@/components/charts/chartTheme';

interface PerformanceChartsProps {
  subjectScores: { subject: string; score: number }[];
  termScores: { term: string; score: number }[];
}

/** "Score by Subject" bar chart and "Score Trend" line chart. */
export function PerformanceCharts({ subjectScores, termScores }: PerformanceChartsProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-6 mb-6">
      {/* Bar Chart */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <h3 className="font-heading font-700 text-gray-900 mb-5">Score by Subject</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={subjectScores} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="subject" tick={axisTick(11)} />
            <YAxis tick={axisTick(11)} domain={[0, 100]} />
            <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => [`${v}%`, 'Score']} />
            <Bar dataKey="score" fill="#B22234" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <h3 className="font-heading font-700 text-gray-900 mb-5">Score Trend This Session</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={termScores} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="term" tick={axisTick(11)} />
            <YAxis tick={axisTick(11)} domain={[60, 100]} />
            <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => [`${v}%`, 'Average']} />
            <Line type="monotone" dataKey="score" stroke="#B22234" strokeWidth={3} dot={{ fill: '#B22234', r: 5 }} activeDot={{ r: 7 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
