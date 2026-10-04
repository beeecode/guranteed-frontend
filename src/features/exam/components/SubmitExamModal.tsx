interface SubmitExamModalProps {
  unanswered: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export function SubmitExamModal({ unanswered, onCancel, onConfirm }: SubmitExamModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white p-8 max-w-sm w-full shadow-2xl text-center" style={{ borderRadius: 28 }}>
        <div className="text-5xl mb-4">{unanswered > 0 ? '🤔' : '🎉'}</div>
        <h3 className="font-playful font-bold text-[#1C0A04] text-xl mb-2">
          {unanswered > 0 ? 'Are You Sure?' : 'Ready to Submit!'}
        </h3>
        {unanswered > 0 && (
          <p className="font-playful text-orange-600 text-sm mb-2 font-bold">
            You still have {unanswered} unanswered question{unanswered > 1 ? 's' : ''}.
          </p>
        )}
        <p className="text-[#7A5C3A] text-sm mb-6">Once submitted, you cannot change your answers. Make sure you're happy!</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 font-playful font-bold text-sm transition-all"
            style={{ border: '2px solid rgba(217,198,178,0.6)', color: '#7A5C3A', borderRadius: 999 }}
          >
            Keep Going →
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 font-playful font-bold text-sm text-white transition-all hover:shadow-lg"
            style={{ background: '#B22234', borderRadius: 999, boxShadow: '0 4px 14px rgba(178,34,52,0.3)' }}
          >
            Submit ✓
          </button>
        </div>
      </div>
    </div>
  );
}
