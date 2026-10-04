'use client';

import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { axisTick, chartTooltipStyle, gridStroke } from '@/components/charts/chartTheme';
import { classScores, passFailRate } from '@/data/admin';

export function ClassScoreChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={classScores} margin={{ top: 5, right: 10, bottom: 5, left: -25 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="class" tick={axisTick(10)} />
        <YAxis tick={axisTick(10)} domain={[60, 100]} />
        <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => [`${v}%`, 'Avg Score']} />
        <Bar dataKey="score" fill="#B22234" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PassFailChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={passFailRate} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
          {passFailRate.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Legend iconType="circle" iconSize={10} formatter={(value) => <span style={{ fontSize: '12px', color: '#555' }}>{value}</span>} />
        <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => [`${v}%`]} />
      </PieChart>
    </ResponsiveContainer>
  );
}
