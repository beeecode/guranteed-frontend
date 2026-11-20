"use client"

/** Simulated sign-in: shows a 1.2s loading state, then succeeds if the fields are filled. */

import { useState } from "react"

interface MockLoginOptions {
  isValid: () => boolean
  onSuccess: () => void
  errorMessage: string
}
export function useMockLogin({
  isValid,
  onSuccess,
  errorMessage,
}: MockLoginOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setTimeout(() => {
      if (isValid()) {
        onSuccess()
      } else {
        setError(errorMessage)
        setLoading(false)
      }
    }, 1200)
  }

  return { loading, error, submit }
}
