/**
 * Vertex AI Integration for Dan Concierge
 * 
 * This file contains helper functions for integrating Vertex AI Search
 * and enhanced function calling with the Dan Concierge API.
 * 
 * Setup Required:
 * 1. Enable Vertex AI API in Google Cloud Console
 * 2. Set environment variables:
 *    - GOOGLE_CLOUD_PROJECT_ID=cs-poc-ujrgyykgigo08lwlg6fdrrl
 *    - VERTEX_AI_LOCATION=global
 *    - VERTEX_AI_EVENTS_DATASTORE_ID=your-datastore-id
 * 3. Install: npm install @google-cloud/aiplatform
 * 
 * NOTE: This file uses dynamic imports to avoid build errors when
 * the package is not installed. The functions will gracefully
 * fall back to static data if Vertex AI is not available.
 */

// Initialize Vertex AI client (lazy-loaded)
let vertexAI: any = null;
let vertexAIModule: any = null;

/**
 * Dynamically load Vertex AI module only when needed
 * This prevents build errors if package is not installed
 * 
 * NOTE: Only attempts import if VERTEX_AI_EVENTS_DATASTORE_ID is set
 * This prevents webpack from trying to resolve the module at build time
 */
async function getVertexAI(): Promise<any> {
  // If already loaded, return it
  if (vertexAI) {
    return vertexAI;
  }

  // Only attempt import if Vertex AI is configured
  // This prevents webpack from trying to resolve the module
  if (!process.env.VERTEX_AI_EVENTS_DATASTORE_ID) {
    return null;
  }

  // Try to dynamically import the module
  // Use Function constructor to prevent webpack from statically analyzing
  if (!vertexAIModule) {
    try {
      // This prevents webpack from trying to resolve the module at build time
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - Dynamic import via Function constructor (prevents static analysis)
      const dynamicImport = new Function('specifier', 'return import(specifier)');
      vertexAIModule = await dynamicImport('@google-cloud/aiplatform');
    } catch (error: any) {
      // Package not installed - that's okay, will use fallback
      if (error?.code !== 'MODULE_NOT_FOUND') {
        console.error('Vertex AI import error:', error);
      }
      return null;
    }
  }

  // Initialize Vertex AI client
  if (vertexAIModule && !vertexAI) {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'cs-poc-ujrgyykgigo08lwlg6fdrrl';
    const location = process.env.VERTEX_AI_LOCATION || 'global';
    
    try {
      const { VertexAI } = vertexAIModule;
      vertexAI = new VertexAI({
        project: projectId,
        location: location,
      });
    } catch (error) {
      console.error('Failed to initialize Vertex AI:', error);
      return null;
    }
  }
  
  return vertexAI;
}

/**
 * Fetch real-time events from Eventbrite API
 * 
 * @param area - Area to search (e.g., "Salt Lake City")
 * @param category - Optional event category filter
 * @returns JSON string with events data
 */
async function fetchEventsFromEventbrite(
  area?: string,
  category?: string
): Promise<string | null> {
  const eventbriteToken = process.env.EVENTBRITE_API_TOKEN;
  
  if (!eventbriteToken) {
    return null; // No API token configured
  }

  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format dates for Eventbrite API (ISO 8601)
    const startDate = today.toISOString().split('T')[0] + 'T00:00:00Z';
    const endDate = tomorrow.toISOString().split('T')[0] + 'T23:59:59Z';
    
    // Build search query
    const location = area || 'Salt Lake City, UT';
    const searchUrl = new URL('https://www.eventbriteapi.com/v3/events/search/');
    searchUrl.searchParams.set('location.address', location);
    searchUrl.searchParams.set('start_date.range_start', startDate);
    searchUrl.searchParams.set('start_date.range_end', endDate);
    searchUrl.searchParams.set('status', 'live');
    searchUrl.searchParams.set('order_by', 'start_asc');
    searchUrl.searchParams.set('expand', 'venue');
    searchUrl.searchParams.set('page_size', '10');

    const response = await fetch(searchUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${eventbriteToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Eventbrite API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    
    if (!data.events || data.events.length === 0) {
      return null; // No events found
    }

    // Format events for Dan's response
    const formattedEvents = data.events.map((event: any) => {
      const startDate = new Date(event.start?.utc || event.start?.local);
      const venue = event.venue?.name || event.venue?.address?.localized_area_display || 'Location TBD';
      
      return {
        name: event.name?.text || 'Event',
        location: venue,
        time: startDate.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          timeZoneName: 'short'
        }),
        date: startDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        }),
        price: event.is_free ? 'Free' : (event.ticket_availability?.minimum_ticket_price?.display || 'Varies'),
        url: event.url || null,
        description: event.description?.text?.substring(0, 200) || null,
      };
    });

    return JSON.stringify({
      date: today.toLocaleDateString(),
      area: location,
      events: formattedEvents,
      source: 'Eventbrite API - Real-time',
      last_updated: new Date().toISOString(),
      disclaimer: '⚠️ Event details may change. Verify with event organizers.',
      sources: [
        'https://www.eventbrite.com/d/ut--salt-lake-city/events/',
        'https://www.visitsaltlake.com/events/',
      ],
    });
    
  } catch (error: any) {
    console.error('Eventbrite API fetch error:', error);
    return null;
  }
}

/**
 * Search for real-time events using Eventbrite API (primary) or Vertex AI Search (fallback)
 * 
 * @param area - Area to search (e.g., "Salt Lake City")
 * @param category - Optional event category filter
 * @returns JSON string with events data
 */
export async function searchEventsWithVertexAI(
  area?: string,
  category?: string
): Promise<string> {
  // Try Eventbrite API first (no domain verification needed, real-time data)
  const eventbriteEvents = await fetchEventsFromEventbrite(area, category);
  if (eventbriteEvents) {
    return eventbriteEvents;
  }

  // Fallback to Vertex AI Search if configured (requires domain verification)
  const datastoreId = process.env.VERTEX_AI_EVENTS_DATASTORE_ID;
  
  if (datastoreId) {
    const vertexAI = await getVertexAI();
    if (vertexAI) {
      try {
        // TODO: Implement Vertex AI Search query once domain verification is complete
        // const searchResults = await vertexAI.search({
        //   query: `Events happening today in ${area || 'Salt Lake City'}`,
        //   dataStoreId: datastoreId,
        // });
        // For now, Vertex AI Search is not yet active (domain verification pending)
      } catch (error) {
        console.error('Vertex AI Search error:', error);
      }
    }
  }

  // Final fallback to curated static data
  return getFallbackEvents(area, category);
}

/**
 * Fallback events data (current implementation)
 * This will be replaced by Vertex AI Search results
 */
function getFallbackEvents(area?: string, category?: string): string {
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
    source: 'Fallback data - Vertex AI Search not yet configured',
  });
}

/**
 * Enhanced ski conditions with Vertex AI function calling
 * 
 * @param resort - Resort name
 * @returns JSON string with ski conditions
 */
export async function getSkiConditionsWithVertexAI(resort: string): Promise<string> {
  // TODO: Implement Vertex AI function calling for ski resort APIs
  // This will enable real-time data fetching from resort APIs
  
  // For now, return enhanced static data with disclaimers
  return getEnhancedSkiConditions(resort);
}

function getEnhancedSkiConditions(resort: string): string {
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
      disclaimer: '⚠️ Data may not reflect current conditions. Check resort website for real-time updates.',
      resort_website: 'https://www.snowbird.com/conditions/',
      source: 'Static data - May be outdated',
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
      disclaimer: '⚠️ Data may not reflect current conditions. Check resort website for real-time updates.',
      resort_website: 'https://www.alta.com/conditions/',
      source: 'Static data - May be outdated',
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
      disclaimer: '⚠️ Data may not reflect current conditions. Check resort website for real-time updates.',
      resort_website: 'https://www.brightonresort.com/conditions/',
      source: 'Static data - May be outdated',
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
      disclaimer: '⚠️ Data may not reflect current conditions. Check resort website for real-time updates.',
      resort_website: 'https://www.solitudemountain.com/conditions/',
      source: 'Static data - May be outdated',
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
      disclaimer: '⚠️ Data may not reflect current conditions. Check resort website for real-time updates.',
      resort_website: 'https://www.parkcitymountain.com/conditions/',
      source: 'Static data - May be outdated',
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
      disclaimer: '⚠️ Data may not reflect current conditions. Check resort website for real-time updates.',
      resort_website: 'https://www.deervalley.com/conditions/',
      source: 'Static data - May be outdated',
    },
  };

  const key = resort.toLowerCase().replace(/\s+/g, ' ');
  const match = Object.entries(conditions).find(([k]) =>
    key.includes(k) || k.includes(key)
  );

  if (match) {
    return JSON.stringify(match[1]);
  }

  return JSON.stringify({
    error: `No data for ${resort}. Try: Snowbird, Alta, Brighton, Solitude, Park City, Deer Valley`,
    disclaimer: '⚠️ Check resort website for real-time conditions.',
  });
}

/**
 * Setup instructions for Vertex AI Search
 */
export const VERTEX_AI_SETUP_INSTRUCTIONS = `
# Vertex AI Search Setup for Events

## Step 1: Create Vertex AI Search App
1. Go to: https://console.cloud.google.com/vertex-ai/search?project=cs-poc-ujrgyykgigo08lwlg6fdrrl
2. Click "Create App"
3. Choose "Custom Search" → "General"
4. Name: "SLCTrips Events Search"

## Step 2: Create Data Store
1. In your Search App, click "Create Data Store"
2. Choose data source:
   - Option A: Web scraping (Eventbrite, Visit Salt Lake, etc.)
   - Option B: API integration (Eventbrite API)
3. Configure data store with event sources

## Step 3: Set Environment Variables
Add to .env:
GOOGLE_CLOUD_PROJECT_ID=cs-poc-ujrgyykgigo08lwlg6fdrrl
VERTEX_AI_LOCATION=global
VERTEX_AI_EVENTS_DATASTORE_ID=your-datastore-id-here

## Step 4: Install Dependencies
npm install @google-cloud/aiplatform

## Step 5: Update getTodaysEvents Function
Replace the function in /api/dan/chat/route.ts with Vertex AI Search implementation.
`;
