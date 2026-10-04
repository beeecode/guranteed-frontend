/** Floating green celebration pill above the answer options. */
export function AnswerToast({ message }: { message: string }) {
  return (
    <div
      className="animate-toast absolute -top-12 left-1/2 -translate-x-1/2 px-5 py-2.5 shadow-xl text-sm font-bold font-playful text-white whitespace-nowrap z-10"
      style={{ background: '#16A34A', borderRadius: 999 }}
    >
      {message}
    </div>
  );
}
