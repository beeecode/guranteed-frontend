import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { ExamBundle } from '@/types/exam';
import type { Parent, Student } from '@/types/student';

export function ParentWelcomeBanner({ parent }: { parent: Parent }) {
  return (
    <div className="relative overflow-hidden mb-6 p-6 sm:p-8" style={{ background: '#8B0000', borderRadius: 24 }}>
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 translate-x-1/4 -translate-y-1/4" />
      <div className="relative z-10">
        <div className="font-playful text-white/70 text-sm mb-1">Welcome,</div>
        <h2 className="font-playful font-bold text-white leading-tight mb-1" style={{ fontSize: 'clamp(1.5rem,4vw,2.2rem)' }}>{parent.name}! 👋</h2>
        <p className="text-white/60 text-sm">Viewing results for {parent.child.name} · {parent.child.class}</p>
      </div>
    </div>
  );
}

/** Profile card for the parent's linked child. */
export function ChildProfileCard({ child, relationship }: { child: Student; relationship: string }) {
  const rows = [
    { label: 'Student ID', value: child.id },
    { label: 'Class', value: child.class },
    { label: 'Session', value: child.session },
    { label: 'Relationship', value: relationship },
  ];

  return (
    <div className="bg-white p-6" style={{ borderRadius: 24 }}>
      <h3 className="font-playful font-bold text-[#1C0A04] mb-4">👧 My Child</h3>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 flex items-center justify-center font-playful font-bold text-white flex-shrink-0" style={{ background: '#B22234', borderRadius: 14 }}>
          {child.avatar}
        </div>
        <div className="min-w-0">
          <div className="font-playful font-bold text-[#1C0A04] truncate">{child.name}</div>
          <div className="text-xs text-[#B8967A]">{child.class}</div>
        </div>
      </div>
      <div className="space-y-2.5" style={{ background: 'rgba(217,198,178,0.15)', borderRadius: 16, padding: '14px 18px' }}>
        {rows.map(row => (
          <div key={row.label} className="flex justify-between gap-3">
            <span className="text-xs text-[#7A5C3A] font-medium">{row.label}</span>
            <span className="text-xs font-bold text-[#1C0A04] text-right">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Highlights the child's latest multi-subject exam and links to its breakdown. */
export function LatestExamResultsCard({ bundle, averagePct, grade }: { bundle: ExamBundle; averagePct: number; grade: string }) {
  return (
    <div className="relative overflow-hidden p-6" style={{ background: 'linear-gradient(135deg, #1C0A04 0%, #5C1010 100%)', borderRadius: 24 }}>
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-white/5 -translate-x-1/3 translate-y-1/3" />

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-3 font-playful font-bold text-xs uppercase tracking-widest"
            style={{ background: 'rgba(232,184,48,0.2)', borderRadius: 999, color: '#E8B830', border: '1px solid rgba(232,184,48,0.35)' }}>
            📋 Latest Exam Results
          </div>
          <h3 className="font-playful font-bold text-white text-xl mb-0.5">{bundle.name}</h3>
          <p className="text-white/55 text-xs mb-4">{bundle.class} · {bundle.term} · {bundle.subjects.length} subjects</p>
          <Link
            href={`/parent/bundle/${bundle.id}/results`}
            className="inline-flex items-center gap-2 px-6 py-3 font-playful font-bold text-sm transition-all hover:-translate-y-0.5 hover:shadow-xl"
            style={{ background: '#E8B830', color: '#1C0A04', borderRadius: 999, boxShadow: '0 4px 16px rgba(232,184,48,0.4)' }}
          >
            VIEW BREAKDOWN 📊
          </Link>
        </div>
        <div className="w-24 h-24 flex flex-col items-center justify-center flex-shrink-0" style={{ borderRadius: '50%', border: '5px solid #E8B830', background: 'rgba(255,255,255,0.12)' }}>
          <div className="font-playful font-bold text-white" style={{ fontSize: '1.6rem', lineHeight: 1 }}>{averagePct}%</div>
          <div className="text-white/60 text-xs">Grade {grade}</div>
        </div>
      </div>
    </div>
  );
}

const quickLinks = [
  { href: '/parent/results', emoji: '📊', label: 'All Results', desc: 'Every published exam score' },
  { href: '/parent/performance', emoji: '📈', label: 'Performance', desc: 'Subject scores & term trend' },
];

export function ParentQuickLinks() {
  return (
    <div className="bg-white p-6" style={{ borderRadius: 24 }}>
      <h3 className="font-playful font-bold text-[#1C0A04] mb-4">🔗 Quick Links</h3>
      <div className="space-y-3">
        {quickLinks.map(link => (
          <Link key={link.href} href={link.href} className="flex items-center gap-3 p-3 transition-all hover:-translate-y-0.5" style={{ background: 'rgba(217,198,178,0.15)', borderRadius: 14 }}>
            <span className="text-xl">{link.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[#1C0A04]">{link.label}</div>
              <div className="text-xs text-[#B8967A]">{link.desc}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#B8967A]" />
          </Link>
        ))}
      </div>
    </div>
  );
}
