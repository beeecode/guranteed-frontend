"use client"

/**
 * Stage 11: the DESIGNED student dashboard (PortalDashboardShell, WelcomeBanner,
 * DashboardStats, BundleExamCard, RecentResults, MotivationCard) driven by live data from
 * /api/bff/student/dashboard. Announcements are omitted (owner decision 2026-11-24); only
 * released results are shown; the server decides which bundles can be started.
 */

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { PortalDashboardShell, type PortalNavItem } from "@/components/layout/PortalDashboardShell"
import { bffClient } from "@/lib/api/bffClient"
import type { BundlePayload } from "@/features/bundle/integration/types"
import { bundlePhase, subjectEmoji, toExamBundle } from "@/features/bundle/live/adapters"
import { BundleExamCard, DashboardStats, MotivationCard, RecentResults, WelcomeBanner } from "../components/DashboardSections"
import type { RecentResult } from "@/types/student"

type Row = Record<string, unknown>
const object = (value: unknown): Row => (value && typeof value === "object" && !Array.isArray(value) ? (value as Row) : {})
const list = (value: unknown): Row[] => (Array.isArray(value) ? value.map(object) : [])
const text = (value: unknown, fallback = "") => (typeof value === "string" && value.trim() ? value : fallback)
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "S"

/** Only screens that work with live data are linked (results/performance pages come later). */
const LIVE_NAV: PortalNavItem[] = [{ id: "dashboard", label: "Dashboard", emoji: "🏠", path: "/student/dashboard" }]

const BUNDLE_ACTION: Record<string, { label: string; status: string }> = {
  "not-started": { label: "START EXAM 🚀", status: "Ready" },
  exam: { label: "CONTINUE EXAM →", status: "In progress" },
  "subject-complete": { label: "NEXT SUBJECT →", status: "In progress" },
  break: { label: "RETURN FROM BREAK →", status: "On break" },
  paused: { label: "VIEW STATUS", status: "Paused" },
}

const cardClass = "bg-white p-6"
const cardStyle = { borderRadius: 24 }

export function StudentDashboardLive({ data }: { data: Row }) {
  const router = useRouter()
  const profile = object(data.profile)
  const dashboard = object(data.dashboard)
  const results = object(data.results)
  const stats = object(results.stats)
  const bundles = Array.isArray(data.bundles) ? list(data.bundles) : list(object(data.bundles).bundles)
  const exams = list(dashboard.activeExams)

  const name = text(profile.full_name, "Student")
  const studentId = text(profile.student_id)
  // Student IDs are built from the class code ("SS1-4821", "JAMB-1234").
  const classLabel = text(profile.class) || studentId.split("-")[0] || ""

  // Each listed bundle carries its own subjects, attempt and availability.
  const bundleViews = bundles.map((raw) => {
    const payload = { bundle: raw, sessionAttempt: raw.sessionAttempt ?? null, availability: raw.availability } as unknown as BundlePayload
    return { id: String(raw.id), payload, phase: bundlePhase(payload), exam: toExamBundle(payload), canStart: object(raw.availability).canStart !== false, reason: text(object(raw.availability).reason) }
  })
  const upcoming = bundleViews.filter((view) => view.phase !== "bundle-done" && (view.phase !== "not-started" || view.canStart))
  const unavailable = bundleViews.filter((view) => view.phase === "not-started" && !view.canStart)
  const completed = bundleViews.filter((view) => view.phase === "bundle-done")

  const released = list(results.entries).filter((entry) => entry.percentage !== null && entry.percentage !== undefined)
  const recent: RecentResult[] = released.slice(0, 5).map((entry) => {
    const pct = Math.round(Number(entry.percentage) || 0)
    const subject = text(entry.subject, "Subject")
    const when = text(entry.submitted_at)
    return {
      subject: entry.bundle_name ? `${subject} · ${text(entry.bundle_name)}` : subject,
      score: Number(entry.score) || 0,
      total: Number(entry.total_marks) || 0,
      grade: text(entry.grade) || `${pct}%`,
      emoji: subjectEmoji(subject),
      date: when ? new Date(when).toLocaleDateString(undefined, { dateStyle: "medium" }) : "",
    }
  })
  const average = Number(stats.average) || 0
  const tiles = [
    { label: "Exam Bundles", value: String(bundles.length), emoji: "📚", border: "#B22234" },
    { label: "Exams Completed", value: String(Number(stats.completed) || 0), emoji: "✅", border: "#16A34A" },
    { label: "Results Released", value: String(Number(stats.released) || 0), emoji: "📊", border: "#E8B830" },
    { label: "Average Score", value: released.length ? `${Math.round(average)}%` : "—", emoji: "⭐", border: "#3B82F6" },
  ]

  const logout = async () => {
    try { await bffClient.logout() } catch { /* already signed out */ }
    router.replace("/student/login")
  }

  return (
    <PortalDashboardShell
      portalName="Student Portal"
      title="My Dashboard"
      session=""
      user={{ name, avatar: initials(name), detail: classLabel }}
      navItems={LIVE_NAV}
      onLogout={() => void logout()}
    >
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <WelcomeBanner student={{ name, id: studentId, class: classLabel, avatar: initials(name), session: "" }} />
        <DashboardStats stats={tiles} />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {upcoming.length ? upcoming.map((view) => (
              <BundleExamCard key={view.id} bundle={view.exam} live={BUNDLE_ACTION[view.phase] ? { actionLabel: BUNDLE_ACTION[view.phase].label, status: BUNDLE_ACTION[view.phase].status } : undefined} />
            )) : (
              <div className={`${cardClass} text-center`} style={cardStyle}>
                <div className="text-4xl mb-2">🎉</div>
                <div className="font-playful font-bold text-[#1C0A04]">No exams waiting for you right now</div>
                <p className="text-sm text-[#7A5C3A] mt-1">When your teacher opens an exam for your class, it will appear here.</p>
              </div>
            )}

            {unavailable.length ? (
              <div className={cardClass} style={cardStyle}>
                <h3 className="font-playful font-bold text-[#1C0A04] mb-3">🗓️ Coming Up</h3>
                {unavailable.map((view) => (
                  <Link key={view.id} href={`/student/bundle/${encodeURIComponent(view.id)}/overview`} className="flex items-center gap-3 py-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#1C0A04] truncate">{view.exam.name}</div>
                      <div className="text-xs text-[#B8967A]">{view.reason || "Not open yet"}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#B8967A]" />
                  </Link>
                ))}
              </div>
            ) : null}

            {exams.length ? (
              <div className={cardClass} style={cardStyle}>
                <h3 className="font-playful font-bold text-[#1C0A04] mb-3">📝 Other Exams</h3>
                {exams.map((exam) => (
                  <Link key={String(exam.id)} href={`/student/exam/${encodeURIComponent(String(exam.id))}/instructions`} className="flex items-center gap-3 py-2">
                    <span className="text-lg">{subjectEmoji(text(object(exam.subject).name))}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#1C0A04] truncate">{text(exam.title, "Exam")}</div>
                      <div className="text-xs text-[#B8967A]">{Number(exam.duration_mins) || 0} minutes</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#B8967A]" />
                  </Link>
                ))}
              </div>
            ) : null}

            {recent.length ? <RecentResults results={recent} viewAllHref={null} /> : (
              <div className={cardClass} style={cardStyle}>
                <h3 className="font-playful font-bold text-[#1C0A04] mb-2">🏆 Recent Results</h3>
                <p className="text-sm text-[#7A5C3A]">No results have been released yet. Your teacher publishes them after marking.</p>
              </div>
            )}
          </div>

          <div className="space-y-5">
            {completed.length ? (
              <div className={cardClass} style={cardStyle}>
                <h3 className="font-playful font-bold text-[#1C0A04] mb-3">✅ Completed Exams</h3>
                {completed.map((view) => (
                  <Link key={view.id} href={`/student/bundle/${encodeURIComponent(view.id)}/results`} className="flex items-center gap-3 py-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#1C0A04] truncate">{view.exam.name}</div>
                      <div className="text-xs text-[#B8967A]">{view.exam.subjects.length} subjects · view results</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#B8967A]" />
                  </Link>
                ))}
              </div>
            ) : null}
            <MotivationCard />
          </div>
        </div>
      </main>
    </PortalDashboardShell>
  )
}
