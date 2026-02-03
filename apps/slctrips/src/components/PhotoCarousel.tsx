'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';

/**
 * Photo Carousel - Beautiful image gallery for destinations
 *
 * Features:
 * - Smooth transitions between photos
 * - Thumbnail navigation
 * - Keyboard navigation (arrow keys)
 * - Touch-friendly for mobile
 * - Full-screen view option
 */

interface PhotoCarouselProps {
  photos: any[];
  destinationName: string;
}

export default function PhotoCarousel({ photos, destinationName }: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [failedPhotos, setFailedPhotos] = useState<Set<number>>(new Set());
  const [mainImageLoaded, setMainImageLoaded] = useState(false);
  const [thumbLoaded, setThumbLoaded] = useState<Record<number, boolean>>({});

  const onMainLoad = useCallback(() => setMainImageLoaded(true), []);
  const onThumbLoad = useCallback((index: number) => {
    setThumbLoaded(prev => ({ ...prev, [index]: true }));
  }, []);

  // Reset main image skeleton when slide changes so the new image shows skeleton until loaded
  useEffect(() => {
    setMainImageLoaded(false);
  }, [currentIndex]);

  // Defensive check: ensure photos is a valid array with content - ALWAYS ensure it's an array
  const safePhotos = Array.isArray(photos) ? photos.filter(photo => photo !== null && photo !== undefined) : [];
  if (!safePhotos || safePhotos.length === 0) {
    return null;
  }

  // Hide component if all photos have failed to load
  if (failedPhotos.size === safePhotos.length) {
    return null;
  }

  // Helper to extract URL from photo (handles JSON strings, objects, and plain URLs)
  const getPhotoUrl = (photo: any): string => {
    if (!photo) return '';

    let url = '';

    // If it's a string, try to parse it as JSON first
    if (typeof photo === 'string') {
      try {
        const parsed = JSON.parse(photo);
        url = parsed.url || photo;
      } catch {
        // If parsing fails, treat it as a plain URL string
        url = photo;
      }
    } else if (photo?.url) {
      // If it's already an object, extract the URL
      url = photo.url;
    }

    // If it's a Google Places photo, proxy it through our API to avoid CORS issues
    if (url && url.includes('maps.googleapis.com/maps/api/place/photo')) {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    }

    return url;
  };

  const goToNext = () => {
    if (!safePhotos || safePhotos.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % safePhotos.length);
  };

  const goToPrev = () => {
    if (!safePhotos || safePhotos.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + safePhotos.length) % safePhotos.length);
  };

  const goToPhoto = (index: number) => {
    setCurrentIndex(index);
  };

  const handlePhotoError = (index: number) => {
    setFailedPhotos(prev => new Set(prev).add(index));
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrev();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') setIsFullScreen(false);
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">📸 Photo Gallery</h2>
            <span className="text-sm text-gray-500">
              {currentIndex + 1} / {safePhotos.length}
            </span>
          </div>
        </div>

        {/* Main Photo */}
        <div
          className="relative bg-gray-100"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="aspect-[16/9] relative overflow-hidden bg-gray-200">
            <span
              className="absolute inset-0 bg-gray-200 animate-pulse transition-opacity duration-300 z-[0]"
              style={{ opacity: mainImageLoaded ? 0 : 1 }}
              aria-hidden
            />
            {safePhotos[currentIndex] && (
              <Image
                src={getPhotoUrl(safePhotos[currentIndex])}
                alt={`${destinationName} - Photo ${currentIndex + 1}`}
                fill
                className={`object-cover cursor-pointer transition-opacity duration-300 z-[1] ${mainImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onClick={() => setIsFullScreen(true)}
                onLoad={onMainLoad}
                onError={() => handlePhotoError(currentIndex)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                loading={currentIndex === 0 ? 'eager' : 'lazy'}
                priority={currentIndex === 0}
              />
            )}

            {/* Navigation Arrows */}
            {safePhotos.length > 1 && (
              <>
                <button
                  onClick={goToPrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
                  aria-label="Previous photo"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
                  aria-label="Next photo"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Full Screen Button */}
            <button
              onClick={() => setIsFullScreen(true)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-all"
              aria-label="View full screen"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>

          {/* Thumbnail Strip */}
          {safePhotos.length > 1 && (
            <div className="p-4 bg-gray-50">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {safePhotos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => goToPhoto(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all relative bg-gray-200 ${
                      index === currentIndex
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <span
                      className="absolute inset-0 bg-gray-200 animate-pulse transition-opacity duration-200"
                      style={{ opacity: thumbLoaded[index] ? 0 : 1 }}
                      aria-hidden
                    />
                    <Image
                      src={getPhotoUrl(photo)}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className={`object-cover transition-opacity duration-200 ${thumbLoaded[index] ? 'opacity-100' : 'opacity-0'}`}
                      sizes="80px"
                      onLoad={() => onThumbLoad(index)}
                      onError={() => handlePhotoError(index)}
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-700 text-center">
            Photos from Google Places • Click to view full screen
          </p>
        </div>
      </div>

      {/* Full Screen Modal */}
      {isFullScreen && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setIsFullScreen(false)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsFullScreen(false)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all"
            aria-label="Close full screen"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Full Screen Image */}
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full">
            {safePhotos[currentIndex] && (
              <Image
                src={getPhotoUrl(safePhotos[currentIndex])}
                alt={`${destinationName} - Photo ${currentIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                onError={() => handlePhotoError(currentIndex)}
              />
            )}

            {/* Navigation in Full Screen */}
            {safePhotos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrev();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all"
                  aria-label="Previous photo"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all"
                  aria-label="Next photo"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Photo Counter in Full Screen */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
              {currentIndex + 1} / {safePhotos.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
