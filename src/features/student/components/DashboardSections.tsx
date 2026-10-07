import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { formatDuration, sum } from '@/lib/format';
import type { ExamBundle, Subject } from '@/types/exam';
import type { Announcement, RecentResult, Student } from '@/types/student';

const gradeColor = (g: string) =>
  g.startsWith('A') ? '#15803d' : g.startsWith('B') ? '#1d4ed8' : '#d97706';

export function WelcomeBanner({ student }: { student: Student }) {
  return (
    <div className="relative overflow-hidden mb-6 p-6 sm:p-8" style={{ background: '#8B0000', borderRadius: 24 }}>
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 translate-x-1/4 -translate-y-1/4" />
      <div className="relative z-10">
        <div className="font-playful text-white/70 text-sm mb-1">Welcome back,</div>
        <h2 className="font-playful font-bold text-white leading-tight mb-1" style={{ fontSize: 'clamp(1.5rem,4vw,2.2rem)' }}>{student.name}! 👋</h2>
        <p className="text-white/60 text-sm">{student.class} · ID: {student.id}</p>
      </div>
    </div>
  );
}

export function DashboardStats({ stats }: { stats: { label: string; value: string; emoji: string; border: string }[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white flex flex-col items-center justify-center py-5 gap-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg" style={{ borderRadius: 20, border: '2px solid rgba(217,198,178,0.4)' }}>
          <div className="text-2xl">{stat.emoji}</div>
          <div className="font-playful font-bold text-2xl" style={{ color: stat.border }}>{stat.value}</div>
          <div className="text-xs text-[#7A5C3A] font-semibold text-center uppercase tracking-wide" style={{ maxWidth: 90 }}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

function BundleJourneyStrip({ subjects }: { subjects: Subject[] }) {
  return (
    <div className="flex items-center gap-1 flex-wrap mt-3">
      {subjects.map((s, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 border border-white/25 text-white text-xs font-bold font-playful" style={{ borderRadius: 10 }}>
            <span>{s.emoji}</span>
            <span className="hidden sm:inline">{s.name.split(' ')[0]}</span>
          </div>
          {i < subjects.length - 1 && <span className="text-white/50 text-sm">→</span>}
        </div>
      ))}
    </div>
  );
}

/** Dark gradient card advertising the upcoming multi-subject exam. */
export function BundleExamCard({ bundle }: { bundle: ExamBundle }) {
  const durationLabel = formatDuration(sum(bundle.subjects, s => s.duration));
  return (
    <div className="relative overflow-hidden p-6" style={{ background: 'linear-gradient(135deg, #1C0A04 0%, #5C1010 100%)', borderRadius: 24 }}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-white/5 -translate-x-1/3 translate-y-1/3" />

      <div className="relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-3 font-playful font-bold text-xs uppercase tracking-widest"
          style={{ background: 'rgba(232,184,48,0.2)', borderRadius: 999, color: '#E8B830', border: '1px solid rgba(232,184,48,0.35)' }}>
          📚 {bundle.subjects.length} Subjects · Bundled Exam
        </div>

        <h3 className="font-playful font-bold text-white text-xl mb-0.5">{bundle.name}</h3>
        <p className="text-white/55 text-xs mb-4">{bundle.class} · {bundle.date} · {durationLabel} total</p>

        <BundleJourneyStrip subjects={bundle.subjects} />

        <div className="flex flex-wrap items-center gap-3 mt-5">
          <Link
            href={`/student/bundle/${bundle.id}/overview`}
            className="inline-flex items-center gap-2 px-6 py-3 font-playful font-bold text-sm transition-all hover:-translate-y-0.5 hover:shadow-xl"
            style={{ background: '#E8B830', color: '#1C0A04', borderRadius: 999, boxShadow: '0 4px 16px rgba(232,184,48,0.4)' }}
          >
            START EXAM 🚀
          </Link>
          <div className="text-white/50 text-xs">
            {bundle.subjects.length} subjects · {sum(bundle.subjects, s => s.totalQuestions)} questions
          </div>
        </div>
      </div>
    </div>
  );
}

export function RecentResults({ results, viewAllHref = '/student/results' }: { results: RecentResult[]; viewAllHref?: string }) {
  return (
    <div className="bg-white p-6" style={{ borderRadius: 24 }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-playful font-bold text-[#1C0A04]">🏆 Recent Results</h3>
        <Link href={viewAllHref} className="text-xs text-[#B22234] font-bold font-playful flex items-center gap-1">View All <ChevronRight className="w-3 h-3" /></Link>
      </div>
      <div className="space-y-3">
        {results.map((r, i) => (
          <div key={i} className="flex items-center gap-3 py-2" style={{ borderBottom: i < results.length - 1 ? '1px solid rgba(217,198,178,0.25)' : 'none' }}>
            <span className="text-lg">{r.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[#1C0A04] truncate">{r.subject}</div>
              <div className="text-xs text-[#B8967A]">{r.date}</div>
            </div>
            <div className="text-right">
              <div className="font-playful font-bold text-lg" style={{ color: gradeColor(r.grade) }}>{r.grade}</div>
              <div className="text-xs text-[#B8967A]">{r.score}/{r.total}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Announcements({ items }: { items: Announcement[] }) {
  return (
    <div className="bg-white p-6" style={{ borderRadius: 24 }}>
      <h3 className="font-playful font-bold text-[#1C0A04] mb-4">📢 Announcements</h3>
      <div className="space-y-3">
        {items.map((a, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-base flex-shrink-0 mt-0.5">{a.emoji}</span>
            <div>
              <div className="text-sm text-[#1C0A04] leading-snug font-medium">{a.title}</div>
              <div className="text-xs text-[#B8967A] mt-0.5">{a.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MotivationCard() {
  return (
    <div className="p-5 text-center" style={{ background: 'rgba(178,34,52,0.06)', borderRadius: 20, border: '1.5px solid rgba(178,34,52,0.12)' }}>
      <div className="text-3xl mb-2">💪</div>
      <p className="font-playful font-bold text-[#8B0000] text-sm leading-snug">"Every expert was once a beginner. Keep going!"</p>
    </div>
  );
}
