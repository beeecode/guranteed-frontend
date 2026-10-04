'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle, ChevronRight, Clock, RefreshCw, Wifi, WifiOff, X } from 'lucide-react';
import { formatClock, sum } from '@/lib/format';
import type { ExamBundle } from '@/types/exam';
import type { MonitorStudent } from '@/types/student';

const statusConfig: Record<MonitorStudent['status'], { label: string; bg: string; color: string; dot: string }> = {
  writing:    { label: 'Writing',     bg: 'rgba(22,163,74,0.1)',   color: '#16A34A', dot: '#16A34A' },
  break:      { label: 'On Break',    bg: 'rgba(234,179,8,0.1)',   color: '#854D0E', dot: '#EAB308' },
  done:       { label: 'Completed',   bg: 'rgba(107,114,128,0.1)', color: '#6B7280', dot: '#9CA3AF' },
  notStarted: { label: 'Not Started', bg: 'rgba(59,130,246,0.1)',  color: '#1D4ED8', dot: '#60A5FA' },
};

/* ── Student action modal ───────────────────────────────────── */
function StudentActionModal({ bundle, student, onClose }: { bundle: ExamBundle; student: MonitorStudent; onClose: () => void }) {
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const currentSubject = bundle.subjects[student.currentSubjectIdx];

  const actions = [
    { label: 'Extend Current Subject Time (+10 min)', icon: Clock, color: '#2563EB', dangerous: false },
    { label: 'Move to Next Subject', icon: ChevronRight, color: '#D97706', dangerous: false },
    { label: 'Pause Student Exam', icon: AlertTriangle, color: '#D97706', dangerous: false },
    { label: 'Reopen Completed Subject', icon: RefreshCw, color: '#DC2626', dangerous: true },
    { label: 'Force Submit Current Subject', icon: CheckCircle, color: '#DC2626', dangerous: true },
    { label: 'Force Submit Full Bundle', icon: CheckCircle, color: '#DC2626', dangerous: true },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white w-full max-w-md shadow-2xl" style={{ borderRadius: 24 }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(217,198,178,0.3)' }}>
          <div>
            <div className="font-semibold text-gray-900">{student.name}</div>
            <div className="text-xs text-gray-500">{student.id} · Currently: {currentSubject?.emoji} {currentSubject?.name}</div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600" style={{ borderRadius: 8 }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timeline */}
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(217,198,178,0.3)' }}>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Exam Timeline</div>
          <div className="space-y-1.5">
            {bundle.subjects.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className={student.subjectsCompleted > i ? 'text-green-500' : i === student.currentSubjectIdx ? 'text-[#B22234]' : 'text-gray-300'}>
                  {student.subjectsCompleted > i ? '✓' : i === student.currentSubjectIdx ? '●' : '○'}
                </span>
                <span className="text-lg">{s.emoji}</span>
                <span className={student.subjectsCompleted > i ? 'text-green-600 font-medium' : i === student.currentSubjectIdx ? 'text-[#B22234] font-bold' : 'text-gray-400'}>
                  {s.name}
                </span>
                {student.subjectsCompleted > i && <span className="text-green-500 ml-auto">Completed</span>}
                {i === student.currentSubjectIdx && <span className="text-[#B22234] ml-auto">In Progress</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-5">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Admin Actions</div>
          {confirmAction ? (
            <div className="p-4" style={{ background: 'rgba(220,38,38,0.05)', borderRadius: 14, border: '1.5px solid rgba(220,38,38,0.2)' }}>
              <p className="text-sm text-red-700 font-medium mb-3">Are you sure? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmAction(null)} className="flex-1 py-2.5 text-sm font-semibold" style={{ border: '1.5px solid rgba(217,198,178,0.5)', borderRadius: 999, color: '#7A5C3A' }}>Cancel</button>
                <button onClick={onClose} className="flex-1 py-2.5 text-sm font-bold text-white" style={{ background: '#DC2626', borderRadius: 999 }}>Confirm</button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {actions.map((a, i) => (
                <button key={i} onClick={() => a.dangerous ? setConfirmAction(a.label) : onClose()}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all text-left"
                  style={{ borderRadius: 12, background: `${a.color}10`, color: a.color }}>
                  <a.icon className="w-4 h-4 flex-shrink-0" />
                  {a.label}
                  {a.dangerous && <span className="ml-auto text-[10px] font-bold px-2 py-0.5" style={{ background: `${a.color}20`, borderRadius: 999 }}>DANGER</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Status filter pills, live student table and per-student admin actions. */
export function MonitorStudentTable({ bundle, students }: { bundle: ExamBundle; students: MonitorStudent[] }) {
  const [selectedStudent, setSelectedStudent] = useState<MonitorStudent | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const stats = {
    total: students.length,
    notStarted: students.filter(s => s.status === 'notStarted').length,
    writing: students.filter(s => s.status === 'writing').length,
    onBreak: students.filter(s => s.status === 'break').length,
    completed: students.filter(s => s.status === 'done').length,
  };
  const totalQ = sum(bundle.subjects, sub => sub.totalQuestions);

  const filtered = filterStatus === 'all' ? students : students.filter(s => s.status === filterStatus);

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[['all', 'All'], ['writing', 'Writing'], ['break', 'On Break'], ['done', 'Completed'], ['notStarted', 'Not Started']].map(([val, label]) => (
          <button key={val} onClick={() => setFilterStatus(val)}
            className="px-4 py-2 text-xs font-bold transition-all"
            style={{ borderRadius: 999, background: filterStatus === val ? '#B22234' : '#fff', color: filterStatus === val ? '#fff' : '#7A5C3A', border: `1.5px solid ${filterStatus === val ? '#B22234' : 'rgba(217,198,178,0.5)'}` }}>
            {label} {val === 'all' ? `(${stats.total})` : val === 'writing' ? `(${stats.writing})` : val === 'break' ? `(${stats.onBreak})` : val === 'done' ? `(${stats.completed})` : `(${stats.notStarted})`}
          </button>
        ))}
      </div>

      {/* Student table */}
      <div className="bg-white shadow-sm overflow-hidden" style={{ borderRadius: 20 }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F9F5F1', borderBottom: '1px solid rgba(217,198,178,0.4)' }}>
                {['Student', 'Current Subject', 'Subject Progress', 'Overall', 'Time Left', 'Status', 'Conn.', ''].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => {
                const cfg = statusConfig[student.status] ?? statusConfig.notStarted;
                const currentSubject = bundle.subjects[student.currentSubjectIdx];
                const currentAnswered = student.answers[student.currentSubjectIdx] ?? 0;
                const subjectPct = Math.round((currentAnswered / (currentSubject?.totalQuestions ?? 10)) * 100);
                const totalAnswered = sum(Object.values(student.answers), v => v);
                const overallPct = Math.round((totalAnswered / totalQ) * 100);

                return (
                  <tr key={student.id} className="border-b border-[rgba(217,198,178,0.2)] hover:bg-[rgba(217,198,178,0.05)] transition-colors" style={{ opacity: student.status === 'notStarted' ? 0.7 : 1 }}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 whitespace-nowrap">{student.name}</div>
                      <div className="text-xs text-gray-400">{student.id}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {student.status === 'done' ? (
                        <span className="text-green-600 font-medium text-xs">All Done ✓</span>
                      ) : student.status === 'notStarted' ? (
                        <span className="text-gray-400 text-xs">Not started</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span>{currentSubject?.emoji}</span>
                          <span className="text-gray-700 text-xs">{currentSubject?.name?.split(' ')[0]}</span>
                          <span className="text-gray-400 text-xs">({student.currentSubjectIdx + 1}/{bundle.subjects.length})</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(217,198,178,0.4)' }}>
                          <div className="h-full rounded-full" style={{ width: `${subjectPct}%`, background: '#B22234' }} />
                        </div>
                        <span className="text-xs text-gray-500">{subjectPct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(217,198,178,0.4)' }}>
                          <div className="h-full rounded-full" style={{ width: `${overallPct}%`, background: '#16A34A' }} />
                        </div>
                        <span className="text-xs text-gray-500">{overallPct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-xs font-medium ${student.timeLeft < 300 ? 'text-red-500' : 'text-gray-600'}`}>
                        {student.status === 'done' ? '—' : formatClock(student.timeLeft)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold" style={{ background: cfg.bg, color: cfg.color, borderRadius: 999 }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {student.connected ? (
                        <Wifi className="w-4 h-4 text-green-500" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-red-400" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelectedStudent(student)} className="text-xs font-semibold text-[#B22234] hover:underline whitespace-nowrap">
                        Actions →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedStudent && <StudentActionModal bundle={bundle} student={selectedStudent} onClose={() => setSelectedStudent(null)} />}
    </>
  );
}
