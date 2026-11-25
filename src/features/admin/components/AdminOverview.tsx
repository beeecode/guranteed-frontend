"use client"

/**
 * Admin dashboard body (Stage 11: live data). KPIs and recent exams come from
 * GET /api/admin/stats, the charts from GET /api/admin/analytics (both loaded by the BFF
 * dashboard route), bundle counts from the bundle list and the activity feed from the audit
 * log. Nothing is invented: a figure the server did not return shows "—".
 */

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Activity,
  BarChart2,
  BookOpen,
  CheckCircle,
  ChevronRight,
  FileText,
  Layers,
  Users,
  Zap,
} from "lucide-react"
import { bffClient } from "@/lib/api/bffClient"
import { ScoreBandChart, SubjectScoreChart } from "./DashboardCharts"

type Json = Record<string, unknown>
const obj = (value: unknown): Json => (value && typeof value === "object" && !Array.isArray(value) ? value as Json : {})
const arr = (value: unknown): Json[] => (Array.isArray(value) ? value.map(obj) : [])
const num = (value: unknown): number | null => (typeof value === "number" && Number.isFinite(value) ? value : null)
const text = (value: unknown, fallback = "") => (typeof value === "string" && value.trim() ? value : fallback)

const ago = (iso: string) => {
  const minutes = Math.round((Date.now() - Date.parse(iso)) / 60_000)
  if (!Number.isFinite(minutes)) return ""
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`
  const days = Math.round(hours / 24)
  return days === 1 ? "Yesterday" : `${days} days ago`
}

const quickActions = [
  { label: "Add Student", icon: Users, path: "/admin/students", color: "#2563EB" },
  { label: "Add Question", icon: BookOpen, path: "/admin/questions", color: "#B22234" },
  { label: "Create Exam", icon: Zap, path: "/admin/exams", color: "#16A34A" },
  { label: "Create Bundle", icon: Layers, path: "/admin/bundles/create", color: "#7C3AED" },
  { label: "View Results", icon: FileText, path: "/admin/results", color: "#0891B2" },
]

const statusBadge: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  draft: "bg-yellow-100 text-yellow-700",
  closed: "bg-gray-100 text-gray-600",
}

/** Admin dashboard body: KPIs, charts, recent exams, activity, bundle widgets and quick actions. */
export function AdminOverview({ data }: { data: Json }) {
  const statsPayload = obj(data.stats)
  const stats = obj(statsPayload.stats)
  const recentExams = arr(statsPayload.recentExams)
  const analytics = obj(data.analytics)
  const analyticsStats = obj(analytics.stats)
  const subjectAverages = arr(analytics.subjectAverages).map((row) => ({ name: text(row.name, "Subject"), avg: num(row.avg) ?? 0 }))

  const [bundles, setBundles] = useState<Json[] | null>(null)
  const [activity, setActivity] = useState<Json[] | null>(null)
  useEffect(() => {
    void bffClient.action<{ bundles?: Json[] }>("admin-bundles-list").then((value) => setBundles(value.bundles ?? [])).catch(() => setBundles([]))
    void bffClient.action<{ logs?: Json[] }>("admin-audit-logs", { params: { limit: 6 } }).then((value) => setActivity(value.logs ?? [])).catch(() => setActivity([]))
  }, [])

  const bundleCount = (...statuses: string[]) => (bundles ? bundles.filter((bundle) => statuses.includes(text(bundle.status))).length : null)
  const liveBundles = bundleCount("live", "ongoing")
  const submissions = num(analyticsStats.total_submissions)
  const average = num(analyticsStats.avg_score)
  const show = (value: number | null) => (value === null ? "—" : String(value))

  const cards = [
    { label: "Total Students", value: show(num(stats.students)), change: "Registered accounts", icon: Users, color: "#2563EB", bg: "#EFF6FF" },
    { label: "Active Exams", value: show(num(stats.active_exams)), change: liveBundles === null ? "Checking bundles…" : `${liveBundles} bundle(s) live now`, icon: Zap, color: "#16A34A", bg: "#F0FDF4" },
    { label: "Total Subjects", value: show(num(stats.subjects)), change: "In the question bank", icon: BookOpen, color: "#B22234", bg: "#FFF0F0" },
    { label: "Total Exams", value: show(num(stats.exams)), change: "All statuses", icon: FileText, color: "#7C3AED", bg: "#F5F3FF" },
    { label: "Submitted Results", value: show(submissions), change: "Across all exams", icon: CheckCircle, color: "#D97706", bg: "#FFFBEB" },
    { label: "Avg Performance", value: average === null || !submissions ? "—" : `${Math.round(average)}%`, change: "Score ÷ exam total marks", icon: BarChart2, color: "#0891B2", bg: "#ECFEFF" },
  ]
  const widgets = [
    { label: "Bundles Live", value: liveBundles, emoji: "🟢", color: "#16A34A", bg: "rgba(22,163,74,0.1)" },
    { label: "Bundles Scheduled", value: bundleCount("scheduled"), emoji: "📅", color: "#2563EB", bg: "rgba(37,99,235,0.1)" },
    { label: "Bundle Drafts", value: bundleCount("draft"), emoji: "📝", color: "#D97706", bg: "rgba(217,119,6,0.1)" },
    { label: "Bundles Closed", value: bundleCount("closed"), emoji: "🔒", color: "#6B7280", bg: "rgba(107,114,128,0.1)" },
  ]

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {cards.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div className="font-heading text-2xl font-700 text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-700 font-medium mt-0.5">{s.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.change}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="font-heading font-700 text-gray-900 mb-5">Average Score by Subject</h3>
          <SubjectScoreChart data={subjectAverages} />
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="font-heading font-700 text-gray-900 mb-5">Score Bands</h3>
          <ScoreBandChart distribution={obj(analytics.distribution) as Record<string, number>} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Exams */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading font-700 text-gray-900">Recent Examinations</h3>
            <Link href="/admin/exams" className="text-xs text-[#B22234] font-medium flex items-center gap-1 hover:gap-2 transition-all">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentExams.length === 0 ? <p className="rounded-2xl bg-[#F9F5F1] p-4 text-sm text-gray-500">No examinations yet.</p> : null}
            {recentExams.map((exam, i) => {
              const status = text(exam.status, "draft")
              return (
                <div key={String(exam.id ?? i)} className="flex items-center gap-4 p-3 bg-[#F9F5F1] rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-[#B22234] flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate">{text(exam.title, "Exam")}</div>
                    <div className="text-xs text-gray-400">
                      {[text(obj(exam.subject).name), num(exam.duration_mins) ? `${exam.duration_mins} min` : "", text(exam.created_at) ? new Date(text(exam.created_at)).toLocaleDateString() : ""].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusBadge[status] ?? "bg-gray-100 text-gray-600"}`}>
                    {status === "active" ? (exam.is_paused ? "⏸ Paused" : "🟢 Active") : status}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="font-heading font-700 text-gray-900 mb-5">Recent Activity</h3>
          <div className="space-y-4">
            {activity === null ? <p className="text-xs text-gray-400">Loading…</p> : activity.length === 0 ? <p className="text-xs text-gray-400">No admin activity recorded yet.</p> : null}
            {(activity ?? []).map((entry, i) => (
              <div key={String(entry.id ?? i)} className="flex gap-3">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "#B2223415" }}>
                  <Activity className="w-3.5 h-3.5" style={{ color: "#B22234" }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-700 leading-snug break-words">{text(entry.description, text(entry.action_type, "Admin action"))}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{text(entry.created_at) ? ago(text(entry.created_at)) : ""}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bundle widgets */}
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {widgets.map((w) => (
          <Link key={w.label} href="/admin/bundles" className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: w.bg }}>{w.emoji}</div>
            <div>
              <div className="text-2xl font-bold" style={{ color: w.color }}>{w.value === null ? "—" : w.value}</div>
              <div className="text-xs text-gray-500">{w.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {quickActions.map((action) => (
          <Link key={action.label} href={action.path} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-all group border border-transparent hover:border-[#D9C6B2]">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: action.color + "12" }}>
              <action.icon className="w-5 h-5" style={{ color: action.color }} />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{action.label}</span>
            <ChevronRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-gray-500" />
          </Link>
        ))}
      </div>
    </>
  )
}
