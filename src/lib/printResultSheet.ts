/** Opens the printable result sheet (lib/resultSheet.ts) and the browser's print dialog. */
import logo from "@/assets/logo.png"
import { buildResultSheetHtml, type ResultSheet } from "./resultSheet"

export type { ResultSheet, ResultSheetRow } from "./resultSheet"

/** Returns false when the browser blocked the new window (pop-ups disabled). */
export function printResultSheet(sheet: ResultSheet) {
  const win = window.open("", "_blank", "width=900,height=1000")
  if (!win) return false
  win.document.open()
  win.document.write(buildResultSheetHtml(sheet, new URL(logo.src, window.location.origin).href))
  win.document.close()
  return true
}
