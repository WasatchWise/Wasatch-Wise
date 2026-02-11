'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import type { FirstVisitModalContent } from '@/lib/first-visit-modal-config';
import { Button } from '@/components/shared/Button';

const STORAGE_KEY_PREFIX = 'ww_first_visit_modal_';

function getStorageKey(slug: string): string {
  return `${STORAGE_KEY_PREFIX}${slug}`;
}

export function FirstVisitModal({ content }: { content: FirstVisitModalContent }) {
  const [open, setOpen] = useState(false);
  const key = getStorageKey(content.slug);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seen = sessionStorage.getItem(key);
    if (!seen) {
      setOpen(true);
    }
  }, [key]);

  const handleClose = () => {
    sessionStorage.setItem(key, '1');
    setOpen(false);
  };

  const handlePrimaryClick = () => {
    sessionStorage.setItem(key, '1');
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-visit-modal-title"
      aria-describedby="first-visit-modal-desc"
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={handleClose}
        aria-label="Close modal"
      />
      {/* Panel */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-orange-100">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 text-gray-500 hover:text-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 id="first-visit-modal-title" className="text-xl font-bold text-gray-900 pr-8 mb-2">
          {content.headline}
        </h2>
        <p id="first-visit-modal-desc" className="text-gray-600 mb-6">
          {content.body}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <span onClick={handlePrimaryClick} className="flex-1">
            <Button href={content.primaryCta.href} variant="primary" size="md" className="w-full">
              {content.primaryCta.label}
            </Button>
          </span>
          {content.secondaryCta && (
            <span onClick={handleClose} className="flex-1">
              <Button href={content.secondaryCta.href} variant="outline" size="md" className="w-full">
                {content.secondaryCta.label}
              </Button>
            </span>
          )}
        </div>
        <p className="mt-4 text-center">
          <button
            type="button"
            onClick={handleClose}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Maybe later
          </button>
        </p>
      </div>
    </div>
  );
}
