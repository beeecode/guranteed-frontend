type EnquiryKind = "contact" | "admissions"

const value = (body: Record<string, unknown>, key: string, maximum: number) => {
  const current = body[key]
  if (typeof current !== "string") {
    throw Object.assign(new Error("Please complete all required enquiry fields."), { status: 400, code: "VALIDATION_ERROR" })
  }
  return current.trim().slice(0, maximum)
}

export function parsePublicEnquiry(input: unknown, kind: EnquiryKind) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw Object.assign(new Error("The enquiry is invalid."), { status: 400, code: "VALIDATION_ERROR" })
  }
  const body = input as Record<string, unknown>
  const common = {
    full_name: value(body, "full_name", 100),
    email: value(body, "email", 150).toLowerCase(),
    phone: value(body, "phone", 30),
    message: value(body, "message", 2000),
  }
  if (common.full_name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(common.email) || common.phone.length < 6 || common.message.length < 10) {
    throw Object.assign(new Error("Please provide a valid name, email, phone number, and message."), { status: 400, code: "VALIDATION_ERROR" })
  }
  const field = kind === "contact" ? "subject" : "class_interest"
  const detail = value(body, field, kind === "contact" ? 120 : 80)
  if (detail.length < 2) {
    throw Object.assign(new Error("Please complete all required enquiry fields."), { status: 400, code: "VALIDATION_ERROR" })
  }
  return kind === "contact"
    ? { ...common, subject: detail }
    : { ...common, class_interest: detail }
}
