"use client"
/** Pauses the countdown while false. */
/** Fires once when the countdown reaches zero while running. */

/** One-second countdown used by the exam timers and the bundle break screen. */
import { useEffect, useRef, useState } from "react"

interface CountdownOptions {
  running?: boolean
  onExpire?: () => void
}
export function useCountdown(
  initialSeconds: number,
  { running = true, onExpire }: CountdownOptions = {},
) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const expired = secondsLeft === 0

  const onExpireRef = useRef(onExpire)
  useEffect(() => {
    onExpireRef.current = onExpire
  })

  useEffect(() => {
    if (!running || expired) return
    const timer = setInterval(
      () => setSecondsLeft((t) => (t <= 1 ? 0 : t - 1)),
      1000,
    )
    return () => clearInterval(timer)
  }, [running, expired])

  useEffect(() => {
    if (running && expired) onExpireRef.current?.()
  }, [running, expired])

  return { secondsLeft, reset: setSecondsLeft }
}
