import type { Question } from '@/types/exam';
import { optionLabel, optionLetter } from '@/features/exam/lib/questions';
import { AnswerToast } from './AnswerToast';

interface AnswerOptionsProps {
  question: Question;
  selectedLetter: string | undefined;
  toast: string | null;
  /** Whether the selected option plays the pop-in animation. */
  animateSelected: boolean;
  onSelect: (option: string) => void;
}

export function AnswerOptions({ question, selectedLetter, toast, animateSelected, onSelect }: AnswerOptionsProps) {
  return (
    <div className="space-y-3 mb-6 relative">
      {toast && <AnswerToast message={toast} />}

      {question.options.map((opt, i) => {
        const letter = optionLetter(opt);
        const selected = selectedLetter === letter;
        return (
          <button
            key={i}
            onClick={() => onSelect(opt)}
            className={`w-full text-left flex items-center gap-4 p-4 sm:p-5 font-medium text-sm sm:text-base focus:outline-none transition-all duration-200 hover:-translate-y-0.5 ${selected && animateSelected ? 'animate-pop-in' : ''}`}
            style={{
              borderRadius: 18,
              border: selected ? '2.5px solid #B22234' : '2px solid rgba(217,198,178,0.5)',
              background: selected ? '#B22234' : '#fff',
              color: selected ? '#fff' : '#1C0A04',
              boxShadow: selected ? '0 6px 20px rgba(178,34,52,0.3)' : '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div
              className="w-9 h-9 flex items-center justify-center font-playful font-bold flex-shrink-0"
              style={{
                borderRadius: 10,
                background: selected ? '#fff' : 'rgba(217,198,178,0.25)',
                color: selected ? '#B22234' : '#7A5C3A',
              }}
            >
              {letter}
            </div>
            <span className="flex-1">{optionLabel(opt)}</span>
            {selected && <span className="text-lg">✓</span>}
          </button>
        );
      })}
    </div>
  );
}
