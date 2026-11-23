"use client"

import { useEffect, useState, type ReactNode } from "react"
import { AlertCircle, LoaderCircle } from "lucide-react"

type Mode = "loading" | "mock" | "integration" | "disabled" | "error"
export function AdminModeBoundary({ preview, integrated }: { preview: ReactNode; integrated: ReactNode }) {
  const [mode, setMode] = useState<Mode>("loading")
  useEffect(() => {
    let active = true
    void fetch("/api/bff/config", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error("Configuration unavailable")
      const data = await response.json() as { mode?: string }
      return data.mode === "mock" || data.mode === "integration" || data.mode === "disabled" ? data.mode : "error"
    }).catch(() => "error" as const).then((next) => { if (active) setMode(next) })
    return () => { active = false }
  }, [])
  if (mode === "mock") return preview
  if (mode === "integration") return integrated
  return <main className="grid min-h-[50vh] place-items-center"><section className="max-w-lg rounded-3xl border border-[#E8D9CB] bg-white p-8 text-center shadow-sm">{mode === "loading" ? <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-[#8B1D2C]" /> : <AlertCircle className="mx-auto h-8 w-8 text-[#8B1D2C]" />}<h2 className="mt-4 text-xl font-bold">{mode === "disabled" ? "Administration unavailable" : mode === "error" ? "Configuration unavailable" : "Preparing administration"}</h2><p className="mt-2 text-sm text-gray-600">Secure application mode must be verified before administrative data can be shown.</p></section></main>
}
