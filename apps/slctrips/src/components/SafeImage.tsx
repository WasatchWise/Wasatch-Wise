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
  height
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-400 ${className || ''}`}>
        No photo
      </div>
    );
  }

  // Use Next.js Image component for better performance
  // External images are marked as unoptimized unless from known domains
  const shouldOptimize = src.startsWith('/') || isOptimizedDomain(src);

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setHasError(true)}
      onClick={onClick}
      unoptimized={!shouldOptimize}
      {...(fill && !width && !height ? { fill: true } : { width: width || 400, height: height || 300 })}
    />
  );
}


