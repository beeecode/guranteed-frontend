export interface BundleExamLink {
  id: number
  duration_override: number | null
  sort_order: number
  pass_mark: number | null
  total_marks_override: number | null
  instructions?: string | null
  exam: { id: number; title: string; duration_mins: number; total_marks: number; subject?: { id?: number; name?: string } | null } | null
}

export interface BundleAttempt {
  id: number
  session_id: number
  status: string
  current_session_exam_id: number | null
  break_ends_at?: string | null
  started_at?: string | null
  completed_at?: string | null
}

export interface SubjectAttempt {
  id: number
  session_exam_id: number
  exam_id: number
  status: string
  score?: number | null
  submitted_at?: string | null
}

export interface BundlePayload {
  bundle: {
    id: number
    session_name: string
    description?: string | null
    status: string
    starts_at?: string | null
    ends_at?: string | null
    break_mode?: string | null
    break_duration_mins?: number | null
    allow_skip_break?: boolean
    results_released?: boolean
    session_exams: BundleExamLink[]
  }
  sessionAttempt: BundleAttempt | null
  currentAttempt?: SubjectAttempt | null
  subjectAttempt?: SubjectAttempt | null
  subjectAttempts?: SubjectAttempt[]
  availability?: { canStart?: boolean; reason?: string | null }
  serverTime?: string
}

export interface BundleProgression {
  sessionAttempt: BundleAttempt
  phase: string
  bundleId: number
  nextSubject?: BundleExamLink
}
