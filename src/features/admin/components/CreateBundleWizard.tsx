'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ChevronUp, ChevronDown, Check } from 'lucide-react';

/* ── Types ─────────────────────────────────────────────────── */
interface SubjectEntry {
  id: number;
  name: string;
  emoji: string;
  questions: number;
  duration: number;
  totalMarks: number;
  passmark: number;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  autoSubmit: boolean;
}

const subjectOptions = [
  { name: 'English Language', emoji: '📘' },
  { name: 'Mathematics', emoji: '➕' },
  { name: 'Basic Science', emoji: '🔬' },
  { name: 'Social Studies', emoji: '🌍' },
  { name: 'Computer Studies', emoji: '💻' },
  { name: 'Creative Arts', emoji: '🎨' },
  { name: 'Music', emoji: '🎵' },
  { name: 'Physical Education', emoji: '⚽' },
  { name: 'Agriculture', emoji: '🌱' },
  { name: 'Civic Education', emoji: '🏛️' },
];

const classOptions = ['Nursery 1', 'Nursery 2', 'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6', 'JSS 1', 'JSS 2', 'JSS 3'];

const STEPS = ['Bundle Info', 'Subjects', 'Transitions', 'Rules', 'Assign Students', 'Review & Publish'];

/* ── Step indicator ─────────────────────────────────────────── */
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-1">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
              style={{ background: i < current ? '#16A34A' : i === current ? '#B22234' : 'rgba(217,198,178,0.4)', color: i <= current ? '#fff' : '#7A5C3A' }}>
              {i < current ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className="text-xs font-semibold hidden sm:block" style={{ color: i === current ? '#B22234' : i < current ? '#16A34A' : '#B8967A' }}>{label}</span>
          </div>
          {i < STEPS.length - 1 && <div className="w-6 sm:w-10 h-0.5 mx-1 flex-shrink-0" style={{ background: i < current ? '#16A34A' : 'rgba(217,198,178,0.4)' }} />}
        </div>
      ))}
    </div>
  );
}

/* ── Subject card in the list ───────────────────────────────── */
function SubjectCard({ subject, index, total, onMove, onRemove, onEdit }: {
  subject: SubjectEntry;
  index: number;
  total: number;
  onMove: (from: number, dir: -1 | 1) => void;
  onRemove: (id: number) => void;
  onEdit: (id: number, field: string, value: unknown) => void;
}) {
  return (
    <div className="bg-white border border-[rgba(217,198,178,0.5)] p-4" style={{ borderRadius: 16 }}>
      <div className="flex items-center gap-3">
        {/* Reorder */}
        <div className="flex flex-col gap-0.5">
          <button onClick={() => onMove(index, -1)} disabled={index === 0} className="p-1 text-[#B8967A] hover:text-[#8B0000] disabled:opacity-30 transition-colors" style={{ borderRadius: 6 }}>
            <ChevronUp className="w-4 h-4" />
          </button>
          <button onClick={() => onMove(index, 1)} disabled={index === total - 1} className="p-1 text-[#B8967A] hover:text-[#8B0000] disabled:opacity-30 transition-colors" style={{ borderRadius: 6 }}>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Number */}
        <div className="w-8 h-8 flex items-center justify-center font-bold text-white text-sm flex-shrink-0" style={{ background: '#B22234', borderRadius: '50%' }}>
          {index + 1}
        </div>

        {/* Subject info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{subject.emoji}</span>
            <span className="font-semibold text-[#1C0A04]">{subject.name}</span>
          </div>
          {/* Compact fields */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Questions', field: 'questions', value: subject.questions },
              { label: 'Duration (min)', field: 'duration', value: subject.duration },
              { label: 'Total Marks', field: 'totalMarks', value: subject.totalMarks },
              { label: 'Pass Mark', field: 'passmark', value: subject.passmark },
            ].map((f) => (
              <div key={f.field}>
                <label className="block text-[10px] font-bold text-[#B8967A] uppercase tracking-wide mb-1">{f.label}</label>
                <input
                  type="number"
                  value={f.value}
                  onChange={e => onEdit(subject.id, f.field, Number(e.target.value))}
                  className="w-full px-2 py-1.5 text-sm text-[#1C0A04] focus:outline-none"
                  style={{ background: '#F9F5F1', borderRadius: 8, border: '1.5px solid rgba(217,198,178,0.5)' }}
                />
              </div>
            ))}
          </div>
          {/* Toggles */}
          <div className="flex flex-wrap gap-3 mt-2">
            {[
              { label: 'Randomise Questions', field: 'randomizeQuestions', value: subject.randomizeQuestions },
              { label: 'Randomise Options', field: 'randomizeOptions', value: subject.randomizeOptions },
              { label: 'Auto-Submit on Timeout', field: 'autoSubmit', value: subject.autoSubmit },
            ].map((t) => (
              <label key={t.field} className="flex items-center gap-1.5 text-xs text-[#7A5C3A] cursor-pointer">
                <input type="checkbox" checked={t.value} onChange={e => onEdit(subject.id, t.field, e.target.checked)} className="accent-[#B22234]" />
                {t.label}
              </label>
            ))}
          </div>
        </div>

        {/* Remove */}
        <button onClick={() => onRemove(subject.id)} className="p-2 text-[#B8967A] hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0" style={{ borderRadius: 10 }}>
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ── Add Subject Modal ──────────────────────────────────────── */
function AddSubjectModal({ onAdd, onClose, existing }: {
  onAdd: (s: SubjectEntry) => void;
  onClose: () => void;
  existing: string[];
}) {
  const [selected, setSelected] = useState('');
  const available = subjectOptions.filter(s => !existing.includes(s.name));

  const handleAdd = () => {
    const opt = subjectOptions.find(s => s.name === selected);
    if (!opt) return;
    onAdd({ id: Date.now(), name: opt.name, emoji: opt.emoji, questions: 20, duration: 30, totalMarks: 40, passmark: 20, randomizeQuestions: true, randomizeOptions: false, autoSubmit: true });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white w-full max-w-sm p-6 shadow-2xl" style={{ borderRadius: 24 }}>
        <h3 className="font-semibold text-[#1C0A04] text-lg mb-4">Add Subject</h3>
        <div className="space-y-2 mb-5 max-h-64 overflow-y-auto">
          {available.map((s) => (
            <button key={s.name} onClick={() => setSelected(s.name)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-left transition-all"
              style={{ borderRadius: 12, background: selected === s.name ? 'rgba(178,34,52,0.08)' : 'rgba(217,198,178,0.12)', border: `1.5px solid ${selected === s.name ? '#B22234' : 'transparent'}`, color: '#1C0A04' }}>
              <span className="text-xl">{s.emoji}</span>{s.name}
            </button>
          ))}
          {available.length === 0 && <p className="text-[#7A5C3A] text-sm text-center py-4">All subjects already added</p>}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 text-sm font-semibold transition-all" style={{ border: '1.5px solid rgba(217,198,178,0.5)', borderRadius: 999, color: '#7A5C3A' }}>Cancel</button>
          <button onClick={handleAdd} disabled={!selected} className="flex-1 py-3 text-sm font-semibold text-white disabled:opacity-50 transition-all" style={{ background: '#B22234', borderRadius: 999 }}>Add Subject</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CREATE BUNDLE WIZARD
══════════════════════════════════════════════════════════════ */
export function CreateBundleWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [showAddSubject, setShowAddSubject] = useState(false);

  // Step 1 — Bundle Info
  const [info, setInfo] = useState({
    name: '',
    class: '',
    session: '2025/2026',
    term: 'Second Term',
    description: '',
    date: '',
    time: '09:00',
    status: 'draft' as 'draft' | 'scheduled' | 'published',
  });

  // Step 2 — Subjects
  const [subjects, setSubjects] = useState<SubjectEntry[]>([
    { id: 1, name: 'English Language', emoji: '📘', questions: 20, duration: 30, totalMarks: 40, passmark: 20, randomizeQuestions: true, randomizeOptions: false, autoSubmit: true },
    { id: 2, name: 'Mathematics', emoji: '➕', questions: 20, duration: 30, totalMarks: 40, passmark: 20, randomizeQuestions: true, randomizeOptions: false, autoSubmit: true },
  ]);

  // Step 3 — Transitions
  const [transitions, setTransitions] = useState({
    mode: 'manual' as 'manual' | 'auto',
    autoCountdown: 10,
    breakEnabled: true,
    breakDuration: 5,
    allowSkipBreak: true,
    autoStartAfterBreak: false,
  });

  // Step 4 — Rules
  const [rules, setRules] = useState({
    canReturnToCompleted: false,
    canPause: false,
    resumeAfterLoss: true,
    requireSameDevice: false,
    allowLateStart: true,
    lateStartWindow: 15,
    autoSubmitFinal: true,
  });

  // Step 5 — Students
  const [assignedClasses] = useState([
    { name: 'Primary 5A', students: 32, selected: true },
    { name: 'Primary 5B', students: 30, selected: true },
    { name: 'Primary 5C', students: 28, selected: false },
  ]);

  const totalAssigned = assignedClasses.filter(c => c.selected).reduce((s, c) => s + c.students, 0);
  const totalMins = subjects.reduce((s, sub) => s + sub.duration, 0);
  const durationLabel = totalMins >= 60 ? `${Math.floor(totalMins / 60)}h ${totalMins % 60 > 0 ? `${totalMins % 60}m` : ''}` : `${totalMins}m`;

  // Subject manipulation
  const moveSubject = (from: number, dir: -1 | 1) => {
    const arr = [...subjects];
    const to = from + dir;
    if (to < 0 || to >= arr.length) return;
    [arr[from], arr[to]] = [arr[to], arr[from]];
    setSubjects(arr);
  };
  const removeSubject = (id: number) => setSubjects(prev => prev.filter(s => s.id !== id));
  const editSubject = (id: number, field: string, value: unknown) => setSubjects(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  const addSubject = (s: SubjectEntry) => setSubjects(prev => [...prev, s]);

  const inputClass = "w-full px-4 py-3 text-sm text-[#1C0A04] focus:outline-none transition-all";
  const inputStyle = { background: '#fff', border: '1.5px solid rgba(217,198,178,0.6)', borderRadius: 12 };
  const labelClass = "block text-xs font-bold text-[#7A5C3A] uppercase tracking-widest mb-1.5";
  const toggleRow = (label: string, value: boolean, onChange: (v: boolean) => void, desc?: string) => (
    <div className="flex items-start justify-between gap-4 py-3" style={{ borderBottom: '1px solid rgba(217,198,178,0.2)' }}>
      <div>
        <div className="text-sm font-semibold text-[#1C0A04]">{label}</div>
        {desc && <div className="text-xs text-[#B8967A] mt-0.5">{desc}</div>}
      </div>
      <button onClick={() => onChange(!value)} className="relative w-12 h-6 flex-shrink-0 transition-all" style={{ borderRadius: 999, background: value ? '#B22234' : '#D9C6B2' }}>
        <div className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all" style={{ left: value ? 'calc(100% - 20px)' : '4px' }} />
      </button>
    </div>
  );

  const canNext = [
    info.name && info.class && info.date,
    subjects.length >= 1,
    true,
    true,
    totalAssigned > 0,
  ][step] ?? true;

  return (
    <>
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <div className="mb-6">
          <Link href="/admin/exams" className="text-sm text-[#7A5C3A] hover:text-[#8B0000] transition-colors font-medium flex items-center gap-1">
            ← Back to Examinations
          </Link>
        </div>

        <StepIndicator current={step} />

        {/* ── STEP 0 — Bundle Info ────────────────────── */}
        {step === 0 && (
          <div className="bg-white p-6 shadow-sm" style={{ borderRadius: 24 }}>
            <h2 className="font-semibold text-[#1C0A04] text-xl mb-6">Bundle Information</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className={labelClass}>Exam Bundle Name *</label>
                <input type="text" value={info.name} onChange={e => setInfo({ ...info, name: e.target.value })} className={inputClass} style={inputStyle} placeholder="e.g. 2026 First Term Examination" />
              </div>
              <div>
                <label className={labelClass}>Class *</label>
                <select value={info.class} onChange={e => setInfo({ ...info, class: e.target.value })} className={inputClass} style={inputStyle}>
                  <option value="">Select class...</option>
                  {classOptions.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Academic Session</label>
                <input type="text" value={info.session} onChange={e => setInfo({ ...info, session: e.target.value })} className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className={labelClass}>Term</label>
                <select value={info.term} onChange={e => setInfo({ ...info, term: e.target.value })} className={inputClass} style={inputStyle}>
                  {['First Term', 'Second Term', 'Third Term'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Bundle Status</label>
                <select value={info.status} onChange={e => setInfo({ ...info, status: e.target.value as typeof info.status })} className={inputClass} style={inputStyle}>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Exam Date *</label>
                <input type="date" value={info.date} onChange={e => setInfo({ ...info, date: e.target.value })} className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className={labelClass}>Start Time</label>
                <input type="time" value={info.time} onChange={e => setInfo({ ...info, time: e.target.value })} className={inputClass} style={inputStyle} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea value={info.description} onChange={e => setInfo({ ...info, description: e.target.value })} rows={3} className={inputClass} style={inputStyle} placeholder="Optional description for this exam bundle..." />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 1 — Subjects ──────────────────────── */}
        {step === 1 && (
          <div>
            <div className="bg-white p-6 shadow-sm mb-4" style={{ borderRadius: 24 }}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-[#1C0A04] text-xl">Subjects</h2>
                <button onClick={() => setShowAddSubject(true)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-md" style={{ background: '#B22234', borderRadius: 999 }}>
                  <Plus className="w-4 h-4" /> Add Subject
                </button>
              </div>
              <p className="text-[#7A5C3A] text-sm mb-5">Students will take subjects in the order shown below. Drag or use arrows to reorder.</p>

              {subjects.length === 0 ? (
                <div className="text-center py-12 text-[#B8967A]">
                  <div className="text-4xl mb-2">📚</div>
                  <p className="text-sm">No subjects added yet. Click "Add Subject" to begin.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {subjects.map((s, i) => (
                    <SubjectCard key={s.id} subject={s} index={i} total={subjects.length} onMove={moveSubject} onRemove={removeSubject} onEdit={editSubject} />
                  ))}
                </div>
              )}
            </div>

            {/* Journey preview */}
            {subjects.length > 0 && (
              <div className="bg-white p-5 shadow-sm" style={{ borderRadius: 20 }}>
                <div className="text-xs font-bold text-[#7A5C3A] uppercase tracking-widest mb-3">Student Journey Preview</div>
                <div className="flex items-center gap-2 flex-wrap">
                  {subjects.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold" style={{ background: 'rgba(178,34,52,0.08)', borderRadius: 10, color: '#8B0000' }}>
                        <span>{s.emoji}</span>{s.name.split(' ')[0]}
                      </div>
                      {i < subjects.length - 1 && <span className="text-[#B8967A]">→</span>}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#B8967A] mt-2">Students will complete subjects in this order.</p>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2 — Transitions ───────────────────── */}
        {step === 2 && (
          <div className="bg-white p-6 shadow-sm" style={{ borderRadius: 24 }}>
            <h2 className="font-semibold text-[#1C0A04] text-xl mb-6">Transition Settings</h2>

            <div className="mb-6">
              <label className={labelClass}>Progression Mode</label>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { value: 'manual', label: 'Student manually continues', desc: 'Student clicks "Continue" to move to next subject', emoji: '👆' },
                  { value: 'auto', label: 'Automatically start next', desc: 'System automatically advances after a countdown', emoji: '⚡' },
                ].map((opt) => (
                  <button key={opt.value} onClick={() => setTransitions({ ...transitions, mode: opt.value as 'manual' | 'auto' })}
                    className="text-left p-4 transition-all"
                    style={{ borderRadius: 14, border: `2px solid ${transitions.mode === opt.value ? '#B22234' : 'rgba(217,198,178,0.5)'}`, background: transitions.mode === opt.value ? 'rgba(178,34,52,0.04)' : '#fff' }}>
                    <div className="text-2xl mb-1">{opt.emoji}</div>
                    <div className="text-sm font-bold text-[#1C0A04]">{opt.label}</div>
                    <div className="text-xs text-[#B8967A] mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {transitions.mode === 'auto' && (
              <div className="mb-6">
                <label className={labelClass}>Countdown Before Next Subject (seconds)</label>
                <select value={transitions.autoCountdown} onChange={e => setTransitions({ ...transitions, autoCountdown: Number(e.target.value) })} className={inputClass} style={inputStyle}>
                  {[5, 10, 15, 30, 60].map(v => <option key={v} value={v}>{v} seconds</option>)}
                </select>
              </div>
            )}

            <div className="mb-4">
              {toggleRow('Allow Break Between Subjects', transitions.breakEnabled, v => setTransitions({ ...transitions, breakEnabled: v }), 'Gives students a short rest between each subject')}
            </div>

            {transitions.breakEnabled && (
              <div className="ml-6 space-y-4 mt-4">
                <div>
                  <label className={labelClass}>Break Duration (minutes)</label>
                  <select value={transitions.breakDuration} onChange={e => setTransitions({ ...transitions, breakDuration: Number(e.target.value) })} className={inputClass} style={inputStyle}>
                    {[3, 5, 10, 15, 20].map(v => <option key={v} value={v}>{v} minutes</option>)}
                  </select>
                </div>
                {toggleRow('Allow Student to Skip Break', transitions.allowSkipBreak, v => setTransitions({ ...transitions, allowSkipBreak: v }))}
                {toggleRow('Auto-Start Next Subject When Break Ends', transitions.autoStartAfterBreak, v => setTransitions({ ...transitions, autoStartAfterBreak: v }))}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3 — Rules ─────────────────────────── */}
        {step === 3 && (
          <div className="bg-white p-6 shadow-sm" style={{ borderRadius: 24 }}>
            <h2 className="font-semibold text-[#1C0A04] text-xl mb-6">Bundle Rules</h2>
            <div className="space-y-0">
              {toggleRow('Allow Students to Return to Completed Subjects', rules.canReturnToCompleted, v => setRules({ ...rules, canReturnToCompleted: v }), 'Recommended: OFF — prevents post-submission editing')}
              {toggleRow('Allow Students to Pause the Entire Exam', rules.canPause, v => setRules({ ...rules, canPause: v }))}
              {toggleRow('Resume After Connection Loss', rules.resumeAfterLoss, v => setRules({ ...rules, resumeAfterLoss: v }), 'Answers are preserved if student gets disconnected')}
              {toggleRow('Require Same Device for Resume', rules.requireSameDevice, v => setRules({ ...rules, requireSameDevice: v }))}
              {toggleRow('Allow Late Start', rules.allowLateStart, v => setRules({ ...rules, allowLateStart: v }), 'Students can join after the exam start time')}
              {rules.allowLateStart && (
                <div className="ml-4 py-3">
                  <label className={labelClass}>Late Start Window (minutes)</label>
                  <select value={rules.lateStartWindow} onChange={e => setRules({ ...rules, lateStartWindow: Number(e.target.value) })} className={inputClass} style={inputStyle}>
                    {[5, 10, 15, 20, 30].map(v => <option key={v} value={v}>{v} minutes</option>)}
                  </select>
                </div>
              )}
              {toggleRow('Auto-Submit Final Subject When Bundle Time Expires', rules.autoSubmitFinal, v => setRules({ ...rules, autoSubmitFinal: v }))}
            </div>
          </div>
        )}

        {/* ── STEP 4 — Assign Students ───────────────── */}
        {step === 4 && (
          <div className="bg-white p-6 shadow-sm" style={{ borderRadius: 24 }}>
            <h2 className="font-semibold text-[#1C0A04] text-xl mb-2">Assign Students</h2>
            <p className="text-[#7A5C3A] text-sm mb-6">Select which classes will take this exam bundle.</p>
            <div className="space-y-3 mb-6">
              {assignedClasses.map((cls, i) => (
                <div key={i} className="flex items-center justify-between p-4" style={{ borderRadius: 16, border: `2px solid ${cls.selected ? '#B22234' : 'rgba(217,198,178,0.5)'}`, background: cls.selected ? 'rgba(178,34,52,0.04)' : '#fff' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center font-bold text-white text-sm" style={{ background: cls.selected ? '#B22234' : '#D9C6B2', borderRadius: 10 }}>
                      {cls.name.split(' ').map(w => w[0]).join('')}
                    </div>
                    <div>
                      <div className="font-semibold text-[#1C0A04] text-sm">{cls.name}</div>
                      <div className="text-xs text-[#7A5C3A]">{cls.students} students</div>
                    </div>
                  </div>
                  <div className="w-6 h-6 flex items-center justify-center" style={{ background: cls.selected ? '#B22234' : '#fff', border: `2px solid ${cls.selected ? '#B22234' : '#D9C6B2'}`, borderRadius: 6 }}>
                    {cls.selected && <Check className="w-4 h-4 text-white" />}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 text-center" style={{ background: 'rgba(178,34,52,0.06)', borderRadius: 16, border: '1.5px solid rgba(178,34,52,0.15)' }}>
              <div className="font-bold text-[#B22234] text-2xl">{totalAssigned}</div>
              <div className="text-xs text-[#7A5C3A] font-semibold uppercase tracking-wide">Total Students Assigned</div>
            </div>
          </div>
        )}

        {/* ── STEP 5 — Review & Publish ──────────────── */}
        {step === 5 && (
          <div className="bg-white p-6 shadow-sm" style={{ borderRadius: 24 }}>
            <h2 className="font-semibold text-[#1C0A04] text-xl mb-6">Review & Publish</h2>

            <div className="space-y-4">
              {/* Summary */}
              <div className="p-5" style={{ background: '#F9F5F1', borderRadius: 16 }}>
                <div className="grid sm:grid-cols-2 gap-y-3 gap-x-8 text-sm">
                  {[
                    ['Exam Name', info.name || '—'],
                    ['Class', info.class || '—'],
                    ['Session / Term', `${info.session} · ${info.term}`],
                    ['Date & Time', `${info.date || '—'} at ${info.time}`],
                    ['Subjects', `${subjects.length}`],
                    ['Total Questions', String(subjects.reduce((s, sub) => s + sub.questions, 0))],
                    ['Estimated Duration', durationLabel],
                    ['Students Assigned', String(totalAssigned)],
                    ['Transition', transitions.mode === 'auto' ? `Auto (${transitions.autoCountdown}s)` : 'Manual'],
                    ['Break Between Subjects', transitions.breakEnabled ? `Yes (${transitions.breakDuration} min)` : 'No'],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <span className="text-[#B8967A] font-medium">{label}: </span>
                      <span className="text-[#1C0A04] font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subject sequence */}
              <div>
                <div className="text-xs font-bold text-[#7A5C3A] uppercase tracking-widest mb-3">Subject Sequence</div>
                <div className="space-y-2">
                  {subjects.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ background: 'rgba(217,198,178,0.15)', borderRadius: 12 }}>
                      <span className="w-6 h-6 flex items-center justify-center text-xs font-bold text-white" style={{ background: '#B22234', borderRadius: '50%' }}>{i + 1}</span>
                      <span className="text-lg">{s.emoji}</span>
                      <span className="font-semibold text-[#1C0A04] text-sm flex-1">{s.name}</span>
                      <span className="text-xs text-[#7A5C3A]">{s.duration} min · {s.questions} Qs</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Publish actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button onClick={() => router.push('/admin/exams')} className="flex-1 py-3.5 text-sm font-semibold transition-all" style={{ border: '1.5px solid rgba(217,198,178,0.5)', borderRadius: 999, color: '#7A5C3A' }}>
                💾 Save Draft
              </button>
              <button className="flex-1 py-3.5 text-sm font-semibold transition-all" style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB', borderRadius: 999 }}>
                👁 Preview Student View
              </button>
              <button onClick={() => router.push('/admin/exams')} className="flex-1 py-3.5 text-sm font-bold text-white transition-all hover:shadow-lg" style={{ background: '#B22234', borderRadius: 999, boxShadow: '0 4px 14px rgba(178,34,52,0.3)' }}>
                🚀 Publish Exam
              </button>
            </div>
          </div>
        )}

        {/* ── Navigation ─────────────────────────────── */}
        <div className="flex justify-between mt-6">
          <button onClick={() => step === 0 ? router.push('/admin/exams') : setStep(s => s - 1)}
            className="px-6 py-3 text-sm font-semibold transition-all" style={{ border: '1.5px solid rgba(217,198,178,0.5)', borderRadius: 999, color: '#7A5C3A' }}>
            {step === 0 ? '← Cancel' : '← Back'}
          </button>
          {step < STEPS.length - 1 && (
            <button onClick={() => setStep(s => s + 1)} disabled={!canNext}
              className="px-8 py-3 text-sm font-bold text-white disabled:opacity-50 transition-all hover:shadow-lg"
              style={{ background: '#B22234', borderRadius: 999, boxShadow: '0 4px 14px rgba(178,34,52,0.3)' }}>
              Next →
            </button>
          )}
        </div>
      </div>

      {showAddSubject && <AddSubjectModal onAdd={addSubject} onClose={() => setShowAddSubject(false)} existing={subjects.map(s => s.name)} />}
    </>
  );
}
