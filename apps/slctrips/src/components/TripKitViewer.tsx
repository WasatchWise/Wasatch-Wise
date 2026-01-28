'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TripKit, Destination } from '@/types/database.types';
import { supabase } from '@/lib/supabaseClient';
import InfoBlurb from './InfoBlurb';
import EnhanceYourVisit from './EnhanceYourVisit';
import DanConcierge from './DanConcierge';
import TripKitResourceCenter from './TripKitResourceCenter';
import SafeImage from './SafeImage';
import ShareButton from '@/components/ShareButton';
import ClientOnlyShareButton from '@/components/ClientOnlyShareButton';
import ShareableItinerary from './ShareableItinerary';
import { getBlurbsForTripKit, Blurb } from '@/data/tripkit-blurbs';

interface DeepDiveStory {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  summary?: string | null;
  reading_time_minutes?: number | null;
  featured_image_url?: string | null;
}

interface TripKitViewerProps {
  tripkit: TripKit;
  destinations: Destination[];
  stories?: DeepDiveStory[];
  accessCode: string;
  accessCodeId: string;
  customerEmail: string;
  progress: any | null;
}

type ViewMode = 'list' | 'map';

export default function TripKitViewer({
  tripkit,
  destinations,
  stories = [],
  accessCode,
  accessCodeId,
  customerEmail,
  progress: initialProgress
}: TripKitViewerProps) {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [visitedIds, setVisitedIds] = useState<Set<string>>(new Set());
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [tripName, setTripName] = useState<string>(tripkit.name);
  const [tripNotes, setTripNotes] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Initialize from progress data
  useEffect(() => {
    if (initialProgress) {
      setVisitedIds(new Set(initialProgress.destinations_visited || []));
      setWishlistIds(new Set(initialProgress.destinations_wishlist || []));
      setNotes(initialProgress.destination_notes || {});
      setTripName(initialProgress.trip_name || tripkit.name);
      setTripNotes(initialProgress.trip_notes || '');
    }
  }, [initialProgress, tripkit.name]);

  const saveProgress = useCallback(async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const progressData = {
        access_code_id: accessCodeId,
        tripkit_id: tripkit.id,
        customer_email: customerEmail,
        destinations_visited: Array.from(visitedIds),
        destinations_wishlist: Array.from(wishlistIds),
        destination_notes: notes,
        trip_name: tripName,
        trip_notes: tripNotes,
        completion_percentage: Math.round((visitedIds.size / destinations.length) * 100),
        last_viewed_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_tripkit_progress')
        .upsert(progressData, {
          onConflict: 'access_code_id,tripkit_id'
        });

      if (error) {
        console.error('Failed to save progress:', error);
      } else {
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setIsSaving(false);
    }
  }, [accessCodeId, tripkit.id, customerEmail, visitedIds, wishlistIds, notes, tripName, tripNotes, destinations.length, isSaving]);

  // Auto-save progress (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveProgress();
    }, 2000); // Save 2 seconds after last change

    return () => clearTimeout(timer);
  }, [visitedIds, wishlistIds, notes, tripName, tripNotes, saveProgress]);

  const toggleVisited = (destinationId: string) => {
    setVisitedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(destinationId)) {
        newSet.delete(destinationId);
      } else {
        newSet.add(destinationId);
        // Remove from wishlist if adding to visited
        setWishlistIds(w => {
          const newWishlist = new Set(w);
          newWishlist.delete(destinationId);
          return newWishlist;
        });
      }
      return newSet;
    });
  };

  const toggleWishlist = (destinationId: string) => {
    setWishlistIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(destinationId)) {
        newSet.delete(destinationId);
      } else {
        newSet.add(destinationId);
      }
      return newSet;
    });
  };

  const updateNote = (destinationId: string, note: string) => {
    setNotes(prev => ({
      ...prev,
      [destinationId]: note
    }));
  };

  const playGuardianVoice = async () => {
    if (!audioUrl) {
      // Generate voiceover for this TripKit
      setIsPlaying(true);
      try {
        const response = await fetch('/api/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'tripkit',
            tripkit_name: tripkit.name,
            tripkit_description: tripkit.description,
            destination_count: destinations.length
          })
        });

        const data = await response.json();
        if (data.success && data.audio) {
          setAudioUrl(data.audio);
          const audio = new Audio(data.audio);
          audio.onended = () => setIsPlaying(false);
          audio.onerror = () => {
            console.warn('Audio playback failed');
            setIsPlaying(false);
          };
          await audio.play().catch(() => setIsPlaying(false));
        } else {
          setIsPlaying(false);
        }
      } catch (error) {
        console.warn('Failed to generate voice:', error);
        setIsPlaying(false);
      }
    } else {
      try {
        const audio = new Audio(audioUrl);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => {
          console.warn('Audio playback failed');
          setIsPlaying(false);
        };
        setIsPlaying(true);
        await audio.play();
      } catch (error) {
        console.warn('Audio play failed:', error);
        setIsPlaying(false);
      }
    }
  };

  // Filter destinations
  const filteredDestinations = destinations.filter(d => {
    const matchesSearch = searchQuery === '' ||
      (d.name ? d.name.toLowerCase().includes(searchQuery.toLowerCase()) : false) ||
      (d.description ? d.description.toLowerCase().includes(searchQuery.toLowerCase()) : false);

    const matchesCategory = filterCategory === 'all' ||
      d.category === filterCategory ||
      (filterCategory === 'visited' && visitedIds.has(d.id)) ||
      (filterCategory === 'wishlist' && wishlistIds.has(d.id));

    return matchesSearch && matchesCategory;
  });

  const completionPercentage = destinations.length > 0
    ? Math.round((visitedIds.size / destinations.length) * 100)
    : 0;

  const categories = Array.from(new Set(destinations.map(d => d.category).filter(Boolean)));

  // Get blurbs for this TripKit
  const blurbs = useMemo(() => getBlurbsForTripKit(tripkit.code), [tripkit.code]);
  const featuredBlurbs = useMemo(() => blurbs.slice(0, 4), [blurbs]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header Section */}
      <div className="mb-8 bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Cover Image */}
        {tripkit.cover_image_url && (
          <div className="relative h-64 w-full">
            <Image
              src={tripkit.cover_image_url}
              alt={tripkit.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                  {accessCode}
                </span>
                {tripkit.tier && tripkit.tier !== 'free' && (
                  <span className="text-xs uppercase tracking-wider bg-blue-500 px-3 py-1 rounded-full font-semibold">
                    {tripkit.tier}
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-lg text-white">
                {tripkit.name}
              </h1>
              {tripkit.tagline && (
                <p className="text-xl mt-2 drop-shadow-md">{tripkit.tagline}</p>
              )}
            </div>
          </div>
        )}

        {/* TripKit Info & Guardian Voice */}
        <div className="p-6">
          {/* Guardian Voice Player */}
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-200">
            <div className="flex items-center gap-4">
              <button
                onClick={playGuardianVoice}
                disabled={isPlaying}
                className="flex-shrink-0 w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isPlaying ? (
                  <svg className="w-8 h-8 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800 mb-1">
                  🎙️ Guardian Introduction by Dan
                </h3>
                <p className="text-gray-600 text-sm">
                  {isPlaying
                    ? "Dan is speaking..."
                    : `Click to hear Dan's personal introduction to this TripKit (${destinations.length} destinations)`}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200 hover:shadow-md transition-shadow duration-300">
              <div className="text-3xl font-bold text-green-700 animate-slideUp">{destinations.length}</div>
              <div className="text-sm text-gray-600">Destinations</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200 hover:shadow-md transition-shadow duration-300">
              <div className="text-3xl font-bold text-blue-700 animate-slideUp">{visitedIds.size}</div>
              <div className="text-sm text-gray-600">Visited</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200 hover:shadow-md transition-shadow duration-300">
              <div className="text-3xl font-bold text-purple-700 animate-slideUp">{wishlistIds.size}</div>
              <div className="text-sm text-gray-600">Wishlist</div>
            </div>
            <div className={`bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200 hover:shadow-md transition-shadow duration-300 ${completionPercentage === 100 ? 'animate-celebrate' : ''}`}>
              <div className="text-3xl font-bold text-amber-700 animate-slideUp">{completionPercentage}%</div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-bold text-gray-900">{completionPercentage}% Complete</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-green-500 via-emerald-500 to-emerald-600 transition-all duration-1000 ease-out relative"
                style={{ width: `${completionPercentage}%` }}
              >
                {completionPercentage > 0 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                )}
              </div>
            </div>
            {completionPercentage === 100 && (
              <div className="mt-2 text-center">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold animate-bounce">
                  🎉 TripKit Complete! 🎉
                </span>
              </div>
            )}
          </div>

          {/* Quick Facts / Did You Know */}
          {featuredBlurbs.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                Quick Facts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {featuredBlurbs.map((blurb) => (
                  <InfoBlurb
                    key={blurb.id}
                    icon={blurb.icon}
                    title={blurb.title}
                    content={blurb.content}
                    category={blurb.category}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                All ({destinations.length})
              </button>
              <button
                onClick={() => setFilterCategory('visited')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterCategory === 'visited'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                ✓ Visited ({visitedIds.size})
              </button>
              <button
                onClick={() => setFilterCategory('wishlist')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterCategory === 'wishlist'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                ⭐ Wishlist ({wishlistIds.size})
              </button>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'list'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                📋 List View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'map'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                🗺️ Map View (Coming Soon)
              </button>
            </div>

            {(isSaving || lastSaved) && (
              <div className={`text-sm ${isSaving ? 'text-blue-500' : 'text-gray-500'}`}>
                {isSaving ? (
                  <span className="flex items-center gap-1">
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </span>
                ) : lastSaved ? (
                  `Saved ${lastSaved.toLocaleTimeString()}`
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resource Center - Display if resources exist */}
      {tripkit.resources && tripkit.resources.length > 0 && (
        <TripKitResourceCenter resources={tripkit.resources} />
      )}

      {/* Shareable Itinerary */}
      {(visitedIds.size > 0 || wishlistIds.size > 0) && (
        <div className="mb-12 animate-slideUp">
          <ShareableItinerary
            tripkitName={tripkit.name}
            destinations={destinations.map(d => ({
              id: d.id,
              name: d.name,
              slug: d.slug,
              drive_time_from_slc: undefined // Destination type doesn't have this property
            }))}
            visitedIds={visitedIds}
            wishlistIds={wishlistIds}
          />
        </div>
      )}

      {/* Deep Dive Stories Section */}
      {stories && stories.length > 0 && (
        <section className="mb-12 animate-slideUp">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-gray-900">📚 Deep Dive Stories</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                {stories.length} {stories.length === 1 ? 'Story' : 'Stories'}
              </span>
            </div>
            <p className="text-gray-600 mb-6">
              Curated narratives that bring these locations to life. Explore the full stories behind the destinations.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story, index) => (
                <Link
                  key={story.id}
                  href={`/stories/${story.slug}`}
                  className="group block bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-300 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {story.featured_image_url && (
                    <div className="aspect-video w-full overflow-hidden bg-gray-200 relative">
                      <SafeImage
                        src={story.featured_image_url}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors text-gray-900 flex-1">
                        {story.title}
                      </h3>
                      <ClientOnlyShareButton
                        url={typeof window !== 'undefined' ? `${window.location.origin}/stories/${story.slug}` : ''}
                        title={story.title}
                        description={story.subtitle || story.summary || ''}
                        image={story.featured_image_url || undefined}
                        variant="icon"
                        className="flex-shrink-0"
                      />
                    </div>
                    {story.subtitle && (
                      <p className="text-gray-600 mb-3 text-sm italic">
                        {story.subtitle}
                      </p>
                    )}
                    {story.summary && (
                      <p className="text-gray-700 line-clamp-3 mb-3">
                        {story.summary}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      {story.reading_time_minutes && (
                        <div className="text-sm text-gray-500">
                          📖 {story.reading_time_minutes} min read
                        </div>
                      )}
                      <span className="text-sm text-blue-600 font-medium group-hover:text-blue-700">
                        Read story →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Destinations List */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredDestinations.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center">
              <p className="text-gray-500 text-lg">No destinations match your filters.</p>
            </div>
          ) : (
            filteredDestinations.map((destination, index) => {
              // Insert a blurb every 5 destinations (after positions 4, 9, 14, etc.)
              const blurbIndex = Math.floor(index / 5) + 4; // Start after featured blurbs
              const showBlurb = (index + 1) % 5 === 0 && blurbs[blurbIndex];
              const blurbToShow = blurbs[blurbIndex];

              return (
                <div key={destination.id}>
                  <DestinationCard
                    destination={destination}
                    index={index}
                    isVisited={visitedIds.has(destination.id)}
                    isWishlist={wishlistIds.has(destination.id)}
                    note={notes[destination.id] || ''}
                    onToggleVisited={() => toggleVisited(destination.id)}
                    onToggleWishlist={() => toggleWishlist(destination.id)}
                    onUpdateNote={(note) => updateNote(destination.id, note)}
                  />
                  {showBlurb && blurbToShow && (
                    <div className="my-4">
                      <InfoBlurb
                        icon={blurbToShow.icon}
                        title={blurbToShow.title}
                        content={blurbToShow.content}
                        category={blurbToShow.category}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Map View Placeholder */}
      {viewMode === 'map' && (
        <div className="bg-white rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-2xl font-bold mb-2 text-gray-900">Map View Coming Soon</h3>
          <p className="text-gray-600">
            We&apos;re building an interactive map to help you visualize all destinations at once.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 bg-white rounded-lg p-6 shadow-md">
        <div className="flex flex-wrap gap-4 justify-center items-center mb-4">
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            📄 Print / Save as PDF
          </button>
          <ClientOnlyShareButton
            url={typeof window !== 'undefined' ? window.location.href : `https://www.slctrips.com/tripkits/${tripkit.slug}/view`}
            title={tripkit.name}
            description={tripkit.tagline || `Explore ${destinations.length} destinations in ${tripkit.name}`}
            image={tripkit.cover_image_url || undefined}
            variant="dropdown"
            className="flex-shrink-0"
          />
          <button
            onClick={saveProgress}
            disabled={isSaving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            💾 Save Progress
          </button>
          <Link
            href={`/tripkits/${tripkit.slug}`}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-300"
          >
            ← Back to TripKit Info
          </Link>
        </div>
        
        {/* Share CTA */}
        <div className="text-center mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3">
            💡 Share this TripKit with friends and family planning a trip to Utah
          </p>
          <div className="flex justify-center gap-2">
            <ClientOnlyShareButton
              url={typeof window !== 'undefined' ? window.location.href : `https://www.slctrips.com/tripkits/${tripkit.slug}/view`}
              title={tripkit.name}
              description={tripkit.tagline || `Explore ${destinations.length} destinations`}
              variant="icon"
              className="flex-shrink-0"
            />
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Access Code: <span className="font-mono font-bold">{accessCode}</span></p>
        <p className="mt-1">Purchased by: {customerEmail}</p>
        <p className="mt-2 text-xs">
          💡 Tip: Bookmark this page or save your access code to return anytime!
        </p>
      </div>

      {/* Dan AI Concierge - Floating Chat */}
      <DanConcierge
        tripkitCode={tripkit.code}
        tripkitName={tripkit.name}
        destinations={destinations}
      />
    </div>
  );
}

// Destination Card Component
function DestinationCard({
  destination,
  index,
  isVisited,
  isWishlist,
  note,
  onToggleVisited,
  onToggleWishlist,
  onUpdateNote
}: {
  destination: Destination;
  index: number;
  isVisited: boolean;
  isWishlist: boolean;
  note: string;
  onToggleVisited: () => void;
  onToggleWishlist: () => void;
  onUpdateNote: (note: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const playDestinationVoice = async () => {
    if (!destination.ai_story && !destination.description) return;

    if (audioUrl) {
      // Play cached audio
      try {
        const audio = new Audio(audioUrl);
        setIsPlayingVoice(true);
        audio.onended = () => setIsPlayingVoice(false);
        audio.onerror = () => {
          console.warn('Audio playback failed');
          setIsPlayingVoice(false);
        };
        await audio.play();
      } catch (error) {
        console.warn('Audio play failed:', error);
        setIsPlayingVoice(false);
      }
      return;
    }

    // Generate new voiceover
    setIsPlayingVoice(true);
    try {
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'destination',
          destinationName: destination.name,
          driveTime: destination.category,
          description: destination.ai_story || destination.description,
          destinationCount: 1
        })
      });

      const data = await response.json();
      if (data.success && data.audio) {
        setAudioUrl(data.audio);
        const audio = new Audio(data.audio);
        audio.onended = () => setIsPlayingVoice(false);
        audio.onerror = () => {
          console.warn('Audio playback failed');
          setIsPlayingVoice(false);
        };
        await audio.play();
      } else {
        console.warn('Voice generation returned no audio');
        setIsPlayingVoice(false);
      }
    } catch (error) {
      console.warn('Failed to generate voice:', error);
      setIsPlayingVoice(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden transition-all border-2 ${isVisited ? 'border-green-300' : isWishlist ? 'border-purple-300' : 'border-gray-200'
        }`}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Number Badge */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
            {index + 1}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{destination.name}</h3>
                <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                  {destination.category && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {destination.category}
                    </span>
                  )}
                  {destination.county && (
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      📍 {destination.county} County
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={onToggleVisited}
                  className={`p-2 rounded-lg transition-colors ${isVisited
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  title={isVisited ? 'Mark as not visited' : 'Mark as visited'}
                >
                  {isVisited ? '✓' : '○'}
                </button>
                <button
                  onClick={onToggleWishlist}
                  className={`p-2 rounded-lg transition-colors ${isWishlist
                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  title={isWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  {isWishlist ? '⭐' : '☆'}
                </button>
              </div>
            </div>

            {/* AI-Generated Story */}
            {destination.ai_summary && (
              <div className="mb-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r">
                <p className="text-sm font-semibold text-blue-900 italic">"{destination.ai_summary}"</p>
              </div>
            )}

            {destination.description && !destination.ai_story && (
              <p className="text-gray-700 mb-3">{destination.description}</p>
            )}

            {destination.ai_story && (
              <div className="mb-3">
                <p className="text-gray-700 leading-relaxed">{destination.ai_story}</p>
              </div>
            )}

            {/* Dan's Tips */}
            {destination.ai_tips && (() => {
              // Parse ai_tips - could be string (JSON) or array
              let tips: string[] = [];
              try {
                if (typeof destination.ai_tips === 'string') {
                  tips = JSON.parse(destination.ai_tips);
                } else if (Array.isArray(destination.ai_tips)) {
                  tips = destination.ai_tips;
                }
              } catch {
                tips = [];
              }

              if (tips.length === 0) return null;

              return (
                <div className="mb-3 bg-amber-50 rounded-lg p-3 border border-amber-200">
                  <p className="text-xs font-bold text-amber-900 uppercase mb-2">🎯 Dan's Tips</p>
                  <div className="text-sm text-gray-700 space-y-1">
                    {tips.map((tip: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-amber-600 flex-shrink-0">•</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              {(destination.ai_story || destination.description) && (
                <button
                  onClick={playDestinationVoice}
                  disabled={isPlayingVoice}
                  className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {isPlayingVoice ? (
                    <>
                      <svg className="w-3 h-3 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Playing...
                    </>
                  ) : (
                    <>🎙️ Hear Dan's Story</>
                  )}
                </button>
              )}
              {destination.latitude && destination.longitude && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  📍 Navigate
                </a>
              )}
              <Link
                href={`/destinations/${destination.slug}`}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
              >
                View Details →
              </Link>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
              >
                {isExpanded ? '📝 Hide Notes' : '📝 Add Notes'}
              </button>
            </div>

            {/* Enhance Your Visit - Subtle Affiliate Recommendations */}
            <EnhanceYourVisit
              destinationName={destination.name}
              hotelRecommendations={destination.hotel_recommendations}
              tourRecommendations={destination.tour_recommendations}
            />

            {/* Notes Section */}
            {isExpanded && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Notes:
                </label>
                <textarea
                  value={note}
                  onChange={(e) => onUpdateNote(e.target.value)}
                  placeholder="Add your thoughts, tips, or memories about this destination..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
