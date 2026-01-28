'use client';

import { useEffect, useState, useCallback } from 'react';

interface DanVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: string;
}

export default function DanVideoModal({ isOpen, onClose, language = 'en' }: DanVideoModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<{
    video_url: string;
    cached: boolean;
    script: string;
  } | null>(null);

  const loadVideo = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/heygen/dan-intro?lang=${language}`);

      if (!response.ok) {
        throw new Error('Failed to load Dan\'s video');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Unknown error');
      }

      setVideoData(data);
      setLoading(false);

    } catch (err: any) {
      console.error('Error loading Dan video:', err);
      setError(err.message || 'Failed to load video');
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    if (isOpen) {
      loadVideo();
    }
  }, [isOpen, loadVideo]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative bg-gray-900 border-2 border-yellow-400 rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-gray-800 hover:bg-gray-700 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6">
          <h2 className="text-2xl font-bold text-gray-900">
            🎬 Meet Dan, the Wasatch Sasquatch
          </h2>
          {!videoData?.cached && !loading && !error && (
            <p className="text-sm text-gray-800 mt-1">
              First time generation - this may take 30-60 seconds
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400 mb-4"></div>
              <p className="text-gray-300 text-lg">
                {videoData?.cached === false ? 'Dan is preparing his introduction...' : 'Loading...'}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                This can take up to 60 seconds for new languages
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 text-center">
              <p className="text-red-400 text-lg mb-2">⚠️ Oops!</p>
              <p className="text-gray-300">{error}</p>
              <button
                onClick={loadVideo}
                className="mt-4 bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && videoData && (
            <div className="space-y-4">
              {/* Video player */}
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  src={videoData.video_url}
                  controls
                  autoPlay
                  className="w-full h-full"
                  poster="/images/dan-thumbnail.png"
                >
                  Your browser doesn't support video playback.
                </video>
              </div>

              {/* Info badges */}
              <div className="flex gap-2 text-sm">
                {videoData.cached && (
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full">
                    ⚡ Instant playback
                  </span>
                )}
                {!videoData.cached && (
                  <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full">
                    🆕 Freshly generated
                  </span>
                )}
                <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full">
                  🗣️ Language: {language.toUpperCase()}
                </span>
              </div>

              {/* Transcript (optional) */}
              <details className="bg-gray-800/50 rounded-lg p-4">
                <summary className="cursor-pointer text-gray-300 font-semibold">
                  📝 View Transcript
                </summary>
                <p className="text-gray-400 mt-3 text-sm leading-relaxed">
                  {videoData.script}
                </p>
              </details>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800 p-4 text-center text-sm text-gray-400">
          <p>
            Dan speaks {Object.keys(['en', 'es', 'fr', 'de', 'zh', 'ja']).length} languages!
            Change your browser language to hear Dan in your native tongue.
          </p>
        </div>
      </div>
    </div>
  );
}
