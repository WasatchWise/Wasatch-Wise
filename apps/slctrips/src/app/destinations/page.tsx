'use client';

import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { sanitizeDestinations } from '@/lib/sanitizeDestination';
import DestinationCard from '@/components/DestinationCard';
import { Destination } from '@/lib/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FAQ from '@/components/FAQ';
import SocialProof from '@/components/SocialProof';

const PAGE_SIZE = 12;

function DestinationsContent() {
  const searchParams = useSearchParams();

  // Data State
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filter State
  const [q, setQ] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [region, setRegion] = useState('');
  const [onlyFamilyFriendly, setOnlyFamilyFriendly] = useState(false);
  const [onlyPetAllowed, setOnlyPetAllowed] = useState(false);
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [onlyTrending, setOnlyTrending] = useState(false);
  const [onlyFreeParking, setOnlyFreeParking] = useState(false);
  const [onlyRestrooms, setOnlyRestrooms] = useState(false);
  const [onlyVisitorCenter, setOnlyVisitorCenter] = useState(false);
  const [onlyPlayground, setOnlyPlayground] = useState(false);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'distance' | 'alphabetical'>('distance');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const filterPanelRef = useRef<HTMLDivElement>(null);

  // Debounce search term
  const [debouncedQ, setDebouncedQ] = useState(q);
  useEffect(() => {
    if (q) {
      setIsSearching(true);
    }
    const timer = setTimeout(() => {
      setDebouncedQ(q);
      setIsSearching(false);
    }, 500);
    return () => {
      clearTimeout(timer);
      setIsSearching(false);
    };
  }, [q]);

  // Close filter panel on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showFilters) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showFilters]);

  // Close filter panel on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(e.target as Node) &&
        showFilters
      ) {
        // Don't close if clicking the "More Filters" button
        const filterButton = document.querySelector('[data-filter-button]');
        if (filterButton && filterButton.contains(e.target as Node)) {
          return;
        }
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters]);

  // Fetch Destinations (Server-Side Filter & Pagination)
  const fetchDestinations = useCallback(async (isLoadMore = false) => {
    try {
      const offset = isLoadMore ? destinations.length : 0;
      if (!isLoadMore) setIsLoading(true);
      else setIsLoadingMore(true);
      setLoadError(null);

      let query = supabase
        .from('public_destinations')
        .select('*', { count: 'exact' });

      // Apply Filters
      if (debouncedQ) query = query.ilike('name', `%${debouncedQ}%`);
      if (category) query = query.eq('category', category);
      if (region) query = query.eq('region', region);

      // Subcategories (OR logic within array)
      if (subcategories.length > 0) {
        // This is a bit tricky with Supabase, usually .in() works for exact matches
        // For now, let's use .in() assuming exact match on the field
        query = query.in('subcategory', subcategories);
      }

      // Boolean Flags
      if (onlyFeatured) query = query.eq('featured', true);
      if (onlyTrending) query = query.eq('trending', true);
      if (onlyFamilyFriendly) query = query.eq('is_family_friendly', true);
      if (onlyPetAllowed) query = query.eq('pet_allowed', true);
      if (onlyFreeParking) query = query.eq('is_parking_free', true);
      if (onlyRestrooms) query = query.eq('has_restrooms', true);
      if (onlyVisitorCenter) query = query.eq('has_visitor_center', true);
      if (onlyPlayground) query = query.eq('has_playground', true);

      // Season Filters (OR logic)
      if (selectedSeasons.length > 0) {
        const seasonConditions = selectedSeasons.map(season => {
          if (season === 'all') return 'is_season_all.eq.true';
          if (season === 'spring') return 'is_season_spring.eq.true';
          if (season === 'summer') return 'is_season_summer.eq.true';
          if (season === 'fall') return 'is_season_fall.eq.true';
          if (season === 'winter') return 'is_season_winter.eq.true';
          return '';
        }).filter(Boolean).join(',');

        if (seasonConditions) {
          query = query.or(seasonConditions);
        }
      }

      // Sorting - Default to distance (closest first), optional alphabetical
      if (sortBy === 'alphabetical') {
        query = query.order('name', { ascending: true });
      } else {
        // Sort by drive_minutes (closest to SLC Airport first)
        // Put nulls last so destinations with distance info appear first
        query = query
          .order('drive_minutes', { ascending: true, nullsFirst: false })
          .order('distance_miles', { ascending: true, nullsFirst: false }) // Fallback to distance_miles
          .order('name', { ascending: true }); // Finally by name for consistency
      }

      // Pagination
      query = query.range(offset, offset + PAGE_SIZE - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      // CRITICAL: Sanitize destinations before setting state
      const sanitized = sanitizeDestinations(data || []);
      
      if (isLoadMore) {
        setDestinations(prev => [...prev, ...sanitized]);
      } else {
        setDestinations(sanitized);
        setTotalCount(count || 0);
      }

      // Check if we have more to load
      const currentCount = isLoadMore ? destinations.length + (data?.length || 0) : (data?.length || 0);
      setHasMore(currentCount < (count || 0));

    } catch {
      // Error already logged by logger if needed
      setLoadError('Failed to load destinations. Please try again.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [debouncedQ, category, subcategories, region, onlyFeatured, onlyTrending, onlyFamilyFriendly, onlyPetAllowed, onlyFreeParking, onlyRestrooms, onlyVisitorCenter, onlyPlayground, selectedSeasons, sortBy, destinations.length]);

  // Geolocation Detection (Optional - for future proximity-based sorting)
  useEffect(() => {
    if (navigator.geolocation && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          // Silently fail - geolocation is optional
          console.debug('Geolocation not available or denied:', error);
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    }
  }, []);

  // Initial Fetch & Filter Changes
  useEffect(() => {
    fetchDestinations(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ, category, subcategories, region, onlyFeatured, onlyTrending, onlyFamilyFriendly, onlyPetAllowed, onlyFreeParking, onlyRestrooms, onlyVisitorCenter, onlyPlayground, selectedSeasons, sortBy]);

  // Static Data for Filters (Hardcoded for performance, or could be fetched once)
  const categories = ['', '30min', '90min', '3h', '5h', '8h', '12h'];
  const availableRegions = ['', 'Salt Lake Valley', 'Park City', 'Utah Valley', 'Davis County', 'Weber County', 'Cache Valley', 'Tooele Valley', 'Summit County', 'Wasatch Back', 'Uinta Mountains', 'West Desert', 'Southern Utah'];
  const availableSubcategories = ['Hiking', 'Park', 'Museum', 'Restaurant', 'Brewery', 'Shopping', 'Entertainment', 'Ski Resort', 'Lake', 'Viewpoint', 'Historical Site', 'Camping', 'Hot Spring', 'Scenic Drive'].sort();

  const activeFilterCount = [
    subcategories.length,
    region ? 1 : 0,
    onlyFamilyFriendly ? 1 : 0,
    onlyPetAllowed ? 1 : 0,
    onlyFeatured ? 1 : 0,
    onlyTrending ? 1 : 0,
    onlyFreeParking ? 1 : 0,
    onlyRestrooms ? 1 : 0,
    onlyVisitorCenter ? 1 : 0,
    onlyPlayground ? 1 : 0,
    selectedSeasons.length
  ].reduce((a, b) => a + b, 0);

  const clearAllFilters = () => {
    setCategory('');
    setSubcategories([]);
    setRegion('');
    setOnlyFamilyFriendly(false);
    setOnlyPetAllowed(false);
    setOnlyFeatured(false);
    setOnlyTrending(false);
    setOnlyFreeParking(false);
    setOnlyRestrooms(false);
    setOnlyVisitorCenter(false);
    setOnlyPlayground(false);
    setSelectedSeasons([]);
    setQ('');
  };

  const toggleSeason = (season: string) => {
    setSelectedSeasons(prev =>
      prev.includes(season) ? prev.filter(s => s !== season) : [...prev, season]
    );
  };

  const toggleSubcategory = (sub: string) => {
    setSubcategories(prev =>
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  return (
    <div className="relative min-h-screen">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header />

      {/* Hero Banner - Bottom Layer */}
      <div className="fixed top-0 left-0 right-0 h-[750px] -z-10">
        <Image
          src="/images/SLCTripsBanner.png"
          alt="SLCTrips - Salt Lake City and Wasatch Mountains"
          fill
          className="object-cover object-top"
          priority
          sizes="100vw"
          quality={75}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white" />
      </div>

      {/* Content - Top Layer */}
      <main id="main-content" className="relative mx-auto max-w-7xl px-4 pt-40 pb-8">
        <h1 className="sr-only">Destinations from Salt Lake City</h1>

        {/* Primary Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1 relative">
            <input
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              placeholder="Search by name..."
              value={q}
              onChange={e => setQ(e.target.value)}
              aria-label="Search destinations by name"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2" role="status" aria-label="Searching">
                <svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            )}
          </div>
          <select
            className="rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
            value={category}
            onChange={e => setCategory(e.target.value)}
            aria-label="Filter by drive time"
          >
            <option value="">All drive times</option>
            {categories.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            className="rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'distance' | 'alphabetical')}
            aria-label="Sort destinations"
          >
            <option value="distance">📍 Closest First</option>
            <option value="alphabetical">🔤 A-Z</option>
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            data-filter-button
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 hover:bg-gray-50 transition-colors font-medium text-gray-700"
            aria-expanded={showFilters}
            aria-controls="filter-panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            More Filters
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Advanced Filters (Collapsible) */}
        {showFilters && (
          <div
            id="filter-panel"
            ref={filterPanelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Filter options"
            className="mb-6 bg-white border border-gray-200 rounded-xl p-6 shadow-md space-y-6"
          >
            {/* Subcategories */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Activity Type</h3>
                {subcategories.length > 0 && (
                  <button
                    onClick={() => setSubcategories([])}
                    className="text-sm text-blue-600 hover:text-blue-700 underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {availableSubcategories.map(sub => {
                  const isSelected = subcategories.includes(sub);
                  return (
                    <button
                      key={sub}
                      onClick={() => toggleSubcategory(sub)}
                      className={`px-4 py-2.5 sm:px-3 sm:py-1.5 rounded-full text-sm font-medium transition-all min-h-[44px] sm:min-h-0 flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 ${isSelected
                        ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      aria-pressed={isSelected}
                      aria-label={`${isSelected ? 'Remove' : 'Add'} ${sub} filter`}
                    >
                      {isSelected && (
                        <span className="text-xs" aria-hidden="true">✓</span>
                      )}
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Region Filter */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Region</h3>
              <select
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
                value={region}
                onChange={e => setRegion(e.target.value)}
                aria-label="Filter by region"
              >
                <option value="">All regions</option>
                {availableRegions.filter(Boolean).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Feature Toggles */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Features</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setOnlyFamilyFriendly(!onlyFamilyFriendly)}
                  className={`flex items-center gap-2 px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 ${onlyFamilyFriendly
                    ? 'bg-green-500 text-white ring-2 ring-green-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  aria-pressed={onlyFamilyFriendly}
                  aria-label={`${onlyFamilyFriendly ? 'Remove' : 'Add'} family friendly filter`}
                >
                  <span aria-hidden="true">👨‍👩‍👧‍👦</span>
                  {onlyFamilyFriendly && <span className="text-xs" aria-hidden="true">✓</span>}
                  Family Friendly
                </button>
                <button
                  onClick={() => setOnlyPetAllowed(!onlyPetAllowed)}
                  className={`flex items-center gap-2 px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 ${onlyPetAllowed
                    ? 'bg-green-500 text-white ring-2 ring-green-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  aria-pressed={onlyPetAllowed}
                  aria-label={`${onlyPetAllowed ? 'Remove' : 'Add'} pet friendly filter`}
                >
                  <span aria-hidden="true">🐕</span>
                  {onlyPetAllowed && <span className="text-xs" aria-hidden="true">✓</span>}
                  Pet Friendly
                </button>
                <button
                  onClick={() => setOnlyFeatured(!onlyFeatured)}
                  className={`flex items-center gap-2 px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 ${onlyFeatured
                    ? 'bg-yellow-500 text-white ring-2 ring-yellow-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  aria-pressed={onlyFeatured}
                  aria-label={`${onlyFeatured ? 'Remove' : 'Add'} featured filter`}
                >
                  <span aria-hidden="true">⭐</span>
                  {onlyFeatured && <span className="text-xs" aria-hidden="true">✓</span>}
                  Featured
                </button>
                <button
                  onClick={() => setOnlyTrending(!onlyTrending)}
                  className={`flex items-center gap-2 px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 ${onlyTrending
                    ? 'bg-orange-600 text-white ring-2 ring-orange-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  aria-pressed={onlyTrending}
                  aria-label={`${onlyTrending ? 'Remove' : 'Add'} trending filter`}
                >
                  <span aria-hidden="true">🔥</span>
                  {onlyTrending && <span className="text-xs" aria-hidden="true">✓</span>}
                  Trending
                </button>
              </div>
            </div>

            {/* Amenity Filters */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setOnlyFreeParking(!onlyFreeParking)}
                  className={`flex items-center gap-2 px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 ${onlyFreeParking
                    ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  aria-pressed={onlyFreeParking}
                  aria-label={`${onlyFreeParking ? 'Remove' : 'Add'} free parking filter`}
                >
                  <span aria-hidden="true">🅿️</span>
                  {onlyFreeParking && <span className="text-xs" aria-hidden="true">✓</span>}
                  Free Parking
                </button>
                <button
                  onClick={() => setOnlyRestrooms(!onlyRestrooms)}
                  className={`flex items-center gap-2 px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 ${onlyRestrooms
                    ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  aria-pressed={onlyRestrooms}
                  aria-label={`${onlyRestrooms ? 'Remove' : 'Add'} restrooms filter`}
                >
                  <span aria-hidden="true">🚻</span>
                  {onlyRestrooms && <span className="text-xs" aria-hidden="true">✓</span>}
                  Restrooms
                </button>
                <button
                  onClick={() => setOnlyVisitorCenter(!onlyVisitorCenter)}
                  className={`flex items-center gap-2 px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 ${onlyVisitorCenter
                    ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  aria-pressed={onlyVisitorCenter}
                  aria-label={`${onlyVisitorCenter ? 'Remove' : 'Add'} visitor center filter`}
                >
                  <span aria-hidden="true">ℹ️</span>
                  {onlyVisitorCenter && <span className="text-xs" aria-hidden="true">✓</span>}
                  Visitor Center
                </button>
                <button
                  onClick={() => setOnlyPlayground(!onlyPlayground)}
                  className={`flex items-center gap-2 px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 ${onlyPlayground
                    ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  aria-pressed={onlyPlayground}
                  aria-label={`${onlyPlayground ? 'Remove' : 'Add'} playground filter`}
                >
                  <span aria-hidden="true">🎪</span>
                  {onlyPlayground && <span className="text-xs" aria-hidden="true">✓</span>}
                  Playground
                </button>
              </div>
            </div>

            {/* Season Filters */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Best Seasons</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => toggleSeason('all')}
                  className={`flex items-center gap-2 px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 ${selectedSeasons.includes('all')
                    ? 'bg-gray-600 text-white ring-2 ring-gray-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  aria-pressed={selectedSeasons.includes('all')}
                  aria-label={`${selectedSeasons.includes('all') ? 'Remove' : 'Add'} year-round filter`}
                >
                  <span aria-hidden="true">✨</span>
                  {selectedSeasons.includes('all') && <span className="text-xs" aria-hidden="true">✓</span>}
                  Year-Round
                </button>
                <button
                  onClick={() => toggleSeason('spring')}
                  className={`flex items-center gap-2 px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 ${selectedSeasons.includes('spring')
                    ? 'bg-green-500 text-white ring-2 ring-green-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  aria-pressed={selectedSeasons.includes('spring')}
                  aria-label={`${selectedSeasons.includes('spring') ? 'Remove' : 'Add'} spring filter`}
                >
                  <span aria-hidden="true">🌸</span>
                  {selectedSeasons.includes('spring') && <span className="text-xs" aria-hidden="true">✓</span>}
                  Spring
                </button>
                <button
                  onClick={() => toggleSeason('summer')}
                  className={`flex items-center gap-2 px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 ${selectedSeasons.includes('summer')
                    ? 'bg-yellow-500 text-white ring-2 ring-yellow-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  aria-pressed={selectedSeasons.includes('summer')}
                  aria-label={`${selectedSeasons.includes('summer') ? 'Remove' : 'Add'} summer filter`}
                >
                  <span aria-hidden="true">☀️</span>
                  {selectedSeasons.includes('summer') && <span className="text-xs" aria-hidden="true">✓</span>}
                  Summer
                </button>
                <button
                  onClick={() => toggleSeason('fall')}
                  className={`flex items-center gap-2 px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 ${selectedSeasons.includes('fall')
                    ? 'bg-orange-600 text-white ring-2 ring-orange-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  aria-pressed={selectedSeasons.includes('fall')}
                  aria-label={`${selectedSeasons.includes('fall') ? 'Remove' : 'Add'} fall filter`}
                >
                  <span aria-hidden="true">🍂</span>
                  {selectedSeasons.includes('fall') && <span className="text-xs" aria-hidden="true">✓</span>}
                  Fall
                </button>
                <button
                  onClick={() => toggleSeason('winter')}
                  className={`flex items-center gap-2 px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 ${selectedSeasons.includes('winter')
                    ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  aria-pressed={selectedSeasons.includes('winter')}
                  aria-label={`${selectedSeasons.includes('winter') ? 'Remove' : 'Add'} winter filter`}
                >
                  <span aria-hidden="true">❄️</span>
                  {selectedSeasons.includes('winter') && <span className="text-xs" aria-hidden="true">✓</span>}
                  Winter
                </button>
              </div>
            </div>

            {/* Clear All Button */}
            {activeFilterCount > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={clearAllFilters}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2.5 rounded-lg transition-colors"
                >
                  Clear All Filters ({activeFilterCount})
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm animate-pulse"
              >
                <div className="aspect-video w-full bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 w-3/4 bg-gray-200 rounded" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded" />
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-gray-200 rounded-full" />
                    <div className="h-6 w-20 bg-gray-200 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && loadError && (
          <div className="text-center py-16 bg-red-50 rounded-xl">
            <div className="text-5xl mb-4">😕</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Destinations</h3>
            <p className="text-gray-600 mb-6">{loadError}</p>
            <button
              onClick={() => fetchDestinations(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!isLoading && !loadError && (
          <>
            <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
              {/* Screen reader announcement */}
              <div 
                role="status" 
                aria-live="polite" 
                aria-atomic="true"
                className="sr-only"
              >
                Showing {destinations.length} of {totalCount} destination{destinations.length !== 1 ? 's' : ''}
                {sortBy === 'distance' && ' sorted by proximity to SLC Airport'}
              </div>
              
              {/* Visual display */}
              <div className="text-gray-700" aria-hidden="true">
                Showing {destinations.length} of {totalCount} destination{totalCount !== 1 ? 's' : ''}
                {sortBy === 'distance' && (
                  <span className="ml-2 text-sm text-gray-700">
                    • Sorted by proximity to SLC Airport
                  </span>
                )}
              </div>
              {userLocation && (
                <div className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  📍 Using your location for better results
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {destinations.map(d => <DestinationCard key={d.id} d={d} />)}
            </div>

            {destinations.length === 0 && (
              <div className="text-center py-16 bg-gray-50 rounded-xl">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-gray-700 text-lg mb-4">No destinations match your filters</p>
                <button
                  onClick={clearAllFilters}
                  className="text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Load More Button */}
            {hasMore && destinations.length > 0 && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => fetchDestinations(true)}
                  disabled={isLoadingMore}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-8 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingMore ? 'Loading...' : 'Load More Destinations'}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <SocialProof />
      <FAQ />
      <Footer />
    </div>
  );
}

export default function DestinationsIndex() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DestinationsContent />
    </Suspense>
  );
}
