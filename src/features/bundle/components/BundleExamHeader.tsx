import { ExamTimer } from '@/components/exam/ExamTimer';
import { Logo } from '@/components/ui/Logo';
import type { BundleSubject } from '@/types/exam';

/** Subject chips with arrows — the student's journey through the bundle. */
function SubjectJourneyBar({ subjects, currentIdx, completedSet }: {
  subjects: BundleSubject[];
  currentIdx: number;
  completedSet: Set<number>;
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {subjects.map((s, i) => {
        const done = completedSet.has(i);
        const current = i === currentIdx && !done;
        return (
          <div key={i} className="flex items-center gap-1.5">
            <div
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold font-playful transition-all"
              style={{
                borderRadius: 999,
                background: done ? 'rgba(22,163,74,0.9)' : current ? '#fff' : 'rgba(255,255,255,0.18)',
                color: done ? '#fff' : current ? '#8B0000' : 'rgba(255,255,255,0.65)',
                boxShadow: current ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
              }}
            >
              {done ? '✓' : s.emoji}
              <span className="hidden sm:inline ml-1">{s.name.split(' ')[0]}</span>
            </div>
            {i < subjects.length - 1 && <span className="text-white/40 text-sm">→</span>}
          </div>
        );
      })}
    </div>
  );
}

interface BundleExamHeaderProps {
  subjects: BundleSubject[];
  subjectIdx: number;
  completedSubjects: Set<number>;
  secondsLeft: number;
  isLastSubject: boolean;
  onOpenNavigator: () => void;
  onSubmit: () => void;
}

export function BundleExamHeader({ subjects, subjectIdx, completedSubjects, secondsLeft, isLastSubject, onOpenNavigator, onSubmit }: BundleExamHeaderProps) {
  const subject = subjects[subjectIdx];
  const isWarning = secondsLeft < 300;
  const isCritical = secondsLeft < 120;

  return (
    <header
      className="sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center gap-3 shadow-md"
      style={{ background: isCritical ? '#DC2626' : isWarning ? '#EA580C' : '#8B0000' }}
    >
      <Logo className="w-8 h-8 object-contain flex-shrink-0" alt="GFMS" />

      {/* Subject journey (desktop) */}
      <div className="flex-1 hidden sm:block">
        <SubjectJourneyBar subjects={subjects} currentIdx={subjectIdx} completedSet={completedSubjects} />
      </div>

      {/* Mobile: subject label */}
      <div className="flex-1 sm:hidden">
        <div className="font-playful font-bold text-white text-sm">{subject.emoji} {subject.name}</div>
        <div className="text-white/55 text-xs">Subject {subjectIdx + 1} of {subjects.length}</div>
      </div>

      <ExamTimer secondsLeft={secondsLeft} critical={isCritical} className="gap-1.5 px-3 py-1.5 text-base flex-shrink-0" />

      {/* Nav toggle (mobile) */}
      <button onClick={onOpenNavigator} className="lg:hidden p-2 flex-col gap-1 flex flex-shrink-0" style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10 }}>
        <div className="w-4 h-0.5 bg-white rounded" /><div className="w-4 h-0.5 bg-white rounded" /><div className="w-4 h-0.5 bg-white rounded" />
      </button>

      <button onClick={onSubmit} className="px-3 py-2 font-playful font-bold text-xs transition-all hover:shadow-lg flex-shrink-0" style={{ background: '#fff', color: '#8B0000', borderRadius: 999, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        {isLastSubject ? 'Finish ✓' : 'Submit →'}
      </button>
    </header>
  );
}
