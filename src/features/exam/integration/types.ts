export interface LiveOption {
  id: number
  option_text: string
  image_url?: string | null
}

export interface LiveQuestion {
  id: number
  question_text: string
  question_type: "mcq" | "true_false" | "short_answer" | "essay" | string
  marks: number
  image_url?: string | null
  passage_id?: number | null
  options: LiveOption[]
}

export interface SavedAnswer {
  question_id: number
  selected_option_id: number | null
  answer_text: string | null
  is_marked_for_review: boolean
}

export interface AttemptTiming {
  expiresAt: number
  saveGraceEndsAt: number
}

export interface AttemptPayload {
  attempt: {
    id: number
    status: string
    exam?: { id?: number; title?: string; duration_mins?: number }
  }
  questions: LiveQuestion[]
  answers: SavedAnswer[]
  passages: Array<{ id: number; title?: string; content?: string; passage_text?: string }>
  bundleContext: unknown | null
  serverTime: string
  timing: AttemptTiming
}

export interface ExamPreviewPayload {
  exam: {
    id: number
    title: string
    duration_mins: number
    total_marks: number
    status: string
    is_paused: boolean
    subject?: { name?: string }
  }
  questionCount: number
  existingAttempt: { id: number; status: string } | null
  canStart: boolean
  reason?: string
}

export type AnswerDraft = Pick<SavedAnswer, "question_id" | "selected_option_id" | "answer_text" | "is_marked_for_review">
export type SaveState = "saved" | "saving" | "unsaved" | "failed"
