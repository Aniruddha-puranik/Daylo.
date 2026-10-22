'use client';

import { useEffect } from 'react';

export function PwaInit() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(error => {
      console.error('Daylo could not enable offline app support:', error);
    });
  }, []);

  return null;
}
