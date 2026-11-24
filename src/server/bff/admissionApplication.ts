/**
 * Stage 11: public admission application contract for the BFF. Only approved fields are
 * forwarded; the backend performs the full validation. Documents are validated here
 * first (type/extension/size) so obviously bad files never leave the browser's request.
 */

const FIELDS = [
  "applicant_name", "date_of_birth", "gender", "class_level_id", "previous_school", "medical_notes",
  "full_name", "guardian_relationship", "phone", "email", "home_address", "message", "website",
] as const

export function parseAdmissionApplication(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw Object.assign(new Error("The application is invalid."), { status: 400, code: "VALIDATION_ERROR" })
  }
  const body = input as Record<string, unknown>
  const out: Record<string, string | number> = {}
  for (const field of FIELDS) {
    const value = body[field]
    if (value === undefined || value === null || value === "") continue
    if (field === "class_level_id") { out[field] = Number(value); continue }
    if (typeof value !== "string") throw Object.assign(new Error("The application is invalid."), { status: 400, code: "VALIDATION_ERROR" })
    out[field] = value.slice(0, field === "medical_notes" ? 1000 : field === "message" ? 2000 : 300)
  }
  return out
}

export const DOCUMENT_KINDS = ["birth_certificate", "passport_photo", "school_report", "other"] as const
const DOCUMENT_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp", "", "application/octet-stream"])
const DOCUMENT_EXTENSIONS = new Set(["pdf", "jpg", "jpeg", "png", "webp"])
export const MAX_DOCUMENT_BYTES = 4 * 1024 * 1024

export function validateApplicationDocument(input: FormData) {
  const file = input.get("document")
  const kind = String(input.get("kind") ?? "")
  if (!(file instanceof File)) throw Object.assign(new Error("Choose a file to upload."), { status: 400, code: "INVALID_UPLOAD" })
  if (!(DOCUMENT_KINDS as readonly string[]).includes(kind)) throw Object.assign(new Error("Choose the document type."), { status: 400, code: "VALIDATION_ERROR" })
  const extension = file.name.toLowerCase().split(".").pop() ?? ""
  if (!DOCUMENT_EXTENSIONS.has(extension) || !DOCUMENT_TYPES.has(file.type.toLowerCase())) {
    throw Object.assign(new Error("Upload a PDF, JPG or PNG file."), { status: 415, code: "UNSUPPORTED_UPLOAD_TYPE" })
  }
  if (file.size <= 0 || file.size > MAX_DOCUMENT_BYTES) throw Object.assign(new Error("Each document must be 4 MB or smaller."), { status: 413, code: "UPLOAD_TOO_LARGE" })
  const body = new FormData()
  body.set("kind", kind)
  body.set("document", file, file.name.replace(/[^\w.\- ]+/g, "_").slice(0, 150) || `document.${extension}`)
  return body
}
