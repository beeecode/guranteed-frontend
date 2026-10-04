'use client';

import { useState } from 'react';
import { Search, Download, Eye, CheckCircle, X, BarChart2, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { adminResults as results, gradeDistribution as gradeData, scoreDistribution as distributionData, type AdminResult } from '@/data/admin';

const gradeColor = (g: string) => {
  if (g.startsWith('A')) return 'text-green-600';
  if (g.startsWith('B')) return 'text-blue-600';
  if (g.startsWith('C')) return 'text-orange-500';
  if (g === 'F') return 'text-red-600';
  return 'text-gray-600';
};

/** Results table / analytics toggle with a result detail modal. */
export function ResultsManager() {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'table' | 'analytics'>('table');
  const [selectedResult, setSelectedResult] = useState<AdminResult | null>(null);

  const filtered = results.filter(r =>
    r.student.toLowerCase().includes(search.toLowerCase()) ||
    r.subject.toLowerCase().includes(search.toLowerCase())
  );

  const avg = Math.round(results.reduce((a, r) => a + r.score, 0) / results.length);
  const passed = results.filter(r => r.score >= 50).length;
  const passRate = Math.round((passed / results.length) * 100);

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Highest Score', value: `${Math.max(...results.map(r => r.score))}%`, icon: TrendingUp, color: '#16A34A', bg: '#F0FDF4' },
          { label: 'Lowest Score', value: `${Math.min(...results.map(r => r.score))}%`, icon: TrendingDown, color: '#EF4444', bg: '#FEF2F2' },
          { label: 'Average Score', value: `${avg}%`, icon: BarChart2, color: '#B22234', bg: '#FFF0F0' },
          { label: 'Pass Rate', value: `${passRate}%`, icon: Users, color: '#2563EB', bg: '#EFF6FF' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div className="font-heading text-2xl font-700 text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by student or subject..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D9C6B2] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#B22234]/30" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('table')} className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${view === 'table' ? 'bg-[#B22234] text-white' : 'bg-white border border-[#D9C6B2] text-gray-600'}`}>
            Table View
          </button>
          <button onClick={() => setView('analytics')} className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${view === 'analytics' ? 'bg-[#B22234] text-white' : 'bg-white border border-[#D9C6B2] text-gray-600'}`}>
            Analytics
          </button>
          <button className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#D9C6B2] text-sm bg-white text-gray-600 hover:bg-gray-50">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {view === 'table' ? (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Student', 'Subject', 'Score', 'Grade', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((r, i) => (
                  <tr key={i} className="hover:bg-[#F9F5F1] transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#B22234] flex items-center justify-center text-white text-xs font-heading font-600 flex-shrink-0">{r.student[0]}</div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{r.student}</div>
                          <div className="text-xs text-gray-400">{r.class}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{r.subject}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full">
                          <div className="h-full rounded-full" style={{ width: `${r.score}%`, background: r.score >= 70 ? '#16A34A' : r.score >= 50 ? '#D97706' : '#EF4444' }} />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{r.score}/{r.total}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`font-heading text-lg font-700 ${gradeColor(r.grade)}`}>{r.grade}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${r.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {r.status === 'published' ? '✓ Published' : '⏳ Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-400">{r.date}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelectedResult(r)} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"><Eye className="w-4 h-4" /></button>
                        {r.status === 'pending' && (
                          <button className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50"><CheckCircle className="w-4 h-4" /></button>
                        )}
                        {r.status === 'published' && (
                          <button className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"><X className="w-4 h-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h3 className="font-heading font-700 text-gray-900 mb-5">Score Distribution</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={distributionData} margin={{ top: 5, right: 10, bottom: 5, left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F3F3" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#9A9A9A' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9A9A9A' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: '12px' }} formatter={(v) => [v, 'Students']} />
                <Bar dataKey="students" fill="#B22234" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h3 className="font-heading font-700 text-gray-900 mb-5">Grade Distribution</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={gradeData} cx="50%" cy="50%" outerRadius={90} paddingAngle={3} dataKey="value">
                  {gradeData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Legend iconType="circle" iconSize={10} formatter={(value) => <span style={{ fontSize: '12px', color: '#555' }}>{value}</span>} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: '12px' }} formatter={(v) => [`${v} students`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Result Detail Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="font-heading text-xl font-700 text-gray-900">{selectedResult.student}</h2>
                <p className="text-sm text-gray-500">{selectedResult.class} · {selectedResult.id}</p>
              </div>
              <button onClick={() => setSelectedResult(null)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="text-center mb-6 p-5 bg-[#F9F5F1] rounded-2xl">
              <div className={`font-heading text-6xl font-700 mb-2 ${gradeColor(selectedResult.grade)}`}>{selectedResult.grade}</div>
              <div className="text-gray-900 font-medium text-xl">{selectedResult.score}/{selectedResult.total}</div>
              <div className="text-gray-400 text-sm mt-1">{selectedResult.subject}</div>
            </div>
            <div className="space-y-3 text-sm mb-6">
              {[
                ['Exam', selectedResult.exam],
                ['Score', `${selectedResult.score} out of ${selectedResult.total}`],
                ['Percentage', `${selectedResult.score}%`],
                ['Grade', selectedResult.grade],
                ['Status', selectedResult.status === 'published' ? 'Result Published' : 'Pending Release'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-medium text-gray-900">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              {selectedResult.status === 'pending' && (
                <button onClick={() => setSelectedResult(null)} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium text-sm hover:bg-green-700 shadow-md">
                  Publish Result
                </button>
              )}
              <button onClick={() => setSelectedResult(null)} className="flex-1 py-3 border-2 border-[#D9C6B2] text-gray-700 rounded-xl font-medium text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
