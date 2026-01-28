'use client';

import { useEffect, useState } from 'react';
import ShareButton from './ShareButton';

interface ClientOnlyShareButtonProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  variant?: 'button' | 'icon' | 'dropdown';
  className?: string;
}

/**
 * Client-only wrapper for ShareButton to prevent hydration mismatches
 * in server-rendered pages. Only renders ShareButton after client-side hydration.
 */
export default function ClientOnlyShareButton(props: ClientOnlyShareButtonProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render placeholder during SSR to match client-side initial render
  if (!mounted) {
    if (props.variant === 'dropdown') {
      return (
        <div className={`relative ${props.className || ''}`}>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md min-h-[44px] opacity-0 pointer-events-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </div>
        </div>
      );
    }
    if (props.variant === 'icon') {
      return (
        <div className={`flex items-center gap-2 ${props.className || ''}`}>
          <div className="p-2 text-gray-600 rounded-full opacity-0 pointer-events-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </div>
        </div>
      );
    }
    return (
      <div className={`flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg ${props.className || ''} opacity-0 pointer-events-none`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share
      </div>
    );
  }

  return <ShareButton {...props} />;
}
