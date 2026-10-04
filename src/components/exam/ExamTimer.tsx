import { Clock } from 'lucide-react';
import { formatClock } from '@/lib/format';

interface ExamTimerProps {
  secondsLeft: number;
  critical: boolean;
  /** Spacing / size classes, which differ between the single and bundle headers. */
  className: string;
  showCriticalIcon?: boolean;
}

/** Translucent pill countdown shown in the exam top bar. */
export function ExamTimer({ secondsLeft, critical, className, showCriticalIcon = false }: ExamTimerProps) {
  return (
    <div
      className={`flex items-center ${className} font-playful font-bold ${critical ? 'animate-pulse' : ''}`}
      style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 999, color: '#fff' }}
    >
      <Clock className="w-4 h-4" />
      {formatClock(secondsLeft)}
      {showCriticalIcon && critical && <span className="text-xs ml-1">⚠️</span>}
    </div>
  );
}
