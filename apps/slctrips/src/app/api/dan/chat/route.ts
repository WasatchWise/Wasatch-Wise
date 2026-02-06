import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType, FunctionDeclarationsTool } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Real-time data function declarations for Dan
const danTools: FunctionDeclarationsTool = {
  functionDeclarations: [
    {
      name: 'get_current_weather',
      description: 'Get current weather conditions for a Utah location',
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          location: {
            type: SchemaType.STRING,
            description: 'City name (e.g., "Salt Lake City", "Park City", "Moab")',
          },
        },
        required: ['location'],
      },
    },
    {
      name: 'get_ski_conditions',
      description: 'Get current ski resort conditions including snow depth, lifts open, and trail status',
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          resort: {
            type: SchemaType.STRING,
            description: 'Resort name (e.g., "Snowbird", "Park City", "Alta", "Brighton")',
          },
        },
        required: ['resort'],
      },
    },
    {
      name: 'get_canyon_road_status',
      description: 'Get current road conditions and traffic for Utah canyons',
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          canyon: {
            type: SchemaType.STRING,
            description: 'Canyon name (e.g., "Little Cottonwood", "Big Cottonwood", "Parley\'s")',
          },
        },
        required: ['canyon'],
      },
    },
    {
      name: 'search_tripkit_destinations',
      description: 'Search for destinations within the user\'s TripKit based on criteria',
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          query: {
            type: SchemaType.STRING,
            description: 'Search query (e.g., "hiking", "restaurants", "free activities")',
          },
          maxDriveTime: {
            type: SchemaType.NUMBER,
            description: 'Maximum drive time from SLC in minutes',
          },
          category: {
            type: SchemaType.STRING,
            description: 'Category filter (e.g., "Outdoor Recreation", "Food & Drink", "Arts & Culture")',
          },
        },
        required: ['query'],
      },
    },
    {
      name: 'get_todays_events',
      description: 'Get events happening today in Utah',
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          area: {
            type: SchemaType.STRING,
            description: 'Area to search (e.g., "Salt Lake City", "Park City", "Provo")',
          },
          category: {
            type: SchemaType.STRING,
            description: 'Event category (e.g., "music", "sports", "food", "outdoor")',
          },
        },
        required: [],
      },
    },
    {
      name: 'get_weather_conditions',
      description: 'Get current weather conditions at a location (Google Weather API). Use before recommending outdoor or mountain destinations. Returns conditions, temp, precipitation, and pack-chains style hints for mountain routes.',
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          lat: {
            type: SchemaType.NUMBER,
            description: 'Latitude (e.g., 40.76 for Salt Lake City)',
          },
          lng: {
            type: SchemaType.NUMBER,
            description: 'Longitude (e.g., -111.89 for Salt Lake City)',
          },
        },
        required: ['lat', 'lng'],
      },
    },
    {
      name: 'get_air_quality',
      description: 'Get current air quality at a location (Google Air Quality API). Use before recommending outdoor activities.',
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          lat: {
            type: SchemaType.NUMBER,
            description: 'Latitude',
          },
          lng: {
            type: SchemaType.NUMBER,
            description: 'Longitude',
          },
        },
        required: ['lat', 'lng'],
      },
    },
    {
      name: 'get_place_details',
      description: 'Get place details (hours, phone, open now) from Google Places API (New). Call before saying "Call them" or giving a phone number—verify they are open and get current phone/hours.',
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          placeId: {
            type: SchemaType.STRING,
            description: 'Google Place ID (e.g., ChIJ...)',
          },
        },
        required: ['placeId'],
      },
    },
    {
      name: 'get_drive_time',
      description: 'Get drive time and distance between origin and destination with current traffic (Google Directions API). Use for "how long to get there" questions.',
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          origin: {
            type: SchemaType.STRING,
            description: 'Origin address or place (e.g., "Salt Lake City, UT", "SLC")',
          },
          destination: {
            type: SchemaType.STRING,
            description: 'Destination address or place (e.g., "Mirror Lake, UT", "Park City")',
          },
        },
        required: ['origin', 'destination'],
      },
    },
  ],
};

// Tool implementations
async function getCurrentWeather(location: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  if (!apiKey) {
    return JSON.stringify({ error: 'Weather service unavailable' });
  }

  try {
    // Map common Utah locations to coordinates for accuracy
    const locationMap: Record<string, { lat: number; lon: number }> = {
      'salt lake city': { lat: 40.7608, lon: -111.8910 },
      'slc': { lat: 40.7608, lon: -111.8910 },
      'park city': { lat: 40.6461, lon: -111.4980 },
      'alta': { lat: 40.5884, lon: -111.6378 },
      'snowbird': { lat: 40.5830, lon: -111.6538 },
      'brighton': { lat: 40.5980, lon: -111.5832 },
      'solitude': { lat: 40.6199, lon: -111.5919 },
      'moab': { lat: 38.5733, lon: -109.5498 },
      'st george': { lat: 37.0965, lon: -113.5684 },
      'provo': { lat: 40.2338, lon: -111.6585 },
      'ogden': { lat: 41.2230, lon: -111.9738 },
    };

    const loc = locationMap[location.toLowerCase()] || { lat: 40.7608, lon: -111.8910 };

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${loc.lat}&lon=${loc.lon}&appid=${apiKey}&units=imperial`
    );
    const data = await response.json();

    return JSON.stringify({
      location: location,
      temperature: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      conditions: data.weather[0].description,
      humidity: data.main.humidity,
      wind_speed: Math.round(data.wind.speed),
      visibility: data.visibility ? Math.round(data.visibility / 1609) : null, // Convert to miles
    });
  } catch (error) {
    console.error('Weather API error:', error);
    return JSON.stringify({ error: 'Could not fetch weather data' });
  }
}

async function getSkiConditions(resort: string): Promise<string> {
  // For now, return curated data. In production, scrape or use APIs.
  // This could be enhanced with real-time data from skiutah.com or resort APIs
  const conditions: Record<string, object> = {
    snowbird: {
      resort: 'Snowbird',
      base_depth: '89 inches',
      new_snow_24h: '4 inches',
      lifts_open: '11 of 13',
      trails_open: '168 of 169',
      conditions: 'Powder',
      last_updated: new Date().toISOString(),
      tip: 'Mineral Basin has the best powder stashes today. Take Peruvian Express to avoid tram lines.',
    },
    alta: {
      resort: 'Alta',
      base_depth: '94 inches',
      new_snow_24h: '5 inches',
      lifts_open: '10 of 11',
      trails_open: '119 of 119',
      conditions: 'Powder',
      last_updated: new Date().toISOString(),
      tip: 'Catherine\'s Area is skiing great. High Rustler opened at noon.',
    },
    brighton: {
      resort: 'Brighton',
      base_depth: '82 inches',
      new_snow_24h: '3 inches',
      lifts_open: '7 of 7',
      trails_open: '66 of 66',
      conditions: 'Packed Powder',
      last_updated: new Date().toISOString(),
      tip: 'Night skiing starts at 4pm. Milly Express has the shortest lines.',
    },
    solitude: {
      resort: 'Solitude',
      base_depth: '85 inches',
      new_snow_24h: '3 inches',
      lifts_open: '8 of 8',
      trails_open: '82 of 82',
      conditions: 'Packed Powder',
      last_updated: new Date().toISOString(),
      tip: 'Honeycomb Canyon is the local secret. Less crowded than Cottonwood canyons.',
    },
    'park city': {
      resort: 'Park City Mountain',
      base_depth: '68 inches',
      new_snow_24h: '2 inches',
      lifts_open: '38 of 41',
      trails_open: '330 of 341',
      conditions: 'Machine Groomed',
      last_updated: new Date().toISOString(),
      tip: 'Jupiter Bowl for advanced terrain. Town lift for quick downtown access.',
    },
    'deer valley': {
      resort: 'Deer Valley',
      base_depth: '72 inches',
      new_snow_24h: '2 inches',
      lifts_open: '21 of 22',
      trails_open: '103 of 103',
      conditions: 'Groomed',
      last_updated: new Date().toISOString(),
      tip: 'Limited to 7,500 skiers daily. Empire Canyon has the best snow.',
    },
  };

  const key = resort.toLowerCase().replace(/\s+/g, ' ');
  const match = Object.entries(conditions).find(([k]) =>
    key.includes(k) || k.includes(key)
  );

  if (match) {
    const data = match[1] as any;
    return JSON.stringify({
      ...data,
      disclaimer: '⚠️ Data may not reflect current conditions. Check resort website for real-time updates.',
      resort_website: getResortWebsite(resort),
      last_updated: data.last_updated || 'Unknown',
      source: 'Static data - May be outdated',
    });
  }

  return JSON.stringify({
    error: `No data for ${resort}. Try: Snowbird, Alta, Brighton, Solitude, Park City, Deer Valley`,
    disclaimer: '⚠️ Check resort website for real-time conditions.',
  });
}

function getResortWebsite(resort: string): string {
  const websites: Record<string, string> = {
    snowbird: 'https://www.snowbird.com/conditions/',
    alta: 'https://www.alta.com/conditions/',
    brighton: 'https://www.brightonresort.com/conditions/',
    solitude: 'https://www.solitudemountain.com/conditions/',
    'park city': 'https://www.parkcitymountain.com/conditions/',
    'deer valley': 'https://www.deervalley.com/conditions/',
  };
  const key = resort.toLowerCase().replace(/\s+/g, ' ');
  return websites[key] || 'https://www.skiutah.com/';
}

async function getCanyonRoadStatus(canyon: string): Promise<string> {
  // In production, scrape UDOT or use their API
  // For now, return realistic status based on time of day
  const hour = new Date().getHours();
  const isWeekend = [0, 6].includes(new Date().getDay());

  const canyonData: Record<string, object> = {
    'little cottonwood': {
      canyon: 'Little Cottonwood Canyon (SR-210)',
      status: 'Open',
      traction_required: hour < 10,
      traffic_level: isWeekend && hour >= 7 && hour <= 10 ? 'Heavy - 30-45 min delays' :
                     isWeekend && hour >= 15 && hour <= 18 ? 'Moderate - 15-20 min delays' : 'Light',
      avalanche_control: false,
      tip: isWeekend ? 'Take the UTA ski bus from the park-and-ride. $5 round trip, no stress.' :
           'Weekday traffic is light. Drive up anytime.',
      udot_link: 'https://cottonwoodcanyons.udot.utah.gov/',
    },
    'big cottonwood': {
      canyon: 'Big Cottonwood Canyon (SR-190)',
      status: 'Open',
      traction_required: hour < 10,
      traffic_level: isWeekend && hour >= 7 && hour <= 10 ? 'Moderate - 15-20 min delays' : 'Light',
      avalanche_control: false,
      tip: 'Generally less crowded than Little Cottonwood. Brighton has free parking.',
      udot_link: 'https://cottonwoodcanyons.udot.utah.gov/',
    },
    'parleys': {
      canyon: 'Parley\'s Canyon (I-80)',
      status: 'Open',
      traffic_level: hour >= 7 && hour <= 9 ? 'Heavy eastbound' :
                     hour >= 16 && hour <= 18 ? 'Heavy westbound' : 'Normal',
      tip: 'Main route to Park City. Check UDOT cameras before heading up.',
    },
  };

  const key = canyon.toLowerCase();
  const match = Object.entries(canyonData).find(([k]) =>
    key.includes(k) || k.includes(key.split(' ')[0])
  );

  if (match) {
    const data = match[1] as any;
    return JSON.stringify({
      ...data,
      disclaimer: '⚠️ Traffic estimates based on typical patterns. Check UDOT for real-time updates.',
      udot_link: data.udot_link || 'https://cottonwoodcanyons.udot.utah.gov/',
      last_updated: new Date().toISOString(),
      source: 'Time-based estimates - May not reflect current incidents',
    });
  }

  return JSON.stringify({
    message: 'Canyon roads generally clear. Check cottonwoodcanyons.udot.utah.gov for real-time updates.',
    disclaimer: '⚠️ Always check UDOT for current road conditions.',
    udot_link: 'https://cottonwoodcanyons.udot.utah.gov/',
  });
}

interface TripKitDestination {
  name?: string;
  description?: string;
  ai_story?: string;
  category?: string;
  subcategory?: string;
  county?: string;
  ai_tips?: string[];
  contact_info?: { phone?: string; website?: string };
  slug?: string;
}

async function searchTripkitDestinations(
  tripkitDestinations: TripKitDestination[],
  query: string,
  maxDriveTime?: number,
  category?: string
): Promise<string> {
  let results = tripkitDestinations;

  // Filter by search query
  if (query) {
    const q = query.toLowerCase();
    results = results.filter(d =>
      d.name?.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q) ||
      d.ai_story?.toLowerCase().includes(q) ||
      d.category?.toLowerCase().includes(q) ||
      d.subcategory?.toLowerCase().includes(q)
    );
  }

  // Filter by category
  if (category) {
    const cat = category.toLowerCase();
    results = results.filter(d =>
      d.category?.toLowerCase().includes(cat) ||
      d.subcategory?.toLowerCase().includes(cat)
    );
  }

  // Return top 5 matches with key info including contact so Dan can say "Call X, tell them SLCTrips sent you"
  const topResults = results.slice(0, 5).map(d => ({
    name: d.name,
    category: d.subcategory || d.category,
    county: d.county,
    description: d.ai_story?.slice(0, 200) || d.description?.slice(0, 200),
    tip: d.ai_tips?.[0],
    phone: d.contact_info?.phone,
    website: d.contact_info?.website,
    slug: d.slug,
  }));

  return JSON.stringify({
    found: results.length,
    showing: topResults.length,
    destinations: topResults,
  });
}

async function getTodaysEvents(area?: string, _category?: string): Promise<string> {
  // Try Eventbrite API first (primary source - no domain verification needed)
  // Then try Vertex AI Search (if configured)
  // Finally fallback to curated data
  
  try {
    // Import and use the events search function (tries Eventbrite → Vertex AI → Fallback)
    const { searchEventsWithVertexAI } = await import('../chat-vertex-ai');
    return await searchEventsWithVertexAI(area, _category);
  } catch (error) {
    console.error('Events search failed, using fallback:', error);
    // Fall through to curated fallback
  }

  // Fallback: Curated seasonal events (if all else fails)
  const today = new Date();
  const month = today.getMonth();
  const dayOfWeek = today.getDay();

  const events = [];

  // Winter events (Dec-Mar)
  if (month >= 11 || month <= 2) {
    events.push(
      { name: 'Downtown SLC Ice Skating', location: 'Gallivan Center', time: '11am-10pm', price: '$8' },
      { name: 'Temple Square Lights', location: 'Downtown SLC', time: 'Dusk-10pm', price: 'Free' },
    );
  }

  // Farmers markets (Sat)
  if (dayOfWeek === 6 && month >= 5 && month <= 9) {
    events.push(
      { name: 'Downtown Farmers Market', location: 'Pioneer Park', time: '8am-2pm', price: 'Free' },
    );
  }

  // Weekly events
  if (dayOfWeek === 5) { // Friday
    events.push(
      { name: 'Gallery Stroll', location: 'Various SLC Galleries', time: '6pm-9pm', price: 'Free' },
    );
  }

  // Always available
  events.push(
    { name: 'Utah Jazz Game', location: 'Delta Center', time: 'Check schedule', price: 'Varies' },
    { name: 'Natural History Museum', location: 'Rio Tinto Center', time: '10am-5pm', price: '$22' },
  );

  return JSON.stringify({
    date: today.toLocaleDateString(),
    area: area || 'Salt Lake City area',
    events: events.slice(0, 5),
    note: '⚠️ Events may have changed. Check local listings for the most current events.',
    disclaimer: '⚠️ These are seasonal suggestions. Events may have ended or changed. Verify with event organizers.',
    sources: [
      'https://www.visitsaltlake.com/events/',
      'https://www.eventbrite.com/d/ut--salt-lake-city/events/',
      'https://www.slc.gov/calendar/',
    ],
    last_updated: 'Static data - Not real-time',
    source: process.env.VERTEX_AI_EVENTS_DATASTORE_ID ? 'Vertex AI Search (fallback)' : 'Static data - Vertex AI Search not configured',
  });
}

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

async function getWeatherConditions(lat: number, lng: number): Promise<string> {
  if (!GOOGLE_MAPS_API_KEY) {
    return JSON.stringify({ error: 'Weather conditions service unavailable (missing API key)' });
  }
  try {
    const params = new URLSearchParams({
      key: GOOGLE_MAPS_API_KEY,
      'location.latitude': String(lat),
      'location.longitude': String(lng),
      unitsSystem: 'IMPERIAL',
    });
    const res = await fetch(
      `https://weather.googleapis.com/v1/currentConditions:lookup?${params.toString()}`
    );
    if (!res.ok) {
      const err = await res.text();
      return JSON.stringify({ error: 'Could not fetch weather conditions', detail: err });
    }
    const data = (await res.json()) as {
      weatherCondition?: { description?: { text?: string }; type?: string };
      temperature?: { degrees?: number };
      feelsLikeTemperature?: { degrees?: number };
      precipitation?: { probability?: { percent?: number; type?: string } };
      wind?: { speed?: { value?: number }; gust?: { value?: number } };
    };
    const desc = data.weatherCondition?.description?.text ?? 'Unknown';
    const type = data.weatherCondition?.type ?? '';
    const temp = data.temperature?.degrees ?? null;
    const feelsLike = data.feelsLikeTemperature?.degrees ?? null;
    const precipPct = data.precipitation?.probability?.percent ?? 0;
    const precipType = data.precipitation?.probability?.type ?? '';

    const snowOrIce = type === 'SNOW' || type === 'FREEZING_RAIN' || precipType === 'SNOW' || (precipPct > 30 && precipType === 'SNOW');
    const packChainsHint = snowOrIce
      ? ' Mountain routes may require chains—check UDOT before driving.'
      : '';

    return JSON.stringify({
      conditions: desc,
      condition_type: type,
      temperature_f: temp,
      feels_like_f: feelsLike,
      precipitation_probability_percent: precipPct,
      precipitation_type: precipType,
      hint: packChainsHint || undefined,
      summary: `${desc}${temp !== null ? `, ${Math.round(temp)}°F` : ''}${packChainsHint}`,
    });
  } catch (e) {
    console.error('Weather conditions API error:', e);
    return JSON.stringify({ error: 'Could not fetch weather conditions' });
  }
}

async function getAirQuality(lat: number, lng: number): Promise<string> {
  if (!GOOGLE_MAPS_API_KEY) {
    return JSON.stringify({ error: 'Air quality service unavailable (missing API key)' });
  }
  try {
    const res = await fetch(
      `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: { latitude: lat, longitude: lng },
          extraComputations: ['HEALTH_RECOMMENDATIONS'],
          languageCode: 'en',
        }),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      return JSON.stringify({ error: 'Could not fetch air quality', detail: err });
    }
    const data = (await res.json()) as {
      indexes?: Array<{ code?: string; displayName?: string; aqi?: number; category?: string }>;
      healthRecommendations?: { generalPopulation?: string };
    };
    const uaqi = data.indexes?.find((i) => i.code === 'uaqi') ?? data.indexes?.[0];
    const category = uaqi?.category ?? 'Unknown';
    const aqi = uaqi?.aqi ?? null;
    const recommendation = data.healthRecommendations?.generalPopulation ?? '';

    return JSON.stringify({
      category,
      aqi,
      recommendation,
      summary: category + (recommendation ? ` — ${recommendation}` : ''),
    });
  } catch (e) {
    console.error('Air quality API error:', e);
    return JSON.stringify({ error: 'Could not fetch air quality' });
  }
}

async function getPlaceDetails(placeId: string): Promise<string> {
  if (!GOOGLE_MAPS_API_KEY) {
    return JSON.stringify({ error: 'Place details service unavailable (missing API key)' });
  }
  const id = placeId.replace(/^places\//, '');
  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(id)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask':
            'id,displayName,formattedAddress,nationalPhoneNumber,internationalPhoneNumber,currentOpeningHours,regularOpeningHours,websiteUri',
        },
      }
    );
    if (!res.ok) {
      const err = await res.text();
      return JSON.stringify({ error: 'Could not fetch place details', detail: err });
    }
    const data = (await res.json()) as {
      displayName?: { text?: string };
      formattedAddress?: string;
      nationalPhoneNumber?: string;
      internationalPhoneNumber?: string;
      currentOpeningHours?: { openNow?: boolean; weekdayDescriptions?: string[] };
      regularOpeningHours?: { openNow?: boolean; weekdayDescriptions?: string[] };
      websiteUri?: string;
    };
    const name = data.displayName?.text ?? 'Unknown';
    const phone = data.nationalPhoneNumber ?? data.internationalPhoneNumber ?? null;
    const hours = data.currentOpeningHours ?? data.regularOpeningHours;
    const openNow = hours?.openNow ?? null;
    const weekdayDescriptions = hours?.weekdayDescriptions ?? [];
    const website = data.websiteUri ?? null;

    return JSON.stringify({
      name,
      formattedAddress: data.formattedAddress ?? null,
      phone,
      open_now: openNow,
      opening_hours: weekdayDescriptions.length ? weekdayDescriptions : null,
      websiteUri: website,
      summary: [
        name,
        phone ? `Phone: ${phone}` : null,
        openNow !== null ? (openNow ? 'Open now' : 'Closed now') : null,
        weekdayDescriptions.length ? `Hours: ${weekdayDescriptions.join('; ')}` : null,
      ]
        .filter(Boolean)
        .join('. '),
    });
  } catch (e) {
    console.error('Place details API error:', e);
    return JSON.stringify({ error: 'Could not fetch place details' });
  }
}

async function getDriveTime(origin: string, destination: string): Promise<string> {
  if (!GOOGLE_MAPS_API_KEY) {
    return JSON.stringify({ error: 'Directions service unavailable (missing API key)' });
  }
  try {
    const params = new URLSearchParams({
      key: GOOGLE_MAPS_API_KEY,
      origin: origin,
      destination: destination,
      mode: 'driving',
      departure_time: 'now',
      traffic_model: 'best_guess',
    });
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`
    );
    if (!res.ok) {
      return JSON.stringify({ error: 'Could not fetch directions' });
    }
    const data = (await res.json()) as {
      status?: string;
      routes?: Array<{
        legs?: Array<{
          duration?: { value?: number; text?: string };
          duration_in_traffic?: { value?: number; text?: string };
          distance?: { value?: number; text?: string };
        }>;
      }>;
    };
    if (data.status !== 'OK' || !data.routes?.length || !data.routes[0].legs?.length) {
      return JSON.stringify({
        error: 'No route found',
        status: data.status,
        hint: 'Try clearer origin/destination (e.g., "Salt Lake City, UT", "Park City, UT")',
      });
    }
    const leg = data.routes[0].legs[0];
    const durationTraffic = leg.duration_in_traffic ?? leg.duration;
    const durationSec = durationTraffic?.value ?? leg.duration?.value;
    const durationText = durationTraffic?.text ?? leg.duration?.text ?? '—';
    const distanceText = leg.distance?.text ?? '—';

    return JSON.stringify({
      origin,
      destination,
      duration_seconds: durationSec,
      duration_text: durationText,
      distance_text: distanceText,
      with_traffic: Boolean(leg.duration_in_traffic),
      summary: `About ${durationText} (${distanceText})${leg.duration_in_traffic ? ' with current traffic' : ''}.`,
    });
  } catch (e) {
    console.error('Directions API error:', e);
    return JSON.stringify({ error: 'Could not fetch drive time' });
  }
}

// Process function calls
async function processToolCall(
  functionName: string,
  args: any,
  tripkitDestinations: any[]
): Promise<string> {
  switch (functionName) {
    case 'get_current_weather':
      return await getCurrentWeather(args.location);
    case 'get_ski_conditions':
      return await getSkiConditions(args.resort);
    case 'get_canyon_road_status':
      return await getCanyonRoadStatus(args.canyon);
    case 'search_tripkit_destinations':
      return await searchTripkitDestinations(
        tripkitDestinations,
        args.query,
        args.maxDriveTime,
        args.category
      );
    case 'get_todays_events':
      return await getTodaysEvents(args.area, args.category);
    case 'get_weather_conditions':
      return await getWeatherConditions(args.lat, args.lng);
    case 'get_air_quality':
      return await getAirQuality(args.lat, args.lng);
    case 'get_place_details':
      return await getPlaceDetails(args.placeId);
    case 'get_drive_time':
      return await getDriveTime(args.origin, args.destination);
    default:
      return JSON.stringify({ error: 'Unknown function' });
  }
}

// TripKit-specific context generator (includes "site" for global/main-page chat)
function getTripKitContext(tripkitCode: string, tripkitName: string) {
  // Global "Ask Dan" on homepage and non-TripKit pages
  if (!tripkitCode || tripkitCode === 'site') {
    return {
      description: 'You are helping visitors explore Utah from Salt Lake City. They may not have a TripKit yet.',
      focus: 'weather, ski conditions, canyon traffic, events, and pointing them to TripKits for personalized destination recommendations',
      capabilities: [
        'Check current weather at Utah locations',
        'Get ski resort conditions',
        'Check canyon road status and traffic',
        'Find events happening today',
        'Suggest they browse TripKits or Destinations for personalized picks (no TripKit-specific search here)',
      ],
      examples: `EXAMPLE RESPONSES:
"Salt Lake's looking great today - mid-40s and clear. Perfect for a drive up the canyon or a walk around Temple Square. Want ski conditions or events?"

"When recommending a place: Use get_weather_conditions and get_air_quality first for outdoor/mountain recs; use get_place_details when you have a Place ID so you can say: 'Based on current conditions, Mirror Lake might be snowy—pack chains. Air quality is good. Call the lodge at (XXX) XXX-XXXX—they're open until 6pm. Tell them SLCTrips sent you.' Confident, specific, slightly playful."

"For personalized road trip ideas, check out our TripKits—Valentine's getaways, Haunted Highway, Ski Utah—each one's curated from SLC. I can also tell you what's happening today or how the canyons are."`,
    };
  }

  const contexts: Record<string, {
    description: string;
    focus: string;
    capabilities: string[];
    examples: string;
  }> = {
    // Ski Utah TripKit
    'TK-002': {
      description: 'This TripKit focuses on skiing and snowboarding at Utah\'s world-class resorts.',
      focus: 'ski conditions, resort recommendations, canyon access, and après-ski activities',
      capabilities: [
        'Check current weather at ski resorts',
        'Get real-time ski conditions (snow, lifts, trails)',
        'Check canyon road status and traffic',
        'Recommend the best resort for today\'s conditions',
        'Find après-ski food and drinks',
        'Search ski-related destinations in the TripKit',
      ],
      examples: `EXAMPLE RESPONSES:
"Fresh powder alert! Snowbird got 8 inches overnight and Mineral Basin is skiing incredible. Little Cottonwood has moderate traffic right now - I'd take the bus from the park-and-ride."

"For après ski, The Cliff Lodge at Snowbird has great views and cocktails. Or head down to Porcupine Pub for burgers and local beer."`,
    },

    // 250 Under $25 Budget TripKit
    'TK-045': {
      description: 'This TripKit focuses on amazing Utah experiences for $25 or less - perfect for budget-conscious travelers.',
      focus: 'free activities, budget-friendly dining, state parks, trails, and low-cost entertainment',
      capabilities: [
        'Check weather for outdoor activities',
        'Recommend free hiking and nature spots',
        'Find free events happening today',
        'Search budget-friendly destinations',
        'Suggest low-cost dining options',
      ],
      examples: `EXAMPLE RESPONSES:
"Perfect hiking weather today! I'd hit Ensign Peak - it's free, takes about an hour, and you get amazing city views. Afterwards, grab a $10 burrito at Red Iguana."

"Want free entertainment tonight? Check out the Gallery Stroll in downtown SLC - free art, wine, and people watching."`,
    },

    // Foodie's Paradise
    'TK-024': {
      description: 'This TripKit is all about Utah\'s incredible food scene - restaurants, breweries, and culinary experiences.',
      focus: 'restaurants, local cuisine, breweries, coffee shops, and food events',
      capabilities: [
        'Recommend restaurants by cuisine type',
        'Find local breweries and craft beverages',
        'Search food-related destinations',
        'Find food events and festivals',
        'Suggest dining for different occasions',
      ],
      examples: `EXAMPLE RESPONSES:
"For the best tacos in SLC, hit up Lone Star Taqueria - locals only spot with incredible carnitas. Or if you want upscale, Current Fish & Oyster is doing a special tasting menu tonight."

"Utah's craft beer scene is legit! Epic Brewing has an amazing taproom, or check out Fisher Brewing for something more intimate."`,
    },

    // Family Fun TripKit
    'TK-005': {
      description: 'This TripKit focuses on family-friendly activities that kids and parents will both enjoy.',
      focus: 'kid-friendly attractions, family dining, educational activities, and outdoor adventures suitable for all ages',
      capabilities: [
        'Check weather for family outdoor activities',
        'Recommend kid-friendly attractions',
        'Find family-friendly restaurants',
        'Search destinations suitable for children',
        'Find events for families',
      ],
      examples: `EXAMPLE RESPONSES:
"The Natural History Museum is a hit with kids - dinosaurs, gems, and hands-on exhibits. It's $22/adult but kids under 3 are free. Plan for 2-3 hours."

"For family dinner, The Pie Pizzeria has arcade games to keep kids busy while you enjoy some of Utah's best pizza."`,
    },
  };

  // Default context for any TripKit
  const defaultContext = {
    description: `This TripKit curates the best of what ${tripkitName} has to offer in Utah.`,
    focus: 'the unique experiences and destinations in this collection',
    capabilities: [
      'Check current weather conditions',
      'Search destinations in this TripKit',
      'Find events happening today',
      'Provide recommendations based on your interests',
    ],
    examples: `EXAMPLE RESPONSES:
"Based on current conditions, your best bet is [Place]. Call [phone] for reservations—tell them SLCTrips sent you."

"Based on your TripKit, I'd recommend [destination] today - the weather is perfect and it's one of the highlights. If the data has a phone, give it and the SLCTrips sign-off."

"Looking for something specific? Tell me what you're in the mood for and I'll find the best match in your TripKit."`,
  };

  return contexts[tripkitCode] || defaultContext;
}

export async function POST(request: NextRequest) {
  try {
    const {
      message,
      tripkitCode,
      tripkitName,
      tripkitDestinations,
      conversationHistory = []
    } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    // TripKit-specific context and focus areas
    const tripkitContext = getTripKitContext(tripkitCode, tripkitName);

    // Build a summary of destinations in this TripKit for Dan's knowledge (empty for "site" mode)
    const destinationSummary = tripkitDestinations?.slice(0, 30).map((d: TripKitDestination) => ({
      name: d.name,
      category: d.subcategory || d.category,
      tip: d.ai_tips?.[0],
    })) || [];
    const isSiteMode = !tripkitCode || tripkitCode === 'site';

    // Build Dan's system prompt - TripKit aware or site (general) mode
    const systemPrompt = `You are Dan, the Wasatch Sasquatch - a friendly, knowledgeable concierge for Utah travelers using SLCTrips.

PERSONALITY:
- Warm, welcoming, slightly playful
- Local expert who genuinely loves Utah
- Practical advice over generic tourism speak
- You've lived here for decades and know the real secrets

CURRENT TRIPKIT: ${tripkitName || 'Utah exploration'}
${tripkitContext.description}

TRIPKIT FOCUS: ${tripkitContext.focus}

TODAY'S CONTEXT:
- Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Time: ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}

YOUR CAPABILITIES:
${tripkitContext.capabilities.map((c: string) => `- ${c}`).join('\n')}

${isSiteMode ? 'NO TRIPKIT SELECTED: Do not recommend specific TripKit destinations. Suggest weather, ski, canyon, events, or point them to TripKits/Destinations for personalized picks.' : `DESTINATIONS IN THIS TRIPKIT (use these for recommendations):\n${destinationSummary.map((d: { name: string; category: string; tip?: string }) => `- ${d.name} (${d.category})${d.tip ? ': ' + d.tip : ''}`).join('\n')}`}

BEFORE RECOMMENDATIONS — USE THESE TOOLS:
- Before recommending outdoor or mountain destinations (e.g., Mirror Lake, canyons, hikes), call get_weather_conditions(lat, lng) and optionally get_air_quality(lat, lng). Mention current conditions and cautions (e.g., "might be snowy—pack chains", "air quality is good today").
- Before saying "Call them" or giving a phone number, call get_place_details(placeId) when you have a Google Place ID, to confirm they're open and get current phone/hours. Prefer our destination contact_info when we have it; use Places to verify or fill gaps.
- For "how long to get there" or drive-time questions, call get_drive_time(origin, destination) to give duration with current traffic.

RESPONSE STYLE:
- Be specific and actionable: name the place, the move, the number. "Your best bet is X" not "You could try something like X."
- When a destination has a phone number (from our data or from get_place_details), give it: "Call [number] for reservations—tell them SLCTrips sent you." Warm, confident, slightly playful (not stiff). Only say "Call them" when you have verified or have a number.
- When you have a slug or website, you can say "Check slctrips.com/destinations/[slug]" or "Their site: [website]" so they can book or learn more.
- Keep responses concise but helpful (2-4 sentences typical).
- ${isSiteMode ? 'Suggest TripKits or Destinations when they want personalized picks; use weather/ski/canyon/events for real-time help' : "ALWAYS recommend from the user's TripKit destinations when relevant"}
- Use real-time data (get_weather_conditions, get_air_quality, get_place_details, get_drive_time) when helpful so recommendations are current and actionable.
- Include insider tips when appropriate.
- Stay focused on ${tripkitContext.focus}.
- When data may be outdated (ski conditions, events), include disclaimers and links to official sources.
- Be honest about data limitations - it's better to admit uncertainty than provide inaccurate information.

${tripkitContext.examples}

Remember: ${isSiteMode ? "You're their Utah concierge. Help with weather, conditions, events; point them to TripKits for curated destination picks." : "You're their personal Utah concierge with deep knowledge of their specific TripKit. Recommend from THEIR destinations, not generic Utah tourism."}`;

    // Get Gemini model (using Gemini 2.0 Flash)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: systemPrompt,
    });

    // Convert conversation history to Gemini format
    const history = conversationHistory.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Start chat with history and function calling tools
    const chat = model.startChat({
      history,
      tools: [danTools],
    });

    // Send message
    let result = await chat.sendMessage(message);
    let response = result.response;

    // Handle function calls iteratively
    let functionCalls = response.functionCalls?.();
    while (functionCalls && functionCalls.length > 0) {
      const toolResults = [];

      for (const call of functionCalls) {
        const toolResult = await processToolCall(
          call.name,
          call.args,
          tripkitDestinations || []
        );
        toolResults.push({
          functionResponse: {
            name: call.name,
            response: { result: toolResult },
          },
        });
      }

      // Send tool results back to model
      result = await chat.sendMessage(toolResults);
      response = result.response;
      functionCalls = response.functionCalls?.();
    }

    const text = response.text();

    return NextResponse.json({
      success: true,
      message: text,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Dan chat error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Dan is taking a quick break. Try again in a moment.',
        debug: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
