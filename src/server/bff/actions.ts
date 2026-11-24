export type BffRole = "student" | "admin"
export interface ResolvedAction { role: BffRole; method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; path: string; body?: unknown }

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

// Stage 11: the bundle submit names the subject attempt being submitted so a retried or
// stale request can never submit the next subject. Only a positive integer is forwarded.
const submitBody = (payload: unknown) => {
  const attemptId = Number((payload as { attempt_id?: unknown } | undefined)?.attempt_id)
  return Number.isInteger(attemptId) && attemptId > 0 ? { attempt_id: attemptId } : undefined
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
    "student-bundle-submit-current": () => ({ role: "student", method: "POST", path: `/api/student/bundle-attempts/${id(p.sessionAttemptId, "sessionAttemptId")}/current/submit`, body: submitBody(body) }),
    "student-bundle-results": () => ({ role: "student", method: "GET", path: `/api/student/bundles/${id(p.sessionId, "sessionId")}/results` }),
    "admin-class-levels": () => ({ role: "admin", method: "GET", path: "/api/admin/class-levels" }),
    "admin-class-level-create": () => ({ role: "admin", method: "POST", path: "/api/admin/class-levels", body }),
    "admin-class-level-update": () => ({ role: "admin", method: "PATCH", path: `/api/admin/class-levels/${id(p.levelId, "levelId")}`, body }),
    "admin-subjects-list": () => ({ role: "admin", method: "GET", path: "/api/admin/subjects" }),
    "admin-subject-create": () => ({ role: "admin", method: "POST", path: "/api/admin/subjects", body }),
    "admin-topics-list": () => ({ role: "admin", method: "GET", path: `/api/admin/topics/subject/${id(p.subjectId, "subjectId")}` }),
    "admin-passages-list": () => ({ role: "admin", method: "GET", path: "/api/admin/passages" }),
    "admin-passage-save": () => ({ role: "admin", method: "POST", path: "/api/admin/passages", body }),
    "admin-passage-delete": () => ({ role: "admin", method: "DELETE", path: `/api/admin/passages/${id(p.passageId, "passageId")}` }),
    "admin-students-list": () => ({ role: "admin", method: "GET", path: withQuery("/api/admin/students", p, ["page", "limit", "search", "status", "class_level_id"]) }),
    "admin-student-create": () => ({ role: "admin", method: "POST", path: "/api/admin/students", body }),
    "admin-student-status": () => ({ role: "admin", method: "PATCH", path: `/api/admin/students/${id(p.studentId, "studentId")}/status`, body }),
    "admin-student-reset-password": () => ({ role: "admin", method: "PATCH", path: `/api/admin/students/${id(p.studentId, "studentId")}/reset-password` }),
    "admin-student-delete": () => ({ role: "admin", method: "DELETE", path: `/api/admin/students/${id(p.studentId, "studentId")}` }),
    "admin-students-bulk-delete": () => ({ role: "admin", method: "POST", path: "/api/admin/students/bulk-delete", body }),
    "admin-questions-list": () => ({ role: "admin", method: "GET", path: withQuery(`/api/admin/questions/subject/${id(p.subjectId, "subjectId")}`, p, ["page", "limit", "search", "type", "topicId", "difficulty", "all"]) }),
    "admin-question-create": () => ({ role: "admin", method: "POST", path: "/api/admin/questions", body }),
    "admin-question-update": () => ({ role: "admin", method: "PATCH", path: `/api/admin/questions/${id(p.questionId, "questionId")}`, body }),
    "admin-question-delete": () => ({ role: "admin", method: "DELETE", path: `/api/admin/questions/${id(p.questionId, "questionId")}` }),
    "admin-questions-bulk-delete": () => ({ role: "admin", method: "POST", path: "/api/admin/questions/bulk-delete", body }),
    "admin-exams-list": () => ({ role: "admin", method: "GET", path: withQuery("/api/admin/exams", p, ["page", "limit", "search", "status"]) }),
    "admin-exam-get": () => ({ role: "admin", method: "GET", path: `/api/admin/exams/${id(p.examId, "examId")}` }),
    "admin-exam-create": () => ({ role: "admin", method: "POST", path: "/api/admin/exams", body }),
    "admin-exam-update": () => ({ role: "admin", method: "PUT", path: `/api/admin/exams/${id(p.examId, "examId")}`, body }),
    "admin-exam-delete": () => ({ role: "admin", method: "DELETE", path: `/api/admin/exams/${id(p.examId, "examId")}` }),
    "admin-exam-pause": () => ({ role: "admin", method: "PATCH", path: `/api/admin/exams/${id(p.examId, "examId")}/pause`, body }),
    "admin-exam-release": () => ({ role: "admin", method: "PATCH", path: `/api/admin/exams/${id(p.examId, "examId")}/release`, body }),
    "admin-exam-live": () => ({ role: "admin", method: "GET", path: `/api/admin/exams/${id(p.examId, "examId")}/live` }),
    "admin-attempt-force-submit": () => ({ role: "admin", method: "POST", path: `/api/admin/attempts/${id(p.attemptId, "attemptId")}/force-submit` }),
    "admin-results-list": () => ({ role: "admin", method: "GET", path: withQuery("/api/admin/results", p, ["page", "limit", "examId", "class"]) }),
    "admin-result-detail": () => ({ role: "admin", method: "GET", path: `/api/admin/results/attempt/${id(p.attemptId, "attemptId")}` }),
    "admin-result-grade": () => ({ role: "admin", method: "PATCH", path: "/api/admin/results/grade", body }),
    "admin-result-reset": () => ({ role: "admin", method: "DELETE", path: `/api/admin/results/attempt/${id(p.attemptId, "attemptId")}` }),
    "admin-bundles-list": () => ({ role: "admin", method: "GET", path: withQuery("/api/admin/bundles", p, ["page", "limit", "search", "status"]) }),
    "admin-bundle-get": () => ({ role: "admin", method: "GET", path: `/api/admin/bundles/${id(p.bundleId, "bundleId")}` }),
    "admin-bundle-create": () => ({ role: "admin", method: "POST", path: "/api/admin/bundles", body }),
    "admin-bundle-update": () => ({ role: "admin", method: "PUT", path: `/api/admin/bundles/${id(p.bundleId, "bundleId")}`, body }),
    "admin-bundle-publish": () => ({ role: "admin", method: "PATCH", path: `/api/admin/bundles/${id(p.bundleId, "bundleId")}/publish` }),
    "admin-bundle-close": () => ({ role: "admin", method: "PATCH", path: `/api/admin/bundles/${id(p.bundleId, "bundleId")}/close` }),
    "admin-bundle-release": () => ({ role: "admin", method: "PATCH", path: `/api/admin/bundles/${id(p.bundleId, "bundleId")}/release-results`, body }),
    "admin-bundle-monitor": () => ({ role: "admin", method: "GET", path: `/api/admin/bundles/${id(p.bundleId, "bundleId")}/monitor` }),
    "admin-bundle-intervene": () => ({ role: "admin", method: "POST", path: `/api/admin/bundles/${id(p.bundleId, "bundleId")}/monitor/${id(p.sessionAttemptId, "sessionAttemptId")}/action`, body }),
    "admin-bundle-results": () => ({ role: "admin", method: "GET", path: `/api/admin/bundles/${id(p.bundleId, "bundleId")}/results` }),
    "admin-audit-logs": () => ({ role: "admin", method: "GET", path: withQuery("/api/admin/audit-logs", p, ["page", "limit", "action", "actor_id", "from", "to"]) }),
    "admin-contact-enquiries": () => ({ role: "admin", method: "GET", path: withQuery("/api/admin/enquiries/contact", p, ["page", "limit", "search", "status", "from", "to"]) }),
    "admin-admission-get": () => ({ role: "admin", method: "GET", path: `/api/admin/enquiries/admissions/${id(p.enquiryId, "enquiryId")}` }),
    "admin-admission-document-url": () => ({ role: "admin", method: "GET", path: `/api/admin/enquiries/admissions/${id(p.enquiryId, "enquiryId")}/documents/${id(p.documentId, "documentId")}` }),
    "admin-admission-accept": () => ({ role: "admin", method: "POST", path: `/api/admin/enquiries/admissions/${id(p.enquiryId, "enquiryId")}/accept`, body }),
    "admin-admission-status": () => ({ role: "admin", method: "PATCH", path: `/api/admin/enquiries/admissions/${id(p.enquiryId, "enquiryId")}/status`, body }),
    "admin-admission-enquiries": () => ({ role: "admin", method: "GET", path: withQuery("/api/admin/enquiries/admissions", p, ["page", "limit", "search", "status", "from", "to"]) }),
  }
  const resolver = actions[action]
  if (!resolver) throw Object.assign(new Error("Unknown BFF action"), { status: 404, code: "BFF_ACTION_NOT_FOUND" })
  return resolver()
}
