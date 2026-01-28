'use client'

import Link from 'next/link'
import { useAudioPlayer } from '@/contexts/AudioPlayerContext'

interface LiveStreamPlayerProps {
  title?: string
  description?: string
}

export default function LiveStreamPlayer({
  title = 'The Rock Salt Live',
  description = 'Live stream for local broadcasts and scheduled shows.'
}: LiveStreamPlayerProps) {
  const { isPlaying, isLoading, error, nowPlaying, togglePlay } = useAudioPlayer()
  const hasValidTrack = nowPlaying && nowPlaying.song.title !== 'Station Offline'
  const looksLikeTimestamp = Boolean(nowPlaying?.song.title?.match(/^\d{4}-\d{2}-\d{2}/))
  const displayTitle = hasValidTrack && !looksLikeTimestamp
    ? nowPlaying?.song.title
    : 'The Rock Salt Radio'
  const displayArtist = hasValidTrack && !looksLikeTimestamp && nowPlaying?.song.artist !== 'Unknown Artist'
    ? nowPlaying?.song.artist
    : 'Live stream'
  const artistSlug = nowPlaying?.song.band_slug
  const canLinkArtist = displayArtist !== 'Live stream'
  const artistHref = artistSlug
    ? `/bands/${artistSlug}`
    : `/bands?search=${encodeURIComponent(displayArtist)}`

  return (
    <div className="bg-zinc-950 border border-zinc-800 p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col justify-between gap-3">
          <div>
            <div className="inline-block border border-zinc-700 px-2 py-1 mb-2">
              <p className="text-zinc-300 text-xs font-mono">
                Stream: The Rock Salt
              </p>
            </div>

            <h2 className="text-xl md:text-2xl font-semibold text-zinc-100 mb-1">
              {title}
            </h2>
            <p className="text-zinc-400 text-sm">
              {description}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="border border-red-500 text-red-400 text-xs font-mono p-2"
            >
              {error}{' '}
              <button onClick={togglePlay} className="underline underline-offset-4">
                Retry
              </button>
            </div>
          )}

          <div className="flex items-end justify-between gap-4">
            <div className="flex-1">
              {nowPlaying && (
                <div className="flex items-center gap-3">
                  {nowPlaying.song.art && !looksLikeTimestamp && hasValidTrack && (
                    <img
                      src={nowPlaying.song.art}
                      alt="Album Art"
                      className="w-12 h-12 border border-zinc-800 object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-100 font-semibold text-sm truncate">
                      {displayTitle}
                    </p>
                    <p className="text-zinc-400 text-xs truncate font-mono">
                      {canLinkArtist ? (
                        <Link href={artistHref} className="underline underline-offset-4">
                          {displayArtist}
                        </Link>
                      ) : (
                        displayArtist
                      )}
                    </p>
                    {nowPlaying.live.is_live && nowPlaying.live.streamer_name && (
                      <p className="text-zinc-400 text-xs font-mono">
                        Live host: {nowPlaying.live.streamer_name}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-2">
              {isPlaying && !isLoading && (
                <div className="px-2 py-0.5 border border-red-500 text-red-400 text-xs font-mono">
                  LIVE
                </div>
              )}

              <button
                onClick={togglePlay}
                disabled={isLoading}
                className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-zinc-900 text-zinc-100 border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={isPlaying ? 'Pause stream' : 'Play stream'}
              >
                {isLoading ? (
                  <span className="text-xs font-mono">LOAD</span>
                ) : isPlaying ? (
                  <svg className="w-8 h-8 md:w-10 md:h-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 md:w-10 md:h-10 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <div className="text-zinc-400 text-xs font-mono text-center">
                {isLoading && <p>Connecting...</p>}
                {isPlaying && !isLoading && <p>Streaming live</p>}
                {!isPlaying && !isLoading && !error && <p>Click to listen</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 p-3 border border-red-500 text-red-400 text-xs font-mono">
          {error}
        </div>
      )}
    </div>
  )
}
