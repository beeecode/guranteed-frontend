import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ExamControlsProps {
  onPrev: () => void;
  onClear: () => void;
  onNext: () => void;
  prevDisabled: boolean;
  nextDisabled: boolean;
  /** Show a not-allowed cursor on disabled Prev/Next (single-subject exam only). */
  notAllowedWhenDisabled?: boolean;
}

// Full literal class strings so Tailwind's scanner picks up every variant.
const prevClass = 'flex items-center gap-2 px-5 py-3 font-playful font-bold text-sm transition-all disabled:opacity-40 hover:-translate-y-0.5';
const prevClassNotAllowed = 'flex items-center gap-2 px-5 py-3 font-playful font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5';
const nextClass = 'flex items-center gap-2 px-5 py-3 font-playful font-bold text-sm transition-all disabled:opacity-40 hover:-translate-y-0.5 hover:shadow-lg';
const nextClassNotAllowed = 'flex items-center gap-2 px-5 py-3 font-playful font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-lg';

/** Prev / Clear / Next row under the answer options. */
export function ExamControls({ onPrev, onClear, onNext, prevDisabled, nextDisabled, notAllowedWhenDisabled = false }: ExamControlsProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <button
        onClick={onPrev}
        disabled={prevDisabled}
        className={notAllowedWhenDisabled ? prevClassNotAllowed : prevClass}
        style={{ borderRadius: 999, border: '2px solid rgba(217,198,178,0.6)', color: '#7A5C3A', background: '#fff' }}
      >
        <ChevronLeft className="w-4 h-4" /> Prev
      </button>

      <button
        onClick={onClear}
        className="text-xs text-[#B8967A] hover:text-red-500 transition-colors px-3 py-2 font-medium"
        style={{ borderRadius: 10 }}
      >
        Clear
      </button>

      <button
        onClick={onNext}
        disabled={nextDisabled}
        className={notAllowedWhenDisabled ? nextClassNotAllowed : nextClass}
        style={{ borderRadius: 999, background: '#B22234', color: '#fff', boxShadow: '0 4px 14px rgba(178,34,52,0.3)' }}
      >
        Next <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
