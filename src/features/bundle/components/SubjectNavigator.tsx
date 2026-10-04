import { X } from 'lucide-react';
import { QuestionGrid } from '@/components/exam/QuestionGrid';
import type { BundleSubject, Question, QuestionStatus } from '@/types/exam';

interface SubjectNavigatorProps {
  subjects: BundleSubject[];
  subjectIdx: number;
  completedSubjects: Set<number>;
  questions: Question[];
  statusOf: (idx: number) => QuestionStatus;
  onSelect: (idx: number) => void;
}

const journeyColor = (i: number, subjectIdx: number, completed: Set<number>) =>
  completed.has(i) ? '#16A34A' : i === subjectIdx ? '#B22234' : '#B8967A';

const journeyMark = (i: number, subjectIdx: number, completed: Set<number>) =>
  completed.has(i) ? '✓' : i === subjectIdx ? '●' : '○';

/** Desktop sidebar: subject journey, question grid and counts. */
export function SubjectNavigatorPanel({ subjects, subjectIdx, completedSubjects, questions, statusOf, onSelect, subjectAnswered, flaggedCount, overallProgress }: SubjectNavigatorProps & {
  subjectAnswered: number;
  flaggedCount: number;
  overallProgress: number;
}) {
  const subject = subjects[subjectIdx];
  const counts: [string, number, string][] = [
    ['✅ Answered', subjectAnswered, '#16A34A'],
    ['○ Unanswered', questions.length - subjectAnswered, '#F97316'],
    ['🚩 Flagged', flaggedCount, '#F97316'],
  ];

  return (
    <aside className="hidden lg:flex w-64 bg-white border-l border-[rgba(217,198,178,0.3)] flex-col">
      <div className="p-4 border-b border-[rgba(217,198,178,0.3)]">
        <div className="text-xs font-bold text-[#7A5C3A] uppercase tracking-wide mb-1">{subject.emoji} {subject.name}</div>
        <div className="text-[10px] text-[#B8967A]">Subject {subjectIdx + 1} of {subjects.length}</div>
        {/* Subject mini-journey */}
        <div className="mt-3 space-y-1">
          {subjects.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-xs" style={{ color: journeyColor(i, subjectIdx, completedSubjects), fontWeight: i === subjectIdx ? 700 : 400 }}>
              <span>{journeyMark(i, subjectIdx, completedSubjects)}</span>
              <span>{s.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 border-b border-[rgba(217,198,178,0.3)]">
        <div className="text-[10px] text-[#7A5C3A] font-bold uppercase tracking-wide mb-2">Questions</div>
        <QuestionGrid
          questions={questions}
          statusOf={statusOf}
          onSelect={onSelect}
          gridClassName="grid grid-cols-5 gap-1.5"
          buttonClassName="w-9 h-9 text-xs font-playful font-bold transition-all hover:-translate-y-0.5"
          radius={8}
        />
      </div>
      <div className="p-4 space-y-2">
        {counts.map(([label, val, color], i) => (
          <div key={i} className="flex justify-between text-xs text-[#7A5C3A]">
            <span>{label}</span><span className="font-bold" style={{ color }}>{val}</span>
          </div>
        ))}
        <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(217,198,178,0.3)' }}>
          <div className="text-[10px] text-[#B8967A] mb-1">Overall Bundle</div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(217,198,178,0.4)' }}>
            <div className="h-full rounded-full" style={{ width: `${overallProgress}%`, background: '#16A34A' }} />
          </div>
          <div className="text-[10px] font-bold text-[#16A34A] mt-0.5 text-right">{overallProgress}%</div>
        </div>
      </div>
    </aside>
  );
}

/** Mobile/tablet drawer with the exam journey and question grid. */
export function SubjectNavigatorDrawer({ subjects, subjectIdx, completedSubjects, questions, statusOf, onSelect, onClose }: SubjectNavigatorProps & { onClose: () => void }) {
  const subject = subjects[subjectIdx];
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50" onClick={onClose} />
      <div className="w-72 bg-white h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-[rgba(217,198,178,0.3)]">
          <div>
            <div className="font-playful font-bold text-[#1C0A04]">{subject.emoji} {subject.name}</div>
            <div className="text-xs text-[#B8967A]">Subject {subjectIdx + 1} of {subjects.length}</div>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-[#7A5C3A]" /></button>
        </div>
        <div className="p-4 border-b border-[rgba(217,198,178,0.3)]">
          <div className="text-xs font-bold text-[#7A5C3A] uppercase tracking-wide mb-2">Exam Journey</div>
          {subjects.map((s, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 text-sm" style={{ color: journeyColor(i, subjectIdx, completedSubjects), fontWeight: i === subjectIdx ? 700 : 400 }}>
              <span>{journeyMark(i, subjectIdx, completedSubjects)}</span>{s.emoji} {s.name}
            </div>
          ))}
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="text-xs font-bold text-[#7A5C3A] uppercase tracking-wide mb-2">Questions</div>
          <QuestionGrid
            questions={questions}
            statusOf={statusOf}
            onSelect={idx => { onSelect(idx); onClose(); }}
            gridClassName="grid grid-cols-5 gap-2"
            buttonClassName="w-10 h-10 text-xs font-playful font-bold"
            radius={8}
          />
        </div>
      </div>
    </div>
  );
}
