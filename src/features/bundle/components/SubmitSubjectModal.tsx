import type { AnswerMap, BundleSubject } from '@/types/exam';

interface SubmitSubjectModalProps {
  subject: BundleSubject;
  answers: AnswerMap;
  totalQ: number;
  isLast: boolean;
  nextSubjectName?: string;
  onCancel: () => void;
  onSubmit: () => void;
}

/** Confirmation before submitting the current subject (or finishing the bundle). */
export function SubmitSubjectModal({ subject, answers, totalQ, isLast, nextSubjectName, onCancel, onSubmit }: SubmitSubjectModalProps) {
  const answered = Object.keys(answers).length;
  const unanswered = totalQ - answered;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white p-8 max-w-sm w-full shadow-2xl text-center" style={{ borderRadius: 28 }}>
        <div className="text-5xl mb-4">{unanswered > 0 ? '🤔' : isLast ? '🏆' : '✅'}</div>
        <h3 className="font-playful font-bold text-[#1C0A04] text-xl mb-2">
          {isLast ? "Finish Your Exam?" : `Submit ${subject.name}?`}
        </h3>
        {unanswered > 0 && (
          <p className="font-playful text-orange-600 text-sm mb-2 font-bold">⚠️ {unanswered} question{unanswered > 1 ? 's' : ''} unanswered</p>
        )}
        <div className="grid grid-cols-3 gap-2 my-4 text-center text-xs">
          <div className="py-2" style={{ background: 'rgba(22,163,74,0.08)', borderRadius: 10 }}>
            <div className="font-bold text-[#16A34A] text-base">{answered}</div>
            <div className="text-[#7A5C3A]">Answered</div>
          </div>
          <div className="py-2" style={{ background: 'rgba(249,115,22,0.08)', borderRadius: 10 }}>
            <div className="font-bold text-orange-500 text-base">{unanswered}</div>
            <div className="text-[#7A5C3A]">Unanswered</div>
          </div>
          <div className="py-2" style={{ background: 'rgba(217,198,178,0.2)', borderRadius: 10 }}>
            <div className="font-bold text-[#7A5C3A] text-base">{totalQ}</div>
            <div className="text-[#7A5C3A]">Total</div>
          </div>
        </div>
        {!isLast && nextSubjectName && (
          <p className="text-[#7A5C3A] text-xs mb-4">After submitting you'll move to <strong>{nextSubjectName}</strong>. You cannot return to {subject.name} unless your teacher allows it.</p>
        )}
        {isLast && (
          <p className="text-[#7A5C3A] text-xs mb-4">This will complete your entire exam. You cannot make any more changes.</p>
        )}
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 font-playful font-bold text-sm transition-all" style={{ border: '2px solid rgba(217,198,178,0.6)', color: '#7A5C3A', borderRadius: 999 }}>
            Keep Going
          </button>
          <button onClick={onSubmit} className="flex-1 py-3 font-playful font-bold text-sm text-white transition-all hover:shadow-lg" style={{ background: '#B22234', borderRadius: 999 }}>
            {isLast ? 'Finish Exam 🏆' : 'Submit & Continue →'}
          </button>
        </div>
      </div>
    </div>
  );
}
