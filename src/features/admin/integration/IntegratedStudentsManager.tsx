"use client"

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react"
import { AlertTriangle, ChevronLeft, ChevronRight, KeyRound, LoaderCircle, Plus, Search, ShieldCheck, Trash2, Upload, X } from "lucide-react"
import { bffClient } from "@/lib/api/bffClient"

interface Student { id: string; full_name: string; student_id: string; email?: string | null; is_active: boolean; class_level?: { id: number; name: string; code: string } | null; class_section?: { name: string; code: string } | null }
interface PageData { students: Student[]; pagination?: { page: number; limit: number; total: number; totalPages?: number; total_pages?: number } }
interface Level { id: number; name: string; code: string; sections?: Array<{ id: number; name: string; code: string }> }

export function IntegratedStudentsManager() {
  const [data, setData] = useState<PageData>({ students: [] })
  const [levels, setLevels] = useState<Level[]>([])
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [credentials, setCredentials] = useState<{ student_id: string; temp_password: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const load = useCallback(async () => {
    setLoading(true); setError("")
    try { setData(await bffClient.action<PageData>("admin-students-list", { params: { page, limit: 20, search, status } })) }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Students could not be loaded.") }
    finally { setLoading(false) }
  }, [page, search, status])
  useEffect(() => { const timer = window.setTimeout(() => void load(), 250); return () => window.clearTimeout(timer) }, [load])
  useEffect(() => { void bffClient.action<{ levels?: Level[]; classLevels?: Level[] }>("admin-class-levels").then((value) => setLevels(value.levels ?? value.classLevels ?? [])).catch(() => undefined) }, [])

  const create = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (saving) return
    const form = new FormData(event.currentTarget); const fullName = String(form.get("full_name") || "").trim(); const level = Number(form.get("class_level_id"))
    if (!fullName || !Number.isInteger(level) || level < 1) { setError("Name and class level are required."); return }
    setSaving(true); setError("")
    try {
      const result = await bffClient.action<{ credentials: { student_id: string; temp_password: string } }>("admin-student-create", { payload: { full_name: fullName, email: String(form.get("email") || "").trim() || null, class_level_id: level, class_section_id: Number(form.get("class_section_id")) || null } })
      setCredentials(result.credentials); setShowCreate(false); setNotice("Student created. Copy the one-time credentials now."); await load()
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Student creation failed.") }
    finally { setSaving(false) }
  }
  const mutate = async (action: string, student: Student, payload?: unknown) => {
    setError(""); setNotice("")
    try {
      const result = await bffClient.action<{ temp_password?: string }>(action, { params: { studentId: student.id }, payload })
      if (result.temp_password) { setCredentials({ student_id: student.student_id, temp_password: result.temp_password }); setNotice("Password reset confirmed. Copy the one-time password now.") }
      else setNotice("The server confirmed the account update.")
      await load()
    } catch (reason) { setError(reason instanceof Error ? reason.message : "The account was not updated.") }
  }
  const importCsv = async (file?: File) => {
    if (!file) return
    const form = new FormData(); form.set("csv_file", file); setNotice(""); setError("")
    try { const result = await bffClient.upload<{ successCount?: number; errorCount?: number; errors?: unknown[] }>("students-csv", form); setNotice(`Import confirmed: ${result.successCount ?? 0} succeeded, ${result.errorCount ?? 0} failed.`); await load() }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Import failed.") }
    finally { if (fileRef.current) fileRef.current.value = "" }
  }
  const totalPages = data.pagination?.totalPages ?? data.pagination?.total_pages ?? 1
  return <div className="space-y-5"><div className="flex flex-col gap-3 lg:flex-row"><label className="relative flex-1"><span className="sr-only">Search students</span><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search name, student ID or email" className="min-h-12 w-full rounded-xl border border-[#D9C6B2] bg-white pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#B22234]/25" /></label><select aria-label="Filter by status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }} className="min-h-12 rounded-xl border border-[#D9C6B2] bg-white px-4 text-sm"><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select><input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => void importCsv(event.target.files?.[0])} /><button type="button" onClick={() => fileRef.current?.click()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#D9C6B2] bg-white px-4 text-sm font-bold"><Upload className="h-4 w-4" /> Import CSV</button><button type="button" onClick={() => setShowCreate(true)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#B22234] px-5 text-sm font-bold text-white"><Plus className="h-4 w-4" /> Add student</button></div>
    {notice ? <div role="status" className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><ShieldCheck className="h-5 w-5 shrink-0" />{notice}</div> : null}{error ? <div role="alert" className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"><AlertTriangle className="h-5 w-5 shrink-0" />{error}</div> : null}{credentials ? <div role="status" className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"><div className="flex justify-between gap-4"><div><p className="font-bold">One-time credentials</p><p className="mt-2 font-mono">ID: {credentials.student_id}</p><p className="font-mono">Password: {credentials.temp_password}</p><p className="mt-2 text-xs">This password is not stored in the browser. Copy it before dismissing.</p></div><button type="button" onClick={() => setCredentials(null)} aria-label="Dismiss credentials"><X className="h-5 w-5" /></button></div></div> : null}
    <div className="overflow-hidden rounded-3xl border border-[#E8D9CB] bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[760px]"><thead><tr className="border-b border-[#EEE3D8] text-left text-xs uppercase tracking-wider text-gray-500"><th className="px-5 py-4">Student</th><th className="px-4 py-4">ID</th><th className="px-4 py-4">Class</th><th className="px-4 py-4">Status</th><th className="px-5 py-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-gray-100">{loading ? <tr><td colSpan={5} className="p-10 text-center"><LoaderCircle className="mx-auto h-6 w-6 animate-spin text-[#B22234]" /></td></tr> : data.students.length === 0 ? <tr><td colSpan={5} className="p-10 text-center text-sm text-gray-500">No students match these filters.</td></tr> : data.students.map((student) => <tr key={student.id} className="hover:bg-[#FFFDF9]"><td className="px-5 py-4"><p className="font-bold">{student.full_name}</p><p className="text-xs text-gray-500">{student.email || "No reference email"}</p></td><td className="px-4 py-4 font-mono text-xs">{student.student_id}</td><td className="px-4 py-4 text-sm">{student.class_level?.name || "Unassigned"}{student.class_section ? ` · ${student.class_section.name}` : ""}</td><td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${student.is_active ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}`}>{student.is_active ? "Active" : "Inactive"}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-1"><button type="button" title={student.is_active ? "Deactivate" : "Activate"} onClick={() => void mutate("admin-student-status", student, { is_active: !student.is_active })} className="rounded-lg p-2 text-gray-500 hover:bg-emerald-50 hover:text-emerald-700"><ShieldCheck className="h-4 w-4" /></button><button type="button" title="Reset password" onClick={() => { if (window.confirm(`Reset the password for ${student.full_name}?`)) void mutate("admin-student-reset-password", student) }} className="rounded-lg p-2 text-gray-500 hover:bg-amber-50 hover:text-amber-700"><KeyRound className="h-4 w-4" /></button><button type="button" title="Delete student" onClick={() => { if (window.confirm(`Permanently delete ${student.full_name}? The server may reject deletion when records must be preserved.`)) void mutate("admin-student-delete", student) }} className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-700"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div><div className="flex items-center justify-between border-t border-[#EEE3D8] px-5 py-4"><p className="text-sm text-gray-500">{data.pagination?.total ?? data.students.length} students</p><div className="flex items-center gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-xl border p-2 disabled:opacity-40" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button><span className="text-sm font-bold">{page} / {Math.max(1, totalPages)}</span><button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-xl border p-2 disabled:opacity-40" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button></div></div></div>
    {showCreate ? <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"><form onSubmit={create} className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Create student</h2><button type="button" onClick={() => setShowCreate(false)} aria-label="Close"><X /></button></div><div className="mt-6 space-y-4"><label className="block text-sm font-bold">Full name<input name="full_name" required className="mt-2 min-h-11 w-full rounded-xl border border-[#D9C6B2] px-3 font-normal" /></label><label className="block text-sm font-bold">Reference email (optional)<input name="email" type="email" className="mt-2 min-h-11 w-full rounded-xl border border-[#D9C6B2] px-3 font-normal" /></label><label className="block text-sm font-bold">Class level<select name="class_level_id" required className="mt-2 min-h-11 w-full rounded-xl border border-[#D9C6B2] bg-white px-3 font-normal"><option value="">Select class</option>{levels.map((level) => <option key={level.id} value={level.id}>{level.name} ({level.code})</option>)}</select></label></div><div className="mt-7 flex gap-3"><button type="button" onClick={() => setShowCreate(false)} className="min-h-11 flex-1 rounded-full border font-bold">Cancel</button><button type="submit" disabled={saving} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#B22234] font-bold text-white disabled:opacity-50">{saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null} Create</button></div></form></div> : null}</div>
}
