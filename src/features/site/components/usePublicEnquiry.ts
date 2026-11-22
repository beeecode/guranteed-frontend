"use client"

import { useState } from "react"

type SubmissionState = "idle" | "submitting" | "submitted"

export function usePublicEnquiry(endpoint: "contact" | "admissions") {
  const [state, setState] = useState<SubmissionState>("idle")
  const [error, setError] = useState("")

  const submit = async (payload: Record<string, string>) => {
    setError("")
    setState("submitting")
    try {
      const configResponse = await fetch("/api/bff/config", { cache: "no-store" })
      const config = (await configResponse.json()) as { mode?: string }
      if (config.mode === "mock") {
        throw new Error("Preview mode is active. Your enquiry has not been sent or stored.")
      }
      if (config.mode !== "integration") {
        throw new Error("Online enquiries are temporarily unavailable. Please contact the school directly.")
      }

      const response = await fetch(`/api/bff/public/${endpoint}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })
      const body = (await response.json().catch(() => ({}))) as { message?: string }
      if (!response.ok) throw new Error(body.message || "We could not send your enquiry.")
      setState("submitted")
      return true
    } catch (submissionError) {
      setState("idle")
      setError(submissionError instanceof Error ? submissionError.message : "We could not send your enquiry.")
      return false
    }
  }

  return { error, isSubmitting: state === "submitting", submitted: state === "submitted", submit }
}
