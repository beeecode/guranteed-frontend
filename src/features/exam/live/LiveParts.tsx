"use client"

/**
 * Stage 11: small pieces shared by the live single-subject and bundle exam screens, in the
 * design's own styling (status cards, alert bars, the per-question save indicator,
 * passage/image/written-answer blocks).
 */

import type { ReactNode } from "react"
import { AlertTriangle, Check, CloudOff, LoaderCircle, RefreshCw } from "lucide-react"
import { MathText } from "@/components/exam/MathText"
import type { LiveQuestion, SaveState } from "@/features/exam/integration/types"

/** Neutral: praise such as "You got it!" could be read as "your answer is correct". */
export const LIVE_TOAST = ["Answer selected ✓"]

export function StatusCard({ title, message, loading = false, action }: { title: string; message: string; loading?: boolean; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "#F9F5F1" }}>
      <div className="bg-white w-full max-w-md p-8 text-center shadow-xl" style={{ borderRadius: 32 }}>
        <div className="mx-auto mb-4 w-14 h-14 flex items-center justify-center" style={{ borderRadius: 18, background: "rgba(178,34,52,0.08)", color: "#B22234" }}>
          {loading ? <LoaderCircle className="w-7 h-7 animate-spin" /> : <AlertTriangle className="w-7 h-7" />}
        </div>
        <h1 className="font-playful font-bold text-[#1C0A04] text-xl mb-2">{title}</h1>
        <p className="text-[#7A5C3A] text-sm leading-relaxed">{message}</p>
        {action ? (
          <button type="button" onClick={action.onClick} className="mt-6 inline-flex items-center gap-2 px-6 py-3 font-playful font-bold text-white text-sm" style={{ background: "#B22234", borderRadius: 999 }}>
            <RefreshCw className="w-4 h-4" /> {action.label}
          </button>
        ) : null}
      </div>
    </div>
  )
}

export function AlertBar({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <div role="alert" className="flex items-start gap-3 p-4 mb-4 text-sm font-medium" style={{ borderRadius: 18, background: "rgba(249,115,22,0.10)", border: "2px solid rgba(249,115,22,0.35)", color: "#9A3412" }}>
      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onDismiss ? <button type="button" onClick={onDismiss} className="font-playful font-bold text-xs underline">Dismiss</button> : null}
    </div>
  )
}

export function FloatingNotice({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  if (!message) return null
  return <div className="fixed bottom-4 inset-x-4 z-50 max-w-xl mx-auto"><AlertBar message={message} onDismiss={onDismiss} /></div>
}

/** Per-question save status: students must be able to see that an answer reached the server. */
export function SaveIndicator({ state, onRetry }: { state: SaveState; onRetry: () => void }) {
  const look: Record<SaveState, { text: string; color: string; icon: ReactNode }> = {
    saved: { text: "Saved", color: "#16A34A", icon: <Check className="w-3.5 h-3.5" /> },
    saving: { text: "Saving…", color: "#7A5C3A", icon: <LoaderCircle className="w-3.5 h-3.5 animate-spin" /> },
    unsaved: { text: "Waiting to save…", color: "#7A5C3A", icon: <LoaderCircle className="w-3.5 h-3.5 animate-spin" /> },
    failed: { text: "Connection problem — retrying automatically", color: "#EA580C", icon: <CloudOff className="w-3.5 h-3.5" /> },
  }
  const { text, color, icon } = look[state]
  return (
    <div className="flex items-center gap-2 mb-4 text-xs font-bold font-playful" style={{ color }} aria-live="polite">
      {icon} {text}
      {state === "failed" ? <button type="button" onClick={onRetry} className="underline">Retry now</button> : null}
    </div>
  )
}

export function PassageCard({ passage }: { passage: { title?: string; content?: string; passage_text?: string } }) {
  return (
    <div className="bg-white p-6 mb-5 shadow-sm" style={{ borderRadius: 24, border: "2px solid rgba(217,198,178,0.4)" }}>
      <div className="font-playful font-bold text-[#B22234] text-xs uppercase tracking-wide mb-2">📄 {passage.title || "Read the passage"}</div>
      <p className="text-[#1C0A04] text-sm leading-relaxed whitespace-pre-wrap"><MathText text={passage.content || passage.passage_text || ""} /></p>
    </div>
  )
}

export function QuestionImage({ src, number }: { src: string; number: number }) {
  return (
    <div className="bg-white p-4 mb-5 shadow-sm" style={{ borderRadius: 24 }}>
      <img src={src} alt={`Illustration for question ${number}`} className="max-h-80 w-full object-contain" style={{ borderRadius: 16 }} />
    </div>
  )
}

export function WrittenAnswer({ question, value, disabled, onChange }: { question: LiveQuestion; value: string; disabled: boolean; onChange: (text: string) => void }) {
  return (
    <div className="mb-6">
      <textarea
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        rows={question.question_type === "essay" ? 10 : 4}
        maxLength={10_000}
        placeholder="Type your answer here…"
        className="w-full p-5 text-sm sm:text-base text-[#1C0A04] outline-none"
        style={{ borderRadius: 18, border: "2px solid rgba(217,198,178,0.6)", background: "#fff" }}
      />
    </div>
  )
}

export function SubmittingOverlay({ label }: { label: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white px-8 py-6 text-center shadow-2xl" style={{ borderRadius: 28 }}>
        <LoaderCircle className="mx-auto mb-3 w-8 h-8 animate-spin text-[#B22234]" />
        <div className="font-playful font-bold text-[#1C0A04]">Submitting {label}…</div>
        <div className="text-xs text-[#7A5C3A] mt-1">Please keep this page open.</div>
      </div>
    </div>
  )
}
