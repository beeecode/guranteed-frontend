"use client"

import { useCallback, useEffect, useState } from "react"

interface Options {
  portal: "student" | "admin" | "parent"
  identifier: string
  password: string
  onSuccess: () => void
  validationMessage: string
}

export function usePortalLogin(options: Options) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [mode, setMode] = useState<string | null>(null)

  const readMode = useCallback(async () => {
    const response = await fetch("/api/bff/config", { cache: "no-store" })
    const payload = await response.json() as { mode?: string }
    const current = payload.mode || "disabled"
    setMode(current)
    return current
  }, [])

  useEffect(() => {
    let active = true
    void fetch("/api/bff/config", { cache: "no-store" })
      .then((response) => response.json() as Promise<{ mode?: string }>)
      .then((payload) => { if (active) setMode(payload.mode || "disabled") })
      .catch(() => { if (active) setMode("disabled") })
    return () => { active = false }
  }, [])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!options.identifier.trim() || !options.password) {
      setError(options.validationMessage)
      return
    }
    setLoading(true)
    setError("")
    try {
      const currentMode = mode || await readMode()
      if (currentMode === "mock") {
        await new Promise((resolve) => setTimeout(resolve, 400))
        options.onSuccess()
        return
      }
      if (currentMode !== "integration") throw new Error("Backend integration is currently disabled.")
      if (options.portal === "parent") throw new Error("The parent portal is not supported by the current backend.")
      const response = await fetch("/api/bff/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ identifier: options.identifier, password: options.password, portal: options.portal }),
      })
      const payload = await response.json() as { message?: string }
      if (!response.ok) throw new Error(payload.message || "Sign-in failed. Please try again.")
      options.onSuccess()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign-in failed. Please try again.")
      setLoading(false)
    }
  }

  return { loading, error, mode, submit }
}
