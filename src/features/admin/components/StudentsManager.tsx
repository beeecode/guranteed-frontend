"use client"

/**
 * Searchable student table with bulk selection and an "Add Student" modal — the designed
 * admin screen, driven by live backend data (Stage 11; fixtures removed).
 *
 * Owner rules (2026-11-24): a student is created from NAME + CLASS only; the server
 * generates the student ID and password, which are shown to the administrator once (copy /
 * print). Passwords are never stored readable — "Reset password" issues a new one.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Search, Plus, Download, Upload, ChevronLeft, ChevronRight, Trash2, KeyRound, Power, Eye,
  LoaderCircle, Copy, Printer, X, AlertTriangle, CheckCircle2,
} from "lucide-react"
import { bffClient } from "@/lib/api/bffClient"
import { StudentDetailsModal } from "./StudentDetailsModal"

interface Level { id: number; name: string; code: string; is_active?: boolean }
interface Student {
  id: string
  full_name: string
  student_id: string
  is_active: boolean
  created_at?: string | null
  class_level?: { id: number; name: string; code: string } | null
  class_section?: { name: string } | null
}
interface PageData { students: Student[]; pagination?: { page: number; limit: number; total: number | null; total_pages: number | null } }
export interface Credential { name: string; student_id: string; temp_password: string }

const PAGE_SIZE = 20
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "?"
const errorText = (reason: unknown, fallback: string) => (reason instanceof Error && reason.message ? reason.message : fallback)
/** CSV cell, protected against spreadsheet formula injection. */
const csvCell = (value: string) => `"${(/^[=+\-@\t\r]/.test(value) ? `'${value}` : value).replace(/"/g, '""')}"`
const downloadCsv = (filename: string, rows: string[][]) => {
  const blob = new Blob([`﻿${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = Object.assign(document.createElement("a"), { href: url, download: filename })
  link.click()
  URL.revokeObjectURL(url)
}
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char] as string))
/** Printable login slips (one per student) for handing out credentials. */
const printSlips = (credentials: Credential[]) => {
  const win = window.open("", "_blank", "width=800,height=900")
  if (!win) return
  const slips = credentials.map((item) => `<div class="slip"><h2>${escapeHtml(item.name)}</h2><p>Student ID: <b>${escapeHtml(item.student_id)}</b></p><p>Password: <b>${escapeHtml(item.temp_password)}</b></p><small>Sign in at the school CBT portal. Keep these details private.</small></div>`).join("")
  win.document.write(`<!doctype html><title>Student login slips</title><style>body{font-family:system-ui,sans-serif;margin:24px}.slip{border:1px dashed #999;border-radius:12px;padding:16px 20px;margin-bottom:14px;break-inside:avoid}h2{margin:0 0 8px;font-size:18px}p{margin:4px 0;font-size:15px}b{font-family:ui-monospace,monospace;font-size:17px}small{color:#666}</style>${slips}<script>window.print()</script>`)
  win.document.close()
}

export function StudentsManager() {
  const [search, setSearch] = useState("")
  const [classFilter, setClassFilter] = useState("")
  const [page, setPage] = useState(1)
  const [data, setData] = useState<PageData>({ students: [] })
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showAddModal, setShowAddModal] = useState(false)
  const [credentials, setCredentials] = useState<{ title: string; items: Credential[] } | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await bffClient.action<PageData>("admin-students-list", { params: { page, limit: PAGE_SIZE, search, class_level_id: classFilter } })
      setData(result); setError("")
    } catch (reason) { setError(errorText(reason, "Students could not be loaded.")) }
    finally { setLoading(false) }
  }, [page, search, classFilter])

  useEffect(() => {
    const timer = window.setTimeout(() => { void load() }, 250)
    return () => window.clearTimeout(timer)
  }, [load])

  useEffect(() => {
    void bffClient.action<{ levels?: Level[] }>("admin-class-levels")
      .then((value) => setLevels((value.levels ?? []).filter((level) => level.is_active !== false)))
      .catch(() => setError("Class levels could not be loaded."))
  }, [])

  const students = data.students
  const total = data.pagination?.total ?? students.length
  const totalPages = Math.max(1, data.pagination?.total_pages ?? 1)

  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }
  const toggleAll = () => setSelected(selected.size === students.length ? new Set() : new Set(students.map((s) => s.id)))

  const run = async (key: string, task: () => Promise<string | void>) => {
    setBusy(key); setError(""); setNotice("")
    try { const message = await task(); if (message) setNotice(message); await load() }
    catch (reason) { setError(errorText(reason, "The action could not be completed.")) }
    finally { setBusy(null) }
  }

  const setStatus = (ids: string[], active: boolean) => run(`status-${active}`, async () => {
    for (const id of ids) await bffClient.action("admin-student-status", { params: { studentId: id }, payload: { is_active: active } })
    setSelected(new Set())
    return `${ids.length} student${ids.length === 1 ? "" : "s"} ${active ? "activated" : "deactivated"}.`
  })

  const deleteSelected = () => {
    if (!window.confirm(`Permanently delete ${selected.size} student account(s)? Students who have exam history may be refused by the server.`)) return
    void run("delete-bulk", async () => {
      await bffClient.action("admin-students-bulk-delete", { payload: { ids: [...selected] } })
      setSelected(new Set())
      return "Selected students deleted."
    })
  }

  const resetPassword = (student: Pick<Student, "id" | "full_name" | "student_id">) => {
    if (!window.confirm(`Generate a new password for ${student.full_name}? The old password stops working.`)) return
    void run(`reset-${student.id}`, async () => {
      const result = await bffClient.action<{ temp_password: string }>("admin-student-reset-password", { params: { studentId: student.id } })
      setCredentials({ title: "New password generated", items: [{ name: student.full_name, student_id: student.student_id, temp_password: result.temp_password }] })
    })
  }

  const deleteOne = (student: Student) => {
    if (!window.confirm(`Permanently delete ${student.full_name}? Students with exam history may be refused by the server.`)) return
    void run(`delete-${student.id}`, async () => {
      await bffClient.action("admin-student-delete", { params: { studentId: student.id } })
      return `${student.full_name} deleted.`
    })
  }

  const importCsv = (file?: File) => {
    if (!file) return
    const form = new FormData()
    form.set("csv_file", file)
    void run("import", async () => {
      const result = await bffClient.upload<{ successCount?: number; credentials?: Credential[] }>("students-csv", form)
      const created = result.credentials ?? []
      if (created.length) setCredentials({ title: `${created.length} student account${created.length === 1 ? "" : "s"} created`, items: created })
      return `Import complete: ${result.successCount ?? created.length} student(s) created.`
    }).finally(() => { if (fileRef.current) fileRef.current.value = "" })
  }

  const exportList = () => void run("export", async () => {
    const all = await bffClient.action<PageData>("admin-students-list", { params: { search, class_level_id: classFilter } })
    downloadCsv("students.csv", [["Name", "Student ID", "Class", "Status"], ...all.students.map((s) => [s.full_name, s.student_id, s.class_level?.name ?? "", s.is_active ? "Active" : "Inactive"])])
    return `Exported ${all.students.length} student(s). Passwords are not included; use Reset password to issue a new one.`
  })

  return (
    <>
      {}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or student ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D9C6B2] focus:outline-none focus:ring-2 focus:ring-[#B22234]/30 text-sm bg-white"
          />
        </div>
        <select
          value={classFilter}
          onChange={(e) => { setClassFilter(e.target.value); setPage(1) }}
          aria-label="Filter by class"
          className="px-4 py-3 rounded-xl border border-[#D9C6B2] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#B22234]/30"
        >
          <option value="">All classes</option>
          {levels.map((level) => <option key={level.id} value={level.id}>{level.name}</option>)}
        </select>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => importCsv(e.target.files?.[0])} />
          <button onClick={() => fileRef.current?.click()} disabled={busy !== null} title="CSV columns: Full Name, Class (class code, e.g. SS1)" className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#D9C6B2] text-sm bg-white text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
            {busy === "import" ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Import
          </button>
          <button onClick={exportList} disabled={busy !== null} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#D9C6B2] text-sm bg-white text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
            {busy === "export" ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#B22234] text-white text-sm font-medium hover:bg-[#8B0000] transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

      {busy === "import" ? (
        <div className="mb-4 rounded-xl border border-[#D9C6B2] bg-white px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700"><LoaderCircle className="w-4 h-4 animate-spin text-[#B22234]" /> Uploading and creating student accounts… large files can take a minute. Keep this page open.</div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F1E7DC]"><div className="h-full w-1/3 animate-pulse rounded-full bg-[#B22234]" /></div>
        </div>
      ) : null}
      {error ? <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}</div> : null}
      {notice ? <div role="status" className="mb-4 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> {notice}</div> : null}

      {}
      {selected.size > 0 && (
        <div className="mb-4 bg-[#B22234]/10 border border-[#B22234]/20 rounded-xl px-4 py-3 flex items-center gap-4">
          <span className="text-sm font-medium text-[#B22234]">
            {selected.size} selected
          </span>
          <button disabled={busy !== null} onClick={() => void setStatus([...selected], true)} className="text-sm text-gray-600 hover:text-[#B22234] disabled:opacity-50">
            Activate
          </button>
          <button disabled={busy !== null} onClick={() => void setStatus([...selected], false)} className="text-sm text-gray-600 hover:text-[#B22234] disabled:opacity-50">
            Deactivate
          </button>
          <button disabled={busy !== null} onClick={deleteSelected} className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50">
            Delete Selected
          </button>
          {busy?.startsWith("status") || busy === "delete-bulk" ? <LoaderCircle className="w-4 h-4 animate-spin text-[#B22234]" /> : null}
        </div>
      )}

      {}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-4 text-left">
                  <input
                    type="checkbox"
                    aria-label="Select all students on this page"
                    checked={selected.size === students.length && students.length > 0}
                    onChange={toggleAll}
                    className="w-4 h-4 accent-[#B22234] rounded"
                  />
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Student</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Student ID</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Class</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Added</th>
                <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && students.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-500"><LoaderCircle className="mx-auto mb-2 w-6 h-6 animate-spin text-[#B22234]" /> Loading students…</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-500">{search || classFilter ? "No students match these filters." : "No students yet. Use Add Student or Import."}</td></tr>
              ) : students.map((student) => (
                <tr key={student.id} className={`hover:bg-[#F9F5F1] transition-colors ${loading ? "opacity-60" : ""}`}>
                  <td className="px-5 py-4">
                    <input
                      type="checkbox"
                      aria-label={`Select ${student.full_name}`}
                      checked={selected.has(student.id)}
                      onChange={() => toggleSelect(student.id)}
                      className="w-4 h-4 accent-[#B22234] rounded"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#B22234] flex items-center justify-center font-heading font-600 text-white text-xs flex-shrink-0">
                        {initials(student.full_name)}
                      </div>
                      <button type="button" onClick={() => setViewingId(student.id)} className="font-medium text-gray-900 text-sm text-left hover:text-[#B22234] hover:underline underline-offset-2">{student.full_name}</button>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 font-mono text-xs">{student.student_id}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {student.class_level?.name ?? "Unassigned"}{student.class_section ? ` · ${student.class_section.name}` : ""}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${student.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {student.is_active ? "● Active" : "○ Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-400">
                    {student.created_at ? new Date(student.created_at).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewingId(student.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-[#B22234] hover:bg-red-50 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => void setStatus([student.id], !student.is_active)}
                        disabled={busy !== null}
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
                        title={student.is_active ? "Deactivate" : "Activate"}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => resetPassword(student)}
                        disabled={busy !== null}
                        className="p-2 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-colors disabled:opacity-50"
                        title="Reset Password"
                      >
                        {busy === `reset-${student.id}` ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteOne(student)}
                        disabled={busy !== null}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {busy === `delete-${student.id}` ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Showing {students.length} of {total} students
          </span>
          <div className="flex items-center gap-2">
            <button aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="p-2 rounded-xl border border-[#D9C6B2] text-gray-500 hover:border-[#B22234] hover:text-[#B22234] transition-colors disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="min-w-9 h-9 px-2 rounded-xl bg-[#B22234] text-white flex items-center justify-center text-sm font-medium">
              {page} / {totalPages}
            </span>
            <button aria-label="Next page" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="p-2 rounded-xl border border-[#D9C6B2] text-gray-500 hover:border-[#B22234] hover:text-[#B22234] transition-colors disabled:opacity-40">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddStudentModal
          levels={levels}
          onClose={() => setShowAddModal(false)}
          onCreated={(credential) => { setShowAddModal(false); setCredentials({ title: "Student account created", items: [credential] }); void load() }}
        />
      )}

      {viewingId ? (
        <StudentDetailsModal
          studentId={viewingId}
          levels={levels}
          onClose={() => setViewingId(null)}
          onChanged={() => void load()}
          onNewPassword={resetPassword}
        />
      ) : null}

      {credentials && <CredentialsModal title={credentials.title} items={credentials.items} onClose={() => setCredentials(null)} />}
    </>
  )
}

function AddStudentModal({ levels, onClose, onCreated }: { levels: Level[]; onClose: () => void; onCreated: (credential: Credential) => void }) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [levelId, setLevelId] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const save = async () => {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()
    if (!firstName.trim() || !lastName.trim() || !levelId) { setError("Enter the student's first name, last name and class."); return }
    setSaving(true); setError("")
    try {
      const result = await bffClient.action<{ credentials: { student_id: string; temp_password: string } }>("admin-student-create", { payload: { full_name: fullName, class_level_id: Number(levelId) } })
      onCreated({ name: fullName, ...result.credentials })
    } catch (reason) { setError(errorText(reason, "The student could not be created.")) }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl p-7 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="font-heading text-xl font-700 text-gray-900 mb-2">Add New Student</h2>
        <p className="text-xs text-gray-500 mb-6">The student ID and password are generated automatically and shown after saving.</p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">First Name *</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-[#D9C6B2] focus:outline-none focus:ring-2 focus:ring-[#B22234]/30 text-sm" placeholder="First name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Last Name *</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-[#D9C6B2] focus:outline-none focus:ring-2 focus:ring-[#B22234]/30 text-sm" placeholder="Last name" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Class *</label>
            <select value={levelId} onChange={(e) => setLevelId(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-[#D9C6B2] bg-white focus:outline-none text-sm">
              <option value="">Select class</option>
              {levels.map((level) => <option key={level.id} value={level.id}>{level.name}</option>)}
            </select>
          </div>
          {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} disabled={saving} className="flex-1 py-3 border-2 border-[#D9C6B2] text-gray-700 rounded-xl font-medium text-sm hover:border-gray-400 transition-colors">Cancel</button>
          <button onClick={() => void save()} disabled={saving} className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-[#B22234] text-white rounded-xl font-medium text-sm hover:bg-[#8B0000] transition-colors shadow-md disabled:opacity-60">
            {saving ? <LoaderCircle className="w-4 h-4 animate-spin" /> : null} {saving ? "Creating…" : "Save Student"}
          </button>
        </div>
      </div>
    </div>
  )
}

/** Shows generated credentials once. They are not stored readable anywhere. */
export function CredentialsModal({ title, items, onClose }: { title: string; items: Credential[]; onClose: () => void }) {
  const [copied, setCopied] = useState("")
  const copy = async (text: string, key: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(key); window.setTimeout(() => setCopied(""), 1500) } catch { /* clipboard blocked: values stay visible */ }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl p-7 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h2 className="font-heading text-xl font-700 text-gray-900">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="p-1 text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
        </div>
        <p className="mb-5 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">Copy, print or download these details now. Passwords are not stored and cannot be shown again; use Reset password to issue a new one.</p>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={`${item.student_id}-${index}`} className="rounded-2xl border border-[#E8D9CB] bg-[#F9F5F1] p-4">
              <div className="font-medium text-gray-900 text-sm mb-2">{item.name}</div>
              <div className="grid grid-cols-2 gap-3">
                {([["Student ID", item.student_id], ["Password", item.temp_password]] as const).map(([label, value]) => (
                  <div key={label}>
                    <div className="text-[10px] uppercase tracking-wide text-gray-500">{label}</div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-semibold text-gray-900 select-all">{value}</span>
                      <button onClick={() => void copy(value, `${index}-${label}`)} title={`Copy ${label}`} className="p-1 text-gray-400 hover:text-[#B22234]">
                        {copied === `${index}-${label}` ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-6">
          <button onClick={() => printSlips(items)} className="flex-1 inline-flex items-center justify-center gap-2 py-3 border-2 border-[#D9C6B2] text-gray-700 rounded-xl font-medium text-sm hover:border-gray-400"><Printer className="w-4 h-4" /> Print slips</button>
          {items.length > 1 ? <button onClick={() => downloadCsv("student-credentials.csv", [["Name", "Student ID", "Password"], ...items.map((item) => [item.name, item.student_id, item.temp_password])])} className="flex-1 inline-flex items-center justify-center gap-2 py-3 border-2 border-[#D9C6B2] text-gray-700 rounded-xl font-medium text-sm hover:border-gray-400"><Download className="w-4 h-4" /> Download CSV</button> : null}
          <button onClick={onClose} className="flex-1 py-3 bg-[#B22234] text-white rounded-xl font-medium text-sm hover:bg-[#8B0000] shadow-md">Done</button>
        </div>
      </div>
    </div>
  )
}
