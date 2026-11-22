"use client"

import { useEffect, useState, type ReactNode } from "react"
import { AlertCircle, LoaderCircle } from "lucide-react"

type Mode = "loading" | "mock" | "integration" | "disabled" | "error"

function Message({ loading = false, title, body }: { loading?: boolean; title: string; body: string }) {
  return <main className="min-h-screen bg-[#F9F5F1] px-4 py-16"><section className="mx-auto max-w-xl rounded-3xl border border-[#E8D9CB] bg-white p-8 text-center shadow-sm">{loading ? <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-[#8B1D2C]" /> : <AlertCircle className="mx-auto h-8 w-8 text-[#8B1D2C]" />}<h1 className="mt-4 text-2xl font-bold text-gray-950">{title}</h1><p className="mt-3 text-sm leading-6 text-gray-600">{body}</p></section></main>
}

export function ExamModeBoundary({ preview, integrated }: { preview: ReactNode; integrated: ReactNode }) {
  const [mode, setMode] = useState<Mode>("loading")
  useEffect(() => {
    let active = true
    void fetch("/api/bff/config", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Configuration unavailable")
        const data = await response.json() as { mode?: string }
        return data.mode === "mock" || data.mode === "integration" || data.mode === "disabled" ? data.mode : "error"
      })
      .catch(() => "error" as const)
      .then((next) => { if (active) setMode(next) })
    return () => { active = false }
  }, [])
  if (mode === "mock") return preview
  if (mode === "integration") return integrated
  if (mode === "disabled") return <Message title="Examinations are unavailable" body="The secure examination service is disabled. No sample or live attempt was started." />
  if (mode === "error") return <Message title="Examination service unavailable" body="We could not verify the application mode. Refresh when your connection is stable." />
  return <Message loading title="Preparing your examination" body="Verifying the secure application configuration…" />
}
