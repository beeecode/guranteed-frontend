'use client';

import Link from 'next/link';

/** Fallback for unexpected runtime errors in any route. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: '#F9F5F1' }}>
      <div className="bg-white w-full max-w-md p-8 text-center shadow-xl" style={{ borderRadius: 32 }}>
        <div className="text-5xl mb-4">😕</div>
        <h1 className="font-playful font-bold text-[#1C0A04] text-2xl mb-2">Something went wrong</h1>
        <p className="text-[#7A5C3A] text-sm mb-6">Please try again. If the problem continues, contact your teacher or admin.</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="py-4 font-playful font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-xl"
            style={{ background: '#B22234', borderRadius: 999, boxShadow: '0 4px 16px rgba(178,34,52,0.3)' }}
          >
            Try Again
          </button>
          <Link
            href="/"
            className="py-4 font-playful font-bold transition-all"
            style={{ border: '2px solid rgba(217,198,178,0.6)', color: '#7A5C3A', borderRadius: 999 }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
