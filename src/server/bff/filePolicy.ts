const CSV_TYPES = new Set(["text/csv", "application/csv", "application/vnd.ms-excel"])
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

export type UploadKind = "csv" | "question-image"

export function validateUpload(
  file: { name: string; type: string; size: number },
  kind: UploadKind,
) {
  const maximum = kind === "csv" ? 10 * 1024 * 1024 : 5 * 1024 * 1024
  const allowedTypes = kind === "csv" ? CSV_TYPES : IMAGE_TYPES
  const extension = file.name.toLowerCase().split(".").pop()
  const extensionAllowed = kind === "csv"
    ? extension === "csv"
    : extension === "jpg" || extension === "jpeg" || extension === "png" || extension === "webp"

  if (!file.name || file.name.includes("\0") || file.name.includes("/") || file.name.includes("\\")) {
    throw Object.assign(new Error("The upload filename is invalid."), { status: 400, code: "INVALID_UPLOAD" })
  }
  if (!allowedTypes.has(file.type.toLowerCase()) || !extensionAllowed) {
    throw Object.assign(new Error("The upload type is not allowed."), { status: 415, code: "UNSUPPORTED_UPLOAD_TYPE" })
  }
  if (!Number.isSafeInteger(file.size) || file.size <= 0 || file.size > maximum) {
    throw Object.assign(new Error("The upload size is not allowed."), { status: 413, code: "UPLOAD_TOO_LARGE" })
  }
  return { maximum, kind }
}
