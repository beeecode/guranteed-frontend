import { Flag } from 'lucide-react';

interface QuestionCardProps {
  number: number;
  total: number;
  text: string;
  flagged: boolean;
  onToggleFlag: () => void;
  /** Bottom margin of the number/flag row (the bundle exam uses a tighter `mb-4`). */
  headerSpacingClassName?: string;
}

/** White card with the question number, flag toggle and question text. */
export function QuestionCard({ number, total, text, flagged, onToggleFlag, headerSpacingClassName = 'mb-5' }: QuestionCardProps) {
  return (
    <div className="bg-white p-6 mb-5 shadow-sm" style={{ borderRadius: 24 }}>
      <div className={`flex items-start justify-between ${headerSpacingClassName}`}>
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 flex items-center justify-center font-playful font-bold text-white text-lg"
            style={{ background: '#B22234', borderRadius: 14 }}
          >
            {number}
          </div>
          <div className="text-sm text-[#7A5C3A] font-medium">of {total} questions</div>
        </div>
        <button
          onClick={onToggleFlag}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold font-playful transition-all"
          style={{
            borderRadius: 999,
            background: flagged ? 'rgba(249,115,22,0.12)' : 'rgba(217,198,178,0.25)',
            color: flagged ? '#EA580C' : '#7A5C3A',
          }}
        >
          <Flag className="w-3.5 h-3.5" />
          {flagged ? '🚩 Flagged' : 'Flag'}
        </button>
      </div>
      <p className="text-[#1C0A04] text-base sm:text-lg leading-relaxed font-medium">
        {text}
      </p>
    </div>
  );
}
