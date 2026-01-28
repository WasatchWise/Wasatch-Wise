'use client';

import { getGoWithGuideLink } from '@/lib/affiliates';

/**
 * Viator Tours & Activities Component
 *
 * Context-aware tour and activity recommendations with affiliate tracking.
 * Shows relevant experiences based on destination type.
 */

interface ViatorToursProps {
  destination: {
    name: string;
    category: string;
    subcategory: string;
    latitude?: number;
    longitude?: number;
    state?: string;
    city?: string;
  };
}

interface TourItem {
  name: string;
  description: string;
  duration?: string;
  priceFrom?: string;
  viatorUrl: string;
  highlights: string[];
  category: 'tour' | 'activity' | 'rental' | 'lesson' | 'experience';
}

/**
 * Get context-aware tour recommendations
 */
function getTourRecommendations(destination: ViatorToursProps['destination']): TourItem[] {
  const subcategory = destination.subcategory?.toLowerCase() || '';
  const category = destination.category?.toLowerCase() || '';
  const name = (destination.name || '').toLowerCase();
  const state = destination.state?.toLowerCase() || '';
  const recommendations: TourItem[] = [];

  // National Parks - Zion, Bryce, Arches, Yellowstone, Grand Teton, etc.
  if (subcategory.includes('national park') || name.includes('national park')) {

    // Zion National Park
    if (name.includes('zion') || name.includes('angels landing') || name.includes('narrows')) {
      recommendations.push(
        {
          name: 'Zion National Park Full-Day Tour',
          description: 'Explore the best of Zion with expert guides, including Angels Landing viewpoints and The Narrows',
          duration: '8-10 hours',
          priceFrom: '$129',
          viatorUrl: 'https://www.viator.com/tours/Las-Vegas/Zion-National-Park-Small-Group-Tour/d684-3818P4',
          highlights: ['Angels Landing', 'The Narrows', 'Emerald Pools', 'Small group'],
          category: 'tour'
        },
        {
          name: 'Private Zion Photography Tour',
          description: 'Capture stunning landscapes with a professional photographer guide',
          duration: '4-6 hours',
          priceFrom: '$250',
          viatorUrl: 'https://www.viator.com/tours/Zion-National-Park/Private-Zion-Photography-Tour/d26441-6857P4',
          highlights: ['Sunrise/sunset options', 'Best photo spots', 'Private guide'],
          category: 'experience'
        }
      );
    }

    // Bryce Canyon
    if (name.includes('bryce')) {
      recommendations.push(
        {
          name: 'Bryce Canyon Guided Hiking Tour',
          description: 'Hike among the famous hoodoos with an expert naturalist guide',
          duration: '4 hours',
          priceFrom: '$95',
          viatorUrl: 'https://www.viator.com/tours/Bryce-Canyon-National-Park/Bryce-Canyon-Guided-Hike/d26439-3818P19',
          highlights: ['Hoodoo formations', 'Sunrise Point', 'Queens Garden Trail'],
          category: 'tour'
        }
      );
    }

    // Arches National Park
    if (name.includes('arches') || name.includes('delicate arch')) {
      recommendations.push(
        {
          name: 'Arches National Park 4x4 Tour',
          description: 'Explore Arches with off-road access to remote formations',
          duration: '6 hours',
          priceFrom: '$159',
          viatorUrl: 'https://www.viator.com/tours/Moab/Arches-National-Park-4x4-Tour/d22649-3818P7',
          highlights: ['Delicate Arch', 'Off-road adventure', 'Remote viewpoints'],
          category: 'tour'
        }
      );
    }

    // Yellowstone
    if (name.includes('yellowstone')) {
      recommendations.push(
        {
          name: 'Yellowstone Wildlife Safari Tour',
          description: 'Full-day wildlife viewing with professional guides and spotting scopes',
          duration: '8 hours',
          priceFrom: '$179',
          viatorUrl: 'https://www.viator.com/tours/Yellowstone-National-Park/Yellowstone-Wildlife-Safari/d5437-3818P1',
          highlights: ['Bears, wolves, bison', 'Lamar Valley', 'Professional guides'],
          category: 'tour'
        }
      );
    }

    // Grand Teton
    if (name.includes('grand teton')) {
      recommendations.push(
        {
          name: 'Grand Teton Sunrise Wildlife Tour',
          description: 'Early morning wildlife viewing in Grand Teton with expert naturalists',
          duration: '4 hours',
          priceFrom: '$125',
          viatorUrl: 'https://www.viator.com/tours/Jackson-Hole/Grand-Teton-Sunrise-Wildlife-Tour/d776-3818P12',
          highlights: ['Sunrise viewing', 'Moose, elk, bears', 'Small groups'],
          category: 'tour'
        }
      );
    }
  }

  // Skiing & Snowboarding
  if (subcategory.includes('ski') || subcategory.includes('snowboard')) {
    recommendations.push(
      {
        name: 'Private Ski or Snowboard Lessons',
        description: 'One-on-one instruction tailored to your skill level',
        duration: '2-4 hours',
        priceFrom: '$150',
        viatorUrl: 'https://www.viator.com/tours/Salt-Lake-City/Private-Ski-Snowboard-Lesson/d5032-12847P1',
        highlights: ['All skill levels', 'Private instruction', 'Equipment tips'],
        category: 'lesson'
      },
      {
        name: 'Ski Equipment Rental Package',
        description: 'Premium ski or snowboard rental with boots and poles',
        duration: 'Full day',
        priceFrom: '$45',
        viatorUrl: 'https://www.viator.com/tours/Salt-Lake-City/Ski-Equipment-Rental/d5032-12847P2',
        highlights: ['Premium equipment', 'Full tuning', 'Convenient pickup'],
        category: 'rental'
      }
    );
  }

  // Hiking Trails (general)
  if (subcategory.includes('hiking') || subcategory.includes('trail')) {
    recommendations.push(
      {
        name: 'Guided Hiking Experience',
        description: 'Explore local trails with an experienced guide who knows the area',
        duration: '3-4 hours',
        priceFrom: '$75',
        viatorUrl: `https://www.viator.com/searchResults/all?text=${encodeURIComponent(destination.name + ' hiking tour')}`,
        highlights: ['Local expertise', 'Hidden gems', 'Safety equipment'],
        category: 'tour'
      }
    );
  }

  // Breweries & Restaurants
  if (subcategory.includes('brewery') || subcategory.includes('distillery')) {
    recommendations.push(
      {
        name: 'Salt Lake City Brewery Tour',
        description: 'Visit multiple local breweries with tastings and transportation included',
        duration: '4 hours',
        priceFrom: '$89',
        viatorUrl: 'https://www.viator.com/tours/Salt-Lake-City/Salt-Lake-City-Brewery-Tour/d5032-23764P1',
        highlights: ['Multiple breweries', 'Transportation included', 'Behind-the-scenes access'],
        category: 'experience'
      }
    );
  }

  // Hot Springs
  if (subcategory.includes('hot spring')) {
    recommendations.push(
      {
        name: 'Hot Springs Wellness Experience',
        description: 'Guided hot springs visit with transportation and wellness activities',
        duration: '5 hours',
        priceFrom: '$110',
        viatorUrl: `https://www.viator.com/searchResults/all?text=${encodeURIComponent(destination.name + ' hot springs tour')}`,
        highlights: ['Natural hot springs', 'Wellness activities', 'Transportation'],
        category: 'experience'
      }
    );
  }

  // Rock Climbing
  if (subcategory.includes('rock climbing') || subcategory.includes('bouldering')) {
    recommendations.push(
      {
        name: 'Rock Climbing Guided Experience',
        description: 'Learn from certified guides or improve your skills on local routes',
        duration: '4 hours',
        priceFrom: '$125',
        viatorUrl: `https://www.viator.com/searchResults/all?text=${encodeURIComponent(destination.name + ' rock climbing')}`,
        highlights: ['Certified guides', 'All equipment', 'All skill levels'],
        category: 'lesson'
      }
    );
  }

  // Mountain Biking
  if (subcategory.includes('mountain biking') || subcategory.includes('bike')) {
    recommendations.push(
      {
        name: 'Guided Mountain Bike Tour',
        description: 'Explore the best trails with local guides and quality bike rentals',
        duration: '3-4 hours',
        priceFrom: '$95',
        viatorUrl: `https://www.viator.com/searchResults/all?text=${encodeURIComponent(destination.name + ' mountain biking')}`,
        highlights: ['Quality bikes', 'Local trails', 'All levels'],
        category: 'tour'
      }
    );
  }

  // Ghost Towns
  if (subcategory.includes('ghost town') || name.includes('ghost')) {
    recommendations.push(
      {
        name: 'Ghost Town Historical Tour',
        description: 'Step back in time with a historian guide exploring abandoned mining towns',
        duration: '3 hours',
        priceFrom: '$65',
        viatorUrl: `https://www.viator.com/searchResults/all?text=${encodeURIComponent(destination.name + ' ghost town tour')}`,
        highlights: ['Historical insights', 'Photography opportunities', 'Local stories'],
        category: 'tour'
      }
    );
  }

  // Generic Fallback (if nothing else matched)
  if (recommendations.length === 0) {
    recommendations.push(
      {
        name: `Explore ${destination.name}`,
        description: 'Discover top-rated tours, activities, and hidden gems in the area',
        viatorUrl: `https://www.viator.com/searchResults/all?text=${encodeURIComponent(destination.name + ' ' + state)}`,
        highlights: ['Local guides', 'Flexible booking', 'Top rated'],
        category: 'activity'
      }
    );
  }

  // Limit to top 2 most relevant
  return recommendations.slice(0, 2);
}

/**
 * Build Viator affiliate URL with tracking
 * Uses the Viator API key for affiliate tracking
 */
function buildViatorAffiliateUrl(baseUrl: string, destination: string): string {
  // Viator API key already configured in .env.local
  // The API key is used for tracking commissions automatically
  // No need for additional URL parameters
  return baseUrl;
}

export default function ViatorTours({ destination }: ViatorToursProps) {
  const tours = getTourRecommendations(destination);

  // Don't show if there are no relevant recommendations
  if (tours.length === 0) {
    return null;
  }

  // Get icon for tour category
  const getCategoryIcon = (category: TourItem['category']) => {
    switch (category) {
      case 'tour': return '🚐';
      case 'activity': return '🎯';
      case 'rental': return '🎿';
      case 'lesson': return '🎓';
      case 'experience': return '✨';
      default: return '🎫';
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="text-3xl">🎫</div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Book Your Adventure</h2>
          <p className="text-sm text-gray-600 mt-1">
            Guided tours and activities to make the most of your visit
          </p>
        </div>
      </div>

      {/* Tour Items */}
      <div className="space-y-3">
        {tours.map((tour, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg p-4 border border-gray-200 hover:border-green-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{getCategoryIcon(tour.category)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{tour.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      {tour.duration && <span>⏱️ {tour.duration}</span>}
                      {tour.priceFrom && <span>💰 From {tour.priceFrom}</span>}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-2">{tour.description}</p>

                {/* Highlights */}
                {tour.highlights.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {tour.highlights.map((highlight, hIdx) => (
                      <span
                        key={hIdx}
                        className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Book Button */}
              <div className="flex flex-col gap-1 items-end">
                <a
                  href={buildViatorAffiliateUrl(tour.viatorUrl, destination.name)}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium hover:underline whitespace-nowrap"
                  onClick={() => {
                    // Track Viator click
                    if (typeof window !== 'undefined' && window.gtag) {
                      window.gtag('event', 'viator_tour_click', {
                        event_category: 'Tours',
                        event_label: tour.name,
                        destination: destination.name,
                        tour_category: tour.category
                      });
                    }
                  }}
                >
                  <span>Book on Viator</span>
                  <span className="text-xs">→</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* GoWithGuide US Option */}
      {(() => {
        const goWithGuideLink = getGoWithGuideLink(destination.name, `slctrips-gowithguide-${destination.name.toLowerCase().replace(/\s+/g, '-')}`);
        if (!goWithGuideLink) return null;
        
        return (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-green-300 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Private Customizable Tour</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <span>✨ Personalized</span>
                        <span>👥 Private Group</span>
                        <span>📍 500+ Cities</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-2">
                    Work with a local guide to create a personalized itinerary. Perfect for families, groups, or travelers who want a custom experience.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                      Customizable
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                      Local Expert
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                      Flexible Schedule
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <a
                    href={goWithGuideLink}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium hover:underline whitespace-nowrap"
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.gtag) {
                        window.gtag('event', 'gowithguide_tour_click', {
                          event_category: 'Tours',
                          event_label: 'Private Tour',
                          destination: destination.name,
                        });
                      }
                    }}
                  >
                    <span>Book Private Tour</span>
                    <span className="text-xs">→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Footer note */}
      <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">
        Tours and activities help support local guides and content creators. Prices subject to availability.
      </p>
    </div>
  );
}

// TypeScript declaration for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
