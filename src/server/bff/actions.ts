export type BffRole = "student" | "admin"
export interface ResolvedAction { role: BffRole; method: "GET" | "POST" | "PATCH" | "DELETE"; path: string; body?: unknown }

const id = (value: unknown, name: string) => {
  const text = String(value ?? "")
  if (!/^[A-Za-z0-9-]{1,80}$/.test(text)) throw Object.assign(new Error(`${name} is invalid`), { status: 400, code: "VALIDATION_ERROR" })
  return encodeURIComponent(text)
}

const withQuery = (path: string, params: Record<string, unknown>, allowed: string[]) => {
  const query = new URLSearchParams()
  for (const key of allowed) {
    const value = params[key]
    if (value === undefined || value === null || value === "") continue
    const text = String(value)
    if (text.length > 150) throw Object.assign(new Error(`${key} is invalid`), { status: 400, code: "VALIDATION_ERROR" })
    query.set(key, text)
  }
  const suffix = query.toString()
  return suffix ? `${path}?${suffix}` : path
}

export function resolveAction(action: string, input: { params?: Record<string, unknown>; payload?: unknown } = {}): ResolvedAction {
  const p = input.params || {}
  const body = input.payload
  const actions: Record<string, () => ResolvedAction> = {
    "student-server-time": () => ({ role: "student", method: "GET", path: "/api/student/server-time" }),
    "student-exam-preview": () => ({ role: "student", method: "GET", path: `/api/student/exams/${id(p.examId, "examId")}/preview` }),
    "student-attempt-start": () => ({ role: "student", method: "POST", path: "/api/student/attempts/start", body }),
    "student-attempt-get": () => ({ role: "student", method: "GET", path: `/api/student/attempts/${id(p.attemptId, "attemptId")}` }),
    "student-answers-save": () => ({ role: "student", method: "POST", path: `/api/student/attempts/${id(p.attemptId, "attemptId")}/save-answers`, body }),
    "student-heartbeat": () => ({ role: "student", method: "POST", path: `/api/student/attempts/${id(p.attemptId, "attemptId")}/heartbeat`, body }),
    "student-security-event": () => ({ role: "student", method: "POST", path: `/api/student/attempts/${id(p.attemptId, "attemptId")}/security-event`, body }),
    "student-attempt-submit": () => ({ role: "student", method: "POST", path: `/api/student/attempts/${id(p.attemptId, "attemptId")}/submit` }),
    "student-attempt-results": () => ({ role: "student", method: "GET", path: `/api/student/attempts/${id(p.attemptId, "attemptId")}/results` }),
    "student-bundles-list": () => ({ role: "student", method: "GET", path: withQuery("/api/student/bundles", p, ["page", "limit"]) }),
    "student-bundle-get": () => ({ role: "student", method: "GET", path: `/api/student/bundles/${id(p.sessionId, "sessionId")}` }),
    "student-bundle-start": () => ({ role: "student", method: "POST", path: `/api/student/bundles/${id(p.sessionId, "sessionId")}/start` }),
    "student-bundle-continue": () => ({ role: "student", method: "POST", path: `/api/student/bundles/${id(p.sessionId, "sessionId")}/continue` }),
    "student-bundle-submit-current": () => ({ role: "student", method: "POST", path: `/api/student/bundle-attempts/${id(p.sessionAttemptId, "sessionAttemptId")}/current/submit` }),
    "student-bundle-results": () => ({ role: "student", method: "GET", path: `/api/student/bundles/${id(p.sessionId, "sessionId")}/results` }),
    "admin-students-list": () => ({ role: "admin", method: "GET", path: withQuery("/api/admin/students", p, ["page", "limit", "search", "status", "class_id", "section_id"]) }),
    "admin-student-create": () => ({ role: "admin", method: "POST", path: "/api/admin/students", body }),
    "admin-student-status": () => ({ role: "admin", method: "PATCH", path: `/api/admin/students/${id(p.studentId, "studentId")}/status`, body }),
    "admin-student-reset-password": () => ({ role: "admin", method: "PATCH", path: `/api/admin/students/${id(p.studentId, "studentId")}/reset-password` }),
    "admin-questions-list": () => ({ role: "admin", method: "GET", path: withQuery(`/api/admin/questions/subject/${id(p.subjectId, "subjectId")}`, p, ["page", "limit", "search", "topic_id"]) }),
    "admin-question-create": () => ({ role: "admin", method: "POST", path: "/api/admin/questions", body }),
    "admin-question-update": () => ({ role: "admin", method: "PATCH", path: `/api/admin/questions/${id(p.questionId, "questionId")}`, body }),
    "admin-question-delete": () => ({ role: "admin", method: "DELETE", path: `/api/admin/questions/${id(p.questionId, "questionId")}` }),
    "admin-exams-list": () => ({ role: "admin", method: "GET", path: withQuery("/api/admin/exams", p, ["page", "limit", "search", "status"]) }),
    "admin-results-list": () => ({ role: "admin", method: "GET", path: withQuery("/api/admin/results", p, ["page", "limit", "search", "exam_id", "student_id", "status"]) }),
    "admin-bundles-list": () => ({ role: "admin", method: "GET", path: withQuery("/api/admin/bundles", p, ["page", "limit", "search", "status"]) }),
    "admin-audit-logs": () => ({ role: "admin", method: "GET", path: withQuery("/api/admin/audit-logs", p, ["page", "limit", "action", "actor_id", "from", "to"]) }),
    "admin-contact-enquiries": () => ({ role: "admin", method: "GET", path: withQuery("/api/admin/enquiries/contact", p, ["page", "limit", "search", "status", "from", "to"]) }),
    "admin-admission-enquiries": () => ({ role: "admin", method: "GET", path: withQuery("/api/admin/enquiries/admissions", p, ["page", "limit", "search", "status", "from", "to"]) }),
  }
  const resolver = actions[action]
  if (!resolver) throw Object.assign(new Error("Unknown BFF action"), { status: 404, code: "BFF_ACTION_NOT_FOUND" })
  return resolver()
}
