"use client"

/**
 * Class management in the admin design (Stage 11). Besides school classes (SS1–SS3), the
 * school runs lesson classes such as JAMB, WAEC and NECO; students, exams and bundles are
 * assigned to these classes. Codes are permanent because student IDs are built from them
 * ("JAMB-4821"); names can change and classes can be deactivated (never deleted, so the
 * history of students and results stays intact).
 */

import { useCallback, useEffect, useState } from "react"
import { AlertTriangle, CheckCircle2, GraduationCap, LoaderCircle, Pencil, Plus, Power, BookOpenCheck } from "lucide-react"
import { bffClient } from "@/lib/api/bffClient"

interface Level { id: number; code: string; name: string; stage: string; sort_order: number; is_active: boolean }

const STAGES = [
  { value: "secondary", label: "School class", hint: "e.g. SS1, JSS2", icon: GraduationCap },
  { value: "lessons", label: "Lesson class", hint: "e.g. JAMB, WAEC, NECO", icon: BookOpenCheck },
] as const
const suggestCode = (name: string) => name.trim().split(/\s+/)[0]?.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 12) ?? ""
const errorText = (reason: unknown, fallback: string) => (reason instanceof Error && reason.message ? reason.message : fallback)

export function ClassesManager() {
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [busy, setBusy] = useState<number | null>(null)
  const [editing, setEditing] = useState<Level | "new" | null>(null)

  const load = useCallback(async () => {
    try {
      const result = await bffClient.action<{ levels?: Level[] }>("admin-class-levels")
      setLevels([...(result.levels ?? [])].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)))
      setError("")
    } catch (reason) { setError(errorText(reason, "Classes could not be loaded.")) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => {
    const timer = window.setTimeout(() => { void load() }, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const toggleActive = async (level: Level) => {
    if (level.is_active && !window.confirm(`Deactivate ${level.name}? It disappears from class lists for new students, exams and admissions. Existing students and results are kept.`)) return
    setBusy(level.id); setError(""); setNotice("")
    try {
      await bffClient.action("admin-class-level-update", { params: { levelId: level.id }, payload: { is_active: !level.is_active } })
      setNotice(`${level.name} ${level.is_active ? "deactivated" : "activated"}.`)
      await load()
    } catch (reason) { setError(errorText(reason, "The class could not be updated.")) }
    finally { setBusy(null) }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <p className="text-sm text-gray-500 max-w-xl">Classes are used for students, exams, bundles and the admission form. Lesson classes (JAMB, WAEC, NECO…) work exactly like school classes.</p>
        <button onClick={() => setEditing("new")} className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#B22234] text-white text-sm font-medium hover:bg-[#8B0000] transition-colors shadow-md">
          <Plus className="w-4 h-4" /> Add Class
        </button>
      </div>

      {error ? <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}</div> : null}
      {notice ? <div role="status" className="mb-4 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> {notice}</div> : null}

      {loading ? (
        <div className="bg-white rounded-3xl shadow-sm p-12 text-center text-sm text-gray-500"><LoaderCircle className="mx-auto mb-2 w-6 h-6 animate-spin text-[#B22234]" /> Loading classes…</div>
      ) : (
        <div className="space-y-6">
          {STAGES.map((stage) => {
            const group = levels.filter((level) => (stage.value === "secondary" ? level.stage !== "lessons" : level.stage === "lessons"))
            return (
              <section key={stage.value} className="bg-white rounded-3xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                  <stage.icon className="w-5 h-5 text-[#B22234]" />
                  <h2 className="font-heading font-700 text-gray-900">{stage.label}es</h2>
                  <span className="text-xs text-gray-400">{group.length}</span>
                </div>
                {group.length === 0 ? (
                  <p className="px-5 py-8 text-center text-sm text-gray-500">No {stage.label.toLowerCase()}es yet ({stage.hint}).</p>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {group.map((level) => (
                      <div key={level.id} className={`flex items-center gap-4 px-5 py-4 hover:bg-[#F9F5F1] ${level.is_active ? "" : "opacity-60"}`}>
                        <div className="w-12 h-10 rounded-xl bg-[#B22234] flex items-center justify-center font-mono font-semibold text-white text-xs flex-shrink-0">{level.code}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm truncate">{level.name}</div>
                          <div className="text-xs text-gray-400">Student IDs: {level.code}-1234</div>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${level.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{level.is_active ? "● Active" : "○ Inactive"}</span>
                        <button onClick={() => setEditing(level)} title="Rename" className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => void toggleActive(level)} disabled={busy !== null} title={level.is_active ? "Deactivate" : "Activate"} className="p-2 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 disabled:opacity-50">
                          {busy === level.id ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}

      {editing ? (
        <ClassModal
          level={editing === "new" ? null : editing}
          nextOrder={(levels.at(-1)?.sort_order ?? 0) + 10}
          onClose={() => setEditing(null)}
          onSaved={(message) => { setEditing(null); setNotice(message); void load() }}
        />
      ) : null}
    </>
  )
}

function ClassModal({ level, nextOrder, onClose, onSaved }: { level: Level | null; nextOrder: number; onClose: () => void; onSaved: (message: string) => void }) {
  const [name, setName] = useState(level?.name ?? "")
  const [code, setCode] = useState(level?.code ?? "")
  const [codeTouched, setCodeTouched] = useState(Boolean(level))
  const [stage, setStage] = useState(level?.stage === "lessons" ? "lessons" : "secondary")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const shownCode = codeTouched ? code : suggestCode(name)

  const save = async () => {
    if (!name.trim()) { setError("Enter the class name."); return }
    if (!level && !/^[A-Z0-9][A-Z0-9-]{0,11}$/.test(shownCode)) { setError("The code must be 1–12 letters, digits or hyphens (for example JAMB)."); return }
    setSaving(true); setError("")
    try {
      if (level) {
        await bffClient.action("admin-class-level-update", { params: { levelId: level.id }, payload: { name: name.trim(), stage } })
        onSaved(`${name.trim()} updated.`)
      } else {
        await bffClient.action("admin-class-level-create", { payload: { name: name.trim(), code: shownCode, stage, sort_order: nextOrder } })
        onSaved(`${name.trim()} (${shownCode}) created.`)
      }
    } catch (reason) { setError(errorText(reason, "The class could not be saved.")) }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl p-7 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="font-heading text-xl font-700 text-gray-900 mb-6">{level ? "Edit Class" : "Add New Class"}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Type *</label>
            <div className="grid grid-cols-2 gap-3">
              {STAGES.map((item) => (
                <button key={item.value} type="button" onClick={() => setStage(item.value)} className={`flex items-center gap-2 rounded-xl border-2 px-3 py-3 text-left text-sm ${stage === item.value ? "border-[#B22234] bg-[#B22234]/5 text-[#B22234]" : "border-[#D9C6B2] text-gray-700"}`}>
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span><span className="block font-medium">{item.label}</span><span className="block text-xs text-gray-400">{item.hint}</span></span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Class name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-[#D9C6B2] focus:outline-none focus:ring-2 focus:ring-[#B22234]/30 text-sm" placeholder={stage === "lessons" ? "e.g. JAMB Lessons" : "e.g. Senior Secondary 1"} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Code {level ? "(cannot be changed)" : "*"}</label>
            <input value={shownCode} disabled={Boolean(level)} onChange={(e) => { setCodeTouched(true); setCode(e.target.value.toUpperCase().replace(/\s+/g, "-").slice(0, 12)) }} className="w-full px-3 py-2.5 rounded-xl border border-[#D9C6B2] focus:outline-none focus:ring-2 focus:ring-[#B22234]/30 text-sm font-mono disabled:bg-gray-50 disabled:text-gray-500" placeholder="e.g. JAMB" />
            <p className="mt-1 text-xs text-gray-400">Used in student IDs, e.g. {shownCode || "JAMB"}-4821. Up to 12 letters, digits or hyphens.</p>
          </div>
          {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} disabled={saving} className="flex-1 py-3 border-2 border-[#D9C6B2] text-gray-700 rounded-xl font-medium text-sm hover:border-gray-400 transition-colors">Cancel</button>
          <button onClick={() => void save()} disabled={saving} className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-[#B22234] text-white rounded-xl font-medium text-sm hover:bg-[#8B0000] transition-colors shadow-md disabled:opacity-60">
            {saving ? <LoaderCircle className="w-4 h-4 animate-spin" /> : null} {level ? "Save Changes" : "Create Class"}
          </button>
        </div>
      </div>
    </div>
  )
}
