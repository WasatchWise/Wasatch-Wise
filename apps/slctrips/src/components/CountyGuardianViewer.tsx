'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TripKit, Destination, Guardian } from '@/types/database.types';
import { CurriculumFramework } from '@/types/curriculum.types';
import CurriculumFrameworkSelector from './CurriculumFrameworkSelector';
import FrameworkViewer from './FrameworkViewer';
import GuardianGallery from './GuardianGallery';
import SafeImage from '@/components/SafeImage';
import Image from 'next/image';

interface CountyGuardianViewerProps {
  tripkit: TripKit;
  destinations: Destination[];
  guardians: Guardian[];
  accessCode: string;
}

export default function CountyGuardianViewer({
  tripkit,
  destinations,
  guardians,
  accessCode
}: CountyGuardianViewerProps) {
  const [visitedCounties, setVisitedCounties] = useState<Set<string>>(new Set());
  const [expandedCounty, setExpandedCounty] = useState<string | null>(null);
  const [selectedFramework, setSelectedFramework] = useState<CurriculumFramework | null>(null);

  // Helper function to normalize county names (strip " County" suffix)
  const normalizeCountyName = (county: string): string => {
    return county.replace(/ County$/i, '').trim();
  };

  // Group destinations by county
  const countiesByName: Record<string, {
    guardian: Guardian;
    destinations: Destination[];
    fullCountyName: string;
  }> = {};

  // Map guardians by NORMALIZED county name
  // This ensures we only show Utah counties with guardians
  guardians.forEach(g => {
    if (g.county) {
      const normalizedName = normalizeCountyName(g.county);
      countiesByName[normalizedName] = {
        guardian: g,
        destinations: [],
        fullCountyName: g.county // Keep original for display
      };
    }
  });

  // Add destinations to their counties (only if guardian exists)
  destinations.forEach(dest => {
    if (dest.county) {
      const normalizedName = normalizeCountyName(dest.county);

      // Only add destinations to counties that have guardians (Utah counties)
      if (countiesByName[normalizedName]) {
        countiesByName[normalizedName].destinations.push(dest);
      }
    }
  });

  const counties = Object.keys(countiesByName).sort();
  const completedCount = visitedCounties.size;
  const totalCount = counties.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const toggleCounty = (countyName: string) => {
    setVisitedCounties(prev => {
      const newSet = new Set(prev);
      if (newSet.has(countyName)) {
        newSet.delete(countyName);
      } else {
        newSet.add(countyName);
      }
      return newSet;
    });
  };

  // If a framework is selected, show the FrameworkViewer
  if (selectedFramework) {
    return (
      <FrameworkViewer
        tripkit={tripkit}
        destinations={destinations}
        guardians={guardians}
        framework={selectedFramework}
        accessCode={accessCode}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 rounded-2xl shadow-2xl overflow-hidden text-white p-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <span className="font-mono text-sm">{accessCode}</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-white">
            {tripkit.name}
          </h1>

          <p className="text-xl md:text-2xl text-blue-100 mb-6">
            {tripkit.tagline}
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-4xl font-bold text-yellow-300">{totalCount}</div>
                <div className="text-sm text-blue-200">Utah Counties</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-300">{completedCount}</div>
                <div className="text-sm text-blue-200">Explored</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-300">{progress}%</div>
                <div className="text-sm text-blue-200">Complete</div>
              </div>
            </div>
          </div>

          <div className="h-4 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* How to Use This TripKit - Multi-Audience Guide */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
          How to Use This TripKit
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* For Teachers */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200 hover:border-blue-400 transition-all">
            <div className="text-5xl mb-4 text-center">👩‍🏫</div>
            <h3 className="text-xl font-bold mb-3 text-center text-gray-900">For Teachers</h3>
            <ul className="space-y-2 text-sm text-gray-700 mb-4">
              <li className="flex items-start gap-2">
                <span className="text-green-500 flex-shrink-0">✓</span>
                <span>Browse curriculum frameworks below for lesson plans</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 flex-shrink-0">✓</span>
                <span>Share your access link with students (no separate emails needed)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 flex-shrink-0">✓</span>
                <span>Use guardians to teach geography, history, and civics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 flex-shrink-0">✓</span>
                <span>Track progress by marking counties as explored</span>
              </li>
            </ul>
            <div className="p-3 bg-blue-50 rounded-lg text-xs text-gray-600">
              <strong className="text-blue-900">Your access link:</strong>
              <div className="mt-1 p-2 bg-white rounded text-xs break-all font-mono border border-blue-200">
                {typeof window !== 'undefined' ? window.location.href : 'Loading...'}
              </div>
              <p className="mt-2 text-xs text-gray-500">Bookmark and share freely with your class!</p>
            </div>
          </div>

          {/* For Parents */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200 hover:border-purple-400 transition-all">
            <div className="text-5xl mb-4 text-center">👨‍👩‍👧‍👦</div>
            <h3 className="text-xl font-bold mb-3 text-center text-gray-900">For Families</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 flex-shrink-0">✓</span>
                <span>Pick a county to explore on your next family trip</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 flex-shrink-0">✓</span>
                <span>Read guardian stories together to learn county history</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 flex-shrink-0">✓</span>
                <span>Use destinations as field trip ideas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 flex-shrink-0">✓</span>
                <span>Support homeschool Utah Studies curriculum</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 flex-shrink-0">✓</span>
                <span>Challenge your kids to visit all 29 counties</span>
              </li>
            </ul>
          </div>

          {/* For Explorers */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200 hover:border-green-400 transition-all">
            <div className="text-5xl mb-4 text-center">🗺️</div>
            <h3 className="text-xl font-bold mb-3 text-center text-gray-900">For Explorers</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 flex-shrink-0">✓</span>
                <span>Discover the unique character of each Utah county</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 flex-shrink-0">✓</span>
                <span>Find hidden gems and off-the-beaten-path destinations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 flex-shrink-0">✓</span>
                <span>Learn the mythology and stories behind the guardians</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 flex-shrink-0">✓</span>
                <span>Challenge yourself to visit all 29 counties</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 flex-shrink-0">✓</span>
                <span>Share your favorite counties with friends</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Guardian Gallery - Showcase all transparent images */}
      <GuardianGallery guardians={guardians} />

      {/* Curriculum Framework Selector */}
      <CurriculumFrameworkSelector
        selectedFramework={selectedFramework}
        onSelectFramework={setSelectedFramework}
      />

      {/* County Sections */}
      <div className="space-y-6">
        {counties.map((countyName, idx) => {
          const county = countiesByName[countyName];
          const guardian = county.guardian;
          const isVisited = visitedCounties.has(countyName);
          const isExpanded = expandedCounty === countyName;

          return (
            <div
              key={countyName}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all border-2 ${isVisited ? 'border-green-400' : 'border-gray-200'
                }`}
            >
              {/* County Header with Guardian */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6">
                <div className="flex items-start gap-6">
                  {/* Guardian Avatar - ENHANCED with transparent image */}
                  {guardian && guardian.image_url && (
                    <div className="flex-shrink-0 group relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                      <div className="relative bg-white rounded-2xl p-4 shadow-2xl transform group-hover:scale-105 transition-transform duration-300">
                        <div className="relative w-32 h-32">
                          <Image
                            src={guardian.image_url}
                            alt={guardian.display_name}
                            fill
                            className="object-contain drop-shadow-2xl"
                            sizes="128px"
                          />
                        </div>
                      </div>
                      {guardian.element && (
                        <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-indigo-700 to-purple-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          ✨ {guardian.element}
                        </div>
                      )}
                    </div>
                  )}

                  {/* County Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                        {countyName} County
                      </h2>
                      <button
                        onClick={() => toggleCounty(countyName)}
                        className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg ${isVisited
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                      >
                        {isVisited ? '✓ Explored' : 'Mark Explored'}
                      </button>
                    </div>

                    {guardian && (
                      <>
                        <div className="mb-5">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs uppercase tracking-wider font-bold text-gray-500">
                              County Guardian
                            </span>
                          </div>
                          <span className="text-3xl md:text-4xl font-extrabold text-indigo-700 tracking-tight">
                            {guardian.display_name}
                          </span>
                        </div>

                        {guardian.bio && (
                          <div className="bg-blue-50 border-l-4 border-blue-600 p-5 rounded-r-lg mb-5 shadow-sm">
                            <p className="text-gray-900 leading-relaxed text-xl font-medium">
                              {guardian.bio}
                            </p>
                          </div>
                        )}

                        {guardian.motto && (
                          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-500 p-5 rounded-r-lg mb-5 shadow-sm">
                            <p className="text-gray-800 italic text-xl font-bold">
                              💬 Guardian's Motto: "{guardian.motto}"
                            </p>
                          </div>
                        )}

                        <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-5 shadow-sm mb-5">
                          <h3 className="font-extrabold text-green-900 mb-3 text-lg tracking-wide uppercase">
                            🎓 Learning Focus
                          </h3>
                          <p className="text-gray-800 text-base leading-relaxed">
                            Discover how {guardian.display_name} protects {countyName} County
                            and teaches us about its unique history, geography, and challenges.
                            Each destination below tells part of the county's story!
                          </p>
                        </div>
                      </>
                    )}

                    <div className="mt-5 flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <span className="text-base font-bold text-gray-900">
                        📍 {county.destinations.length} destination{county.destinations.length !== 1 ? 's' : ''} to explore
                      </span>
                      <button
                        onClick={() => setExpandedCounty(isExpanded ? null : countyName)}
                        className="text-blue-700 hover:text-blue-900 font-bold text-base hover:underline"
                      >
                        {isExpanded ? '▲ Hide Destinations' : '▼ Show Destinations'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Destinations List */}
              {isExpanded && (
                <div className="p-6 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {county.destinations.map(dest => (
                      <Link
                        key={dest.id}
                        href={`/destinations/${dest.slug}?from=tk-000`}
                        className="group block bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-4 border border-gray-200 hover:border-blue-400"
                      >
                        {dest.image_url && (
                          <div className="aspect-video w-full overflow-hidden bg-gray-100 rounded-lg mb-3">
                            <SafeImage
                              src={dest.image_url}
                              alt={dest.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}

                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                          {dest.name}
                        </h3>

                        {dest.ai_summary && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {dest.ai_summary}
                          </p>
                        )}

                        {dest.subcategory && (
                          <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {dest.subcategory}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer - Multi-section */}
      <div className="mt-12 space-y-6">
        {/* Educational CTA */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 text-center border-2 border-blue-200">
          <h3 className="text-2xl font-bold mb-4 text-gray-900">🎓 Perfect for Utah Studies</h3>
          <p className="text-gray-700 max-w-2xl mx-auto mb-4">
            All 29 Utah counties with their guardian characters, aligned to 4th Grade Core Standards.
            Choose a curriculum framework above to see lesson plans and activities.
          </p>
          <Link
            href="/guardians"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Meet All Guardians →
          </Link>
        </div>

        {/* Cross-Sell to Paid TripKits */}
        <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-2xl p-8 border-2 border-orange-300">
          <div className="text-center mb-6">
            <h3 className="text-3xl font-bold mb-3 text-gray-900">
              ❤️ Enjoying This TripKit?
            </h3>
            <p className="text-lg text-gray-700 mb-2">
              TK-000 is a <strong className="text-orange-600">$50 value</strong>, yours <strong>FREE FOREVER</strong>.
            </p>
            <p className="text-gray-600">
              See what else we've built. Each TripKit offers the same depth and quality.
            </p>
          </div>

          <div className="flex justify-center gap-4 mb-6">
            <Link
              href="/tripkits"
              className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-orange-500 hover:to-red-500 transition-all hover:scale-105 shadow-lg"
            >
              🗺️ Explore More TripKits
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-lg p-4 text-center shadow-md border border-orange-200">
              <div className="font-bold text-gray-900 mb-1">90-Day Welcome Wagon</div>
              <div className="text-gray-600">New to Utah? Complete relocation guide</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-md border border-orange-200">
              <div className="font-bold text-gray-900 mb-1">National Parks Loop</div>
              <div className="text-gray-600">The Mighty Five + hidden treasures</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-md border border-orange-200">
              <div className="font-bold text-gray-900 mb-1">Ghost Towns Trail</div>
              <div className="text-gray-600">Utah's forgotten communities</div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href={`/tripkits/${tripkit.slug}`}
            className="text-gray-600 hover:text-gray-800 font-semibold"
          >
            ← Back to TripKit Info
          </Link>
        </div>
      </div>
    </div>
  );
}
