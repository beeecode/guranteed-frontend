/** Thin green bar under the header with a "% done" label. */
export function ExamProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-2 bg-[#D9C6B2]/40 relative">
      <div
        className="h-full transition-all duration-500"
        style={{ width: `${percent}%`, background: '#16A34A' }}
      />
      {percent > 5 && (
        <div
          className="absolute top-3 right-2 text-[10px] font-bold font-playful"
          style={{ color: '#7A5C3A' }}
        >
          {percent}% done
        </div>
      )}
    </div>
  );
}
