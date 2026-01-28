'use client';

import { useEffect } from 'react';
import { captureAttribution } from '@/lib/attribution';

/**
 * Attribution Capture Component
 *
 * Captures marketing attribution (UTM params, referrer) on first page load.
 * Include this in your root layout to track where customers come from.
 *
 * This is a CLIENT component because it:
 * 1. Accesses browser APIs (window, localStorage, document.referrer)
 * 2. Runs on initial page load (useEffect)
 *
 * Usage in layout.tsx:
 * <AttributionCapture />
 */
export default function AttributionCapture() {
  useEffect(() => {
    // Capture attribution data on mount
    captureAttribution();
  }, []);

  // This component renders nothing
  return null;
}
