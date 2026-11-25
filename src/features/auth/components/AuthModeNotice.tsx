import { ShieldCheck, WifiOff } from "lucide-react"

export function AuthModeNotice({ mode }: { mode: string | null }) {
  if (mode === null) return <div role="status" className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">Checking secure sign-in availability…</div>
  if (mode === "mock") return <div role="status" className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600"><strong>Preview mode.</strong> Sign-in is not connected to the school server.</div>
  if (mode === "integration") return <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-950"><ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0" /><span><strong>Secure sign-in enabled.</strong> Credentials are sent only to the same-origin server session endpoint.</span></div>
  return <div role="status" className="flex items-start gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700"><WifiOff className="mt-0.5 h-4 w-4 flex-shrink-0" /><span><strong>Sign-in unavailable.</strong> Backend integration is disabled.</span></div>
}
