'use client'

import { useEffect, useState } from 'react'

interface Photo {
  id: string
  url: string
  fullUrl: string
  thumbUrl: string
  alt: string
  color: string
  photographer: string
  photographerUsername: string
  photographerUrl: string
}

interface DynamicPhotoCardProps {
  query: string
  className?: string
  aspectRatio?: 'square' | 'portrait' | 'landscape'
  fallbackElement?: React.ReactNode
}

export function DynamicPhotoCard({
  query,
  className = '',
  aspectRatio = 'square',
  fallbackElement,
}: DynamicPhotoCardProps) {
  const [photo, setPhoto] = useState<Photo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/images?query=${encodeURIComponent(query)}&per_page=1`)
        const data = await response.json()

        if (data.photos && data.photos.length > 0) {
          setPhoto(data.photos[0])
          setError(null)
        } else {
          setError('No photos found')
        }
      } catch (err) {
        console.error('Error loading photo:', err)
        setError('Failed to load photo')
      } finally {
        setLoading(false)
      }
    }

    fetchPhoto()
  }, [query])

  const aspectRatioClass = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
  }[aspectRatio]

  return (
    <div className={`relative rounded-lg overflow-hidden ${aspectRatioClass} ${className}`}>
      {photo && !loading && (
        <>
          <img
            src={photo.url}
            alt={photo.alt}
            className="w-full h-full object-cover"
            style={{
              backgroundColor: photo.color,
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
            <a
              href={photo.photographerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-[family-name:var(--font-playfair)] opacity-70 hover:opacity-100 transition-opacity"
              style={{ color: 'var(--boxing-cream)' }}
            >
              Photo by {photo.photographer}
            </a>
          </div>
        </>
      )}
      {(loading || error) && (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--boxing-brown)' }}
        >
          {loading ? (
            <div className="text-center p-6">
              <div className="text-6xl mb-4">🎯</div>
              <div className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider" style={{ color: 'var(--boxing-gold)' }}>
                Ring Leader
              </div>
            </div>
          ) : (
            fallbackElement || (
              <div className="text-center p-6">
                <div className="text-6xl mb-4">🎯</div>
                <div className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider" style={{ color: 'var(--boxing-gold)' }}>
                  Ring Leader
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}

