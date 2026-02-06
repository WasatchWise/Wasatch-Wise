'use client';

import { usePathname } from 'next/navigation';
import DanConcierge from './DanConcierge';

/**
 * Global "Ask Dan" floating chat on the main site.
 * Renders on every page except TripKit viewer pages (where TripKitViewer
 * already shows a TripKit-specific Dan Concierge).
 */
export default function GlobalDanConcierge() {
  const pathname = usePathname() ?? '';

  // On TripKit detail pages (/tripkits/[slug]) we already have Dan in TripKitViewer
  const isTripKitViewerPage = pathname.startsWith('/tripkits/') && pathname !== '/tripkits';

  if (isTripKitViewerPage) {
    return null;
  }

  return (
    <DanConcierge
      tripkitCode="site"
      tripkitName="SLCTrips"
      destinations={[]}
    />
  );
}
