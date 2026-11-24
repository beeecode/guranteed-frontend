"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"
import { AlertCircle, BookOpen, RefreshCw, ShieldCheck, Users } from "lucide-react"
import { AdminShell } from "@/components/layout/AdminShell"
import { StudentDashboardLive } from "@/features/student/live/StudentDashboardLive"

type Role = "student" | "admin"
type State =
  | { status: "loading" }
  | { status: "preview" }
  | { status: "disabled" }
  | { status: "error"; message: string }
  | { status: "ready"; data: Record<string, unknown> }
const object = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}
const list = (value: unknown): Record<string, unknown>[] => Array.isArray(value) ? value.map(object) : []
const label = (value: unknown, fallback: string) => typeof value === "string" && value.trim() ? value : fallback

function StatusPanel({ icon, title, message, action }: { icon: ReactNode; title: string; message: string; action?: () => void }) {
  return <main className="min-h-screen bg-[#F9F5F1] px-4 py-16 sm:px-6"><div className="mx-auto max-w-xl rounded-3xl border border-[#E8D9CB] bg-white p-8 text-center shadow-sm"><div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0F0] text-[#8B1D2C]">{icon}</div><h1 className="font-heading text-2xl font-bold text-gray-950">{title}</h1><p className="mt-3 text-sm leading-6 text-gray-600">{message}</p>{action ? <button type="button" onClick={action} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#8B1D2C] px-5 py-3 text-sm font-semibold text-white hover:bg-[#741724] focus:outline-none focus:ring-2 focus:ring-[#8B1D2C] focus:ring-offset-2"><RefreshCw className="h-4 w-4" /> Try again</button> : null}</div></main>
}

function Metric({ name, value, icon: Icon = BookOpen }: { name: string; value: number; icon?: typeof BookOpen }) {
  return <div className="rounded-2xl border border-[#E8D9CB] bg-white p-5 shadow-sm"><Icon className="mb-4 h-5 w-5 text-[#8B1D2C]" /><div className="text-3xl font-bold text-gray-950">{value}</div><div className="mt-1 text-sm text-gray-600">{name}</div></div>
}

function LiveAdminDashboard({ data }: { data: Record<string, unknown> }) {
  const profile = object(data.profile)
  const payload = object(data.stats)
  const stats = object(payload.stats)
  const recent = list(payload.recentExams)
  // Stage 11: inside AdminShell so the sidebar navigation (and real sign-out) exist in
  // integration mode; previously this page had no way to reach the other admin screens.
  return <AdminShell title="Dashboard" subtitle={`Welcome, ${label(profile.full_name, "Administrator")}`}><div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"><ShieldCheck className="h-5 w-5" /> Secure integration mode — these records were returned by the school backend.</div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric name="Students" value={Number(stats.students) || 0} icon={Users} /><Metric name="Examinations" value={Number(stats.exams) || 0} /><Metric name="Subjects" value={Number(stats.subjects) || 0} /><Metric name="Active exams" value={Number(stats.active_exams) || 0} icon={ShieldCheck} /></div><section className="mt-8 rounded-3xl border border-[#E8D9CB] bg-white p-6 shadow-sm"><h2 className="font-heading text-xl font-bold text-gray-950">Recent examinations</h2>{recent.length ? <div className="mt-5 divide-y divide-gray-100">{recent.map((exam, index) => <div key={String(exam.id ?? index)} className="py-4"><p className="font-semibold text-gray-900">{label(exam.title, "Assessment")}</p><p className="mt-1 text-sm capitalize text-gray-500">{label(exam.status, "Status unavailable")}</p></div>)}</div> : <p className="mt-5 rounded-2xl bg-gray-50 p-5 text-sm text-gray-600">No recent examinations were returned.</p>}</section></AdminShell>
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
