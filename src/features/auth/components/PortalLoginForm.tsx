"use client"
/** e.g. 'numeric' for a PIN */

/** Mock credential form (ID + password/PIN) shared by the student and parent portals. */
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Spinner } from "@/components/ui/Spinner"
import { usePortalLogin } from "../hooks/usePortalLogin"
import { returnPath } from "../returnPath"
import { AuthModeNotice } from "./AuthModeNotice"

const inputStyle = {
  background: "#fff",
  border: "2px solid rgba(217,198,178,0.6)",
  borderRadius: 14,
  color: "#1C0A04",
}
const focusBorder = (e: React.FocusEvent<HTMLInputElement>) =>
  (e.target.style.borderColor = "#B22234")
const blurBorder = (e: React.FocusEvent<HTMLInputElement>) =>
  (e.target.style.borderColor = "rgba(217,198,178,0.6)")

export interface PortalLoginFormConfig {
  portal?: "student" | "parent"
  idLabel: string
  idPlaceholder: string
  secretLabel: string
  secretPlaceholder: string
  secretInputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  forgotLabel: string
  rememberLabel: string
  submitLabel: string
  successPath: string
  errorMessage: string
}
export function PortalLoginForm({ config }: { config: PortalLoginFormConfig }) {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ id: "", password: "" })
  const { loading, error, mode, submit } = usePortalLogin({
    portal: config.portal || "student",
    identifier: form.id,
    password: form.password,
    onSuccess: () => router.push(config.portal === "parent" ? config.successPath : returnPath("/student", config.successPath)),
    validationMessage: config.errorMessage,
  })

  return (
    <form onSubmit={submit} className="space-y-5">
      <AuthModeNotice mode={mode} />
      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm font-medium"
          style={{ borderRadius: 14 }}
        >
          ⚠️ {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-[#7A5C3A] uppercase tracking-widest mb-2">
          {config.idLabel}
        </label>
        <input
          type="text"
          required
          value={form.id}
          onChange={(e) => setForm({ ...form, id: e.target.value })}
          className="w-full px-4 py-3.5 text-sm font-medium transition-all duration-200 focus:outline-none"
          style={inputStyle}
          onFocus={focusBorder}
          onBlur={blurBorder}
          placeholder={config.idPlaceholder}
        />
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <label className="text-xs font-bold text-[#7A5C3A] uppercase tracking-widest">
            {config.secretLabel}
          </label>
          <a
            href="#"
            className="text-xs text-[#B22234] hover:underline font-medium"
          >
            {config.forgotLabel}
          </a>
        </div>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-3.5 pr-12 text-sm font-medium transition-all duration-200 focus:outline-none"
            style={inputStyle}
            onFocus={focusBorder}
            onBlur={blurBorder}
            placeholder={config.secretPlaceholder}
            inputMode={config.secretInputMode}
          />
          <button
            type="button"
            aria-label={show ? "Hide password" : "Show password"}
            onClick={() => setShow(!show)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B8967A] hover:text-[#8B0000] transition-colors"
          >
            {show ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="remember"
          className="w-4 h-4 rounded accent-[#B22234]"
        />
        <label htmlFor="remember" className="text-sm text-[#7A5C3A]">
          {config.rememberLabel}
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 font-bold font-playful text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{
          background: "#B22234",
          borderRadius: 999,
          boxShadow: "0 4px 16px rgba(178,34,52,0.3)",
          fontSize: "1rem",
        }}
      >
        {loading ? (
          <>
            <Spinner />
            {mode === "integration" ? "Signing in…" : "Opening preview…"}
          </>
        ) : (
          mode === "integration" ? config.submitLabel : `${config.submitLabel} (Preview)`
        )}
      </button>
    </form>
  )
}
