import { validateUpload, type UploadKind } from "./filePolicy.ts"

type UploadDefinition = { path: (params: Record<string, unknown>) => string; field: string; kind: UploadKind }
const safeId = (value: unknown, name: string) => {
  const text = String(value ?? "")
  if (!/^[A-Za-z0-9-]{1,80}$/.test(text)) throw Object.assign(new Error(`${name} is invalid.`), { status: 400, code: "VALIDATION_ERROR" })
  return encodeURIComponent(text)
}

const uploads: Record<string, UploadDefinition> = {
  "students-csv": { path: () => "/api/admin/students/import-csv", field: "csv_file", kind: "csv" },
  "questions-csv": { path: () => "/api/admin/questions/import-csv", field: "csv_file", kind: "csv" },
  "question-image": { path: () => "/api/admin/questions/upload-image", field: "image", kind: "question-image" },
  "exam-answers-csv": { path: (params) => `/api/admin/exams/${safeId(params.examId, "examId")}/import-answers`, field: "csv_file", kind: "csv" },
}

const downloads: Record<string, (params: Record<string, unknown>) => string> = {
  "exam-results": (params) => `/api/admin/exams/${safeId(params.examId, "examId")}/export-results`,
  "bundle-results": (params) => `/api/admin/bundles/${safeId(params.bundleId, "bundleId")}/export`,
  "bulk-transcripts": (params) => {
    const examId = safeId(params.examId, "examId")
    return `/api/admin/results/bulk-transcripts?examId=${examId}`
  },
}

export const isUploadOperation = (operation: string) => Object.prototype.hasOwnProperty.call(uploads, operation)
export const isDownloadOperation = (operation: string) => Object.prototype.hasOwnProperty.call(downloads, operation)

export function prepareUpload(operation: string, input: FormData) {
  const definition = uploads[operation]
  if (!definition) throw Object.assign(new Error("Unknown upload operation."), { status: 404, code: "BFF_UPLOAD_NOT_FOUND" })
  const file = input.get(definition.field)
  if (!(file instanceof File)) throw Object.assign(new Error("The required upload file is missing."), { status: 400, code: "INVALID_UPLOAD" })
  validateUpload(file, definition.kind)
  const params = Object.fromEntries([...input.entries()].filter(([, value]) => typeof value === "string"))
  return { path: definition.path(params), body: input }
}

export function resolveDownload(operation: string, params: Record<string, unknown>) {
  const resolver = downloads[operation]
  if (!resolver) throw Object.assign(new Error("Unknown download operation."), { status: 404, code: "BFF_DOWNLOAD_NOT_FOUND" })
  return resolver(params)
}

export function safeDownloadHeaders(headers: Headers, requestId: string) {
  const disposition = headers.get("content-disposition") || "attachment; filename=export.csv"
  const safeDisposition = /^[\x20-\x7E]{1,200}$/.test(disposition) && !/[\r\n]/.test(disposition) ? disposition : "attachment; filename=export.csv"
  return {
    "cache-control": "private, no-store",
    "content-type": headers.get("content-type") || "text/csv; charset=utf-8",
    "content-disposition": safeDisposition,
    "x-request-id": headers.get("x-request-id") || requestId,
  }
}
