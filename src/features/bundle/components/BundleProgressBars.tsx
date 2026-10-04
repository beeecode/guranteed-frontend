import type { BundleSubject } from '@/types/exam';

/** Current-subject and overall-bundle progress bars under the header. */
export function BundleProgressBars({ subject, subjectProgress, overallProgress }: {
  subject: BundleSubject;
  subjectProgress: number;
  overallProgress: number;
}) {
  return (
    <div className="px-4 sm:px-6 py-2 bg-white border-b border-[rgba(217,198,178,0.3)]">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-2 sm:gap-6">
        {/* Current subject */}
        <div className="flex-1">
          <div className="flex justify-between text-[10px] font-bold text-[#7A5C3A] mb-1 uppercase tracking-wide">
            <span>{subject.emoji} {subject.name.split(' ')[0]}</span>
            <span>{subjectProgress}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(217,198,178,0.3)' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${subjectProgress}%`, background: '#B22234' }} />
          </div>
        </div>
        {/* Overall */}
        <div className="flex-1">
          <div className="flex justify-between text-[10px] font-bold text-[#7A5C3A] mb-1 uppercase tracking-wide">
            <span>📊 Overall Bundle</span>
            <span>{overallProgress}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(217,198,178,0.3)' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${overallProgress}%`, background: '#16A34A' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
