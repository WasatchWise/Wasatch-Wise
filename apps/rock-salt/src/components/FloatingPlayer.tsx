'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAudioPlayer } from '@/contexts/AudioPlayerContext'

export default function FloatingPlayer() {
  const { isPlaying, isLoading, error, nowPlaying, togglePlay } = useAudioPlayer()
  const [isExpanded, setIsExpanded] = useState(false)

  const hasValidTrack = nowPlaying &&
    nowPlaying.song.title !== 'Station Offline'
  const looksLikeTimestamp = Boolean(nowPlaying?.song.title?.match(/^\d{4}-\d{2}-\d{2}/))
  const displayTitle = hasValidTrack && !looksLikeTimestamp
    ? nowPlaying?.song.title
    : 'The Rock Salt Radio'
  const displayArtist = hasValidTrack && !looksLikeTimestamp
    ? nowPlaying?.song.artist
    : 'Live stream'
  const artistSlug = nowPlaying?.song.band_slug
  const canLinkArtist = displayArtist !== 'Live stream'
  const artistHref = artistSlug
    ? `/bands/${artistSlug}`
    : `/bands?search=${encodeURIComponent(displayArtist)}`

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-zinc-950 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4">
          {/* Compact Player Bar */}
          <div className="flex items-center gap-3 py-3">
            {/* Play Button - Far Left */}
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="relative w-10 h-10 flex items-center justify-center bg-zinc-900 text-zinc-100 border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              aria-label={isPlaying ? 'Pause stream' : 'Play stream'}
            >
              {isLoading ? (
                <span className="text-xs font-mono">Connecting...</span>
              ) : isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Now Playing Info */}
            <div className="flex-1 min-w-0 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-zinc-100 font-semibold text-sm truncate">
                    {displayTitle}
                  </p>
                  {isPlaying && !isLoading && (
                    <span className="px-2 py-0.5 border border-red-500 text-red-400 text-xs font-mono">
                      LIVE
                    </span>
                  )}
                </div>
                <p className="text-zinc-300 text-xs truncate font-mono">
                  {canLinkArtist ? (
                    <Link href={artistHref} className="underline underline-offset-4">
                      {displayArtist}
                    </Link>
                  ) : (
                    displayArtist
                  )}
                </p>
                {isLoading && (
                  <p className="text-zinc-400 text-xs font-mono">Connecting...</p>
                )}
                {error && !isLoading && (
                  <p role="alert" aria-live="assertive" className="text-red-400 text-xs font-mono">
                    {error}
                  </p>
                )}
              </div>

              {/* Request Song Link - Hidden on mobile */}
              <a
                href="https://a8.asurahosting.com/public/therocksalt/embed-requests"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-1 text-zinc-300 text-sm font-mono underline underline-offset-4 flex-shrink-0"
              >
                <span>Request a Song</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* Expand Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-zinc-300 underline underline-offset-4 text-xs font-mono flex-shrink-0"
              aria-label={isExpanded ? 'Collapse player' : 'Expand player'}
            >
              {isExpanded ? 'Close' : 'Details'}
            </button>
          </div>

          {/* Expanded View */}
          {isExpanded && (
            <div className="pb-6 pt-2 border-t border-zinc-800">
              {/* Request a Song - Full Width */}
              <div className="max-w-2xl mx-auto">
                <div className="border border-zinc-800 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-zinc-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                    </svg>
                    <h4 className="text-zinc-100 font-mono text-sm">Request a Song</h4>
                  </div>
                  <div className="h-40 overflow-y-auto border border-zinc-800 bg-black">
                    <iframe
                      src="https://a8.asurahosting.com/public/therocksalt/embed-requests?theme=dark"
                      className="w-full h-64 border-0"
                      title="Request Songs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
