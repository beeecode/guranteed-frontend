"use client"

/**
 * Question bank table with filters and a "Create Question" modal — the designed admin
 * screen driven by live backend data (Stage 11; fixtures removed).
 *
 * - Formulas: question/option/passage text uses `$…$` (KaTeX), previewed while typing.
 * - Bulk upload: one CSV (or ZIP = CSV + images) holds many questions; the subject is
 *   chosen per upload; progress is shown; the backend imports all rows or rolls back.
 * - Passages: comprehension passages per subject, linkable to questions.
 * Questions already used in an attempt cannot be edited/deleted (server returns 409).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Search, Plus, Upload, Edit, Trash2, ChevronLeft, ChevronRight, Eye, LoaderCircle, AlertTriangle,
  CheckCircle2, X, FileText, ImagePlus, Download, BookOpen,
} from "lucide-react"
import { bffClient } from "@/lib/api/bffClient"
import { MathText } from "@/components/exam/MathText"

interface Subject { id: number; name: string }
interface Topic { id: number; name: string }
interface Passage { id: number; subject_id: number | null; title: string | null; content: string }
interface Option { id?: number; option_text: string; is_correct: boolean; image_url?: string | null }
interface Question {
  id: number; subject_id: number; question_text: string; question_type: string; marks: number; difficulty: string
  image_url?: string | null; passage_id?: number | null; topic_id?: number | null; topic?: { name: string } | null
  expected_answer?: string | null; options?: Option[]
}
interface QuestionPage { questions: Question[]; totalCount?: number | null; totalPages?: number; page?: number }

const PAGE_SIZE = 20
const DIFFICULTIES = [{ value: "basic", label: "Easy" }, { value: "intermediate", label: "Medium" }, { value: "advanced", label: "Hard" }]
const TYPES = [{ value: "mcq", label: "MCQ" }, { value: "truefalse", label: "True / False" }, { value: "shortanswer", label: "Short answer" }, { value: "essay", label: "Essay" }]
const difficultyLabel = (value: string) => DIFFICULTIES.find((item) => item.value === value)?.label ?? value
const typeLabel = (value: string) => TYPES.find((item) => item.value === value)?.label ?? value
const difficultyColor = (d: string) =>
  ({
    Easy: "bg-green-100 text-green-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Hard: "bg-red-100 text-red-700",
  })[d] || "bg-gray-100 text-gray-600"
const letter = (index: number) => String.fromCharCode(65 + index)
const errorText = (reason: unknown, fallback: string) => (reason instanceof Error && reason.message ? reason.message : fallback)
const inputClass = "w-full px-3 py-2.5 rounded-xl border border-[#D9C6B2] text-sm focus:outline-none focus:ring-2 focus:ring-[#B22234]/30"

const TEMPLATE_ROWS = [
  ["question_text", "type", "marks", "answer", "option_a", "option_b", "option_c", "option_d", "passage_title", "passage_content", "image_url", "a_image", "b_image", "c_image", "d_image"],
  ["What is the product of $2x^2 - x + 1$ and $3 - 2x$?", "mcq", "1", "A", "$-4x^3 + 8x^2 - 5x + 3$", "$4x^3 - 8x^2 + 5x - 3$", "$-4x^3 - 8x^2 + 5x + 3$", "$4x^3 - 8x^2 - 5x + 3$", "", "", "", "", "", "", ""],
  ["According to the passage, why did the farmer move?", "mcq", "1", "B", "To find gold", "Because of the drought", "To join the army", "To start a school", "Passage 1", "Read the passage and answer the questions that follow…", "", "", "", "", ""],
]
const downloadTemplate = () => {
  const csv = TEMPLATE_ROWS.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\r\n")
  const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }))
  Object.assign(document.createElement("a"), { href: url, download: "question-import-template.csv" }).click()
  URL.revokeObjectURL(url)
}

export function QuestionBank() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [subjectId, setSubjectId] = useState("")
  const [topics, setTopics] = useState<Topic[]>([])
  const [passages, setPassages] = useState<Passage[]>([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [data, setData] = useState<QuestionPage>({ questions: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [busy, setBusy] = useState<number | null>(null)
  const [editing, setEditing] = useState<Question | "new" | null>(null)
  const [viewing, setViewing] = useState<Question | null>(null)
  const [showImport, setShowImport] = useState(false)
  const [showPassages, setShowPassages] = useState(false)

  const loadSubjects = useCallback(async (selectName?: string) => {
    try {
      const result = await bffClient.action<{ subjects?: Subject[] }>("admin-subjects-list")
      const list = [...(result.subjects ?? [])].sort((a, b) => a.name.localeCompare(b.name))
      setSubjects(list)
      setSubjectId((current) => {
        const named = selectName ? list.find((item) => item.name === selectName) : undefined
        if (named) return String(named.id)
        return current && list.some((item) => String(item.id) === current) ? current : list[0] ? String(list[0].id) : ""
      })
    } catch (reason) { setError(errorText(reason, "Subjects could not be loaded.")) }
  }, [])
  useEffect(() => { const timer = window.setTimeout(() => { void loadSubjects() }, 0); return () => window.clearTimeout(timer) }, [loadSubjects])

  const loadPassages = useCallback(async () => {
    try { setPassages((await bffClient.action<{ passages?: Passage[] }>("admin-passages-list")).passages ?? []) }
    catch { /* passages are optional; questions still work */ }
  }, [])

  const load = useCallback(async () => {
    if (!subjectId) { setData({ questions: [] }); return }
    setLoading(true)
    try {
      setData(await bffClient.action<QuestionPage>("admin-questions-list", { params: { subjectId, page, limit: PAGE_SIZE, search } }))
      setError("")
    } catch (reason) { setError(errorText(reason, "Questions could not be loaded.")) }
    finally { setLoading(false) }
  }, [subjectId, page, search])
  useEffect(() => { const timer = window.setTimeout(() => { void load() }, 250); return () => window.clearTimeout(timer) }, [load])

  useEffect(() => {
    if (!subjectId) return
    const timer = window.setTimeout(() => {
      void bffClient.action<{ topics?: Topic[] }>("admin-topics-list", { params: { subjectId } }).then((value) => setTopics(value.topics ?? [])).catch(() => setTopics([]))
      void loadPassages()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [subjectId, loadPassages])

  const subjectPassages = useMemo(() => passages.filter((item) => String(item.subject_id) === subjectId), [passages, subjectId])
  const subjectName = subjects.find((item) => String(item.id) === subjectId)?.name ?? ""
  const questions = data.questions ?? []
  const totalPages = Math.max(1, data.totalPages ?? 1)

  const addSubject = async () => {
    const name = window.prompt("New subject name (e.g. Further Mathematics):")?.trim()
    if (!name) return
    try { await bffClient.action("admin-subject-create", { payload: { name } }); await loadSubjects(name); setNotice(`Subject "${name}" created.`) }
    catch (reason) { setError(errorText(reason, "The subject could not be created.")) }
  }

  const remove = async (question: Question) => {
    if (!window.confirm("Delete this question? Questions already used in an exam attempt cannot be deleted.")) return
    setBusy(question.id); setError(""); setNotice("")
    try { await bffClient.action("admin-question-delete", { params: { questionId: question.id } }); setNotice("Question deleted."); await load() }
    catch (reason) { setError(errorText(reason, "The question could not be deleted.")) }
    finally { setBusy(null) }
  }

  return (
    <>
      {}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search question text..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D9C6B2] focus:outline-none focus:ring-2 focus:ring-[#B22234]/30 text-sm bg-white"
          />
        </div>
        <select
          value={subjectId}
          onChange={(e) => { if (e.target.value === "__new") { void addSubject(); return } setSubjectId(e.target.value); setPage(1) }}
          aria-label="Subject"
          className="px-4 py-3 rounded-xl border border-[#D9C6B2] text-sm bg-white focus:outline-none"
        >
          {subjects.length === 0 ? <option value="">No subjects yet</option> : null}
          {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
          <option value="__new">+ New subject…</option>
        </select>
        <div className="flex gap-2">
          <button onClick={() => setShowPassages(true)} disabled={!subjectId} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#D9C6B2] text-sm bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            <BookOpen className="w-4 h-4" /> Passages
          </button>
          <button onClick={() => setShowImport(true)} disabled={!subjects.length} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#D9C6B2] text-sm bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            <Upload className="w-4 h-4" /> Import CSV
          </button>
          <button
            onClick={() => setEditing("new")}
            disabled={!subjectId}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#B22234] text-white text-sm font-medium hover:bg-[#8B0000] transition-colors shadow-md disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>
      </div>

      {error ? <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}</div> : null}
      {notice ? <div role="status" className="mb-4 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> {notice}</div> : null}

      {}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-12">#</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Question</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Subject</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Topic</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Difficulty</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Marks</th>
                <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && questions.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-500"><LoaderCircle className="mx-auto mb-2 w-6 h-6 animate-spin text-[#B22234]" /> Loading questions…</td></tr>
              ) : questions.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-500">{subjectId ? (search ? "No questions match this search." : "No questions in this subject yet. Use Import CSV or Add Question.") : "Create a subject first."}</td></tr>
              ) : questions.map((q) => (
                <tr key={q.id} className={`hover:bg-[#F9F5F1] transition-colors ${loading ? "opacity-60" : ""}`}>
                  <td className="px-5 py-4 text-xs text-gray-400 font-mono">{q.id}</td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-900 line-clamp-2 max-w-md"><MathText text={q.question_text} /></p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {q.passage_id ? <span className="text-xs px-2 py-0.5 rounded-full text-blue-700 bg-blue-50">passage</span> : null}
                      {q.image_url ? <span className="text-xs px-2 py-0.5 rounded-full text-purple-700 bg-purple-50">image</span> : null}
                    </div>
                  </td>
                  <td className="px-4 py-4"><div className="text-sm font-medium text-gray-800">{subjectName}</div></td>
                  <td className="px-4 py-4 text-sm text-gray-500">{q.topic?.name ?? "—"}</td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${difficultyColor(difficultyLabel(q.difficulty))}`}>{difficultyLabel(q.difficulty)}</span>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-500 bg-gray-50 rounded-lg">{typeLabel(q.question_type)}</td>
                  <td className="px-4 py-4 text-sm font-heading font-700 text-[#B22234]">{q.marks}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewing(q)} title="Preview" className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => setEditing(q)} title="Edit" className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => void remove(q)} disabled={busy !== null} title="Delete" className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
                        {busy === q.id ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">Showing {questions.length} of {data.totalCount ?? questions.length} questions</span>
          <div className="flex items-center gap-2">
            <button aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="p-2 rounded-xl border border-[#D9C6B2] disabled:opacity-40"><ChevronLeft className="w-4 h-4 text-gray-500" /></button>
            <span className="min-w-9 h-9 px-2 rounded-xl bg-[#B22234] text-white flex items-center justify-center text-sm">{page} / {totalPages}</span>
            <button aria-label="Next page" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="p-2 rounded-xl border border-[#D9C6B2] disabled:opacity-40"><ChevronRight className="w-4 h-4 text-gray-500" /></button>
          </div>
        </div>
      </div>

      {editing ? (
        <QuestionModal
          question={editing === "new" ? null : editing}
          subjects={subjects}
          subjectId={subjectId}
          topics={topics}
          passages={subjectPassages}
          onClose={() => setEditing(null)}
          onSaved={(message) => { setEditing(null); setNotice(message); void load() }}
        />
      ) : null}
      {viewing ? <ViewQuestionModal question={viewing} passage={subjectPassages.find((item) => item.id === viewing.passage_id)} onClose={() => setViewing(null)} /> : null}
      {showImport ? (
        <ImportModal
          subjects={subjects}
          initialSubjectId={subjectId}
          onClose={() => setShowImport(false)}
          onImported={(message, importedSubjectId) => { setShowImport(false); setNotice(message); setSubjectId(importedSubjectId); setPage(1); void load(); void loadPassages() }}
        />
      ) : null}
      {showPassages ? (
        <PassagesModal subjectId={subjectId} subjectName={subjectName} passages={subjectPassages} onClose={() => setShowPassages(false)} onChanged={() => void loadPassages()} />
      ) : null}
    </>
  )
}

function ModalFrame({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className={`bg-white rounded-3xl p-7 ${wide ? "max-w-3xl" : "max-w-2xl"} w-full shadow-2xl max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-start justify-between gap-4 mb-6">
          <h2 className="font-heading text-xl font-700 text-gray-900">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="p-1 text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

function QuestionModal({ question, subjects, subjectId, topics, passages, onClose, onSaved }: {
  question: Question | null; subjects: Subject[]; subjectId: string; topics: Topic[]; passages: Passage[]
  onClose: () => void; onSaved: (message: string) => void
}) {
  const initialOptions = question?.options?.length
    ? question.options.map((option) => ({ option_text: option.option_text, is_correct: option.is_correct, image_url: option.image_url ?? null }))
    : [0, 1, 2, 3].map((index) => ({ option_text: "", is_correct: index === 0, image_url: null }))
  const [form, setForm] = useState({
    subject_id: String(question?.subject_id ?? subjectId),
    topic_id: question?.topic_id ? String(question.topic_id) : "",
    difficulty: question?.difficulty ?? "intermediate",
    question_type: question?.question_type ?? "mcq",
    marks: String(question?.marks ?? 1),
    question_text: question?.question_text ?? "",
    passage_id: question?.passage_id ? String(question.passage_id) : "",
    image_url: question?.image_url ?? "",
    expected_answer: question?.expected_answer ?? "",
  })
  const [options, setOptions] = useState<Option[]>(initialOptions)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const imageRef = useRef<HTMLInputElement>(null)
  const isChoice = form.question_type === "mcq" || form.question_type === "truefalse"
  const shownOptions = form.question_type === "truefalse"
    ? [{ option_text: "True", is_correct: options[0]?.option_text === "True" ? options[0].is_correct : true }, { option_text: "False", is_correct: !(options[0]?.option_text === "True" ? options[0].is_correct : true) }]
    : options
  const correctIndex = Math.max(0, shownOptions.findIndex((option) => option.is_correct))

  const setCorrect = (index: number) => {
    if (form.question_type === "truefalse") setOptions([{ option_text: "True", is_correct: index === 0 }, { option_text: "False", is_correct: index === 1 }])
    else setOptions(options.map((option, i) => ({ ...option, is_correct: i === index })))
  }

  const uploadImage = async (file?: File) => {
    if (!file) return
    setUploading(true); setError("")
    try {
      const body = new FormData()
      body.set("image", file)
      const result = await bffClient.upload<{ url: string }>("question-image", body)
      setForm((value) => ({ ...value, image_url: result.url }))
    } catch (reason) { setError(errorText(reason, "The image could not be uploaded.")) }
    finally { setUploading(false); if (imageRef.current) imageRef.current.value = "" }
  }

  const save = async () => {
    if (!form.question_text.trim()) { setError("Enter the question text."); return }
    const marks = Number(form.marks)
    if (!Number.isFinite(marks) || marks < 1) { setError("Marks must be 1 or more."); return }
    const cleanOptions = shownOptions.filter((option) => option.option_text.trim() || option.image_url)
    if (isChoice && cleanOptions.length < 2) { setError("Enter at least two options."); return }
    if (isChoice && cleanOptions.filter((option) => option.is_correct).length !== 1) { setError("Mark exactly one correct option (the correct option must have text)."); return }
    setSaving(true); setError("")
    const payload = {
      subject_id: Number(form.subject_id),
      topic_id: form.topic_id ? Number(form.topic_id) : null,
      difficulty: form.difficulty,
      question_type: form.question_type,
      marks,
      question_text: form.question_text.trim(),
      passage_id: form.passage_id ? Number(form.passage_id) : null,
      image_url: form.image_url || null,
      expected_answer: isChoice ? null : form.expected_answer.trim() || null,
      ...(isChoice ? { options: cleanOptions } : {}),
    }
    try {
      if (question) await bffClient.action("admin-question-update", { params: { questionId: question.id }, payload })
      else await bffClient.action("admin-question-create", { payload })
      onSaved(question ? "Question updated." : "Question created.")
    } catch (reason) { setError(errorText(reason, "The question could not be saved.")) }
    finally { setSaving(false) }
  }

  return (
    <ModalFrame title={question ? "Edit Question" : "Create Question"} onClose={onClose} wide>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Subject *</label>
            <select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} className={`${inputClass} bg-white`}>
              {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Type *</label>
            <select value={form.question_type} onChange={(e) => setForm({ ...form, question_type: e.target.value })} className={`${inputClass} bg-white`}>
              {TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Topic</label>
            <select value={form.topic_id} onChange={(e) => setForm({ ...form, topic_id: e.target.value })} className={`${inputClass} bg-white`}>
              <option value="">No topic</option>
              {topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Difficulty</label>
            <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className={`${inputClass} bg-white`}>
              {DIFFICULTIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Marks</label>
            <input type="number" min="1" value={form.marks} onChange={(e) => setForm({ ...form, marks: e.target.value })} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Reading passage (optional)</label>
          <select value={form.passage_id} onChange={(e) => setForm({ ...form, passage_id: e.target.value })} className={`${inputClass} bg-white`}>
            <option value="">No passage</option>
            {passages.map((passage) => <option key={passage.id} value={passage.id}>{passage.title || `Passage ${passage.id}`}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Question Text * <span className="font-normal text-gray-400">— write formulas between $ signs, e.g. $x^2 + 2x = 0$</span></label>
          <textarea value={form.question_text} onChange={(e) => setForm({ ...form, question_text: e.target.value })} rows={3} className={`${inputClass} resize-y`} placeholder="Type the question here..." />
          {form.question_text.includes("$") ? (
            <div className="mt-2 rounded-xl bg-[#F9F5F1] px-3 py-2 text-sm text-gray-800"><span className="mr-2 text-xs font-medium text-gray-400">Preview:</span><MathText text={form.question_text} /></div>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <input ref={imageRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => void uploadImage(e.target.files?.[0])} />
          <button type="button" onClick={() => imageRef.current?.click()} disabled={uploading} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#D9C6B2] text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            {uploading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />} {form.image_url ? "Replace image" : "Add image"}
          </button>
          {form.image_url ? (
            <div className="flex items-center gap-2">
              { }
              <img src={form.image_url} alt="Question" className="h-12 rounded-lg border border-gray-200 object-contain" />
              <button type="button" onClick={() => setForm({ ...form, image_url: "" })} className="text-xs text-red-600 underline">Remove</button>
            </div>
          ) : null}
        </div>

        {isChoice ? (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-3">Answer Options — click a letter to mark the correct answer</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {shownOptions.map((option, index) => (
                <div key={index} className="flex items-start gap-2">
                  <button type="button" onClick={() => setCorrect(index)} title="Mark as correct" className={`w-7 h-7 mt-1 rounded-lg flex items-center justify-center font-heading font-700 text-xs flex-shrink-0 ${correctIndex === index ? "bg-[#B22234] text-white" : "bg-gray-100 text-gray-600"}`}>
                    {letter(index)}
                  </button>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={option.option_text}
                      disabled={form.question_type === "truefalse"}
                      onChange={(e) => setOptions(options.map((item, i) => (i === index ? { ...item, option_text: e.target.value } : item)))}
                      className="w-full px-3 py-2 rounded-xl border border-[#D9C6B2] text-sm focus:outline-none disabled:bg-gray-50"
                      placeholder={`Option ${letter(index)}`}
                    />
                    {option.option_text.includes("$") ? <div className="mt-1 px-1 text-xs text-gray-700"><MathText text={option.option_text} /></div> : null}
                  </div>
                </div>
              ))}
            </div>
            {form.question_type === "mcq" ? (
              <div className="mt-2 flex gap-3 text-xs">
                {options.length < 6 ? <button type="button" onClick={() => setOptions([...options, { option_text: "", is_correct: false }])} className="text-[#B22234] underline">+ Add option</button> : null}
                {options.length > 2 ? <button type="button" onClick={() => setOptions(options.slice(0, -1).map((item, i, list) => (options[options.length - 1].is_correct && i === list.length - 1 ? { ...item, is_correct: true } : item)))} className="text-gray-500 underline">Remove last option</button> : null}
              </div>
            ) : null}
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Expected answer / marking guide (for manual grading)</label>
            <textarea value={form.expected_answer} onChange={(e) => setForm({ ...form, expected_answer: e.target.value })} rows={3} className={`${inputClass} resize-y`} />
          </div>
        )}
        {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={onClose} disabled={saving} className="flex-1 py-3 border-2 border-[#D9C6B2] text-gray-700 rounded-xl font-medium text-sm">Cancel</button>
        <button onClick={() => void save()} disabled={saving || uploading} className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-[#B22234] text-white rounded-xl font-medium text-sm hover:bg-[#8B0000] shadow-md disabled:opacity-60">
          {saving ? <LoaderCircle className="w-4 h-4 animate-spin" /> : null} {saving ? "Saving…" : "Save Question"}
        </button>
      </div>
    </ModalFrame>
  )
}

function ViewQuestionModal({ question, passage, onClose }: { question: Question; passage?: Passage; onClose: () => void }) {
  return (
    <ModalFrame title="Question preview" onClose={onClose}>
      <p className="mb-3 text-xs text-gray-400">As students will see it (the green tick is shown to administrators only).</p>
      {passage ? <div className="mb-4 rounded-2xl bg-[#F9F5F1] p-4 text-sm text-gray-800"><div className="mb-1 text-xs font-semibold uppercase text-[#B22234]">{passage.title || "Passage"}</div><MathText text={passage.content} /></div> : null}
      <div className="mb-4 text-base text-gray-900"><MathText text={question.question_text} /></div>
      { }
      {question.image_url ? <img src={question.image_url} alt="Question" className="mb-4 max-h-64 w-full rounded-xl object-contain" /> : null}
      {question.options?.length ? (
        <div className="space-y-2">
          {question.options.map((option, index) => (
            <div key={option.id ?? index} className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${option.is_correct ? "border-green-300 bg-green-50" : "border-[#E8D9CB]"}`}>
              <span className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center font-700 text-xs">{letter(index)}</span>
              <span className="flex-1"><MathText text={option.option_text} /></span>
              {option.is_correct ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : null}
            </div>
          ))}
        </div>
      ) : <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">Written answer. {question.expected_answer ? `Marking guide: ${question.expected_answer}` : ""}</p>}
    </ModalFrame>
  )
}

function ImportModal({ subjects, initialSubjectId, onClose, onImported }: { subjects: Subject[]; initialSubjectId: string; onClose: () => void; onImported: (message: string, subjectId: string) => void }) {
  const [subjectId, setSubjectId] = useState(initialSubjectId)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!uploading) return
    const started = Date.now()
    const timer = window.setInterval(() => setElapsed(Math.round((Date.now() - started) / 1000)), 500)
    return () => window.clearInterval(timer)
  }, [uploading])

  const upload = async () => {
    if (!subjectId) { setError("Choose the subject these questions belong to."); return }
    if (!file) { setError("Choose a .csv or .zip file."); return }
    setUploading(true); setElapsed(0); setError("")
    try {
      const body = new FormData()
      body.set("subject_id", subjectId)
      body.set("csv_file", file)
      const result = await bffClient.upload<{ successCount?: number; message?: string }>("questions-csv", body)
      const subject = subjects.find((item) => String(item.id) === subjectId)?.name ?? "the subject"
      onImported(`${result.successCount ?? 0} question(s) imported into ${subject}.`, subjectId)
    } catch (reason) { setError(errorText(reason, "The import failed. Nothing was imported.")) }
    finally { setUploading(false) }
  }

  return (
    <ModalFrame title="Import questions" onClose={uploading ? () => undefined : onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Subject for this file *</label>
          <select value={subjectId} disabled={uploading} onChange={(e) => setSubjectId(e.target.value)} className={`${inputClass} bg-white`}>
            <option value="">Select subject</option>
            {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">File (.csv, or .zip containing the CSV and its images) — max 10 MB</label>
          <label className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed px-4 py-5 text-sm ${file ? "border-[#B22234] bg-[#B22234]/5" : "border-[#D9C6B2]"} ${uploading ? "pointer-events-none opacity-60" : ""}`}>
            <FileText className="w-5 h-5 text-[#B22234]" />
            <span className="flex-1 truncate">{file ? `${file.name} (${Math.max(1, Math.round(file.size / 1024))} KB)` : "Click to choose a file"}</span>
            <input type="file" accept=".csv,.zip,text/csv,application/zip" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
        </div>
        <div className="rounded-xl bg-[#F9F5F1] px-4 py-3 text-xs leading-5 text-gray-600">
          Columns: <span className="font-mono">question_text, type, marks, answer, option_a…option_d</span>, optional <span className="font-mono">passage_title, passage_content, image_url, a_image…d_image</span>. Write formulas as <span className="font-mono">$x^2$</span>. All rows are imported, or none (a bad row cancels the whole file and says why).
          <button type="button" onClick={downloadTemplate} className="mt-2 flex items-center gap-1 font-medium text-[#B22234] underline"><Download className="w-3.5 h-3.5" /> Download template</button>
        </div>
        {uploading ? (
          <div className="rounded-xl border border-[#D9C6B2] px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700"><LoaderCircle className="w-4 h-4 animate-spin text-[#B22234]" /> Uploading and importing… {elapsed}s</div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F1E7DC]"><div className="h-full w-1/3 animate-pulse rounded-full bg-[#B22234]" /></div>
            <p className="mt-2 text-xs text-gray-500">Large files with images can take a minute. Keep this window open.</p>
          </div>
        ) : null}
        {error ? <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}</div> : null}
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={onClose} disabled={uploading} className="flex-1 py-3 border-2 border-[#D9C6B2] text-gray-700 rounded-xl font-medium text-sm disabled:opacity-50">Cancel</button>
        <button onClick={() => void upload()} disabled={uploading} className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-[#B22234] text-white rounded-xl font-medium text-sm hover:bg-[#8B0000] shadow-md disabled:opacity-60">
          {uploading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} {uploading ? "Importing…" : "Upload & Import"}
        </button>
      </div>
    </ModalFrame>
  )
}

function PassagesModal({ subjectId, subjectName, passages, onClose, onChanged }: { subjectId: string; subjectName: string; passages: Passage[]; onClose: () => void; onChanged: () => void }) {
  const [editing, setEditing] = useState<Passage | "new" | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const open = (passage: Passage | "new") => {
    setEditing(passage); setError("")
    setTitle(passage === "new" ? "" : passage.title ?? "")
    setContent(passage === "new" ? "" : passage.content)
  }
  const save = async () => {
    if (!content.trim()) { setError("Enter the passage text."); return }
    setSaving(true); setError("")
    try {
      await bffClient.action("admin-passage-save", { payload: { ...(editing && editing !== "new" ? { id: editing.id } : {}), subject_id: Number(subjectId), title: title.trim() || null, content: content.trim() } })
      setEditing(null); onChanged()
    } catch (reason) { setError(errorText(reason, "The passage could not be saved.")) }
    finally { setSaving(false) }
  }
  const remove = async (passage: Passage) => {
    if (!window.confirm(`Delete "${passage.title || "this passage"}"? Questions linked to it will no longer show it.`)) return
    try { await bffClient.action("admin-passage-delete", { params: { passageId: passage.id } }); onChanged() }
    catch (reason) { setError(errorText(reason, "The passage could not be deleted.")) }
  }

  return (
    <ModalFrame title={`Reading passages — ${subjectName}`} onClose={onClose} wide>
      {editing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="e.g. Passage 1 — The Drought" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Passage text *</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={10} className={`${inputClass} resize-y`} placeholder="Paste the comprehension passage here…" />
          </div>
          {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
          <div className="flex gap-3">
            <button onClick={() => setEditing(null)} disabled={saving} className="flex-1 py-3 border-2 border-[#D9C6B2] text-gray-700 rounded-xl font-medium text-sm">Back</button>
            <button onClick={() => void save()} disabled={saving} className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-[#B22234] text-white rounded-xl font-medium text-sm hover:bg-[#8B0000] shadow-md disabled:opacity-60">
              {saving ? <LoaderCircle className="w-4 h-4 animate-spin" /> : null} Save Passage
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-gray-500">Passages are shown above the questions linked to them in the exam. Link a question to a passage when you create or edit it, or include passage_title/passage_content columns in an import.</p>
          {error ? <p role="alert" className="mb-3 text-sm text-red-700">{error}</p> : null}
          <div className="space-y-2">
            {passages.length === 0 ? <p className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500">No passages for this subject yet.</p> : passages.map((passage) => (
              <div key={passage.id} className="flex items-start gap-3 rounded-2xl border border-[#E8D9CB] p-4">
                <BookOpen className="w-5 h-5 mt-0.5 text-[#B22234] shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900">{passage.title || `Passage ${passage.id}`}</div>
                  <p className="text-xs text-gray-500 line-clamp-2">{passage.content}</p>
                </div>
                <button onClick={() => open(passage)} title="Edit" className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50"><Edit className="w-4 h-4" /></button>
                <button onClick={() => void remove(passage)} title="Delete" className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <button onClick={() => open("new")} className="mt-5 w-full inline-flex items-center justify-center gap-2 py-3 bg-[#B22234] text-white rounded-xl font-medium text-sm hover:bg-[#8B0000] shadow-md"><Plus className="w-4 h-4" /> Add Passage</button>
        </>
      )}
    </ModalFrame>
  )
}
