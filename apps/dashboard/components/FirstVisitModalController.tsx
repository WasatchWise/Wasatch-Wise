'use client';

import { usePathname } from 'next/navigation';
import { getModalContentForPath } from '@/lib/first-visit-modal-config';
import { FirstVisitModal } from '@/components/FirstVisitModal';

/**
 * Renders the first-visit modal for the current entry point when applicable.
 * Aligned with Sabrina Matrix: one modal per brand (/, /adult-ai-academy).
 */
export function FirstVisitModalController() {
  const pathname = usePathname();
  const content = pathname ? getModalContentForPath(pathname) : null;
  if (!content) return null;
  return <FirstVisitModal content={content} />;
}
