'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface NowPlayingData {
  song: {
    title: string
    artist: string
    album?: string
    art?: string
    band_slug?: string
  }
  live: {
    is_live: boolean
    streamer_name?: string
  }
}

export default function NowPlaying() {
  const [nowPlaying, setNowPlaying] = useState<NowPlayingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchNowPlaying = async () => {
      try {
        const response = await fetch('/api/now-playing')
        if (response.ok) {
          const data = await response.json()
          setNowPlaying(data)
          setIsLoading(false)
        } else {
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Failed to fetch now playing data:', err)
        setIsLoading(false)
      }
    }

    // Fetch immediately
    fetchNowPlaying()

    // Then fetch every 10 seconds
    const interval = setInterval(fetchNowPlaying, 10000)

    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 p-4">
        <span className="text-sm text-white/70 font-mono">Loading...</span>
      </div>
    )
  }

  if (!nowPlaying || !nowPlaying.song) {
    return (
      <div className="p-4 border border-zinc-800">
        <p className="text-sm text-white/50 text-center font-mono">
          No track information available
        </p>
      </div>
    )
  }

  const looksLikeTimestamp = Boolean(nowPlaying.song.title?.match(/^\d{4}-\d{2}-\d{2}/))
  const isOffline = nowPlaying.song.title === 'Station Offline'
  const displayTitle = !looksLikeTimestamp && !isOffline
    ? nowPlaying.song.title
    : 'The Rock Salt Radio'
  const displayArtist = !looksLikeTimestamp && !isOffline && nowPlaying.song.artist !== 'Unknown Artist'
    ? nowPlaying.song.artist
    : 'Live stream'
  const artistSlug = nowPlaying.song.band_slug
  const canLinkArtist = displayArtist !== 'Live stream'
  const artistHref = artistSlug
    ? `/bands/${artistSlug}`
    : `/bands?search=${encodeURIComponent(displayArtist)}`

  return (
    <div className="flex items-center gap-4">
      {nowPlaying.song.art && !looksLikeTimestamp && !isOffline && (
        <img
          src={nowPlaying.song.art}
          alt={`${displayArtist} - ${displayTitle}`}
          className="w-16 h-16 object-cover border border-zinc-800"
          onError={(e) => {
            // Hide image if it fails to load
            e.currentTarget.style.display = 'none'
          }}
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-red-400 uppercase tracking-wide border border-red-500 px-2 py-0.5">
            Now Playing
          </span>
        </div>
        <p className="text-base font-bold text-white truncate">
          {displayTitle}
        </p>
        <p className="text-sm text-white/70 truncate font-mono">
          {canLinkArtist ? (
            <Link href={artistHref} className="underline underline-offset-4">
              {displayArtist}
            </Link>
          ) : (
            displayArtist
          )}
        </p>
      </div>
    </div>
  )
}

