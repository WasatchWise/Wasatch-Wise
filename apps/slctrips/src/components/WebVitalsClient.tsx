'use client';

import { useEffect } from 'react';
import { initWebVitals } from '@/lib/web-vitals';

/**
 * Client component to initialize Web Vitals tracking
 * Must be client-side because it uses browser APIs
 */
export default function WebVitalsClient() {
  useEffect(() => {
    initWebVitals();
  }, []);

  return null; // This component doesn't render anything
}

