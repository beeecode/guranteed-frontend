import { ExamTimer } from '@/components/exam/ExamTimer';
import { Logo } from '@/components/ui/Logo';

interface ExamHeaderProps {
  subject: string;
  studentName: string;
  secondsLeft: number;
  warning: boolean;
  critical: boolean;
  currentNumber: number;
  total: number;
  onOpenNavigator: () => void;
  onSubmit: () => void;
}

/** Sticky top bar; turns orange then red as time runs out. */
export function ExamHeader({ subject, studentName, secondsLeft, warning, critical, currentNumber, total, onOpenNavigator, onSubmit }: ExamHeaderProps) {
  return (
    <header
      className="sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center gap-4 shadow-md transition-colors"
      style={{ background: critical ? '#DC2626' : warning ? '#EA580C' : '#8B0000' }}
    >
      <div className="flex items-center gap-2.5">
        <Logo className="w-8 h-8 object-contain" alt="GFMS" />
        <div className="hidden sm:block">
          <div className="font-playful font-bold text-white text-sm">{subject}</div>
          <div className="text-white/60 text-xs">{studentName}</div>
        </div>
      </div>
      <div className="flex-1" />

      <ExamTimer secondsLeft={secondsLeft} critical={critical} className="gap-2 px-4 py-2 text-lg" showCriticalIcon />

      {/* Q count */}
      <div className="hidden sm:flex items-center gap-1.5 text-white/75 text-sm font-playful font-bold">
        Q {currentNumber}/{total}
      </div>

      {/* Mobile nav toggle */}
      <button
        onClick={onOpenNavigator}
        className="lg:hidden flex flex-col gap-1 px-3 py-2"
        style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10 }}
      >
        <div className="w-5 h-0.5 bg-white rounded" />
        <div className="w-5 h-0.5 bg-white rounded" />
        <div className="w-5 h-0.5 bg-white rounded" />
      </button>

      {/* Submit */}
      <button
        onClick={onSubmit}
        className="px-4 py-2 font-playful font-bold text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
        style={{ background: '#fff', color: '#8B0000', borderRadius: 999, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
      >
        Submit ✓
      </button>
    </header>
  );
}
