/** GET /api/student/results-summary (server: controllers/studentResultsController.js). */
export interface ResultEntry {
  id: number
  exam_id: number | null
  kind: "single" | "bundle_subject"
  title: string | null
  subject: string
  bundle_id: number | null
  bundle_name: string | null
  status: string
  started_at: string | null
  submitted_at: string | null
  results_released: boolean
  pending_manual: boolean
  /** null until the result is released and fully marked. */
  score: number | null
  total_marks: number | null
  percentage: number | null
  pass_mark: number | null
  passed: boolean | null
  grade: string | null
}

export interface ResultsSummary {
  entries: ResultEntry[]
  subjects: Array<{ name: string; attempts: number; average: number | null }>
  stats: { completed: number; released: number; average: number; best: number }
}

export const scoreColor = (score: number) => (score >= 70 ? "#16A34A" : score >= 50 ? "#D97706" : "#DC2626")
