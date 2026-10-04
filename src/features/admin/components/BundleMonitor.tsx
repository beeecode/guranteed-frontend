import Link from 'next/link';
import type { ExamBundle } from '@/types/exam';
import type { MonitorStudent } from '@/types/student';
import { MonitorStudentTable } from './MonitorStudentTable';

/* ── Top stat tiles ─────────────────────────────────────────── */
function StatTile({ label, value, emoji, bg, color }: { label: string; value: number | string; emoji: string; bg: string; color: string }) {
  return (
    <div className="bg-white p-4 shadow-sm" style={{ borderRadius: 18, border: '1.5px solid rgba(217,198,178,0.3)' }}>
      <div className="w-10 h-10 flex items-center justify-center text-xl mb-2" style={{ background: bg, borderRadius: 12 }}>
        {emoji}
      </div>
      <div className="font-semibold text-2xl" style={{ color }}>{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

/* ── Subject distribution bar ───────────────────────────────── */
function SubjectDistribution({ bundle, students }: { bundle: ExamBundle; students: MonitorStudent[] }) {
  const dist: Record<number, number> = {};
  let completed = 0;
  students.forEach(s => {
    if (s.status === 'done') { completed++; return; }
    if (s.status !== 'notStarted' && s.status !== 'break') {
      dist[s.currentSubjectIdx] = (dist[s.currentSubjectIdx] ?? 0) + 1;
    }
  });
  const onBreak = students.filter(s => s.status === 'break').length;

  return (
    <div className="bg-white p-5 shadow-sm" style={{ borderRadius: 20 }}>
      <h3 className="font-semibold text-gray-900 text-sm mb-4">Live Subject Distribution</h3>
      <div className="space-y-2">
        {bundle.subjects.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-lg w-8 flex-shrink-0">{s.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-gray-700 truncate">{s.name}</span>
                <span className="text-[#B22234] ml-2 flex-shrink-0">{dist[i] ?? 0} students</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(217,198,178,0.3)' }}>
                <div className="h-full rounded-full" style={{ width: `${((dist[i] ?? 0) / students.length) * 100}%`, background: '#B22234' }} />
              </div>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-3">
          <span className="text-lg w-8 flex-shrink-0">☕</span>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-gray-700">On Break</span>
              <span className="text-yellow-600 ml-2">{onBreak} students</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(217,198,178,0.3)' }}>
              <div className="h-full rounded-full" style={{ width: `${(onBreak / students.length) * 100}%`, background: '#EAB308' }} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg w-8 flex-shrink-0">🏆</span>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-gray-700">Completed</span>
              <span className="text-green-600 ml-2">{completed} students</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(217,198,178,0.3)' }}>
              <div className="h-full rounded-full" style={{ width: `${(completed / students.length) * 100}%`, background: '#16A34A' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Live monitoring dashboard for a multi-subject exam. */
export function BundleMonitor({ bundle, students }: { bundle: ExamBundle; students: MonitorStudent[] }) {
  const stats = {
    total: students.length,
    notStarted: students.filter(s => s.status === 'notStarted').length,
    writing: students.filter(s => s.status === 'writing').length,
    onBreak: students.filter(s => s.status === 'break').length,
    completed: students.filter(s => s.status === 'done').length,
  };

  return (
    <>
      {/* Back */}
      <div className="mb-4">
        <Link href="/admin/exams" className="text-sm text-[#7A5C3A] hover:text-[#8B0000] font-medium">← Back to Examinations</Link>
      </div>

      {/* Bundle header */}
      <div className="bg-[#8B0000] text-white p-5 mb-6 flex flex-wrap items-center justify-between gap-4" style={{ borderRadius: 20 }}>
        <div>
          <div className="font-semibold text-xl">{bundle.name}</div>
          <div className="text-white/65 text-sm">{bundle.class} · {bundle.date}</div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {bundle.subjects.map((s, i) => (
              <span key={i} className="flex items-center gap-1 text-xs px-2.5 py-1" style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 999 }}>
                {s.emoji} {s.name.split(' ')[0]}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2" style={{ background: 'rgba(22,163,74,0.3)', borderRadius: 999, border: '1px solid rgba(22,163,74,0.5)' }}>
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white font-bold text-sm">Live Now</span>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        <StatTile label="Total Students" value={stats.total} emoji="👥" bg="rgba(59,130,246,0.1)" color="#2563EB" />
        <StatTile label="Not Started" value={stats.notStarted} emoji="⏳" bg="rgba(217,198,178,0.3)" color="#7A5C3A" />
        <StatTile label="Currently Writing" value={stats.writing} emoji="✏️" bg="rgba(22,163,74,0.1)" color="#16A34A" />
        <StatTile label="On Break" value={stats.onBreak} emoji="☕" bg="rgba(234,179,8,0.1)" color="#854D0E" />
        <StatTile label="Completed" value={stats.completed} emoji="🏆" bg="rgba(107,114,128,0.1)" color="#6B7280" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <MonitorStudentTable bundle={bundle} students={students} />
        </div>

        <div>
          <SubjectDistribution bundle={bundle} students={students} />
        </div>
      </div>
    </>
  );
}
