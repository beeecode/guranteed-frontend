"use client"

/**
 * Honour-code checkbox plus the Start / Go Back buttons it unlocks. Stage 11: Start calls
 * the server (onStart); the timer only begins once the server creates the attempt.
 */

import { useState } from "react"
import Link from "next/link"

export function ExamAgreement({ onStart, starting = false, startLabel = "Let's Go! I'm Ready! 🚀", error = "" }: {
  onStart: () => void
  starting?: boolean
  startLabel?: string
  error?: string
}) {
  const [agreed, setAgreed] = useState(false)
  const ready = agreed && !starting

  return (
    <>
      {}
      <div className="bg-white mb-6 p-6" style={{ borderRadius: 24 }}>
        {/* The <label> alone toggles the checkbox. (Extra onClick handlers on the box and
            the text used to toggle it a second time, so a click never changed anything.) */}
        <label className="flex items-start gap-4 cursor-pointer select-none">
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="sr-only peer"
            />
            <div
              aria-hidden="true"
              className="w-6 h-6 flex items-center justify-center transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-[#B22234] peer-focus-visible:ring-offset-2"
              style={{
                background: agreed ? "#B22234" : "#fff",
                border: `2.5px solid ${agreed ? "#B22234" : "#D9C6B2"}`,
                borderRadius: 6,
              }}
            >
              {agreed && (
                <span className="text-white text-sm font-bold">✓</span>
              )}
            </div>
          </div>
          <p
            className="text-[#1C0A04] text-sm leading-relaxed"
          >
            I have read and fully understood all the instructions above. I agree
            to follow the examination rules and submit my answers honestly and
            independently. 🤝
          </p>
        </label>
      </div>

      {error ? (
        <div role="alert" className="mb-4 p-4 text-sm font-medium" style={{ borderRadius: 18, background: "rgba(249,115,22,0.10)", border: "2px solid rgba(249,115,22,0.35)", color: "#9A3412" }}>
          {error}
        </div>
      ) : null}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onStart}
          disabled={!ready}
          className="flex-1 py-4 font-playful font-bold text-lg transition-all duration-200"
          style={{
            background: ready ? "#B22234" : "#D9C6B2",
            color: ready ? "#fff" : "#7A5C3A",
            borderRadius: 999,
            cursor: ready ? "pointer" : "not-allowed",
            boxShadow: ready ? "0 4px 20px rgba(178,34,52,0.35)" : "none",
            transform: "none",
          }}
        >
          {starting ? "Starting securely…" : agreed ? startLabel : "Please agree to continue..."}
        </button>
        <Link
          href="/student/dashboard"
          className="flex-1 py-4 font-playful font-bold text-base text-center transition-all"
          style={{
            border: "2px solid rgba(217,198,178,0.6)",
            color: "#7A5C3A",
            borderRadius: 999,
          }}
        >
          ← Not Yet, Go Back
        </Link>
      </div>
    </>
  )
}
