'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const encouragements = ['Great choice! 🎯', 'Nice one! ⭐', 'You got it! 💪', 'Brilliant! 🌟', 'Smart pick! 🧠', 'Awesome! 🚀'];

const TOAST_MS = 2200;

/** Random "Great choice!" toast shown briefly after a student picks an answer. */
export function useAnswerToast() {
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const celebrate = useCallback(() => {
    const msg = encouragements[Math.floor(Math.random() * encouragements.length)];
    setToast(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  return { toast, celebrate };
}
