'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { sanitizeDestinations } from '@/lib/sanitizeDestination';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BullseyeTarget from '@/components/BullseyeTarget';
import RandomDestinationPicker from '@/components/RandomDestinationPicker';
import WelcomeModal from '@/components/WelcomeModal';
import DansScore from '@/components/DansScore';
import DanSpeaks from '@/components/DanSpeaks';
import BookYourAdventure from '@/components/BookYourAdventure';
import { normalizeImageSrc } from '@/lib/normalizeImageSrc';
import { useRouter } from 'next/navigation';

interface Destination {
  id: string;
  name: string;
  slug: string;
  subcategory: string;
  category: string;
  drive_minutes: number | null;
  distance_miles: number | null;
  is_featured: boolean | null;
  is_family_friendly: boolean | null;
  pet_allowed: boolean | null;
  image_url: string | null;
  description: string | null;
  featured: boolean;
}

interface WeeklyPick extends Destination {
  category_emoji: string;
  category_label: string;
  score: number;
  popularity_score?: number;
}

const driveTimeCategories = [
  { name: '30min', label: '30 min', emoji: '⚡' },
  { name: '90min', label: '90 min', emoji: '🚗' },
  { name: '3h', label: '3 hours', emoji: '🏔️' },
  { name: '5h', label: '5 hours', emoji: '🌄' },
  { name: '8h', label: '8 hours', emoji: '🗺️' },
  { name: '12h', label: '12+ hours', emoji: '🚙' }
];

const emojiMap: Record<string, string> = {
  'Hiking': '🥾', 'Skiing': '⛷️', 'National Park': '🏞️',
  'Rock Climbing': '🧗', 'Brewery': '🍺', 'Coffee': '☕',
  'Swimming': '🏊', 'Camping': '⛺', 'Mountain Biking': '🚵',
  'Scenic Drive': '🚗', 'Restaurant': '🍽️', 'Hot Spring': '♨️',
  'Lake': '🏊', 'Waterfall': '💧', 'Ghost Town': '👻'
};

export default function HomePage() {
  const [weeklyPicks, setWeeklyPicks] = useState<WeeklyPick[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [userLanguage, setUserLanguage] = useState('en');
  const [weatherUnavailable, setWeatherUnavailable] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    loadWeeklyPicks();
  }, []);

  useEffect(() => {
    if (mounted) {
      detectLanguage();
    }
  }, [mounted]);

  function detectLanguage() {
    // Only run in browser to prevent hydration errors
    if (typeof window === 'undefined') return;
    
    // Detect user's browser language
    const browserLang = navigator.language.split('-')[0]; // e.g., 'en-US' -> 'en'

    // Supported languages (all 29 ElevenLabs supports)
    const supportedLangs = [
      'en', 'es', 'fr', 'de', 'pt', 'it', 'zh', 'ja', 'ko', 'nl',
      'pl', 'tr', 'ru', 'ar', 'hi', 'sv', 'da', 'no', 'fi', 'cs',
      'uk', 'ro', 'el', 'hu', 'bg', 'hr', 'sk', 'sl', 'lt', 'lv', 'et'
    ];

    // Use detected language if supported, otherwise default to English
    const detectedLang = supportedLangs.includes(browserLang) ? browserLang : 'en';
    setUserLanguage(detectedLang);
  }

  async function loadWeeklyPicks() {
    setLoading(true);
    setLoadError(null);

    try {
      // Get current week number for rotation
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const weekNumber = Math.floor((now.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000));

      // Get current season
      const month = now.getMonth() + 1;
      let season = 'winter';
      if (month >= 3 && month <= 5) season = 'spring';
      if (month >= 6 && month <= 8) season = 'summer';
      if (month >= 9 && month <= 11) season = 'fall';

      // Fetch current weather from secure API route
      let weatherTemp = 65;
      let weatherCondition = 'clear';
      let weatherFailed = false;
      try {
        const weatherRes = await fetch('/api/weather');
        if (weatherRes.ok) {
          const weatherData = await weatherRes.json();
          weatherTemp = weatherData.temp;
          weatherCondition = weatherData.condition;
        } else {
          weatherFailed = true;
        }
      } catch {
        weatherFailed = true;
      }
      setWeatherUnavailable(weatherFailed);

      // Weather-aware seasonal categories
      const seasonalCategories: Record<string, string[]> = {
        winter: ['Skiing', 'Snowshoeing', 'Hot Spring', 'Brewery'],
        spring: ['Hiking', 'National Park', 'Scenic Drive', 'Waterfall'],
        summer: ['Swimming', 'Lake', 'Camping', 'Mountain Biking'],
        fall: ['Hiking', 'Scenic Drive', 'Camping', 'National Park']
      };

      // Weather-based adjustments
      let weatherCategories: string[] = [];
      if (weatherTemp > 75) {
        weatherCategories = ['Swimming', 'Lake', 'Water', 'Beach'];
      } else if (weatherTemp < 40 || weatherCondition.includes('snow')) {
        weatherCategories = ['Skiing', 'Snowshoeing', 'Hot Spring', 'Brewery', 'Coffee'];
      } else if (weatherCondition.includes('rain')) {
        weatherCategories = ['Brewery', 'Coffee', 'Museum', 'Indoor'];
      } else if (weatherTemp > 60 && weatherTemp < 75) {
        weatherCategories = ['Hiking', 'National Park', 'Scenic Drive', 'Waterfall'];
      }

      const picks: WeeklyPick[] = [];

      // Pick one destination from each drive time category
      for (let categoryIndex = 0; categoryIndex < driveTimeCategories.length; categoryIndex++) {
        const category = driveTimeCategories[categoryIndex];
        const { data, error } = await supabase
          .from('public_destinations')
          .select('id, name, slug, subcategory, category, drive_minutes, distance_miles, is_featured, is_family_friendly, pet_allowed, image_url, description, featured')
          .eq('category', category.name)
          .not('image_url', 'is', null)
          .limit(50);

        if (error) {
          console.error(`❌ Error for category ${category.name}:`, error);
          continue;
        }

        if (!data || data.length === 0) {
          continue;
        }

        // CRITICAL: Sanitize destinations before processing
        const sanitizedData = sanitizeDestinations(data as Destination[]);
        
        // Score destinations based on season, weather, distance, and features
        const scored = sanitizedData.map((d: Destination) => {
          let score = 0;

          // Featured destinations get priority (check both fields)
          if (d.featured || d.is_featured) score += 20;

          // Seasonal match
          if (d.subcategory && seasonalCategories[season].some(cat =>
            d.subcategory?.toLowerCase().includes(cat.toLowerCase())
          )) score += 15;

          // Weather-based boost
          if (d.subcategory && weatherCategories.some(cat =>
            d.subcategory?.toLowerCase().includes(cat.toLowerCase())
          )) score += 25; // Higher boost for weather match

          // Distance optimization - favor closer destinations for bad weather
          // 30min and 90min categories are closer
          if (weatherCondition.includes('rain') || weatherCondition.includes('snow')) {
            if (d.category === '30min' || d.category === '90min') score += 10;
          }

          // Family and pet friendly (handle nulls)
          if (d.is_family_friendly === true) score += 5;
          if (d.pet_allowed === true) score += 3;

          return {
            ...d,
            score,
            category_emoji: category.emoji,
            category_label: category.label
          };
        }).sort((a, b) => b.score - a.score);

        if (scored.length > 0) {
          // Take top 5 candidates (or all if less than 5)
          const topCandidates = scored.slice(0, Math.min(5, scored.length));
          // Use week number + category index to deterministically rotate through top picks
          const pickIndex = (weekNumber + categoryIndex) % topCandidates.length;
          const pick = topCandidates[pickIndex];
          picks.push(pick);
        }
      }
      setWeeklyPicks(picks);
      setLoading(false);
    } catch (err) {
      console.error('❌ Error loading weekly picks:', err);
      setLoadError('Unable to load this week\'s picks. Please try again.');
      setLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/destinations?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      if (searchQuery.trim()) {
        router.push(`/destinations?q=${encodeURIComponent(searchQuery.trim())}`);
        setSearchQuery('');
      }
    }
  };

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <WelcomeModal />
      <Header />
      <main id="main-content" className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        {/* Hero Section */}
        <section className="relative pt-8 pb-8 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial from-blue-600/20 to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
            {/* Global Search - Above "Adventure Awaits" */}
            <div className="mb-8 max-w-2xl mx-auto">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="search"
                    className="w-full rounded-lg border-2 border-gray-600 bg-gray-800/90 text-white placeholder-gray-400 pl-12 pr-4 py-3.5 text-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all shadow-xl"
                    placeholder="Search destinations, TripKits, or locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    aria-label="Search destinations"
                  />
                </div>
              </form>
            </div>
            <div className="text-yellow-400 font-semibold text-sm uppercase tracking-wider mb-4">
              Adventure Awaits
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 to-yellow-400 bg-clip-text text-transparent">
              1 Airport • 1000+ Destinations
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Discover destinations organized by drive time from SLC Airport. From 30-minute escapes to 12-hour road trips—find your perfect adventure instantly.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/destinations"
                className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-4 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition-all hover:-translate-y-1 shadow-lg"
              >
                Explore Destinations →
              </Link>
              <Link
                href="/tripkits"
                className="rounded-lg bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600 px-8 py-4 text-white font-semibold hover:border-blue-500 transition-all hover:-translate-y-1"
              >
                Get Your TripKit
              </Link>
            </div>

            {/* Quick Booking Links */}
            <BookYourAdventure variant="compact" />
          </div>
        </section>

        {/* Dan Shoots at Bullseye */}
        <section className="pt-4 pb-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4 text-white">How far do you want to go?</h2>
              <p className="text-gray-400 text-lg mb-6">Click any ring to explore destinations by drive time</p>

              {/* Pill Buttons - Above randomizer, ordered shortest to longest */}
              <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto mb-8" role="group" aria-label="Filter destinations by drive time">
                <Link
                  href="/destinations?category=30min"
                  className="px-6 py-2 rounded-full font-semibold text-gray-900 transition-all hover:scale-105 shadow-lg focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
                  style={{ backgroundColor: '#EAB308' }}
                  aria-label="Browse destinations within 30 minutes drive from Salt Lake City Airport"
                >
                  <span aria-hidden="true">⚡</span> 30 min
                </Link>
                <Link
                  href="/destinations?category=90min"
                  className="px-6 py-2 rounded-full font-semibold text-white transition-all hover:scale-105 shadow-lg focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
                  style={{ backgroundColor: '#A855F7' }}
                  aria-label="Browse destinations within 90 minutes drive from Salt Lake City Airport"
                >
                  <span aria-hidden="true">🚗</span> 90 min
                </Link>
                <Link
                  href="/destinations?category=3h"
                  className="px-6 py-2 rounded-full font-semibold text-white transition-all hover:scale-105 shadow-lg focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
                  style={{ backgroundColor: '#84CC16' }}
                  aria-label="Browse destinations within 3 hours drive from Salt Lake City Airport"
                >
                  <span aria-hidden="true">🏔️</span> 3 hours
                </Link>
                <Link
                  href="/destinations?category=5h"
                  className="px-6 py-2 rounded-full font-semibold text-white transition-all hover:scale-105 shadow-lg focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
                  style={{ backgroundColor: '#F97316' }}
                  aria-label="Browse destinations within 5 hours drive from Salt Lake City Airport"
                >
                  <span aria-hidden="true">🌄</span> 5 hours
                </Link>
                <Link
                  href="/destinations?category=8h"
                  className="px-6 py-2 rounded-full font-semibold text-white transition-all hover:scale-105 shadow-lg focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
                  style={{ backgroundColor: '#3B82F6' }}
                  aria-label="Browse destinations within 8 hours drive from Salt Lake City Airport"
                >
                  <span aria-hidden="true">🗺️</span> 8 hours
                </Link>
                <Link
                  href="/destinations?category=12h"
                  className="px-6 py-2 rounded-full font-semibold text-white transition-all hover:scale-105 shadow-lg focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
                  style={{ backgroundColor: '#EF4444' }}
                  aria-label="Browse destinations 12 or more hours drive from Salt Lake City Airport"
                >
                  <span aria-hidden="true">🚙</span> 12+ hours
                </Link>
                <Link
                  href="/destinations"
                  className="px-8 py-2 rounded-full font-bold bg-white text-gray-900 border-2 border-gray-300 transition-all hover:scale-105 shadow-lg hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
                  aria-label="Browse all destinations"
                >
                  ALL
                </Link>
              </div>

              <RandomDestinationPicker />
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16 max-w-5xl mx-auto">
              {/* Dan shooting arrow */}
              <div className="w-full lg:w-1/2 flex justify-center">
                <div className="relative w-full max-w-md aspect-square">
                  <Image
                    src="/images/dan-arrow-optimized.png"
                    alt="Dan the Wasatch Sasquatch aiming arrow at destination bullseye"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
              </div>

              {/* Bullseye Target with Clickable Rings */}
              <div className="w-full lg:w-1/2 flex justify-center">
                <div className="w-full max-w-md">
                  <BullseyeTarget />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Free TripKit - Meet the Guardians */}
        <section className="py-16 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center text-white">
              <div className="inline-block bg-yellow-400 text-gray-900 px-4 py-2 rounded-full mb-4 font-bold">
                ⭐ FEATURED FREE TRIPKIT
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">
                Meet the Guardians
              </h2>
              <p className="text-xl text-blue-100 mb-6">
                Your introduction to Utah&apos;s 29 counties and their mythical protectors.
                Perfect for teachers, parents, and explorers.
              </p>

              <div className="grid md:grid-cols-3 gap-4 mb-8 text-left">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-3xl mb-2">👩‍🏫</div>
                  <h3 className="font-bold mb-1 text-white">For Teachers</h3>
                  <p className="text-sm text-blue-100">Complete 4th grade Utah Studies curriculum with standards alignment</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-3xl mb-2">👨‍👩‍👧‍👦</div>
                  <h3 className="font-bold mb-1 text-white">For Families</h3>
                  <p className="text-sm text-blue-100">Plan educational adventures and explore Utah counties together</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-3xl mb-2">🗺️</div>
                  <h3 className="font-bold mb-1 text-white">For Explorers</h3>
                  <p className="text-sm text-blue-100">Discover hidden gems and learn the stories behind each county</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <Link
                  href="/tripkits/tk-000"
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-10 py-5 rounded-xl font-extrabold text-xl hover:from-yellow-300 hover:to-orange-400 transition-all hover:scale-105 shadow-2xl"
                >
                  🚀 Get FREE Access Now
                </Link>
                <p className="text-sm text-blue-200">
                  $50 value • FREE FOREVER • No account required • Privacy-first
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Book Your Adventure - Affiliate Section */}
        <BookYourAdventure />

        {/* This Week's Picks */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-white">🌟 This Week's Picks</h2>
              <p className="text-gray-400 text-lg">
                Curated destinations based on season, popularity, and great opportunities
              </p>
              {weatherUnavailable && (
                <p className="text-gray-500 text-sm mt-2">
                  Weather data unavailable — showing seasonal recommendations
                </p>
              )}
            </div>

            {/* Loading Skeleton State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-gray-800/60 border border-gray-700 rounded-xl overflow-hidden animate-pulse"
                  >
                    <div className="aspect-video w-full bg-gray-700" />
                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="h-6 w-24 bg-gray-700 rounded-full" />
                        <div className="h-6 w-8 bg-gray-700 rounded" />
                      </div>
                      <div className="h-6 w-3/4 bg-gray-700 rounded" />
                      <div className="h-4 w-1/2 bg-gray-700 rounded" />
                      <div className="flex gap-4">
                        <div className="h-4 w-20 bg-gray-700 rounded" />
                        <div className="h-4 w-16 bg-gray-700 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State with Retry */}
            {!loading && loadError && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">😕</div>
                <h3 className="text-xl font-bold text-gray-300 mb-2">Oops! Something went wrong</h3>
                <p className="text-gray-400 mb-6">{loadError}</p>
                <button
                  onClick={loadWeeklyPicks}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Loaded Content */}
            {!loading && !loadError && weeklyPicks.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {weeklyPicks.map((pick) => {
                  const categoryEmoji = emojiMap[pick.subcategory] || '📍';

                  // Use image proxy for Google Maps images to inject correct API key
                  const normalizedPickImage = normalizeImageSrc(pick.image_url);
                  const imageSrc = normalizedPickImage?.includes('maps.googleapis.com')
                    ? `/api/image-proxy?url=${encodeURIComponent(normalizedPickImage)}`
                    : normalizedPickImage;

                  return (
                    <Link
                      key={pick.id}
                      href={`/destinations/${pick.slug}`}
                      className="group bg-gray-800/60 border border-gray-700 rounded-xl overflow-hidden hover:border-blue-500 hover:-translate-y-2 transition-all duration-300"
                    >
                      {imageSrc && (
                        <div className="aspect-video w-full overflow-hidden bg-gray-700 relative">
                          <Image
                            src={imageSrc}
                            alt={pick.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            onError={(e) => {
                              console.error(`❌ Image failed to load for ${pick.name}:`, {
                                originalUrl: pick.image_url,
                                proxiedUrl: imageSrc
                              });
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full">
                            {pick.category_emoji} {pick.category_label}
                          </span>
                          <div className="flex items-center gap-2">
                            {pick.popularity_score && pick.popularity_score > 0 && (
                              <DansScore score={pick.popularity_score} size="sm" showLabel={false} />
                            )}
                            {pick.is_featured && (
                              <span className="text-yellow-400">⭐</span>
                            )}
                          </div>
                        </div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                          {categoryEmoji} {pick.name}
                        </h3>
                        <p className="text-gray-400 text-sm mb-3">{pick.subcategory || 'Destination'}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>🚗 {pick.category_label}</span>
                          {pick.distance_miles && <span>📍 {pick.distance_miles} mi</span>}
                        </div>
                        {(pick.is_family_friendly || pick.pet_allowed) && (
                          <div className="flex gap-2 mt-3">
                            {pick.is_family_friendly && (
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                                👨‍👩‍👧‍👦 Family
                              </span>
                            )}
                            {pick.pet_allowed && (
                              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                                🐕 Pet OK
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {!loading && !loadError && weeklyPicks.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏔️</div>
                <h3 className="text-xl font-bold text-gray-300 mb-2">No Picks Available</h3>
                <p className="text-gray-400 mb-6">
                  We&apos;re curating this week&apos;s destinations. Check back soon or explore all destinations!
                </p>
                <Link
                  href="/destinations"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
                >
                  Browse All Destinations
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Meet Dan Section */}
        <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center gap-12">
                {/* Dan Image */}
                <div className="w-full md:w-1/2 flex justify-center relative">
                  <div className="relative w-full max-w-md aspect-square">
                    <Image
                      src="/images/danlogo.png"
                      alt="Daniel the Wasatch Sasquatch"
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </div>

                {/* Dan Audio & Description */}
                <div className="w-full md:w-1/2 space-y-6">
                  {/* Audio Player - Only render after mount to prevent hydration errors */}
                  {mounted && <DanSpeaks language={userLanguage} />}

                  {/* Description Text */}
                  <div className="text-gray-300 space-y-3 text-sm leading-relaxed">
                    <p>
                      I didn&apos;t get the mascot job with the hockey team. The Mammoth had thicker fur and better skates.
                      So now I&apos;m the guide for SLCTrips.com instead.
                    </p>
                    <p>
                      I spent almost twenty years around Liberty Park helping kids make music, videos, and wild ideas come to life.
                      These mountains and canyons raised me as much as any classroom.
                    </p>
                    <p>
                      People call me the Wasatch Sasquatch, but you can call me Dan. I&apos;ll help you find the trails worth walking,
                      the coffee that wakes your soul, and the Utah moments you can&apos;t buy in a gift shop.
                    </p>
                    <p className="text-lg text-yellow-400 font-semibold italic pt-2">
                      Wander wisely, travel kindly, and stay curious.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="py-8 border-y border-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                <span className="text-gray-400">Highly rated by adventurers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400 font-bold">✓</span>
                <span className="text-gray-400">Thousands of trips planned</span>
              </div>
              <div className="text-blue-400 flex items-center gap-2">
                <span>✨ Funofficial SLC Airport Partner</span>
                <span className="text-gray-500 text-xs italic">
                  (Want to make it official? <a href="mailto:Dan@slctrips.com" className="text-blue-400 hover:text-blue-300 underline">Dan@slctrips.com</a>)
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-800/50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-12 text-center text-white">Why SLCTrips?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="text-5xl mb-4">🏔️</div>
                <h3 className="text-xl font-bold mb-2 text-blue-400">1000+ Destinations</h3>
                <p className="text-gray-400">
                  Curated adventures from 30 minutes to 12 hours from SLC Airport
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">🗺️</div>
                <h3 className="text-xl font-bold mb-2 text-blue-400">TripKits</h3>
                <p className="text-gray-400">
                  Complete adventure packages with routes, tips, and insider knowledge
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">🧭</div>
                <h3 className="text-xl font-bold mb-2 text-blue-400">County Guardians</h3>
                <p className="text-gray-400">
                  Local experts guiding you to hidden gems across Utah counties
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
