"use client"

/**
 * Admin dashboard charts (Stage 11: live data from GET /api/admin/analytics). Percentages
 * are score / exam total marks. No pass/fail split is drawn: standalone exams have no pass
 * mark, so the donut shows score bands instead.
 */

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  axisTick,
  chartTooltipStyle,
  gridStroke,
} from "@/components/charts/chartTheme"

export function SubjectScoreChart({ data }: { data: Array<{ name: string; avg: number }> }) {
  if (!data.length) return <p className="py-16 text-center text-sm text-gray-400">No submitted results yet.</p>
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={data.map((row) => ({ subject: row.name, score: Math.round(row.avg) }))}
        margin={{ top: 5, right: 10, bottom: 5, left: -25 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="subject" tick={axisTick(10)} />
        <YAxis tick={axisTick(10)} domain={[0, 100]} />
        <Tooltip
          contentStyle={chartTooltipStyle}
          formatter={(v) => [`${v}%`, "Avg Score"]}
        />
        <Bar dataKey="score" fill="#B22234" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

const BANDS = [
  { key: "excellent", name: "75% and above", color: "#16A34A" },
  { key: "good", name: "50–74%", color: "#2563EB" },
  { key: "average", name: "40–49%", color: "#D97706" },
  { key: "poor", name: "Below 40%", color: "#EF4444" },
] as const

export function ScoreBandChart({ distribution }: { distribution: Partial<Record<(typeof BANDS)[number]["key"], number>> }) {
  const data = BANDS.map((band) => ({ name: band.name, value: Number(distribution[band.key]) || 0, color: band.color })).filter((row) => row.value > 0)
  if (!data.length) return <p className="py-16 text-center text-sm text-gray-400">No submitted results yet.</p>
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={4}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Legend
          iconType="circle"
          iconSize={10}
          formatter={(value) => (
            <span style={{ fontSize: "12px", color: "#555" }}>{value}</span>
          )}
        />
        <Tooltip
          contentStyle={chartTooltipStyle}
          formatter={(v) => [`${v} result(s)`]}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
