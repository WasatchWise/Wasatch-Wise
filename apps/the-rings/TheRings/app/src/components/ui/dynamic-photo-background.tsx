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

interface DynamicPhotoBackgroundProps {
  query: string
  className?: string
  overlay?: boolean
  overlayOpacity?: number
  children?: React.ReactNode
  fallbackColor?: string
}

export function DynamicPhotoBackground({
  query,
  className = '',
  overlay = true,
  overlayOpacity = 0.7,
  children,
  fallbackColor = 'var(--boxing-brown)',
}: DynamicPhotoBackgroundProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/images?query=${encodeURIComponent(query)}&per_page=5`)
        const data = await response.json()

        if (data.photos && data.photos.length > 0) {
          setPhotos(data.photos)
          setBackgroundUrl(data.photos[0].url)
          setError(null)
        } else {
          setError('No photos found')
        }
      } catch (err) {
        console.error('Error loading photos:', err)
        setError('Failed to load photos')
      } finally {
        setLoading(false)
      }
    }

    fetchPhotos()
  }, [query])

  // Rotate through photos every 8 seconds if multiple photos
  useEffect(() => {
    if (photos.length > 1) {
      const interval = setInterval(() => {
        setCurrentPhotoIndex((prev) => {
          const next = (prev + 1) % photos.length
          setBackgroundUrl(photos[next].url)
          return next
        })
      }, 8000)

      return () => clearInterval(interval)
    }
  }, [photos])

  const backgroundStyle: React.CSSProperties = {
    backgroundImage: backgroundUrl
      ? `url(${backgroundUrl})`
      : `linear-gradient(135deg, ${fallbackColor} 0%, ${fallbackColor}dd 100%)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    transition: 'background-image 1s ease-in-out',
  }

  return (
    <div className={`relative ${className}`} style={backgroundStyle}>
      {overlay && (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundColor: 'var(--boxing-brown)',
            opacity: overlayOpacity,
          }}
        />
      )}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="text-center" style={{ color: 'var(--boxing-cream)' }}>
            <div className="font-[family-name:var(--font-playfair)] text-sm italic opacity-70">
              Loading...
            </div>
          </div>
        </div>
      )}
      {error && !backgroundUrl && (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundColor: fallbackColor,
          }}
        />
      )}
      {photos.length > 1 && (
        <div
          className="absolute bottom-4 left-4 z-20 flex gap-2"
          style={{ opacity: 0.6 }}
        >
          {photos.map((_, index) => (
            <div
              key={photos[index].id}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentPhotoIndex ? 'w-8' : ''
              }`}
              style={{
                backgroundColor:
                  index === currentPhotoIndex
                    ? 'var(--boxing-gold)'
                    : 'var(--boxing-cream)',
              }}
            />
          ))}
        </div>
      )}
      {photos.length > 0 && photos[currentPhotoIndex] && (
        <div
          className="absolute bottom-4 right-4 z-20 text-xs opacity-50 hover:opacity-100 transition-opacity"
          style={{ color: 'var(--boxing-cream)' }}
        >
          <a
            href={photos[currentPhotoIndex].photographerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-[family-name:var(--font-playfair)] text-xs"
          >
            Photo by {photos[currentPhotoIndex].photographer} on Unsplash
          </a>
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

