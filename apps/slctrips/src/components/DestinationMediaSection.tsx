'use client';

import { useState } from 'react';
import SafeImage from '@/components/SafeImage';

interface YouTubeVideo {
  url: string;
  title?: string;
  thumbnail?: string;
  channel?: string;
}

interface PodcastEpisode {
  url?: string;
  title: string;
  host?: string;
  duration?: string;
  embedUrl?: string;
  thumbnail?: string;
}

interface DestinationMediaSectionProps {
  videos?: YouTubeVideo[];
  podcasts?: PodcastEpisode[];
  destinationName: string;
}

function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export default function DestinationMediaSection({
  videos = [],
  podcasts = [],
  destinationName
}: DestinationMediaSectionProps) {
  const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);

  // Parse single video_url string or array
  const parsedVideos: YouTubeVideo[] = [];
  
  // Handle single video or multiple videos - ensure videos is always an array
  const safeVideos = Array.isArray(videos) ? videos : [];
  safeVideos.forEach(video => {
    if (!video || !video.url) return;
    try {
      const videoId = getYouTubeVideoId(video.url);
      if (videoId) {
        parsedVideos.push({
          ...video,
          url: video.url,
          thumbnail: video.thumbnail || getYouTubeThumbnail(videoId)
        });
      }
    } catch (err) {
      // Skip invalid video entries
      console.error('Error processing video:', err);
    }
  });

  // Only show if we have content - ensure podcasts is always an array
  const safePodcasts = Array.isArray(podcasts) ? podcasts : [];
  if (parsedVideos.length === 0 && safePodcasts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* YouTube Videos Section */}
      {parsedVideos.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md">
          <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-red-600">▶</span> Videos & Tours
              {parsedVideos.length > 1 && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  ({parsedVideos.length} videos)
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Experience {destinationName} through video tours and guides
            </p>
          </div>

          {parsedVideos.length === 1 ? (
            // Single video - display directly
            <div className="relative pb-[56.25%] h-0">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${getYouTubeVideoId(parsedVideos[0].url)}?rel=0`}
                title={parsedVideos[0].title || `${destinationName} Video Tour`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          ) : (
            // Multiple videos - show carousel
            <div className="p-4 space-y-4">
              {activeVideoIndex !== null ? (
                // Active video player
                <div className="relative pb-[56.25%] h-0 bg-black rounded-lg overflow-hidden">
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(parsedVideos[activeVideoIndex].url)}?rel=0`}
                    title={parsedVideos[activeVideoIndex].title || `${destinationName} Video ${activeVideoIndex + 1}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                  <button
                    onClick={() => setActiveVideoIndex(null)}
                    className="absolute top-4 right-4 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors z-10"
                  >
                    ← Back to List
                  </button>
                </div>
              ) : (
                // Video thumbnails grid
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {parsedVideos.map((video, index) => {
                    const videoId = getYouTubeVideoId(video.url);
                    if (!videoId) return null;

                    return (
                      <button
                        key={index}
                        onClick={() => setActiveVideoIndex(index)}
                        className="group relative aspect-video rounded-lg overflow-hidden bg-gray-100 hover:shadow-lg transition-all"
                      >
                        <SafeImage
                          src={video.thumbnail || getYouTubeThumbnail(videoId)}
                          alt={video.title || `Video ${index + 1}`}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Play overlay */}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <div className="bg-red-600 rounded-full p-4 group-hover:scale-110 transition-transform">
                            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                        {/* Video info */}
                        {video.title && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                            <p className="text-white font-semibold text-sm line-clamp-2">{video.title}</p>
                            {video.channel && (
                              <p className="text-white/80 text-xs mt-1">by {video.channel}</p>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Podcast Episodes Section */}
      {safePodcasts.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md">
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span>🎙️</span> Podcasts & Audio
              {safePodcasts.length > 1 && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  ({safePodcasts.length} episodes)
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Listen to stories and insights about {destinationName}
            </p>
          </div>

          <div className="p-6 space-y-4">
            {safePodcasts.map((podcast, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 hover:border-purple-300 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Podcast thumbnail */}
                  {podcast.thumbnail && (
                    <SafeImage
                      src={podcast.thumbnail}
                      alt={podcast.title}
                      className="w-[120px] h-[120px] rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{podcast.title}</h3>
                    {podcast.host && (
                      <p className="text-sm text-gray-600 mb-1">Host: {podcast.host}</p>
                    )}
                    {podcast.duration && (
                      <p className="text-sm text-gray-600 mb-3">Duration: {podcast.duration}</p>
                    )}
                    {/* Audio player or embed */}
                    {podcast.embedUrl ? (
                      <iframe
                        className="w-full h-32 rounded-lg"
                        src={podcast.embedUrl}
                        title={podcast.title}
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                      />
                    ) : podcast.url ? (
                      <audio controls className="w-full mt-2" preload="metadata">
                        <source src={podcast.url} type="audio/mpeg" />
                        <source src={podcast.url} type="audio/ogg" />
                        Your browser doesn't support audio playback.
                      </audio>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

