/**
 * Stage 11: maps real backend payloads onto the designed bundle/exam component types,
 * so the designed UI renders server data instead of fixtures. Pure functions (tested).
 */

import type { AnswerMap, BundleSubject, ExamBundle, Question } from "../../../types/exam.ts"
import type { AnswerDraft, LiveQuestion } from "../../exam/integration/types.ts"
import type { BundleExamLink, BundlePayload } from "../integration/types.ts"

const SUBJECT_EMOJI: Array<[RegExp, string]> = [
  [/math/i, "🔢"], [/english|literature|language/i, "📖"], [/physics/i, "⚛️"], [/chem/i, "🧪"],
  [/bio|science/i, "🧬"], [/econ/i, "📈"], [/govern|civic/i, "🏛️"], [/account|commerce|business/i, "💼"],
  [/geog/i, "🌍"], [/relig|crs|irs|christian|islam/i, "🙏"], [/computer|ict|data/i, "💻"], [/history/i, "📜"],
]
export const subjectEmoji = (name: string) => SUBJECT_EMOJI.find(([pattern]) => pattern.test(name))?.[1] ?? "📘"

/** Server order of the bundle's subjects (sort_order, then id), as the backend uses. */
export const orderedLinks = (payload: BundlePayload): BundleExamLink[] =>
  [...(payload.bundle.session_exams || [])].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)

const subjectName = (link: BundleExamLink) => link.exam?.subject?.name?.trim() || link.exam?.title?.trim() || "Subject"

/**
 * Builds the designed ExamBundle. Question lists stay empty: a subject's questions exist
 * only once its attempt starts. `questionCounts` (by session_exam id) fills totals that
 * are known; unknown totals are 0 and must not be presented as facts.
 */
export function toExamBundle(payload: BundlePayload, questionCounts: Record<number, number> = {}): ExamBundle {
  const raw = payload.bundle as BundlePayload["bundle"] & { term?: string | null; academic_session?: string | null; class_level?: { name?: string } | null }
  const startsAt = raw.starts_at ? new Date(raw.starts_at) : null
  const subjects: BundleSubject[] = orderedLinks(payload).map((link) => {
    const name = subjectName(link)
    const totalMarks = Number(link.total_marks_override ?? link.exam?.total_marks) || 0
    return {
      id: link.id,
      name,
      emoji: subjectEmoji(name),
      duration: Number(link.duration_override) || Number(link.exam?.duration_mins) || 0,
      totalQuestions: questionCounts[link.id] ?? 0,
      totalMarks,
      // The server's pass mark is a percentage; the design shows it as marks.
      passmark: Math.round((totalMarks * (Number(link.pass_mark) || 0)) / 100),
      questions: [],
    }
  })
  return {
    id: String(raw.id),
    name: raw.session_name,
    class: raw.class_level?.name ?? "",
    session: raw.academic_session ?? "",
    term: raw.term ?? "",
    date: startsAt && Number.isFinite(startsAt.getTime()) ? startsAt.toLocaleDateString(undefined, { dateStyle: "medium" }) : "",
    time: startsAt && Number.isFinite(startsAt.getTime()) ? startsAt.toLocaleTimeString(undefined, { timeStyle: "short" }) : "",
    transitionMode: "manual",
    autoCountdownSecs: 0,
    breakEnabled: Boolean(raw.break_mode && raw.break_mode !== "none"),
    breakDuration: Number(raw.break_duration_mins) || 0,
    canReturnToCompleted: false,
    subjects,
  }
}

export const optionLetterAt = (index: number) => String.fromCharCode(65 + index)

/** Designed Question ("A. text" options). The answer key is never present in live data. */
export const toQuestion = (question: LiveQuestion): Question => ({
  id: question.id,
  text: question.question_text,
  options: (question.options || []).map((option, index) => `${optionLetterAt(index)}. ${option.option_text}`),
})

export const optionIdForLetter = (question: LiveQuestion, letter: string): number | null =>
  question.options?.[letter.charCodeAt(0) - 65]?.id ?? null

export const letterForOption = (question: LiveQuestion, optionId: number | null | undefined): string | undefined => {
  if (optionId == null) return undefined
  const index = (question.options || []).findIndex((option) => option.id === optionId)
  return index >= 0 ? optionLetterAt(index) : undefined
}

/** Written answers have no letter; "✎" marks them answered in the designed navigator. */
export const WRITTEN_ANSWER_MARK = "✎"

/** Designed AnswerMap (question id → letter) from the server/draft answers. */
export function toAnswerMap(questions: LiveQuestion[], answers: Record<number, AnswerDraft>): AnswerMap {
  const map: AnswerMap = {}
  for (const question of questions) {
    const answer = answers[question.id]
    if (!answer) continue
    const letter = letterForOption(question, answer.selected_option_id)
    if (letter) map[question.id] = letter
    else if (answer.answer_text?.trim()) map[question.id] = WRITTEN_ANSWER_MARK
  }
  return map
}

export type LiveBundlePhase = "not-started" | "exam" | "subject-complete" | "break" | "paused" | "bundle-done"

/** Screen phase from the server's bundle-attempt status (the server is authoritative). */
export function bundlePhase(payload: BundlePayload): LiveBundlePhase {
  const status = payload.sessionAttempt?.status
  if (!status || status === "not_started") return "not-started"
  if (status === "completed" || status === "force_submitted") return "bundle-done"
  if (status === "paused") return "paused"
  if (status === "on_break") return "break"
  if (status === "between_subjects") return "subject-complete"
  return "exam"
}

/**
 * Index the designed screens treat as "current": during a subject, the subject being
 * sat; between subjects/on a break, the subject just completed (the server already
 * points current_session_exam_id at the NEXT subject).
 */
export function currentSubjectIndex(payload: BundlePayload): number {
  const links = orderedLinks(payload)
  const pointer = links.findIndex((link) => link.id === payload.sessionAttempt?.current_session_exam_id)
  const phase = bundlePhase(payload)
  if (phase === "bundle-done") return Math.max(0, links.length - 1)
  if (phase === "subject-complete" || phase === "break") return Math.max(0, pointer - 1)
  return Math.max(0, pointer)
}

export function completedSubjectIndexes(payload: BundlePayload): Set<number> {
  const links = orderedLinks(payload)
  const done = new Set<number>()
  for (const attempt of payload.subjectAttempts || []) {
    if (attempt.status !== "submitted") continue
    const index = links.findIndex((link) => link.id === attempt.session_exam_id)
    if (index >= 0) done.add(index)
  }
  if (bundlePhase(payload) === "bundle-done") links.forEach((_, index) => done.add(index))
  return done
}
