"use client"

/**
 * Create an exam bundle — the designed six-step wizard on live data (Stage 11).
 * A bundle groups existing exams (its subjects) for one class, in a fixed order, with
 * optional per-subject overrides and transition/break/late-start rules. "Save as draft"
 * creates it; "Publish" also makes it visible to the class. Subjects must be ACTIVE exams
 * for students to start them; once in a bundle they are no longer offered as standalone
 * exams (server rule).
 */

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Trash2, ChevronUp, ChevronDown, Check, LoaderCircle, AlertTriangle, X } from "lucide-react"
import { bffClient } from "@/lib/api/bffClient"

interface Level { id: number; name: string; code: string; is_active?: boolean }
interface Exam { id: number; title: string; status: string; duration_mins: number; total_marks: number; class_level_id: number | null; random_draw_count: number | null; shuffle_options: boolean | null; subject?: { name?: string } | null }
interface SubjectEntry {
  examId: number
  title: string
  subjectName: string
  status: string
  duration: number
  totalMarks: number
  passMark: number
  randomDraw: string
  randomizeOptions: boolean
  autoSubmit: boolean
  instructions: string
}

const STEPS = ["Bundle Info", "Subjects", "Transitions", "Rules", "Assign Students", "Review & Publish"]
const errorText = (reason: unknown, fallback: string) => (reason instanceof Error && reason.message ? reason.message : fallback)

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-1">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all" style={{ background: i < current ? "#16A34A" : i === current ? "#B22234" : "rgba(217,198,178,0.4)", color: i <= current ? "#fff" : "#7A5C3A" }}>
              {i < current ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className="text-xs font-semibold hidden sm:block" style={{ color: i === current ? "#B22234" : i < current ? "#16A34A" : "#B8967A" }}>{label}</span>
          </div>
          {i < STEPS.length - 1 && <div className="w-6 sm:w-10 h-0.5 mx-1 flex-shrink-0" style={{ background: i < current ? "#16A34A" : "rgba(217,198,178,0.4)" }} />}
        </div>
      ))}
    </div>
  )
}

const smallInput = "w-full px-2 py-1.5 text-sm text-[#1C0A04] focus:outline-none"
const smallInputStyle = { background: "#F9F5F1", borderRadius: 8, border: "1.5px solid rgba(217,198,178,0.5)" }

function SubjectCard({ subject, index, total, onMove, onRemove, onEdit }: {
  subject: SubjectEntry; index: number; total: number
  onMove: (from: number, dir: -1 | 1) => void; onRemove: (examId: number) => void; onEdit: (examId: number, patch: Partial<SubjectEntry>) => void
}) {
  const numberFields: Array<{ label: string; field: "duration" | "totalMarks" | "passMark"; value: number }> = [
    { label: "Duration (min)", field: "duration", value: subject.duration },
    { label: "Total Marks", field: "totalMarks", value: subject.totalMarks },
    { label: "Pass Mark (%)", field: "passMark", value: subject.passMark },
  ]
  return (
    <div className="bg-white border border-[rgba(217,198,178,0.5)] p-4" style={{ borderRadius: 16 }}>
      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-0.5">
          <button type="button" onClick={() => onMove(index, -1)} disabled={index === 0} className="p-1 text-[#B8967A] hover:text-[#8B0000] disabled:opacity-30 transition-colors" style={{ borderRadius: 6 }} aria-label="Move up"><ChevronUp className="w-4 h-4" /></button>
          <button type="button" onClick={() => onMove(index, 1)} disabled={index === total - 1} className="p-1 text-[#B8967A] hover:text-[#8B0000] disabled:opacity-30 transition-colors" style={{ borderRadius: 6 }} aria-label="Move down"><ChevronDown className="w-4 h-4" /></button>
        </div>
        <div className="w-8 h-8 flex items-center justify-center font-bold text-white text-sm flex-shrink-0" style={{ background: "#B22234", borderRadius: "50%" }}>{index + 1}</div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-semibold text-[#1C0A04]">{subject.subjectName}</span>
            <span className="text-xs text-[#B8967A] truncate">{subject.title}</span>
            {subject.status !== "active" ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase">{subject.status} — activate before the exam</span> : null}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {numberFields.map((f) => (
              <div key={f.field}>
                <label className="block text-[10px] font-bold text-[#B8967A] uppercase tracking-wide mb-1">{f.label}</label>
                <input type="number" min={f.field === "passMark" ? 0 : 1} max={f.field === "passMark" ? 100 : undefined} value={f.value} onChange={(e) => onEdit(subject.examId, { [f.field]: Number(e.target.value) })} className={smallInput} style={smallInputStyle} />
              </div>
            ))}
            <div>
              <label className="block text-[10px] font-bold text-[#B8967A] uppercase tracking-wide mb-1">Random draw (qty)</label>
              <input type="number" min={0} placeholder="All" value={subject.randomDraw} onChange={(e) => onEdit(subject.examId, { randomDraw: e.target.value })} className={smallInput} style={smallInputStyle} />
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {([["Randomise Options", "randomizeOptions"], ["Auto-Submit on Timeout", "autoSubmit"]] as const).map(([label, field]) => (
              <label key={field} className="flex items-center gap-1.5 text-xs text-[#7A5C3A] cursor-pointer">
                <input type="checkbox" checked={subject[field]} onChange={(e) => onEdit(subject.examId, { [field]: e.target.checked })} className="accent-[#B22234]" />
                {label}
              </label>
            ))}
          </div>
          <input value={subject.instructions} onChange={(e) => onEdit(subject.examId, { instructions: e.target.value })} placeholder="Instructions shown before this subject (optional)" className={`${smallInput} mt-2`} style={smallInputStyle} />
        </div>
        <button type="button" onClick={() => onRemove(subject.examId)} className="p-2 text-[#B8967A] hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0" style={{ borderRadius: 10 }} aria-label="Remove subject"><Trash2 className="w-4 h-4" /></button>
      </div>
    </div>
  )
}

function AddSubjectModal({ exams, chosen, classLevelId, onAdd, onClose }: { exams: Exam[]; chosen: number[]; classLevelId: string; onAdd: (exam: Exam) => void; onClose: () => void }) {
  const [showAll, setShowAll] = useState(false)
  const available = exams.filter((exam) => !chosen.includes(exam.id) && exam.status !== "closed" && (showAll || !classLevelId || String(exam.class_level_id) === classLevelId))
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white w-full max-w-lg shadow-2xl max-h-[85vh] flex flex-col" style={{ borderRadius: 24 }}>
        <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid rgba(217,198,178,0.3)" }}>
          <h3 className="font-semibold text-[#1C0A04] text-lg">Add a subject exam</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1 text-gray-400"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 overflow-y-auto space-y-2">
          <label className="flex items-center gap-2 text-xs text-[#7A5C3A] mb-2"><input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="accent-[#B22234]" /> Show exams of other classes too</label>
          {available.length === 0 ? <p className="text-sm text-[#B8967A] text-center py-8">No more exams for this class. Create exams under Examinations first.</p> : available.map((exam) => (
            <button key={exam.id} type="button" onClick={() => onAdd(exam)} className="w-full flex items-center justify-between gap-3 p-3 text-left hover:bg-[#F9F5F1] transition-colors" style={{ borderRadius: 12, border: "1.5px solid rgba(217,198,178,0.4)" }}>
              <div className="min-w-0">
                <div className="font-semibold text-[#1C0A04] text-sm truncate">{exam.subject?.name ?? "Subject"} — {exam.title}</div>
                <div className="text-xs text-[#B8967A]">{exam.duration_mins} min · {exam.total_marks} marks{exam.status !== "active" ? ` · ${exam.status}` : ""}</div>
              </div>
              <Plus className="w-4 h-4 text-[#B22234] flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CreateBundleWizard() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [levels, setLevels] = useState<Level[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [studentCount, setStudentCount] = useState<number | null>(null)
  const [showAddSubject, setShowAddSubject] = useState(false)
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null)
  const [error, setError] = useState("")
  const [info, setInfo] = useState({ name: "", classLevelId: "", session: "", term: "First Term", description: "", startDate: "", startTime: "09:00", endDate: "", endTime: "16:00" })
  const [subjects, setSubjects] = useState<SubjectEntry[]>([])
  const [transitions, setTransitions] = useState({ mode: "manual" as "manual" | "automatic", autoCountdown: 10, breakMode: "none" as "none" | "optional" | "timed", breakDuration: 5, allowSkipBreak: true, autoStartAfterBreak: false })
  const [rules, setRules] = useState({ canReturnToCompleted: false, resumeAfterLoss: true, requireSameDevice: false, allowLateStart: true, lateStartWindow: 30, autoSubmitFinal: true })

  useEffect(() => {
    void bffClient.action<{ levels?: Level[] }>("admin-class-levels").then((value) => setLevels((value.levels ?? []).filter((level) => level.is_active !== false))).catch(() => setError("Classes could not be loaded."))
    void bffClient.action<{ exams?: Exam[] }>("admin-exams-list").then((value) => setExams(value.exams ?? [])).catch(() => setError("Exams could not be loaded."))
  }, [])
  useEffect(() => {
    if (!info.classLevelId) return
    let active = true
    void bffClient.action<{ pagination?: { total?: number | null } }>("admin-students-list", { params: { page: 1, limit: 1, class_level_id: info.classLevelId, status: "active" } })
      .then((value) => { if (active) setStudentCount(value.pagination?.total ?? null) })
      .catch(() => { if (active) setStudentCount(null) })
    return () => { active = false }
  }, [info.classLevelId])

  const className = levels.find((level) => String(level.id) === info.classLevelId)?.name ?? ""
  const totalMins = subjects.reduce((sum, sub) => sum + (Number(sub.duration) || 0), 0)
  const durationLabel = totalMins >= 60 ? `${Math.floor(totalMins / 60)}h ${totalMins % 60 > 0 ? `${totalMins % 60}m` : ""}` : `${totalMins}m`
  const startsAt = info.startDate ? new Date(`${info.startDate}T${info.startTime || "00:00"}`) : null
  const endsAt = info.endDate ? new Date(`${info.endDate}T${info.endTime || "23:59"}`) : null
  const notActive = subjects.filter((subject) => subject.status !== "active")

  const moveSubject = (from: number, dir: -1 | 1) => {
    const arr = [...subjects]
    const to = from + dir
    if (to < 0 || to >= arr.length) return
    ;[arr[from], arr[to]] = [arr[to], arr[from]]
    setSubjects(arr)
  }
  const editSubject = (examId: number, patch: Partial<SubjectEntry>) => setSubjects((prev) => prev.map((s) => (s.examId === examId ? { ...s, ...patch } : s)))
  const addSubject = (exam: Exam) => {
    setSubjects((prev) => [...prev, {
      examId: exam.id, title: exam.title, subjectName: exam.subject?.name ?? exam.title, status: exam.status,
      duration: exam.duration_mins || 30, totalMarks: exam.total_marks || 0, passMark: 50,
      randomDraw: exam.random_draw_count ? String(exam.random_draw_count) : "", randomizeOptions: Boolean(exam.shuffle_options), autoSubmit: true, instructions: "",
    }])
    setShowAddSubject(false)
  }

  const inputClass = "w-full px-4 py-3 text-sm text-[#1C0A04] focus:outline-none transition-all"
  const inputStyle = { background: "#fff", border: "1.5px solid rgba(217,198,178,0.6)", borderRadius: 12 }
  const labelClass = "block text-xs font-bold text-[#7A5C3A] uppercase tracking-widest mb-1.5"
  const toggleRow = (label: string, value: boolean, onChange: (v: boolean) => void, desc?: string) => (
    <div className="flex items-start justify-between gap-4 py-3" style={{ borderBottom: "1px solid rgba(217,198,178,0.2)" }}>
      <div>
        <div className="text-sm font-semibold text-[#1C0A04]">{label}</div>
        {desc && <div className="text-xs text-[#B8967A] mt-0.5">{desc}</div>}
      </div>
      <button type="button" onClick={() => onChange(!value)} className="relative w-12 h-6 flex-shrink-0 transition-all" style={{ borderRadius: 999, background: value ? "#B22234" : "#D9C6B2" }} aria-pressed={value} aria-label={label}>
        <div className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all" style={{ left: value ? "calc(100% - 20px)" : "4px" }} />
      </button>
    </div>
  )

  const stepProblem = (() => {
    if (step === 0) {
      if (!info.name.trim()) return "Enter the bundle name."
      if (!info.classLevelId) return "Choose the class."
      if (startsAt && endsAt && endsAt <= startsAt) return "The end must be after the start."
    }
    if (step === 1) {
      if (!subjects.length) return "Add at least one subject."
      if (subjects.some((s) => !(s.duration > 0) || s.passMark < 0 || s.passMark > 100)) return "Each subject needs a duration and a pass mark between 0 and 100."
    }
    return ""
  })()

  const save = async (publish: boolean) => {
    setSaving(publish ? "publish" : "draft"); setError("")
    try {
      const created = await bffClient.action<{ bundle: { id: number } }>("admin-bundle-create", {
        payload: {
          session_name: info.name.trim(), description: info.description.trim() || null, academic_session: info.session.trim() || null, term: info.term || null,
          class_level_id: Number(info.classLevelId), class_section_id: null,
          starts_at: startsAt ? startsAt.toISOString() : null, ends_at: endsAt ? endsAt.toISOString() : null,
          transition_mode: transitions.mode, auto_countdown_seconds: transitions.autoCountdown,
          break_mode: transitions.breakMode, break_duration_mins: transitions.breakMode === "none" ? 0 : transitions.breakDuration,
          allow_skip_break: transitions.allowSkipBreak, auto_start_after_break: transitions.autoStartAfterBreak,
          can_return_to_completed: rules.canReturnToCompleted, resume_after_disconnect: rules.resumeAfterLoss, require_same_device: rules.requireSameDevice,
          allow_late_start: rules.allowLateStart, late_start_window_mins: rules.lateStartWindow, auto_submit_final: rules.autoSubmitFinal,
          subjects: subjects.map((s) => ({
            exam_id: s.examId, duration_override: s.duration, total_marks_override: s.totalMarks || null, pass_mark: s.passMark,
            random_draw_count_override: s.randomDraw ? Number(s.randomDraw) : null, shuffle_options_override: s.randomizeOptions,
            auto_submit_on_timeout: s.autoSubmit, instructions: s.instructions.trim() || null,
          })),
        },
      })
      if (publish) await bffClient.action("admin-bundle-publish", { params: { bundleId: created.bundle.id } })
      router.push("/admin/bundles")
    } catch (reason) { setError(errorText(reason, "The bundle could not be saved.")); setSaving(null) }
  }

  return (
    <>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/bundles" className="text-sm text-[#7A5C3A] hover:text-[#8B0000] transition-colors font-medium flex items-center gap-1">← Back to Exam Bundles</Link>
        </div>

        <StepIndicator current={step} />

        {step === 0 && (
          <div className="bg-white p-6 shadow-sm" style={{ borderRadius: 24 }}>
            <h2 className="font-semibold text-[#1C0A04] text-xl mb-6">Bundle Information</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className={labelClass}>Exam Bundle Name *</label>
                <input type="text" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} className={inputClass} style={inputStyle} placeholder="e.g. 2026 First Term Examination" />
              </div>
              <div>
                <label className={labelClass}>Class *</label>
                <select value={info.classLevelId} onChange={(e) => { setInfo({ ...info, classLevelId: e.target.value }); setStudentCount(null) }} className={inputClass} style={inputStyle}>
                  <option value="">Select class...</option>
                  {levels.map((level) => <option key={level.id} value={level.id}>{level.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Academic Session</label>
                <input type="text" value={info.session} onChange={(e) => setInfo({ ...info, session: e.target.value })} className={inputClass} style={inputStyle} placeholder="e.g. 2026/2027" />
              </div>
              <div>
                <label className={labelClass}>Term</label>
                <select value={info.term} onChange={(e) => setInfo({ ...info, term: e.target.value })} className={inputClass} style={inputStyle}>
                  {["First Term", "Second Term", "Third Term", "Mock", "Lesson"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="hidden sm:block" />
              <div>
                <label className={labelClass}>Opens (date)</label>
                <input type="date" value={info.startDate} onChange={(e) => setInfo({ ...info, startDate: e.target.value })} className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className={labelClass}>Opens (time)</label>
                <input type="time" value={info.startTime} onChange={(e) => setInfo({ ...info, startTime: e.target.value })} className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className={labelClass}>Closes (date)</label>
                <input type="date" value={info.endDate} onChange={(e) => setInfo({ ...info, endDate: e.target.value })} className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className={labelClass}>Closes (time)</label>
                <input type="time" value={info.endTime} onChange={(e) => setInfo({ ...info, endTime: e.target.value })} className={inputClass} style={inputStyle} />
              </div>
              <p className="sm:col-span-2 text-xs text-[#B8967A] -mt-2">Leave the dates empty to open the bundle as soon as it is published and keep it open until you close it.</p>
              <div className="sm:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea value={info.description} onChange={(e) => setInfo({ ...info, description: e.target.value })} rows={3} className={inputClass} style={inputStyle} placeholder="Optional description for this exam bundle..." />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="bg-white p-6 shadow-sm mb-4" style={{ borderRadius: 24 }}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-[#1C0A04] text-xl">Subjects</h2>
              <button type="button" onClick={() => setShowAddSubject(true)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-md" style={{ background: "#B22234", borderRadius: 999 }}>
                <Plus className="w-4 h-4" /> Add Subject
              </button>
            </div>
            <p className="text-[#7A5C3A] text-sm mb-5">Students take the subjects in the order shown. Use the arrows to reorder. Each subject is an existing exam; the values here apply inside this bundle only.</p>
            {subjects.length === 0 ? (
              <div className="text-center py-12 text-[#B8967A]">
                <div className="text-4xl mb-2">📚</div>
                <p className="text-sm">No subjects added yet. Click &quot;Add Subject&quot; to begin.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subjects.map((s, i) => <SubjectCard key={s.examId} subject={s} index={i} total={subjects.length} onMove={moveSubject} onRemove={(examId) => setSubjects((prev) => prev.filter((x) => x.examId !== examId))} onEdit={editSubject} />)}
                <div className="text-sm text-[#7A5C3A] pt-2">Total time: <strong className="text-[#1C0A04]">{durationLabel}</strong></div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="bg-white p-6 shadow-sm" style={{ borderRadius: 24 }}>
            <h2 className="font-semibold text-[#1C0A04] text-xl mb-4">Transitions & Breaks</h2>
            <label className={labelClass}>After a subject is submitted</label>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              {([["manual", "Student presses Continue"], ["automatic", "Move on automatically"]] as const).map(([value, text]) => (
                <button key={value} type="button" onClick={() => setTransitions({ ...transitions, mode: value })} className="p-4 text-left text-sm font-semibold" style={{ borderRadius: 14, border: `2px solid ${transitions.mode === value ? "#B22234" : "rgba(217,198,178,0.5)"}`, color: transitions.mode === value ? "#B22234" : "#1C0A04" }}>{text}</button>
              ))}
            </div>
            {transitions.mode === "automatic" ? (
              <div className="mb-4"><label className={labelClass}>Countdown before the next subject (seconds)</label><input type="number" min={0} max={300} value={transitions.autoCountdown} onChange={(e) => setTransitions({ ...transitions, autoCountdown: Number(e.target.value) })} className={inputClass} style={inputStyle} /></div>
            ) : null}
            <label className={labelClass}>Breaks between subjects</label>
            <div className="grid sm:grid-cols-3 gap-3 mb-4">
              {([["none", "No break"], ["optional", "Optional break"], ["timed", "Timed break"]] as const).map(([value, text]) => (
                <button key={value} type="button" onClick={() => setTransitions({ ...transitions, breakMode: value })} className="p-4 text-left text-sm font-semibold" style={{ borderRadius: 14, border: `2px solid ${transitions.breakMode === value ? "#B22234" : "rgba(217,198,178,0.5)"}`, color: transitions.breakMode === value ? "#B22234" : "#1C0A04" }}>{text}</button>
              ))}
            </div>
            {transitions.breakMode !== "none" ? (
              <>
                <div className="mb-2"><label className={labelClass}>Break length (minutes)</label><input type="number" min={1} max={240} value={transitions.breakDuration} onChange={(e) => setTransitions({ ...transitions, breakDuration: Number(e.target.value) })} className={inputClass} style={inputStyle} /></div>
                {toggleRow("Allow skipping the break", transitions.allowSkipBreak, (v) => setTransitions({ ...transitions, allowSkipBreak: v }), "Students may start the next subject before the break ends.")}
                {toggleRow("Start next subject when the break ends", transitions.autoStartAfterBreak, (v) => setTransitions({ ...transitions, autoStartAfterBreak: v }))}
              </>
            ) : null}
          </div>
        )}

        {step === 3 && (
          <div className="bg-white p-6 shadow-sm" style={{ borderRadius: 24 }}>
            <h2 className="font-semibold text-[#1C0A04] text-xl mb-4">Rules</h2>
            {toggleRow("Allow returning to completed subjects", rules.canReturnToCompleted, (v) => setRules({ ...rules, canReturnToCompleted: v }))}
            {toggleRow("Resume after a lost connection", rules.resumeAfterLoss, (v) => setRules({ ...rules, resumeAfterLoss: v }), "Students continue where they stopped after a crash or reload (recommended).")}
            {toggleRow("Require the same device", rules.requireSameDevice, (v) => setRules({ ...rules, requireSameDevice: v }))}
            {toggleRow("Allow late start", rules.allowLateStart, (v) => setRules({ ...rules, allowLateStart: v }), "Students can still start after the opening time, within the window below.")}
            {rules.allowLateStart ? (
              <div className="py-3"><label className={labelClass}>Late-start window (minutes after opening)</label><input type="number" min={0} max={1440} value={rules.lateStartWindow} onChange={(e) => setRules({ ...rules, lateStartWindow: Number(e.target.value) })} className={inputClass} style={inputStyle} /></div>
            ) : (
              <div className="my-3 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800"><AlertTriangle className="w-4 h-4 shrink-0" /> With late start off and an opening time set, nobody can start after the exact opening time. Keep it on unless every student starts at once.</div>
            )}
            {toggleRow("Auto-submit the final subject at time-out", rules.autoSubmitFinal, (v) => setRules({ ...rules, autoSubmitFinal: v }))}
          </div>
        )}

        {step === 4 && (
          <div className="bg-white p-6 shadow-sm" style={{ borderRadius: 24 }}>
            <h2 className="font-semibold text-[#1C0A04] text-xl mb-4">Assign Students</h2>
            <div className="p-5" style={{ background: "#F9F5F1", borderRadius: 16 }}>
              <div className="text-sm text-[#7A5C3A]">This bundle is assigned to the whole class:</div>
              <div className="font-semibold text-[#1C0A04] text-lg mt-1">{className || "No class chosen"}</div>
              <div className="text-sm text-[#7A5C3A] mt-2">{studentCount === null ? "Counting students…" : `${studentCount} active student${studentCount === 1 ? "" : "s"} will see this bundle.`}</div>
            </div>
            {studentCount === 0 ? <p className="mt-3 text-xs text-amber-700">This class has no active students yet. Add them under Students before the exam.</p> : null}
          </div>
        )}

        {step === 5 && (
          <div className="bg-white p-6 shadow-sm" style={{ borderRadius: 24 }}>
            <h2 className="font-semibold text-[#1C0A04] text-xl mb-4">Review & Publish</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[["Subjects", `${subjects.length}`], ["Total time", durationLabel], ["Class", className || "—"], ["Students", studentCount === null ? "—" : String(studentCount)]].map(([label, value]) => (
                <div key={label} className="text-center p-3" style={{ background: "#F9F5F1", borderRadius: 14 }}>
                  <div className="font-bold text-[#B22234] text-lg">{value}</div>
                  <div className="text-[10px] font-bold text-[#7A5C3A] uppercase tracking-wide">{label}</div>
                </div>
              ))}
            </div>
            <div className="space-y-1 text-sm text-[#1C0A04] mb-4">
              <div><span className="text-[#7A5C3A]">Name:</span> {info.name}</div>
              <div><span className="text-[#7A5C3A]">Opens:</span> {startsAt ? startsAt.toLocaleString() : "when published"} · <span className="text-[#7A5C3A]">Closes:</span> {endsAt ? endsAt.toLocaleString() : "when you close it"}</div>
              <div><span className="text-[#7A5C3A]">Breaks:</span> {transitions.breakMode === "none" ? "none" : `${transitions.breakMode}, ${transitions.breakDuration} min`} · <span className="text-[#7A5C3A]">Late start:</span> {rules.allowLateStart ? `${rules.lateStartWindow} min` : "off"}</div>
            </div>
            <ol className="space-y-2 mb-4">
              {subjects.map((s, i) => (
                <li key={s.examId} className="flex items-center gap-3 text-sm p-3" style={{ border: "1.5px solid rgba(217,198,178,0.4)", borderRadius: 12 }}>
                  <span className="w-6 h-6 flex items-center justify-center text-xs font-bold text-white rounded-full" style={{ background: "#B22234" }}>{i + 1}</span>
                  <span className="flex-1 font-medium">{s.subjectName}</span>
                  <span className="text-xs text-[#7A5C3A]">{s.duration} min · {s.totalMarks} marks · pass {s.passMark}%</span>
                </li>
              ))}
            </ol>
            {notActive.length ? (
              <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800 mb-2"><AlertTriangle className="w-4 h-4 shrink-0" /> {notActive.map((s) => s.subjectName).join(", ")} {notActive.length === 1 ? "is" : "are"} not active yet. Students cannot start a subject until its exam is active (Examinations page).</div>
            ) : null}
          </div>
        )}

        {error ? <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}</div> : null}
        {stepProblem ? <p className="mt-4 text-sm text-[#B22234]">{stepProblem}</p> : null}

        <div className="flex items-center justify-between mt-6">
          <button type="button" onClick={() => (step === 0 ? router.push("/admin/bundles") : setStep((s) => s - 1))} className="px-6 py-3 text-sm font-semibold" style={{ border: "1.5px solid rgba(217,198,178,0.6)", borderRadius: 999, color: "#7A5C3A" }}>
            {step === 0 ? "← Cancel" : "← Back"}
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={() => setStep((s) => s + 1)} disabled={Boolean(stepProblem)} className="px-6 py-3 text-sm font-semibold text-white disabled:opacity-50" style={{ background: "#B22234", borderRadius: 999 }}>Next →</button>
          ) : (
            <div className="flex gap-3">
              <button type="button" onClick={() => void save(false)} disabled={saving !== null} className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold disabled:opacity-50" style={{ border: "1.5px solid #B22234", borderRadius: 999, color: "#B22234" }}>
                {saving === "draft" ? <LoaderCircle className="w-4 h-4 animate-spin" /> : null} Save as Draft
              </button>
              <button type="button" onClick={() => void save(true)} disabled={saving !== null} className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white disabled:opacity-50" style={{ background: "#16A34A", borderRadius: 999 }}>
                {saving === "publish" ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Publish Bundle
              </button>
            </div>
          )}
        </div>
      </div>

      {showAddSubject && <AddSubjectModal exams={exams} chosen={subjects.map((s) => s.examId)} classLevelId={info.classLevelId} onAdd={addSubject} onClose={() => setShowAddSubject(false)} />}
    </>
  )
}
