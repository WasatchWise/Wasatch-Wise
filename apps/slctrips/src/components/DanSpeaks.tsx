'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface DanSpeaksProps {
  language?: string;
  className?: string;
}

export default function DanSpeaks({ language = 'en', className = '' }: DanSpeaksProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchAudio = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/dan/speak?lang=${language}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load audio');
      }

      setAudioUrl(data.audio_url);
    } catch (err: any) {
      console.error('Failed to fetch audio:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  // Fetch audio URL when component mounts or language changes
  useEffect(() => {
    fetchAudio();
  }, [fetchAudio]);

  const togglePlayPause = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleAudioError = () => {
    setError('Failed to play audio');
    setIsPlaying(false);
  };

  return (
    <div className={`bg-navy-ridge/30 backdrop-blur-sm border border-gold-sunburst/20 rounded-lg p-6 ${className}`}>
      <div className="flex items-center gap-4">
        {/* Dan's avatar/icon */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gradient-to-br from-gold-sunburst to-burnt-orange rounded-full flex items-center justify-center">
            <Volume2 className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">
            Meet Dan, the Wasatch Sasquatch
          </h3>
          <p className="text-sm text-gray-300 mb-3">
            Your personal guide to Utah's hidden gems
          </p>

          {/* Play button */}
          <button
            onClick={togglePlayPause}
            disabled={isLoading || !audioUrl || !!error}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gold-sunburst hover:bg-burnt-orange disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>Loading...</span>
              </>
            ) : error ? (
              <span className="text-sm">{error}</span>
            ) : isPlaying ? (
              <>
                <Pause className="w-5 h-5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Listen to Dan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={handleAudioEnded}
          onError={handleAudioError}
          preload="metadata"
        />
      )}
    </div>
  );
}
