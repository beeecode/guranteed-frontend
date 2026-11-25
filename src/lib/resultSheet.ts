/**
 * Printable result sheet for parents (Stage 11, owner request 2026-11-25). Opens a clean
 * A4 page in a new window and starts printing (or "Save as PDF"). Everything shown comes
 * from the server: scores, maximum marks, percentages and pass decisions are printed as
 * given, never recalculated, and no grade or pass mark is invented.
 */

export interface ResultSheetRow {
  title: string
  subject?: string | null
  bundle?: string | null
  date?: string | null
  score: number | null
  max: number | null
  percentage: number | null
  passed: boolean | null
  /** released: final; provisional: not yet released to students; marking: answers still being marked. */
  status: "released" | "provisional" | "marking"
}

export interface ResultSheet {
  student: { name: string; studentId?: string | null; className?: string | null }
  rows: ResultSheetRow[]
  /** Short line under the title, e.g. "Released results" or "All submitted exams". */
  scope: string
}

const SCHOOL_NAME = "Guaranteed Future Model Schools"

const escapeHtml = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char] as string))
const dateText = (value?: string | null) => (value ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—")
const pct = (value: number | null) => (value === null ? "—" : `${Math.round(value * 10) / 10}%`)

export function buildResultSheetHtml(sheet: ResultSheet, logoUrl: string, printedAt = new Date()) {
  const finals = sheet.rows.filter((row) => row.status !== "marking" && row.percentage !== null)
  const average = finals.length ? finals.reduce((sum, row) => sum + (row.percentage ?? 0), 0) / finals.length : null
  const hasPassColumn = sheet.rows.some((row) => row.passed !== null)
  const hasProvisional = sheet.rows.some((row) => row.status !== "released")

  const body = sheet.rows.length
    ? sheet.rows.map((row, index) => `<tr>
        <td>${index + 1}</td>
        <td><strong>${escapeHtml(row.subject || row.title)}</strong>${row.subject && row.title && row.title !== row.subject ? `<div class="muted">${escapeHtml(row.title)}</div>` : ""}${row.bundle ? `<div class="muted">${escapeHtml(row.bundle)}</div>` : ""}</td>
        <td>${escapeHtml(dateText(row.date))}</td>
        <td class="num">${row.status === "marking" ? "—" : `${escapeHtml(row.score ?? "—")} / ${escapeHtml(row.max ?? "—")}`}</td>
        <td class="num">${row.status === "marking" ? "—" : escapeHtml(pct(row.percentage))}</td>
        ${hasPassColumn ? `<td>${row.passed === null ? "—" : row.passed ? "Pass" : "Not passed"}</td>` : ""}
        <td>${row.status === "released" ? "Final" : row.status === "marking" ? "Being marked" : "Provisional*"}</td>
      </tr>`).join("")
    : `<tr><td colspan="${hasPassColumn ? 7 : 6}" class="muted center">No submitted exams yet.</td></tr>`

  return `<!doctype html><html><head><meta charset="utf-8"><title>Result sheet — ${escapeHtml(sheet.student.name)}</title>
<style>
  @page { size: A4; margin: 16mm; }
  * { box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; color: #1c0a04; margin: 0; font-size: 12.5px; }
  header { display: flex; align-items: center; gap: 14px; border-bottom: 3px solid #8b0000; padding-bottom: 10px; }
  header img { width: 62px; height: 62px; object-fit: contain; }
  h1 { font-size: 19px; margin: 0; color: #8b0000; }
  h2 { font-size: 14px; margin: 2px 0 0; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: #5c1010; }
  .muted { color: #7a5c3a; font-size: 11px; }
  .center { text-align: center; }
  .info { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 24px; margin: 14px 0; }
  .info div span { color: #7a5c3a; display: inline-block; min-width: 92px; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th, td { border: 1px solid #d9c6b2; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #f9f5f1; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; }
  td.num { text-align: right; white-space: nowrap; }
  .summary { margin-top: 12px; display: flex; gap: 24px; font-size: 13px; }
  .note { margin-top: 10px; font-size: 11px; color: #7a5c3a; }
  .signatures { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; margin-top: 46px; }
  .signatures div { border-top: 1px solid #1c0a04; padding-top: 5px; font-size: 11px; color: #7a5c3a; }
  footer { margin-top: 26px; font-size: 10px; color: #7a5c3a; text-align: center; }
</style></head><body>
<header>
  <img src="${escapeHtml(logoUrl)}" alt="">
  <div><h1>${SCHOOL_NAME}</h1><h2>Student Result Sheet</h2><div class="muted">${escapeHtml(sheet.scope)}</div></div>
</header>
<section class="info">
  <div><span>Student</span> <strong>${escapeHtml(sheet.student.name)}</strong></div>
  <div><span>Student ID</span> <strong>${escapeHtml(sheet.student.studentId || "—")}</strong></div>
  <div><span>Class</span> ${escapeHtml(sheet.student.className || "—")}</div>
  <div><span>Printed</span> ${escapeHtml(printedAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }))}</div>
</section>
<table>
  <thead><tr><th>#</th><th>Subject / exam</th><th>Date</th><th>Score</th><th>Percentage</th>${hasPassColumn ? "<th>Result</th>" : ""}<th>Status</th></tr></thead>
  <tbody>${body}</tbody>
</table>
<div class="summary">
  <div><span class="muted">Exams listed:</span> <strong>${sheet.rows.length}</strong></div>
  <div><span class="muted">Average of marked exams:</span> <strong>${average === null ? "—" : pct(average)}</strong></div>
</div>
${hasProvisional ? `<p class="note">* Provisional: the school has not yet released this result to the student; it may still change. "Being marked": written answers are still being marked.</p>` : ""}
<p class="note">Percentages are the score divided by the maximum marks of each exam, as recorded by the school's CBT system.</p>
<div class="signatures"><div>Class teacher</div><div>Principal</div><div>Parent / guardian</div></div>
<footer>${SCHOOL_NAME} · Computer-based test results</footer>
<script>window.addEventListener("load", function () { setTimeout(function () { window.print() }, 150) })</script>
</body></html>`
}
