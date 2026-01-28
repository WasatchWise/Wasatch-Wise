'use client';

import { getSitpackLink, getFlextailLink, getVsgoLink, trackAffiliateClick } from '@/lib/affiliates';

/**
 * What Dan Packs - Authentic local recommendations
 *
 * Context-aware gear and tour suggestions that feel like advice from a friend,
 * not pushy affiliate links. Shows only what's genuinely useful for each destination type.
 */

interface WhatDanPacksProps {
  destination: {
    name: string;
    category: string;
    subcategory: string;
    latitude?: number;
    longitude?: number;
    is_family_friendly?: boolean | null;
    activities?: string | null;
  };
}

interface GearItem {
  name: string;
  reason: string;
  amazonId?: string;
  awinUrl?: string;  // AWIN deep link
  retailer?: string; // e.g., 'REI', 'Backcountry', 'Amazon'
  priority: 'essential' | 'recommended' | 'nice-to-have';
}

/**
 * Build AWIN affiliate URL
 * @param merchantId - AWIN merchant ID (e.g., 6791 for REI, 15749 for Backcountry)
 * @param productUrl - The destination product URL
 */
function buildAwinUrl(merchantId: number, productUrl: string): string | undefined {
  const affiliateId = process.env.NEXT_PUBLIC_AWIN_AFFILIATE_ID;

  if (!affiliateId) {
    // No affiliate ID configured - return direct product URL as fallback
    return productUrl;
  }

  // CRITICAL: Must encode the product URL for AWIN deep linking to work
  return `https://www.awin1.com/cread.php?awinmid=${merchantId}&awinaffid=${affiliateId}&clickref=&p=${encodeURIComponent(productUrl)}`;
}

// AWIN Merchant IDs
// NOTE: REI and Backcountry are NOT available through AWIN
// - REI uses: AvantLink (primary), Impact, FlexOffers
// - Backcountry uses: Impact (primary), AvantLink
// Only include merchants where we have an ACTIVE AWIN relationship
const AWIN_MERCHANTS = {
  // REI: 6791, // REMOVED - Not available through AWIN, using direct links
  // BACKCOUNTRY: 15749, // REMOVED - Not available through AWIN
} as const;

/**
 * Get context-aware gear recommendations based on destination characteristics
 */
function getGearRecommendations(destination: WhatDanPacksProps['destination']): GearItem[] {
  const subcategory = destination.subcategory?.toLowerCase() || '';
  const category = destination.category?.toLowerCase() || '';
  // CRITICAL: activities can be string or array - handle both cases
  const activities = Array.isArray(destination.activities) 
    ? destination.activities.join(', ').toLowerCase()
    : (destination.activities || '').toString().toLowerCase();
  const name = (destination.name || '').toLowerCase();
  const recommendations: GearItem[] = [];

  // Hiking & Outdoor destinations
  if (subcategory.includes('hiking') || subcategory.includes('trail') || activities.includes('hik')) {
    recommendations.push(
      {
        name: 'Black Diamond Trekking Poles',
        reason: 'Dan swears by these for steep descents. Your knees will thank you.',
        awinUrl: 'https://www.rei.com/product/172470', // Direct link - REI not on AWIN
        retailer: 'REI',
        priority: 'essential'
      },
      {
        name: 'Katadyn Water Filtration System',
        reason: 'Most hikers underestimate how much water they need. This is lighter than carrying it all.',
        amazonId: 'B006QF3TW4',
        retailer: 'Amazon',
        priority: 'recommended'
      },
      {
        name: 'Darn Tough Merino Hiking Socks',
        reason: 'Cotton kills. Merino regulates temperature and prevents blisters on long hikes.',
        awinUrl: 'https://www.rei.com/product/119828', // Direct link - REI not on AWIN
        retailer: 'REI',
        priority: 'essential'
      },
      {
        name: 'Outdoor Research Gaiters',
        reason: 'Keeps trail debris, snow, and rocks out of your boots. Essential for Utah trails.',
        awinUrl: 'https://www.backcountry.com/outdoor-research-crocodile-gaiters', // Direct link - Backcountry not on AWIN
        retailer: 'Backcountry',
        priority: 'recommended'
      }
    );
  }

  // Desert & Hot destinations
  if (subcategory.includes('desert') || activities.includes('desert')) {
    recommendations.push(
      {
        name: 'Sun Hat with Neck Flap',
        reason: 'The desert sun is no joke. Dan learned this the hard way.',
        amazonId: 'B07DDJQYG2',
        priority: 'essential'
      },
      {
        name: 'Electrolyte Tablets',
        reason: 'Water alone isn\'t enough in the heat. These are what the park rangers use.',
        amazonId: 'B001F0R0VY',
        priority: 'essential'
      }
    );
  }

  // Skiing & Snow Sports
  if (subcategory.includes('ski') || subcategory.includes('snowboard')) {
    recommendations.push(
      {
        name: 'Smith Ski Goggles',
        reason: 'Utah powder means flat light. Good goggles are the difference between seeing terrain and guessing.',
        awinUrl: 'https://www.rei.com/brand/smith', // Direct link - REI not on AWIN
        retailer: 'REI',
        priority: 'essential'
      },
      {
        name: 'Hand Warmers',
        reason: 'For lift rides. Cheap insurance against frozen fingers.',
        awinUrl: 'https://www.backcountry.com/hot-hands-hand-warmers', // Direct link - Backcountry not on AWIN
        retailer: 'Backcountry',
        priority: 'recommended'
      },
      {
        name: 'Helmet with MIPS',
        reason: 'Trees are unforgiving. MIPS technology reduces rotational impact.',
        awinUrl: 'https://www.backcountry.com/oakley-mod5-mips-helmet', // Direct link - Backcountry not on AWIN
        retailer: 'Backcountry',
        priority: 'essential'
      }
    );
  }

  // Winter hiking (different from skiing)
  if ((subcategory.includes('winter') || activities.includes('snow')) && !subcategory.includes('ski')) {
    recommendations.push(
      {
        name: 'Microspikes',
        reason: 'The trails get icy. You can hike confidently instead of slip-sliding around.',
        amazonId: 'B006JYBO4I',
        priority: 'essential'
      },
      {
        name: 'Insulated Water Bottle',
        reason: 'Your water WILL freeze. This keeps it liquid and drinkable.',
        amazonId: 'B01ACJTY0A',
        priority: 'essential'
      },
      {
        name: 'Balaclava',
        reason: 'Protects your face from windburn. Way better than scarves that slip around.',
        amazonId: 'B07XCQH6ST',
        priority: 'recommended'
      }
    );
  }

  // Water activities
  if (subcategory.includes('swimming') || subcategory.includes('hot springs') || activities.includes('water')) {
    recommendations.push(
      {
        name: 'Dry Bag',
        reason: 'Keep your keys and phone safe. Nothing ruins a day faster than a waterlogged phone.',
        amazonId: 'B07PQLC3XK',
        priority: 'recommended'
      }
    );
  }

  // Photography spots
  if (subcategory.includes('scenic') || activities.includes('photography') || name.includes('overlook') || name.includes('viewpoint')) {
    recommendations.push(
      {
        name: 'VSGO Black Snipe',
        reason: 'Award-winning camera support for epic shots. 2023 Red Dot Award winner - Dan uses this for all his scenic photography.',
        awinUrl: getVsgoLink('https://www.vsgo.com/products/black-snipe', `slctrips-vsgo-${destination.name.toLowerCase().replace(/\s+/g, '-')}`) || undefined,
        retailer: 'VSGO',
        priority: 'recommended'
      },
      {
        name: 'VSGO Pocket Ranger',
        reason: 'Ultra-light modular camera support. Perfect for travel photography when you need stability without the weight.',
        awinUrl: getVsgoLink('https://www.vsgo.com/products/pocket-ranger', `slctrips-vsgo-${destination.name.toLowerCase().replace(/\s+/g, '-')}`) || undefined,
        retailer: 'VSGO',
        priority: 'nice-to-have'
      },
      {
        name: 'Compact Tripod',
        reason: 'For sunrise/sunset shots. The lighting here is incredible but you need stability.',
        amazonId: 'B075V5K8YJ',
        priority: 'nice-to-have'
      }
    );
  }

  // Breweries specifically
  if (subcategory.includes('brewery') || subcategory.includes('distillery') || subcategory.includes('winery')) {
    recommendations.push(
      {
        name: 'Portable Breathalyzer',
        reason: 'Know your limits. Dan keeps one in the car - it\'s saved him multiple times.',
        amazonId: 'B07TDCJNCJ',
        priority: 'essential'
      },
      {
        name: 'Insulated Growler',
        reason: 'Take home a fresh pour. Keeps it cold and carbonated for days.',
        amazonId: 'B01DZQT0X2',
        priority: 'nice-to-have'
      }
    );
  }

  // Restaurants & Dining
  if (subcategory.includes('restaurant') || subcategory.includes('food') || subcategory.includes('coffee')) {
    recommendations.push(
      {
        name: 'Cash ($20-40)',
        reason: 'Some local spots are cash-only or give cash discounts. ATMs aren\'t always nearby.',
        priority: 'recommended'
      },
      {
        name: 'Reusable To-Go Container',
        reason: 'Portions are huge. Dan always brings his own - saves money and reduces waste.',
        amazonId: 'B089QYJLX5',
        priority: 'nice-to-have'
      }
    );
  }

  // Rock Climbing & Bouldering
  if (subcategory.includes('rock climbing') || subcategory.includes('bouldering') || activities.includes('climb')) {
    recommendations.push(
      {
        name: 'Climbing Chalk Bag',
        reason: 'Your hands will sweat. Fresh chalk makes all the difference on technical routes.',
        amazonId: 'B01M7QELCZ',
        priority: 'essential'
      },
      {
        name: 'Belay Gloves',
        reason: 'Rope burn sucks. These are thin enough to feel the rope but protect your hands.',
        amazonId: 'B07MDHQZ1S',
        priority: 'recommended'
      },
      {
        name: 'Crash Pad',
        reason: 'For bouldering. Way better than hitting rocks when you fall.',
        amazonId: 'B01MYMQ9ZB',
        priority: 'essential'
      }
    );
  }

  // Camping
  if (subcategory.includes('camping') || activities.includes('camp')) {
    recommendations.push(
      {
        name: 'Sitpack Campster 2',
        reason: 'Portable camping chair that packs tiny. 100K+ sold - Dan\'s favorite for campfire sessions.',
        awinUrl: getSitpackLink('https://www.sitpack.com/products/campster-2', `slctrips-sitpack-${destination.name.toLowerCase().replace(/\s+/g, '-')}`) || undefined,
        retailer: 'Sitpack',
        priority: 'essential'
      },
      {
        name: 'Headlamp (rechargeable)',
        reason: 'Hands-free light. USB rechargeable means no batteries to replace.',
        amazonId: 'B08R6XYQYD',
        priority: 'essential'
      },
      {
        name: 'Bear Canister',
        reason: 'Required in many areas. Also keeps rodents out of your food.',
        amazonId: 'B00ECLGRPE',
        priority: 'essential'
      },
      {
        name: 'Camping Pillow',
        reason: 'Sleeping on a wadded jacket sucks. This packs tiny and makes sleep actually happen.',
        amazonId: 'B01N0ABS6J',
        priority: 'recommended'
      }
    );
  }

  // Mountain Biking
  if (subcategory.includes('mountain biking') || subcategory.includes('bike') || activities.includes('biking')) {
    recommendations.push(
      {
        name: 'Multi-Tool with Chain Breaker',
        reason: 'Chains break. Being miles from the trailhead without this is a nightmare.',
        amazonId: 'B000FIBD0I',
        priority: 'essential'
      },
      {
        name: 'Tubeless Repair Kit',
        reason: 'Flats happen. This gets you rolling again in 2 minutes.',
        amazonId: 'B075K17N5D',
        priority: 'essential'
      },
      {
        name: 'Hydration Pack (2L)',
        reason: 'Hands-free water while riding. Game changer for long rides.',
        amazonId: 'B08F4YN4C2',
        priority: 'recommended'
      }
    );
  }

  // National Parks & Scenic Areas
  if (subcategory.includes('national park') || subcategory.includes('state park') || subcategory.includes('monument')) {
    recommendations.push(
      {
        name: 'America the Beautiful Annual Pass',
        reason: 'Covers ALL national parks for a year. Pays for itself in 3 visits.',
        amazonId: 'B07ZTBJVPW',
        priority: 'essential'
      },
      {
        name: 'VSGO Black Snipe',
        reason: 'Award-winning camera support for capturing those epic views. 2023 Red Dot Award winner.',
        awinUrl: getVsgoLink('https://www.vsgo.com/products/black-snipe', `slctrips-vsgo-${destination.name.toLowerCase().replace(/\s+/g, '-')}`) || undefined,
        retailer: 'VSGO',
        priority: 'recommended'
      },
      {
        name: 'Binoculars (compact)',
        reason: 'Wildlife spotting, canyon views. Dan\'s seen condors, bears, and elk here.',
        amazonId: 'B01LXNBPVD',
        priority: 'recommended'
      }
    );
  }

  // Golf
  if (subcategory.includes('golf')) {
    recommendations.push(
      {
        name: 'Rangefinder',
        reason: 'Elevation changes in Utah mess with your distance control. Trust the laser, not your eyes.',
        amazonId: 'B07F33HVLW',
        priority: 'essential'
      },
      {
        name: 'Sun Sleeves',
        reason: '4 hours in the high-altitude sun will fry you. These keep you cool and unburnt.',
        amazonId: 'B073T2L3Y3',
        priority: 'recommended'
      }
    );
  }

  // Waterfalls (treat as hiking + water)
  if (subcategory.includes('waterfall')) {
    recommendations.push(
      {
        name: 'Chaco Sandals',
        reason: 'For wading and river crossings. Dan has worn the same pair for 5 years.',
        awinUrl: 'https://www.rei.com/brand/chaco', // Direct link - REI not on AWIN
        retailer: 'REI',
        priority: 'recommended'
      },
      {
        name: 'Microfiber Towel',
        reason: 'Packs tiny, dries fast. Perfect for drying off after a dip at the falls.',
        amazonId: 'B01K1C0C1I',
        priority: 'recommended'
      }
    );
  }

  // Family-friendly outdoor destinations (NOT restaurants/breweries)
  const isOutdoorDestination = subcategory.includes('hiking') || subcategory.includes('park') || subcategory.includes('camping') || subcategory.includes('waterfall');
  if (destination.is_family_friendly && isOutdoorDestination) {
    recommendations.push(
      {
        name: 'Kids\' Adventure Kit',
        reason: 'Magnifying glass, compass, whistle - keeps them engaged while you hike.',
        amazonId: 'B07T7ZJLWX',
        priority: 'nice-to-have'
      }
    );
  }

  // Generic Fallback (if nothing else matched)
  if (recommendations.length === 0) {
    recommendations.push(
      {
        name: 'Insulated Water Bottle',
        reason: 'Keeps water cold for hours. Hydration is critical in desert heat.',
        awinUrl: 'https://www.rei.com/brand/hydro-flask', // Direct link - REI not on AWIN
        retailer: 'REI',
        priority: 'essential'
      },
      {
        name: 'Polarized Sunglasses',
        reason: 'UV reflection off rock and water is intense. Protect your eyes.',
        awinUrl: 'https://www.backcountry.com/sunglasses', // Direct link - Backcountry not on AWIN
        retailer: 'Backcountry',
        priority: 'essential'
      }
    );
  }

  return recommendations.slice(0, 3); // Limit to top 3 most relevant
}

/**
 * Get context-aware introductory text
 */
function getIntroText(destination: WhatDanPacksProps['destination']): string {
  const subcategory = destination.subcategory?.toLowerCase() || '';

  if (subcategory.includes('hiking') || subcategory.includes('trail')) {
    return `Dan's logged hundreds of miles here. These are the essentials that actually matter:`;
  }

  if (subcategory.includes('brewery') || subcategory.includes('restaurant')) {
    return `Going local style? Here's what Dan always has:`;
  }

  if (subcategory.includes('desert')) {
    return `The desert doesn't mess around. Dan packs these every time:`;
  }

  if (subcategory.includes('ski') || subcategory.includes('winter')) {
    return `Winter changes everything. These make the difference between suffering and enjoying:`;
  }

  if (subcategory.includes('hot springs')) {
    return `Hot springs regulars know to bring:`;
  }

  return `Based on what you'll be doing, Dan recommends:`;
}

export default function WhatDanPacks({ destination }: WhatDanPacksProps) {
  const gear = getGearRecommendations(destination);

  // Don't show if there are no relevant recommendations
  if (gear.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="text-3xl">🎒</div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">What Dan Packs</h2>
          <p className="text-sm text-gray-600 mt-1">{getIntroText(destination)}</p>
        </div>
      </div>

      {/* Gear Items */}
      <div className="space-y-3">
        {gear.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  {item.priority === 'essential' && (
                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
                      Essential
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{item.reason}</p>
              </div>

              {(item.amazonId || item.awinUrl) && (
                <div className="flex flex-col gap-1 items-end">
                  <a
                    href={item.awinUrl || `https://www.amazon.com/dp/${item.amazonId}?tag=wasatchwise-20`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline whitespace-nowrap"
                    onClick={() => {
                      // Track affiliate click
                      const platform = item.awinUrl ? (item.retailer?.toLowerCase() || 'awin') : 'amazon';
                      trackAffiliateClick(
                        platform === 'sitpack' ? 'sitpack' :
                        platform === 'vsgo' ? 'vsgo' :
                        platform === 'flextail' ? 'flextail' :
                        platform === 'amazon' ? 'amazon' : 'awin',
                        destination.name,
                        destination.name
                      );
                      if (typeof window !== 'undefined' && window.gtag) {
                        window.gtag('event', 'affiliate_click', {
                          event_category: 'Gear',
                          event_label: item.name,
                          destination: destination.name,
                          retailer: item.retailer || 'Amazon'
                        });
                      }
                    }}
                  >
                    <span>View at {item.retailer || 'Amazon'}</span>
                    <span className="text-xs">→</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">
        Links help support local content. Dan uses this stuff himself.
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
