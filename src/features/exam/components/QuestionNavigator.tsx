import { X } from 'lucide-react';
import { QuestionGrid } from '@/components/exam/QuestionGrid';
import type { ExamProgress, Question, QuestionStatus } from '@/types/exam';

const legend = [
  { dot: '#16A34A', label: '✅ Answered' },
  { dot: '#B22234', label: '📍 Current' },
  { dot: '#F97316', label: '🚩 Flagged' },
  { dot: '#D9C6B2', label: '○ Unanswered' },
];

interface NavigatorProps {
  questions: Question[];
  statusOf: (idx: number) => QuestionStatus;
  onSelect: (idx: number) => void;
  progress: ExamProgress;
}

/** Desktop sidebar: legend, question grid and answer summary. */
export function QuestionNavigatorPanel({ questions, statusOf, onSelect, progress }: NavigatorProps) {
  return (
    <aside className="hidden lg:flex w-64 bg-white border-l border-[rgba(217,198,178,0.3)] flex-col">
      <div className="p-4 border-b border-[rgba(217,198,178,0.3)]">
        <h3 className="font-playful font-bold text-[#1C0A04] text-sm mb-3">Question Navigator</h3>
        <div className="flex flex-col gap-1.5 text-xs">
          {legend.map((l, i) => (
            <span key={i} className="flex items-center gap-2 text-[#7A5C3A]">
              <span className="w-3 h-3 rounded-full inline-block flex-shrink-0" style={{ background: l.dot }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <QuestionGrid
          questions={questions}
          statusOf={statusOf}
          onSelect={onSelect}
          gridClassName="grid grid-cols-5 gap-2"
          buttonClassName="w-10 h-10 text-xs font-playful font-bold transition-all hover:-translate-y-0.5"
          radius={10}
        />
      </div>

      <div className="p-4 border-t border-[rgba(217,198,178,0.3)] space-y-2">
        <div className="flex justify-between text-xs text-[#7A5C3A]">
          <span>✅ Answered</span>
          <span className="font-bold text-[#16A34A]">{progress.answered}</span>
        </div>
        <div className="flex justify-between text-xs text-[#7A5C3A]">
          <span>○ Unanswered</span>
          <span className="font-bold text-[#F97316]">{progress.unanswered}</span>
        </div>
        <div className="flex justify-between text-xs text-[#7A5C3A]">
          <span>🚩 Flagged</span>
          <span className="font-bold text-[#F97316]">{progress.flagged}</span>
        </div>
        {/* Mini progress bar */}
        <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(217,198,178,0.4)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress.percent}%`, background: '#16A34A' }} />
        </div>
        <div className="text-center text-xs font-bold font-playful" style={{ color: '#16A34A' }}>{progress.percent}% complete</div>
      </div>
    </aside>
  );
}

/** Mobile/tablet slide-in navigator. */
export function QuestionNavigatorDrawer({ questions, statusOf, onSelect, progress, onClose }: NavigatorProps & { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50" onClick={onClose} />
      <div className="w-72 bg-white h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-[rgba(217,198,178,0.3)]">
          <h3 className="font-playful font-bold text-[#1C0A04]">Question Navigator</h3>
          <button onClick={onClose} className="text-[#7A5C3A]"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          <QuestionGrid
            questions={questions}
            statusOf={statusOf}
            onSelect={idx => { onSelect(idx); onClose(); }}
            gridClassName="grid grid-cols-5 gap-2"
            buttonClassName="w-10 h-10 text-xs font-playful font-bold transition-all"
            radius={10}
          />
        </div>
        <div className="p-4 border-t border-[rgba(217,198,178,0.3)] text-sm font-playful font-bold text-center" style={{ color: '#7A5C3A' }}>
          {progress.answered}/{questions.length} answered
        </div>
      </div>
    </div>
  );
}
