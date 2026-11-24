const CSV_TYPES = new Set(["text/csv", "application/csv", "application/vnd.ms-excel"])
const ZIP_TYPES = new Set(["application/zip", "application/x-zip-compressed", "application/x-zip", "multipart/x-zip"])
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

/**
 * csv: a CSV file only. question-import (Stage 11): a CSV, or a ZIP holding the CSV plus
 * its question images (the backend importer supports both). question-image: one image.
 */
export type UploadKind = "csv" | "question-import" | "question-image"

const RULES: Record<UploadKind, { maximum: number; types: Set<string>; extensions: string[]; allowBlankType: boolean }> = {
  csv: { maximum: 10 * 1024 * 1024, types: CSV_TYPES, extensions: ["csv"], allowBlankType: true },
  "question-import": { maximum: 10 * 1024 * 1024, types: new Set([...CSV_TYPES, ...ZIP_TYPES]), extensions: ["csv", "zip"], allowBlankType: true },
  "question-image": { maximum: 5 * 1024 * 1024, types: IMAGE_TYPES, extensions: ["jpg", "jpeg", "png", "webp"], allowBlankType: false },
}

export function validateUpload(
  file: { name: string; type: string; size: number },
  kind: UploadKind,
) {
  const rule = RULES[kind]
  const extension = file.name.toLowerCase().split(".").pop() ?? ""
  const type = file.type.toLowerCase()

  if (!file.name || file.name.includes("\0") || file.name.includes("/") || file.name.includes("\\")) {
    throw Object.assign(new Error("The upload filename is invalid."), { status: 400, code: "INVALID_UPLOAD" })
  }
  // Windows browsers without a spreadsheet/zip handler send CSV/ZIP files with an empty or
  // generic (application/octet-stream) MIME type; the extension must still match and the
  // backend parses the content.
  const typeAllowed = rule.types.has(type) || (rule.allowBlankType && (type === "" || type === "application/octet-stream"))
  if (!typeAllowed || !rule.extensions.includes(extension)) {
    throw Object.assign(new Error(`The upload type is not allowed. Use a ${rule.extensions.map((item) => `.${item}`).join(" or ")} file.`), { status: 415, code: "UNSUPPORTED_UPLOAD_TYPE" })
  }
  if (!Number.isSafeInteger(file.size) || file.size <= 0 || file.size > rule.maximum) {
    throw Object.assign(new Error(`The file must be between 1 byte and ${Math.round(rule.maximum / 1024 / 1024)} MB.`), { status: 413, code: "UPLOAD_TOO_LARGE" })
  }
  return { maximum: rule.maximum, kind }
}
