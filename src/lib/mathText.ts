/**
 * Splits question text into plain text and LaTeX math segments (Stage 11).
 * Question files store formulas as `$…$` (inline) or `$$…$$` (display), the same
 * convention the legacy client rendered with KaTeX.
 *
 * Inline `$` follows Pandoc's rule so prices are not mistaken for math: the opening `$`
 * must be followed by a non-space, the closing `$` preceded by a non-space and not
 * followed by a digit ("costs $5 and $10" stays text). `\$` is a literal dollar.
 */

export type MathSegment = { type: "text"; value: string } | { type: "math"; value: string; display: boolean }

export function splitMath(input: string): MathSegment[] {
  const text = String(input ?? "")
  const segments: MathSegment[] = []
  let buffer = ""
  let i = 0
  const flush = () => { if (buffer) { segments.push({ type: "text", value: buffer }); buffer = "" } }

  while (i < text.length) {
    const char = text[i]
    if (char === "\\" && text[i + 1] === "$") { buffer += "$"; i += 2; continue }
    if (char === "$" && text[i + 1] === "$") {
      const end = text.indexOf("$$", i + 2)
      if (end > i + 2) { flush(); segments.push({ type: "math", value: text.slice(i + 2, end).trim(), display: true }); i = end + 2; continue }
    }
    if (char === "$" && text[i + 1] && !/\s/.test(text[i + 1])) {
      let j = i + 1
      let close = -1
      while (j < text.length) {
        if (text[j] === "\\") { j += 2; continue }
        if (text[j] === "$") {
          if (!/\s/.test(text[j - 1]) && !/\d/.test(text[j + 1] ?? "")) { close = j; break }
        }
        if (text[j] === "\n" && text[j + 1] === "\n") break // math never spans paragraphs
        j += 1
      }
      if (close > i + 1) { flush(); segments.push({ type: "math", value: text.slice(i + 1, close), display: false }); i = close + 1; continue }
    }
    buffer += char
    i += 1
  }
  flush()
  return segments
}

export const hasMath = (input: string) => splitMath(input).some((segment) => segment.type === "math")
