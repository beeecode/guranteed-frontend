"use client"

/**
 * Admission application — parents register their child (Stage 11, owner requirement
 * 2026-11-24). Designed site form; confirms only after the backend acknowledges.
 *
 * Flow: create the application (reference code + one-time upload key) → upload each
 * chosen document in its own request (keeps every request under the hosting size limit)
 * → confirmation with the reference code. A document that fails can be retried without
 * re-submitting the application.
 *
 * Errors name the field: the same rules as the server are checked first in the browser,
 * and any field the server rejects is marked too. The page scrolls to the first problem.
 */

import { useEffect, useState } from "react"
import { siteInputStyle, siteLabelClassName } from "../components/formStyles"

interface Level { id: number; name: string; code: string; stage?: string }
type DocKind = "birth_certificate" | "passport_photo" | "school_report"
const DOCUMENTS: Array<{ kind: DocKind; label: string; hint: string }> = [
  { kind: "birth_certificate", label: "Birth certificate", hint: "PDF, JPG or PNG" },
  { kind: "passport_photo", label: "Passport photograph", hint: "JPG or PNG" },
  { kind: "school_report", label: "Last school report", hint: "PDF, JPG or PNG" },
]
const MAX_BYTES = 4 * 1024 * 1024
const ALLOWED = /\.(pdf|jpe?g|png|webp)$/i
type UploadState = { status: "waiting" | "uploading" | "done" | "failed"; message?: string }

const inputClass = "w-full px-4 py-3 text-sm focus:outline-none focus:ring-2"
const inputStyle = { ...siteInputStyle, "--tw-ring-color": "#5C1010" } as React.CSSProperties
const errorStyle = { ...inputStyle, borderColor: "#B91C1C", background: "#FEF2F2" } as React.CSSProperties
const sectionTitle = "font-display font-bold text-[#1C0A04] text-xl mb-4 pb-2 border-b border-[rgba(28,10,4,0.08)]"

const EMPTY_FORM = {
  applicant_name: "", date_of_birth: "", gender: "", class_level_id: "", previous_school: "", medical_notes: "",
  full_name: "", guardian_relationship: "", phone: "", email: "", home_address: "", message: "", website: "",
}
type Field = keyof typeof EMPTY_FORM

/** Field names as parents read them (used in the error summary). */
const LABELS: Partial<Record<Field, string>> = {
  applicant_name: "Child's full name", date_of_birth: "Date of birth", gender: "Gender", class_level_id: "Class applying for",
  full_name: "Parent / guardian name", guardian_relationship: "Relationship to the child", phone: "Phone number",
  email: "Email address", home_address: "Home address", previous_school: "Previous school", medical_notes: "Medical information",
}
const ORDER: Field[] = ["applicant_name", "date_of_birth", "gender", "class_level_id", "previous_school", "medical_notes", "full_name", "guardian_relationship", "phone", "email", "home_address", "message"]

/** The server's rules (services/admissionApplicationService.js), checked before sending. */
function validate(form: typeof EMPTY_FORM): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {}
  if (form.applicant_name.trim().length < 2) errors.applicant_name = "Enter the child's full name."
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date_of_birth)) errors.date_of_birth = "Enter the child's date of birth."
  else {
    const age = (Date.now() - Date.parse(`${form.date_of_birth}T00:00:00Z`)) / (365.25 * 24 * 3600 * 1000)
    if (!(age >= 1 && age <= 30)) errors.date_of_birth = "Check the date of birth: the child must be between 1 and 30 years old."
  }
  if (!form.gender) errors.gender = "Choose male or female."
  if (!form.class_level_id) errors.class_level_id = "Choose the class your child is applying for."
  if (form.full_name.trim().length < 2) errors.full_name = "Enter the parent or guardian's name."
  if (!form.guardian_relationship) errors.guardian_relationship = "Choose your relationship to the child."
  if (form.phone.replace(/\D/g, "").length < 7) errors.phone = "Enter a phone number we can call (at least 7 digits)."
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = "Enter a valid email address, or leave it empty."
  if (form.home_address.trim().length < 5) errors.home_address = "Enter the home address (house number, street, town)."
  return errors
}

const sentence = (text: string) => { const t = text.trim(); return t ? `${t[0].toUpperCase()}${t.slice(1)}${/[.!?]$/.test(t) ? "" : "."}` : t }

class SubmitError extends Error {
  readonly fields: Partial<Record<Field, string>>
  constructor(message: string, fields: Partial<Record<Field, string>> = {}) { super(message); this.fields = fields }
}
const readError = async (response: Response, fallback: string) => {
  const body = (await response.json().catch(() => ({}))) as { message?: string; details?: Array<{ field: string; issue: string }> }
  const fields: Partial<Record<Field, string>> = {}
  for (const detail of body.details ?? []) if (detail.field in EMPTY_FORM) fields[detail.field as Field] = sentence(detail.issue)
  const message = response.status >= 500 && response.status !== 503
    ? "Something went wrong on our side and your application was not sent. Please try again in a few minutes, or contact the school."
    : body.message || fallback
  return new SubmitError(message, fields)
}

export function AdmissionsForm() {
  const [levels, setLevels] = useState<Level[]>([])
  const [levelsError, setLevelsError] = useState("")
  const [form, setForm] = useState(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<Field, string>>>({})
  const [files, setFiles] = useState<Partial<Record<DocKind, File>>>({})
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [application, setApplication] = useState<{ id: number; reference: string; token: string } | null>(null)
  const [uploads, setUploads] = useState<Partial<Record<DocKind, UploadState>>>({})

  useEffect(() => {
    let active = true
    void fetch("/api/bff/public/class-levels", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error()
        const body = (await response.json()) as { levels?: Level[] }
        if (active) setLevels(body.levels ?? [])
      })
      .catch(() => { if (active) setLevelsError("Classes could not be loaded. Refresh the page or contact the school.") })
    return () => { active = false }
  }, [])

  const set = (field: Field) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((value) => ({ ...value, [field]: event.target.value }))
    if (fieldErrors[field]) setFieldErrors((value) => { const next = { ...value }; delete next[field]; return next })
  }
  const styleOf = (field: Field) => (fieldErrors[field] ? errorStyle : inputStyle)
  const aria = (field: Field) => ({ id: `adm-${field}`, "aria-invalid": Boolean(fieldErrors[field]) || undefined, "aria-describedby": fieldErrors[field] ? `adm-${field}-error` : undefined })
  const fieldError = (field: Field) => (fieldErrors[field] ? <p id={`adm-${field}-error`} className="mt-1.5 text-xs font-medium text-red-700">{fieldErrors[field]}</p> : null)

  const showFieldErrors = (errors: Partial<Record<Field, string>>) => {
    setFieldErrors(errors)
    const first = ORDER.find((field) => errors[field])
    if (!first) return
    window.setTimeout(() => {
      const element = document.getElementById(`adm-${first}`)
      element?.scrollIntoView({ behavior: "smooth", block: "center" })
      element?.focus({ preventScroll: true })
    }, 0)
  }

  const pickFile = (kind: DocKind, file?: File) => {
    setError("")
    if (!file) { setFiles((value) => { const next = { ...value }; delete next[kind]; return next }); return }
    if (!ALLOWED.test(file.name)) { setError(`${file.name}: upload a PDF, JPG or PNG file.`); return }
    if (file.size > MAX_BYTES) { setError(`${file.name} is larger than 4 MB. Please use a smaller scan or photo.`); return }
    setFiles((value) => ({ ...value, [kind]: file }))
  }

  const uploadOne = async (target: { id: number; token: string }, kind: DocKind) => {
    const file = files[kind]
    if (!file) return true
    setUploads((value) => ({ ...value, [kind]: { status: "uploading" } }))
    try {
      const body = new FormData()
      body.set("kind", kind)
      body.set("document", file)
      const response = await fetch(`/api/bff/public/admission-applications/${target.id}/documents`, { method: "POST", headers: { "x-upload-token": target.token }, body })
      if (!response.ok) throw await readError(response, "The document could not be uploaded.")
      setUploads((value) => ({ ...value, [kind]: { status: "done" } }))
      return true
    } catch (reason) {
      setUploads((value) => ({ ...value, [kind]: { status: "failed", message: reason instanceof Error ? reason.message : "Upload failed." } }))
      return false
    }
  }

  const uploadAll = async (target: { id: number; token: string }, done: Partial<Record<DocKind, UploadState>> = uploads) => {
    for (const doc of DOCUMENTS) {
      if (done[doc.kind]?.status === "done") continue
      await uploadOne(target, doc.kind)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (submitting) return
    setError("")
    const problems = validate(form)
    if (Object.keys(problems).length) { showFieldErrors(problems); return }
    setFieldErrors({})
    setSubmitting(true)
    try {
      const config = (await (await fetch("/api/bff/config", { cache: "no-store" })).json()) as { mode?: string }
      if (config.mode !== "integration") throw new Error(config.mode === "mock" ? "Preview mode is active. Your application has not been sent." : "Online applications are temporarily unavailable. Please contact the school directly.")
      const response = await fetch("/api/bff/public/admission-applications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, class_level_id: Number(form.class_level_id) || form.class_level_id }),
      })
      if (!response.ok) throw await readError(response, "We could not submit your application.")
      const created = (await response.json()) as { application_id?: number; reference_code?: string; upload_token?: string }
      if (!created.application_id || !created.reference_code || !created.upload_token) {
        setApplication({ id: 0, reference: "", token: "" })
        return
      }
      const target = { id: created.application_id, reference: created.reference_code, token: created.upload_token }
      const initial: Partial<Record<DocKind, UploadState>> = Object.fromEntries(DOCUMENTS.filter((doc) => files[doc.kind]).map((doc) => [doc.kind, { status: "waiting" as const }]))
      setApplication(target)
      setUploads(initial)
      window.scrollTo({ top: (document.getElementById("apply")?.offsetTop ?? 0) - 80, behavior: "smooth" })
      await uploadAll(target, initial)
    } catch (reason) {
      if (reason instanceof SubmitError && Object.keys(reason.fields).length) showFieldErrors(reason.fields)
      else setError(reason instanceof Error ? reason.message : "We could not submit your application.")
    } finally {
      setSubmitting(false)
    }
  }

  if (application) {
    const pending = DOCUMENTS.filter((doc) => files[doc.kind])
    const failed = pending.filter((doc) => uploads[doc.kind]?.status === "failed")
    const busy = pending.some((doc) => ["waiting", "uploading"].includes(uploads[doc.kind]?.status ?? ""))
    return (
      <div className="text-center py-14 px-6 bg-white" style={{ border: "1px solid rgba(28,10,4,0.08)", borderRadius: 4 }}>
        <div className="font-display font-black text-6xl mb-4" style={{ color: "#5C1010" }}>✓</div>
        <h3 className="font-display font-bold text-[#1C0A04] text-3xl mb-3">Application Received!</h3>
        {application.reference ? (
          <p className="text-[#7A5C3A] text-sm mb-2">Your reference number is <strong className="font-mono text-[#5C1010] text-base">{application.reference}</strong>. Please keep it — the school will use it when contacting you.</p>
        ) : null}
        <p className="text-[#7A5C3A] text-sm">Our admissions team will review the application and get back to you.</p>
        {pending.length ? (
          <div className="mt-6 mx-auto max-w-md text-left space-y-2">
            {pending.map((doc) => {
              const state = uploads[doc.kind]?.status ?? "waiting"
              return (
                <div key={doc.kind} className="flex items-center justify-between gap-3 px-4 py-3 text-sm" style={{ background: "#FEFCE8", borderRadius: 4 }}>
                  <span className="text-[#1C0A04]">{doc.label}</span>
                  <span className={state === "done" ? "text-green-700 font-semibold" : state === "failed" ? "text-red-700 font-semibold" : "text-[#7A5C3A]"}>
                    {state === "done" ? "Uploaded ✓" : state === "failed" ? "Failed" : state === "uploading" ? "Uploading…" : "Waiting…"}
                  </span>
                </div>
              )
            })}
            {failed.length ? (
              <div className="pt-2">
                <p className="text-xs text-red-700 mb-2">{failed.map((doc) => uploads[doc.kind]?.message).filter(Boolean).join(" ")}</p>
                <button type="button" disabled={busy} onClick={() => void uploadAll(application)} className="px-6 py-3 text-sm font-semibold text-white disabled:opacity-60" style={{ background: "#5C1010", borderRadius: 4 }}>
                  Retry failed uploads
                </button>
                <p className="mt-2 text-xs text-[#7A5C3A]">You can retry for 2 hours. Your application itself has already been received.</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    )
  }

  const listed = ORDER.filter((field) => fieldErrors[field])
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      {/* Honeypot: hidden from people, filled by bots. */}
      <input type="text" name="website" value={form.website} onChange={set("website")} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <p className="text-xs text-[#7A5C3A]">Fields marked * are required.</p>

      <section>
        <h3 className={sectionTitle}>About the child</h3>
        <div className="space-y-5">
          <div>
            <label htmlFor="adm-applicant_name" className={siteLabelClassName}>Child&apos;s Full Name *</label>
            <input type="text" {...aria("applicant_name")} value={form.applicant_name} onChange={set("applicant_name")} className={inputClass} style={styleOf("applicant_name")} placeholder="e.g. Amara Johnson" />
            {fieldError("applicant_name")}
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            <div>
              <label htmlFor="adm-date_of_birth" className={siteLabelClassName}>Date of Birth *</label>
              <input type="date" {...aria("date_of_birth")} value={form.date_of_birth} onChange={set("date_of_birth")} className={inputClass} style={styleOf("date_of_birth")} />
              {fieldError("date_of_birth")}
            </div>
            <div>
              <label htmlFor="adm-gender" className={siteLabelClassName}>Gender *</label>
              <select {...aria("gender")} value={form.gender} onChange={set("gender")} className={inputClass} style={styleOf("gender")}>
                <option value="">Select…</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
              {fieldError("gender")}
            </div>
            <div>
              <label htmlFor="adm-class_level_id" className={siteLabelClassName}>Class Applying For *</label>
              <select {...aria("class_level_id")} value={form.class_level_id} onChange={set("class_level_id")} className={inputClass} style={styleOf("class_level_id")}>
                <option value="">{levels.length ? "Select a class…" : "Loading classes…"}</option>
                {levels.map((level) => <option key={level.id} value={level.id}>{level.name}</option>)}
              </select>
              {fieldError("class_level_id")}
            </div>
          </div>
          {levelsError ? <p className="text-xs text-red-700">{levelsError}</p> : null}
          <div>
            <label htmlFor="adm-previous_school" className={siteLabelClassName}>Previous School</label>
            <input type="text" {...aria("previous_school")} value={form.previous_school} onChange={set("previous_school")} className={inputClass} style={styleOf("previous_school")} placeholder="Name of the last school attended (if any)" />
            {fieldError("previous_school")}
          </div>
          <div>
            <label htmlFor="adm-medical_notes" className={siteLabelClassName}>Medical Information</label>
            <textarea {...aria("medical_notes")} value={form.medical_notes} onChange={set("medical_notes")} rows={2} maxLength={1000} className={`${inputClass} resize-none`} style={styleOf("medical_notes")} placeholder="Allergies, conditions or anything the school should know (optional)" />
            {fieldError("medical_notes")}
          </div>
        </div>
      </section>

      <section>
        <h3 className={sectionTitle}>Parent / guardian</h3>
        <div className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="adm-full_name" className={siteLabelClassName}>Full Name *</label>
              <input type="text" {...aria("full_name")} value={form.full_name} onChange={set("full_name")} className={inputClass} style={styleOf("full_name")} placeholder="e.g. Mrs. Ngozi Johnson" />
              {fieldError("full_name")}
            </div>
            <div>
              <label htmlFor="adm-guardian_relationship" className={siteLabelClassName}>Relationship to the Child *</label>
              <select {...aria("guardian_relationship")} value={form.guardian_relationship} onChange={set("guardian_relationship")} className={inputClass} style={styleOf("guardian_relationship")}>
                <option value="">Select…</option>
                <option value="mother">Mother</option>
                <option value="father">Father</option>
                <option value="guardian">Guardian</option>
                <option value="other">Other</option>
              </select>
              {fieldError("guardian_relationship")}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="adm-phone" className={siteLabelClassName}>Phone Number *</label>
              <input type="tel" {...aria("phone")} value={form.phone} onChange={set("phone")} className={inputClass} style={styleOf("phone")} placeholder="+234 801 234 5678" />
              {fieldError("phone")}
            </div>
            <div>
              <label htmlFor="adm-email" className={siteLabelClassName}>Email Address</label>
              <input type="email" {...aria("email")} value={form.email} onChange={set("email")} className={inputClass} style={styleOf("email")} placeholder="your@email.com (optional)" />
              {fieldError("email")}
            </div>
          </div>
          <div>
            <label htmlFor="adm-home_address" className={siteLabelClassName}>Home Address *</label>
            <input type="text" {...aria("home_address")} value={form.home_address} onChange={set("home_address")} className={inputClass} style={styleOf("home_address")} placeholder="House number, street, town" />
            {fieldError("home_address")}
          </div>
        </div>
      </section>

      <section>
        <h3 className={sectionTitle}>Documents <span className="font-sans text-sm font-normal text-[#7A5C3A]">(optional, up to 4 MB each)</span></h3>
        <div className="space-y-3">
          {DOCUMENTS.map((doc) => (
            <label key={doc.kind} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 py-3 cursor-pointer" style={{ ...siteInputStyle, borderStyle: "dashed" }}>
              <span className="text-sm font-semibold text-[#1C0A04] sm:w-48">{doc.label}</span>
              <span className="flex-1 text-sm text-[#7A5C3A] truncate">{files[doc.kind] ? `${files[doc.kind]!.name} (${Math.max(1, Math.round(files[doc.kind]!.size / 1024))} KB)` : `Choose file — ${doc.hint}`}</span>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => pickFile(doc.kind, event.target.files?.[0])} />
              {files[doc.kind] ? <button type="button" onClick={(event) => { event.preventDefault(); pickFile(doc.kind) }} className="text-xs text-red-700 underline">Remove</button> : null}
            </label>
          ))}
        </div>
      </section>

      <div>
        <label htmlFor="adm-message" className={siteLabelClassName}>Additional Message</label>
        <textarea {...aria("message")} value={form.message} onChange={set("message")} rows={4} maxLength={2000} className={`${inputClass} resize-none`} style={styleOf("message")} placeholder="Any questions or special requirements..." />
        {fieldError("message")}
      </div>

      {listed.length ? (
        <div role="alert" className="px-5 py-4 text-sm" style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 4 }}>
          <p className="font-semibold text-red-800 mb-2">Please correct {listed.length === 1 ? "this field" : `these ${listed.length} fields`} before submitting:</p>
          <ul className="space-y-1">
            {listed.map((field) => (
              <li key={field}>
                <button type="button" onClick={() => { const element = document.getElementById(`adm-${field}`); element?.scrollIntoView({ behavior: "smooth", block: "center" }); element?.focus({ preventScroll: true }) }} className="text-left text-red-700 underline underline-offset-2">
                  {LABELS[field] ?? field}
                </button>
                <span className="text-red-700"> — {fieldErrors[field]}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {error ? <p role="alert" className="px-5 py-4 text-sm font-medium text-red-800" style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 4 }}>{error}</p> : null}
      <button
        type="submit"
        disabled={submitting || !levels.length}
        className="px-10 py-4 text-sm font-semibold text-white hover:opacity-90 transition-all disabled:cursor-not-allowed disabled:opacity-60"
        style={{ background: "#5C1010", borderRadius: 4 }}
      >
        {submitting ? "Submitting…" : "Submit Application →"}
      </button>
      <p className="text-xs text-[#7A5C3A]">By submitting, you agree that the school may contact you about this application and keep the documents for the admission process.</p>
    </form>
  )
}
