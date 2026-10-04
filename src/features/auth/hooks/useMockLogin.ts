'use client';

import { useState } from 'react';

interface MockLoginOptions {
  isValid: () => boolean;
  onSuccess: () => void;
  errorMessage: string;
}

/** Simulated sign-in: shows a 1.2s loading state, then succeeds if the fields are filled. */
export function useMockLogin({ isValid, onSuccess, errorMessage }: MockLoginOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      if (isValid()) {
        onSuccess();
      } else {
        setError(errorMessage);
        setLoading(false);
      }
    }, 1200);
  };

  return { loading, error, submit };
}
