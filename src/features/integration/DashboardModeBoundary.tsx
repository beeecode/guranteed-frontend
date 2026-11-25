"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { AdminShell } from "@/components/layout/AdminShell"
import { AdminOverview } from "@/features/admin/components/AdminOverview"
import { StudentDashboardLive } from "@/features/student/live/StudentDashboardLive"
import { announceSessionEnded, SESSION_ENDED_MESSAGE } from "@/lib/api/sessionEvents"

type Role = "student" | "admin"
type State =
  | { status: "loading" }
  | { status: "preview" }
  | { status: "disabled" }
  | { status: "error"; message: string }
  | { status: "ready"; data: Record<string, unknown> }
const object = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}
const label = (value: unknown, fallback: string) => typeof value === "string" && value.trim() ? value : fallback

function StatusPanel({ icon, title, message, action }: { icon: ReactNode; title: string; message: string; action?: () => void }) {
  return <main className="min-h-screen bg-[#F9F5F1] px-4 py-16 sm:px-6"><div className="mx-auto max-w-xl rounded-3xl border border-[#E8D9CB] bg-white p-8 text-center shadow-sm"><div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0F0] text-[#8B1D2C]">{icon}</div><h1 className="font-heading text-2xl font-bold text-gray-950">{title}</h1><p className="mt-3 text-sm leading-6 text-gray-600">{message}</p>{action ? <button type="button" onClick={action} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#8B1D2C] px-5 py-3 text-sm font-semibold text-white hover:bg-[#741724] focus:outline-none focus:ring-2 focus:ring-[#8B1D2C] focus:ring-offset-2"><RefreshCw className="h-4 w-4" /> Try again</button> : null}</div></main>
}

/** Stage 11: the designed admin overview on the live dashboard payload. */
function LiveAdminDashboard({ data }: { data: Record<string, unknown> }) {
  const profile = object(data.profile)
  return <AdminShell title="Dashboard" subtitle={`Welcome back, ${label(profile.full_name, "Administrator")}`}><AdminOverview data={data} /></AdminShell>
}

export function DashboardModeBoundary({ role, preview }: { role: Role; preview: ReactNode }) {
  const [state, setState] = useState<State>({ status: "loading" })
  const requestDashboard = useCallback(async (): Promise<State> => {
    try {
      const config = await (await fetch("/api/bff/config", { cache: "no-store" })).json() as { mode?: string }
      if (config.mode === "mock") return { status: "preview" }
      if (config.mode !== "integration") return { status: "disabled" }
      const response = await fetch(`/api/bff/${role}/dashboard`, { cache: "no-store" })
      const data = await response.json() as Record<string, unknown> & { message?: string }
      if (response.status === 401) { announceSessionEnded(); throw new Error(SESSION_ENDED_MESSAGE) }
      if (!response.ok) throw new Error(data.message || "The dashboard could not be loaded.")
      return { status: "ready", data }
    } catch (error) { return { status: "error", message: error instanceof Error ? error.message : "The dashboard could not be loaded." } }
  }, [role])
  useEffect(() => {
    let active = true
    void requestDashboard().then((next) => { if (active) setState(next) })
    return () => { active = false }
  }, [requestDashboard])
  const retry = () => {
    setState({ status: "loading" })
    void requestDashboard().then(setState)
  }
  if (state.status === "preview") return preview
  if (state.status === "disabled") return <StatusPanel icon={<AlertCircle className="h-6 w-6" />} title="Portal integration is disabled" message="No account data or sample records are available in disabled mode." />
  if (state.status === "error") return <StatusPanel icon={<AlertCircle className="h-6 w-6" />} title="We could not load this dashboard" message={state.message} action={retry} />
  if (state.status === "loading") return <StatusPanel icon={<RefreshCw className="h-6 w-6 animate-spin" />} title="Loading your dashboard" message="Verifying your secure session and requesting the latest records…" />
  if (state.status !== "ready") return null
  return role === "student" ? <StudentDashboardLive data={state.data} /> : <LiveAdminDashboard data={state.data} />
}
