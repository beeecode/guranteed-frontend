"use client"

/**
 * Shown on any page when the sign-in has ended (see lib/api/sessionEvents.ts) — e.g. right
 * after the school reset the student's password. Replaces dead-end "Try again" errors with
 * a clear way back in. Exam answers already saved stay on the server; unsaved ones are kept
 * on this device and re-sent after signing in.
 */

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { LogIn } from "lucide-react"
import { SESSION_ENDED_EVENT } from "@/lib/api/sessionEvents"

export function SessionEndedNotice() {
  const pathname = usePathname() || ""
  const router = useRouter()
  const [ended, setEnded] = useState(false)
  useEffect(() => {
    const onEnded = () => setEnded(true)
    window.addEventListener(SESSION_ENDED_EVENT, onEnded)
    return () => window.removeEventListener(SESSION_ENDED_EVENT, onEnded)
  }, [])

  const portal = pathname.startsWith("/admin") ? "admin" : pathname.startsWith("/student") ? "student" : null
  if (!ended || !portal || pathname.endsWith("/login")) return null
  const inExam = /^\/student\/(exam|bundle)\//.test(pathname)

  const signIn = () => {
    // Come back to the same page after signing in (the login page only accepts local paths).
    const query = typeof window === "undefined" ? "" : window.location.search
    setEnded(false)
    router.push(`/${portal}/login?next=${encodeURIComponent(pathname + query)}`)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" role="alertdialog" aria-modal="true" aria-labelledby="session-ended-title">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF0F0] text-[#B22234]">
          <LogIn className="h-7 w-7" />
        </div>
        <h2 id="session-ended-title" className="text-xl font-bold text-gray-950">Please sign in again</h2>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          Your sign-in has ended. This happens when your password is changed by the school, or when you have been signed out.
          {portal === "student" ? " Use your Student ID and the password the school gave you." : ""}
        </p>
        {inExam ? <p className="mt-3 rounded-xl bg-green-50 px-4 py-2 text-xs font-medium text-green-800">Your saved answers are safe. Sign in and open the exam again to continue.</p> : null}
        <button type="button" onClick={signIn} autoFocus className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#B22234] px-6 py-3 text-sm font-bold text-white hover:bg-[#971c2c]">
          <LogIn className="h-4 w-4" /> Sign in again
        </button>
      </div>
    </div>
  )
}
