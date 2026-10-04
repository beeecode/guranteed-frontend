'use client';

import { useEffect, useRef, useState } from 'react';

interface CountdownOptions {
  /** Pauses the countdown while false. */
  running?: boolean;
  /** Fires once when the countdown reaches zero while running. */
  onExpire?: () => void;
}

/** One-second countdown used by the exam timers and the bundle break screen. */
export function useCountdown(initialSeconds: number, { running = true, onExpire }: CountdownOptions = {}) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const expired = secondsLeft === 0;

  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    if (!running || expired) return;
    const timer = setInterval(() => setSecondsLeft(t => (t <= 1 ? 0 : t - 1)), 1000);
    return () => clearInterval(timer);
  }, [running, expired]);

  useEffect(() => {
    if (running && expired) onExpireRef.current?.();
  }, [running, expired]);

  return { secondsLeft, reset: setSecondsLeft };
}
