/**
 * Skeleton Loading Components
 *
 * Provides skeleton screens for all async content to improve perceived performance.
 * Automatically tracks when skeletons are shown for metrics analysis.
 *
 * Usage:
 *   import { DestinationCardSkeleton, GuardianCardSkeleton } from '@/components/SkeletonLoader';
 *
 *   {isLoading ? <DestinationCardSkeleton count={6} /> : destinations.map(...)}
 */

'use client';

import { useEffect } from 'react';
import { metrics } from '@/lib/metrics';

// ============================================================================
// BASE SKELETON PRIMITIVE
// ============================================================================

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = 'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200';

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-[length:200%_100%]',
    none: '',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

// ============================================================================
// DESTINATION CARD SKELETON
// ============================================================================

interface DestinationCardSkeletonProps {
  count?: number;
}

export function DestinationCardSkeleton({ count = 1 }: DestinationCardSkeletonProps) {
  useEffect(() => {
    metrics.ui.skeletonShown({
      component: 'DestinationCard',
    });
  }, []);

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
        >
          {/* Image */}
          <Skeleton className="w-full h-48" variant="rectangular" />

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Title */}
            <Skeleton className="h-6 w-3/4" variant="rounded" />

            {/* Category badge */}
            <Skeleton className="h-5 w-20" variant="rounded" />

            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" variant="text" />
              <Skeleton className="h-4 w-5/6" variant="text" />
              <Skeleton className="h-4 w-4/6" variant="text" />
            </div>

            {/* Tags */}
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" variant="rounded" />
              <Skeleton className="h-6 w-20" variant="rounded" />
              <Skeleton className="h-6 w-24" variant="rounded" />
            </div>

            {/* Button */}
            <Skeleton className="h-10 w-full" variant="rounded" />
          </div>
        </div>
      ))}
    </>
  );
}

// ============================================================================
// GUARDIAN CARD SKELETON
// ============================================================================

interface GuardianCardSkeletonProps {
  count?: number;
}

export function GuardianCardSkeleton({ count = 1 }: GuardianCardSkeletonProps) {
  useEffect(() => {
    metrics.ui.skeletonShown({
      component: 'GuardianCard',
    });
  }, []);

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden p-6 space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Skeleton className="w-20 h-20" variant="circular" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-32" variant="rounded" />
              <Skeleton className="h-4 w-24" variant="text" />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-16" variant="rounded" />
            <Skeleton className="h-16" variant="rounded" />
            <Skeleton className="h-16" variant="rounded" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" variant="text" />
            <Skeleton className="h-4 w-full" variant="text" />
            <Skeleton className="h-4 w-3/4" variant="text" />
          </div>
        </div>
      ))}
    </>
  );
}

// ============================================================================
// TABLE SKELETON
// ============================================================================

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  useEffect(() => {
    metrics.ui.skeletonShown({
      component: 'Table',
    });
  }, []);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} className="h-5 flex-1" variant="text" />
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="flex gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-4 flex-1" variant="text" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// TEXT CONTENT SKELETON
// ============================================================================

interface TextSkeletonProps {
  lines?: number;
  className?: string;
}

export function TextSkeleton({ lines = 3, className = '' }: TextSkeletonProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-4"
          width={index === lines - 1 ? '75%' : '100%'}
          variant="text"
        />
      ))}
    </div>
  );
}

// ============================================================================
// PAGE SKELETON
// ============================================================================

export function PageSkeleton() {
  useEffect(() => {
    metrics.ui.skeletonShown({
      component: 'Page',
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Skeleton className="h-12 w-2/3" variant="rounded" />
        <Skeleton className="h-6 w-1/2" variant="text" />
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          <Skeleton className="h-64" variant="rounded" />
          <Skeleton className="h-32" variant="rounded" />
        </div>

        {/* Main content */}
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-96" variant="rounded" />
          <TextSkeleton lines={5} />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODAL SKELETON
// ============================================================================

export function ModalSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 space-y-4 max-w-lg w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" variant="rounded" />
        <Skeleton className="h-8 w-8" variant="circular" />
      </div>

      {/* Content */}
      <div className="space-y-4">
        <TextSkeleton lines={4} />
        <Skeleton className="h-64" variant="rounded" />
        <TextSkeleton lines={2} />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-11 flex-1" variant="rounded" />
        <Skeleton className="h-11 flex-1" variant="rounded" />
      </div>
    </div>
  );
}

// ============================================================================
// FORM SKELETON
// ============================================================================

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      {/* Form fields */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" variant="text" />
          <Skeleton className="h-11 w-full" variant="rounded" />
        </div>
      ))}

      {/* Submit button */}
      <Skeleton className="h-12 w-full" variant="rounded" />
    </div>
  );
}

// ============================================================================
// ANIMATIONS
// ============================================================================

// Add this to your global CSS or tailwind.config.js:
/*
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite linear;
}
*/
