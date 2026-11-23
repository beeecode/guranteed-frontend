"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoaderCircle } from "lucide-react"
import { bffClient } from "@/lib/api/bffClient"
import { IntegratedExamScreen } from "@/features/exam/integration/IntegratedExamScreen"
import type { BundlePayload, BundleProgression } from "./types"

export function IntegratedBundleExam({ bundleId, attemptId, sessionAttemptId }: { bundleId: string; attemptId?: string; sessionAttemptId?: string }) {
  const router = useRouter()
  const [resolved, setResolved] = useState<{ attemptId: string; sessionAttemptId: string; examId: string } | null>(attemptId && sessionAttemptId ? { attemptId, sessionAttemptId, examId: "bundle-subject" } : null)
  useEffect(() => {
    if (resolved) return
    let active = true
    void bffClient.action<BundlePayload>("student-bundle-get", { params: { sessionId: bundleId } }).then((data) => {
      if (!active) return
      const attempt = data.currentAttempt ?? data.subjectAttempt
      if (attempt?.id && data.sessionAttempt?.id) setResolved({ attemptId: String(attempt.id), sessionAttemptId: String(data.sessionAttempt.id), examId: String(attempt.exam_id) })
      else router.replace(`/student/bundle/${encodeURIComponent(bundleId)}/overview`)
    }).catch(() => router.replace(`/student/bundle/${encodeURIComponent(bundleId)}/overview`))
    return () => { active = false }
  }, [bundleId, resolved, router])
  if (!resolved) return <main className="grid min-h-screen place-items-center bg-[#F9F5F1]"><div className="text-center"><LoaderCircle className="mx-auto h-8 w-8 animate-spin text-[#8B1D2C]" /><p className="mt-3 text-sm text-gray-600">Restoring the current bundle subject…</p></div></main>
  const overview = `/student/bundle/${encodeURIComponent(bundleId)}/overview`
  return <IntegratedExamScreen examId={resolved.examId} attemptId={resolved.attemptId} submission={{ action: "student-bundle-submit-current", params: { sessionAttemptId: resolved.sessionAttemptId }, recoveryPath: overview, reconciledPath: overview, successPath: (raw) => { const result = raw as BundleProgression; return result.phase === "completed" ? `/student/bundle/${encodeURIComponent(bundleId)}/results` : overview } }} />
}
