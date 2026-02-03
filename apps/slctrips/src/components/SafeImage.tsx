'use client';

import { useState } from 'react';
import Image from 'next/image';

interface SafeImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  onClick?: () => void;
  fill?: boolean;
  width?: number;
  height?: number;
  /** When src fails or is empty, show this image instead of "No photo" */
  fallbackSrc?: string | null;
  /** Show skeleton placeholder until image loads (default true for better perceived performance) */
  skeleton?: boolean;
}

// Domains configured in next.config.js for optimization
const OPTIMIZED_DOMAINS = [
  'mkepcjzqnbowrgbvjfem.supabase.co',
  'images.unsplash.com',
];

function isOptimizedDomain(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return OPTIMIZED_DOMAINS.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

export default function SafeImage({
  src,
  alt,
  className,
  loading = 'lazy',
  onClick,
  fill = true,
  width,
  height,
  fallbackSrc,
  skeleton = true
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Use fallback image when src is missing or failed (e.g. guardian placeholder)
  const effectiveSrc = (!src || hasError) && fallbackSrc ? fallbackSrc : src;
  const showingFallback = (!src || hasError) && !!fallbackSrc;

  if (!effectiveSrc) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-400 ${className || ''}`}>
        No photo
      </div>
    );
  }

  const imageContent = (
    <Image
      src={effectiveSrc}
      alt={alt}
      className={`${className || ''} ${skeleton && !isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      loading={loading}
      onLoad={() => setIsLoaded(true)}
      onError={() => setHasError(true)}
      onClick={onClick}
      fill={fill && !width && !height}
      {...(fill && !width && !height ? {} : { width: width || 400, height: height || 300 })}
      sizes={fill ? '(max-width: 768px) 100vw, 33vw' : undefined}
      unoptimized={!(effectiveSrc.startsWith('/') || isOptimizedDomain(effectiveSrc))}
    />
  );

  if (showingFallback) {
    return (
      <span className="relative block h-full w-full">
        {skeleton && (
          <span
            className="absolute inset-0 bg-gray-200 animate-pulse transition-opacity duration-300"
            style={{ opacity: isLoaded ? 0 : 1 }}
            aria-hidden
          />
        )}
        {imageContent}
      </span>
    );
  }

  // Use Next.js Image for normal src; external images unoptimized unless from known domains
  const shouldOptimize = src!.startsWith('/') || isOptimizedDomain(src!);

  return (
    <span className="relative block h-full w-full">
      {skeleton && (
        <span
          className="absolute inset-0 bg-gray-200 animate-pulse transition-opacity duration-300"
          style={{ opacity: isLoaded ? 0 : 1 }}
          aria-hidden
        />
      )}
      <Image
        src={src!}
        alt={alt}
        className={`${className || ''} ${skeleton && !isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        loading={loading}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        onClick={onClick}
        unoptimized={!shouldOptimize}
        {...(fill && !width && !height ? { fill: true } : { width: width || 400, height: height || 300 })}
        sizes={fill ? '(max-width: 768px) 100vw, 33vw' : undefined}
      />
    </span>
  );
}


