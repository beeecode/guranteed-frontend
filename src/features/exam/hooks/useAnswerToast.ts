"use client"

/** Random "Great choice!" toast shown briefly after a student picks an answer. */

import { useCallback, useEffect, useRef, useState } from "react"

const encouragements = [
  "Great choice! 🎯",
  "Nice one! ⭐",
  "You got it! 💪",
  "Brilliant! 🌟",
  "Smart pick! 🧠",
  "Awesome! 🚀",
]

const TOAST_MS = 2200
/** `messages` overrides the playful praise (live exams use a neutral confirmation, because
 * praise like "You got it!" can be read as "your answer is correct"). */
export function useAnswerToast(messages: string[] = encouragements) {
  const [toast, setToast] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  const celebrate = useCallback(() => {
    const msg =
      messages[Math.floor(Math.random() * messages.length)]
    setToast(msg)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast(null), TOAST_MS)
  }, [messages])

  return { toast, celebrate }
}
