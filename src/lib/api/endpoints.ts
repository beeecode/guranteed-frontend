export const apiEndpoints = {
  auth: {
    login: "/api/auth/login",
    refresh: "/api/auth/refresh",
    logout: "/api/auth/logout",
    forgotPassword: "/api/auth/forgot-password",
    changePassword: "/api/auth/change-password",
    me: "/api/me",
  },
  student: {
    me: "/api/student/me",
    serverTime: "/api/student/server-time",
    dashboard: "/api/student/dashboard",
    bundles: "/api/student/bundles",
    resultsSummary: "/api/student/results-summary",
    examPreview: (examId: string | number) =>
      `/api/student/exams/${examId}/preview`,
    startAttempt: "/api/student/attempts/start",
    attempt: (attemptId: string | number) =>
      `/api/student/attempts/${attemptId}`,
    saveAnswers: (attemptId: string | number) =>
      `/api/student/attempts/${attemptId}/save-answers`,
    heartbeat: (attemptId: string | number) =>
      `/api/student/attempts/${attemptId}/heartbeat`,
    submit: (attemptId: string | number) =>
      `/api/student/attempts/${attemptId}/submit`,
    attemptResults: (attemptId: string | number) =>
      `/api/student/attempts/${attemptId}/results`,
  },
  admin: {
    stats: "/api/admin/stats",
    students: "/api/admin/students",
    subjects: "/api/admin/subjects",
    classLevels: "/api/admin/class-levels",
    exams: "/api/admin/exams",
    bundles: "/api/admin/bundles",
    sessions: "/api/admin/sessions",
    results: "/api/admin/results",
    analytics: "/api/admin/analytics",
    auditLogs: "/api/admin/audit-logs",
    passages: "/api/admin/passages",
    questionsBySubject: (subjectId: string | number) =>
      `/api/admin/questions/subject/${subjectId}`,
    contactEnquiries: "/api/admin/enquiries/contact",
    admissionEnquiries: "/api/admin/enquiries/admissions",
  },
  public: {
    contact: "/api/public/contact",
    admissions: "/api/public/admissions",
  },
} as const
