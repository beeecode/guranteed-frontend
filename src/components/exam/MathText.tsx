"use client"

/**
 * Renders question/option/passage text with `$…$` formulas typeset by KaTeX
 * (Stage 11: the redesigned frontend previously showed raw LaTeX to students).
 * KaTeX output is generated with `trust: false`, so untrusted text cannot inject HTML;
 * plain-text segments are rendered by React (escaped). A malformed formula is shown
 * as its source text instead of breaking the question.
 */

import { useMemo } from "react"
import katex from "katex"
import "katex/dist/katex.min.css"
import { splitMath } from "@/lib/mathText"

export function MathText({ text, className }: { text: string; className?: string }) {
  const parts = useMemo(() => splitMath(text).map((segment) => {
    if (segment.type === "text") return segment
    try {
      return { ...segment, html: katex.renderToString(segment.value, { displayMode: segment.display, throwOnError: true, trust: false, strict: "ignore", output: "htmlAndMathml" }) }
    } catch {
      return { type: "text" as const, value: segment.display ? `$$${segment.value}$$` : `$${segment.value}$` }
    }
  }), [text])

  return (
    <span className={className} style={{ whiteSpace: "pre-wrap" }}>
      {parts.map((part, index) => "html" in part
        ? <span key={index} className={part.display ? "block my-2 overflow-x-auto" : undefined} dangerouslySetInnerHTML={{ __html: part.html as string }} />
        : <span key={index}>{part.value}</span>)}
    </span>
  )
}
