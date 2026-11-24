import assert from "node:assert/strict"
import test from "node:test"
import type { BundlePayload } from "../integration/types.ts"
import type { LiveQuestion } from "../../exam/integration/types.ts"
import {
  bundlePhase, completedSubjectIndexes, currentSubjectIndex, letterForOption, optionIdForLetter,
  orderedLinks, subjectEmoji, toAnswerMap, toExamBundle, toQuestion, WRITTEN_ANSWER_MARK,
} from "./adapters.ts"

const link = (id: number, sort: number, name: string, minutes = 30) => ({
  id, sort_order: sort, duration_override: null, pass_mark: 50, total_marks_override: null,
  exam: { id: id * 10, title: `${name} Mock`, duration_mins: minutes, total_marks: 20, subject: { name } },
})
const payload = (status: string | null, current: number | null, submitted: number[] = []): BundlePayload => ({
  bundle: { id: 4, session_name: "Mock Day", status: "live", break_mode: "none", break_duration_mins: 0, session_exams: [link(32, 2, "English"), link(31, 1, "Mathematics", 45)] },
  sessionAttempt: status ? { id: 64, session_id: 4, status, current_session_exam_id: current } : null,
  subjectAttempts: submitted.map((sessionExamId, index) => ({ id: 100 + index, session_exam_id: sessionExamId, exam_id: 1, status: "submitted" })),
})

test("bundle subjects follow server order with real names, durations and no invented counts", () => {
  const bundle = toExamBundle(payload("in_progress", 31), { 31: 20 })
  assert.deepEqual(bundle.subjects.map((s) => s.name), ["Mathematics", "English"])
  assert.equal(bundle.subjects[0].duration, 45)
  assert.equal(bundle.subjects[0].totalQuestions, 20)
  assert.equal(bundle.subjects[1].totalQuestions, 0, "unknown until that subject's paper loads")
  assert.equal(bundle.breakEnabled, false)
  assert.equal(subjectEmoji("Further Mathematics"), "🔢")
  assert.equal(subjectEmoji("Unknown Subject"), "📘")
  assert.deepEqual(orderedLinks(payload(null, null)).map((l) => l.id), [31, 32])
})

const question: LiveQuestion = { id: 7, question_text: "2 + 2?", question_type: "mcq", marks: 1, options: [{ id: 701, option_text: "3" }, { id: 702, option_text: "4" }, { id: 703, option_text: "5" }] }

test("questions become designed 'A. text' options and letters map back to real option ids", () => {
  const designed = toQuestion(question)
  assert.deepEqual(designed.options, ["A. 3", "B. 4", "C. 5"])
  assert.equal("answer" in designed, false, "no answer key in live data")
  assert.equal(optionIdForLetter(question, "B"), 702)
  assert.equal(optionIdForLetter(question, "Z"), null)
  assert.equal(letterForOption(question, 703), "C")
  assert.equal(letterForOption(question, 999), undefined)
})

test("answer map marks option and written answers, and skips blanks", () => {
  const essay: LiveQuestion = { id: 8, question_text: "Explain", question_type: "essay", marks: 5, options: [] }
  const map = toAnswerMap([question, essay], {
    7: { question_id: 7, selected_option_id: 702, answer_text: null, is_marked_for_review: false },
    8: { question_id: 8, selected_option_id: null, answer_text: "  Because…", is_marked_for_review: true },
  })
  assert.deepEqual(map, { 7: "B", 8: WRITTEN_ANSWER_MARK })
  assert.deepEqual(toAnswerMap([question], { 7: { question_id: 7, selected_option_id: null, answer_text: " ", is_marked_for_review: true } }), {})
})

test("server status drives the screen phase and the current subject", () => {
  assert.equal(bundlePhase(payload(null, null)), "not-started")
  assert.equal(bundlePhase(payload("in_progress", 31)), "exam")
  assert.equal(currentSubjectIndex(payload("in_progress", 31)), 0)
  // Between subjects the server already points at the NEXT subject; the designed
  // "subject complete" screen needs the one just finished.
  assert.equal(bundlePhase(payload("between_subjects", 32, [31])), "subject-complete")
  assert.equal(currentSubjectIndex(payload("between_subjects", 32, [31])), 0)
  assert.equal(bundlePhase(payload("on_break", 32, [31])), "break")
  assert.equal(bundlePhase(payload("paused", 31)), "paused")
  assert.equal(bundlePhase(payload("completed", null, [31, 32])), "bundle-done")
  assert.deepEqual([...completedSubjectIndexes(payload("between_subjects", 32, [31]))], [0])
  assert.deepEqual([...completedSubjectIndexes(payload("completed", null, []))].sort(), [0, 1])
})
