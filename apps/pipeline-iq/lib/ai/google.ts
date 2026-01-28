/**
 * Google AI Services Integration
 * - Google Places API for project location intelligence
 * - YouTube API for developer research
 * - Gemini AI for advanced analysis
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { logger } from '@/lib/logger'
import { fetchWithTimeout, safeFetch } from '@/lib/api/fetch'
import { safeJsonParse } from '@/lib/api/errors'

// ============================================
// Configuration
// ============================================

const API_TIMEOUT = 15000 // 15 seconds

function getGoogleApiKey(): string {
  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key) {
    throw new Error('GOOGLE_PLACES_API_KEY is not configured')
  }
  return key
}

function getGeminiClient(): GoogleGenerativeAI | null {
  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key) return null
  return new GoogleGenerativeAI(key)
}

// ============================================
// Safe API Call Helpers
// ============================================

async function safeGoogleApiCall<T>(
  url: string,
  fallback: T
): Promise<T> {
  try {
    const response = await fetchWithTimeout(url, { timeout: API_TIMEOUT })

    if (!response.ok) {
      logger.warn('Google API request failed', {
        status: response.status,
        url: url.split('?')[0], // Don't log API key
      })
      return fallback
    }

    return await response.json() as T
  } catch (error) {
    logger.error('Google API call failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      url: url.split('?')[0],
    })
    return fallback
  }
}

async function safeGeminiCall<T>(
  prompt: string,
  fallback: T
): Promise<T> {
  try {
    const gemini = getGeminiClient()
    if (!gemini) {
      logger.debug('Gemini not configured, skipping AI analysis')
      return fallback
    }

    const model = gemini.getGenerativeModel({ model: 'gemini-pro' })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return safeJsonParse<T>(text, fallback)
  } catch (error) {
    logger.error('Gemini API call failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return fallback
  }
}

// ============================================
// Location Enrichment
// ============================================

interface PlaceSearchResponse {
  candidates?: Array<{
    place_id: string
    name: string
    formatted_address: string
    geometry: {
      location: { lat: number; lng: number }
    }
    photos?: Array<{ photo_reference: string }>
  }>
}

interface PlaceDetailsResponse {
  result?: {
    formatted_address: string
    photos?: Array<{ photo_reference: string }>
    rating?: number
    reviews?: unknown[]
    website?: string
    formatted_phone_number?: string
  }
}

export interface LocationEnrichment {
  place_id: string
  coordinates: { lat: number; lng: number }
  formatted_address: string
  photos: string[]
  street_view_url: string
  nearby_comparables: Array<{
    name: string
    address: string
    rating?: number
    total_ratings?: number
    place_id: string
    distance_meters: number
  }>
  area_insights: unknown
}

export async function enrichProjectLocation(project: {
  address?: string
  city?: string
  state?: string
  zip?: string
  project_type?: string[]
}): Promise<LocationEnrichment | null> {
  const apiKey = getGoogleApiKey()
  const address = `${project.address || ''} ${project.city || ''}, ${project.state || ''} ${project.zip || ''}`.trim()

  if (!address || address.length < 5) {
    logger.debug('Insufficient address for location enrichment')
    return null
  }

  // Search for the project location
  const placeSearchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(address)}&inputtype=textquery&fields=place_id,name,formatted_address,geometry,photos&key=${apiKey}`

  const placeData = await safeGoogleApiCall<PlaceSearchResponse>(placeSearchUrl, { candidates: [] })

  if (!placeData.candidates || placeData.candidates.length === 0) {
    logger.debug('No place found for address', { address })
    return null
  }

  const place = placeData.candidates[0]

  // Get detailed place information
  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,geometry,photos,rating,reviews,website,formatted_phone_number&key=${apiKey}`

  const details = await safeGoogleApiCall<PlaceDetailsResponse>(detailsUrl, { result: undefined })

  // Find nearby comparable properties
  const nearbyComps = await findNearbyComparableProjects(
    place.geometry.location.lat,
    place.geometry.location.lng,
    project.project_type || []
  )

  // Get street view URL
  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${place.geometry.location.lat},${place.geometry.location.lng}&key=${apiKey}`

  // Build photo URLs
  const photos =
    details.result?.photos?.slice(0, 5).map(
      (photo) =>
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${apiKey}`
    ) || []

  // Analyze area with Gemini
  const areaInsights = await analyzeAreaWithGemini(
    {
      formatted_address: place.formatted_address,
      geometry: place.geometry,
    },
    nearbyComps
  )

  return {
    place_id: place.place_id,
    coordinates: place.geometry.location,
    formatted_address: details.result?.formatted_address || place.formatted_address,
    photos,
    street_view_url: streetViewUrl,
    nearby_comparables: nearbyComps,
    area_insights: areaInsights,
  }
}

// ============================================
// Nearby Properties
// ============================================

interface NearbySearchResponse {
  results?: Array<{
    name: string
    vicinity: string
    rating?: number
    user_ratings_total?: number
    place_id: string
    geometry: {
      location: { lat: number; lng: number }
    }
  }>
}

async function findNearbyComparableProjects(
  lat: number,
  lng: number,
  projectTypes: string[]
): Promise<Array<{
  name: string
  address: string
  rating?: number
  total_ratings?: number
  place_id: string
  distance_meters: number
}>> {
  const apiKey = getGoogleApiKey()

  // Search for similar properties nearby
  const searchTerms = projectTypes.map((type) => {
    const typeMap: Record<string, string> = {
      hotel: 'hotel',
      multifamily: 'apartment complex',
      senior_living: 'senior living facility',
      student_housing: 'student housing',
    }
    return typeMap[type] || type
  })

  const nearbyResults: Array<{
    name: string
    address: string
    rating?: number
    total_ratings?: number
    place_id: string
    distance_meters: number
  }> = []

  // Limit to first 2 search terms to reduce API calls
  for (const term of searchTerms.slice(0, 2)) {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&keyword=${encodeURIComponent(term)}&key=${apiKey}`

    const data = await safeGoogleApiCall<NearbySearchResponse>(url, { results: [] })

    if (data.results) {
      nearbyResults.push(
        ...data.results.slice(0, 5).map((place) => ({
          name: place.name,
          address: place.vicinity,
          rating: place.rating,
          total_ratings: place.user_ratings_total,
          place_id: place.place_id,
          distance_meters: calculateDistance(
            lat,
            lng,
            place.geometry.location.lat,
            place.geometry.location.lng
          ),
        }))
      )
    }
  }

  return nearbyResults
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3 // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180
  const phi2 = (lat2 * Math.PI) / 180
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return Math.round(R * c)
}

// ============================================
// Gemini Area Analysis
// ============================================

async function analyzeAreaWithGemini(
  place: { formatted_address: string; geometry: { location: { lat: number; lng: number } } },
  nearbyComps: unknown[]
): Promise<unknown> {
  const prompt = `Analyze this construction project location and nearby comparable properties:

Location: ${place.formatted_address}
Coordinates: ${place.geometry.location.lat}, ${place.geometry.location.lng}

Nearby Comparable Properties:
${JSON.stringify(nearbyComps, null, 2)}

Provide strategic insights as JSON:
{
  "market_saturation": "analysis of local market",
  "competitive_positioning": "opportunities for differentiation",
  "local_demand": "indicators of local demand",
  "technology_adoption": "area's technology adoption level",
  "pricing_recommendations": "pricing strategy suggestions",
  "differentiation_strategies": ["strategy1", "strategy2"]
}`

  return safeGeminiCall(prompt, { insights: 'Unable to analyze area' })
}

// ============================================
// YouTube Research
// ============================================

interface YouTubeSearchResponse {
  items?: Array<{
    id: { videoId: string }
    snippet: {
      title: string
      description: string
      thumbnails: { high: { url: string } }
      channelTitle: string
      publishedAt: string
    }
  }>
}

interface YouTubeStatsResponse {
  items?: Array<{
    statistics: {
      viewCount?: string
      likeCount?: string
      commentCount?: string
    }
  }>
}

export interface DeveloperVideos {
  videos: Array<{
    video_id: string
    title: string
    description: string
    thumbnail: string
    channel: string
    published_at: string
    url: string
    views?: number
    likes?: number
    comments?: number
  }>
  analysis: unknown
  key_findings: string[]
}

export async function findDeveloperVideos(params: {
  developerName?: string
  projectName?: string
  projectType?: string
  location?: string
}): Promise<DeveloperVideos> {
  const apiKey = getGoogleApiKey()
  const { developerName, projectName, projectType, location } = params

  const emptyResult: DeveloperVideos = { videos: [], analysis: null, key_findings: [] }

  // Build search query
  const searchTerms = [
    developerName && `"${developerName}"`,
    projectName && `"${projectName}"`,
    projectType,
    location,
    'construction OR development OR groundbreaking',
  ]
    .filter(Boolean)
    .join(' ')

  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(searchTerms)}&type=video&key=${apiKey}`

  const data = await safeGoogleApiCall<YouTubeSearchResponse>(searchUrl, { items: [] })

  if (!data.items || data.items.length === 0) {
    return emptyResult
  }

  const videos = data.items.map((item) => ({
    video_id: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.high.url,
    channel: item.snippet.channelTitle,
    published_at: item.snippet.publishedAt,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
  }))

  // Get video stats
  const videoIds = videos.map((v) => v.video_id).join(',')
  const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${apiKey}`

  const statsData = await safeGoogleApiCall<YouTubeStatsResponse>(statsUrl, { items: [] })

  // Merge stats with video data
  const videosWithStats = videos.map((video, index) => {
    const stats = statsData.items?.[index]?.statistics
    return {
      ...video,
      views: stats?.viewCount ? parseInt(stats.viewCount, 10) : undefined,
      likes: stats?.likeCount ? parseInt(stats.likeCount, 10) : undefined,
      comments: stats?.commentCount ? parseInt(stats.commentCount, 10) : undefined,
    }
  })

  // Analyze videos with Gemini
  const analysis = await analyzeVideosWithGemini(videosWithStats)

  return {
    videos: videosWithStats,
    analysis,
    key_findings: (analysis as { key_findings?: string[] })?.key_findings || [],
  }
}

async function analyzeVideosWithGemini(videos: unknown[]): Promise<unknown> {
  const prompt = `Analyze these YouTube videos about a construction developer/project:

${JSON.stringify(videos, null, 2)}

Extract as JSON:
{
  "key_findings": ["finding1", "finding2"],
  "developer_priorities": "what they value",
  "technology_mentions": ["tech1", "tech2"],
  "pain_points": ["pain1", "pain2"],
  "decision_makers": ["person1", "person2"],
  "company_culture": "communication style",
  "outreach_angles": ["angle1", "angle2"],
  "competitive_intel": "relevant intelligence"
}`

  return safeGeminiCall(prompt, { analysis: 'Unable to analyze videos' })
}

// ============================================
// Contact Research
// ============================================

export interface ContactResearch {
  contact_name: string
  title?: string
  company?: string
  search_results: Array<{
    title: string
    snippet: string
    url: string
  }>
  communication_style?: string
  interests?: string[]
  topics_to_mention?: string[]
  topics_to_avoid?: string[]
  outreach_strategy?: string
}

export async function researchContact(
  contact: { first_name?: string; last_name?: string; title?: string },
  company?: { company_name?: string }
): Promise<ContactResearch> {
  const apiKey = getGoogleApiKey()
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID

  const baseResult: ContactResearch = {
    contact_name: `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
    title: contact.title,
    company: company?.company_name,
    search_results: [],
  }

  // Skip if no search engine configured
  if (!searchEngineId) {
    logger.debug('Google Search Engine ID not configured, skipping contact research')
    return baseResult
  }

  const searchQuery = `"${contact.first_name || ''} ${contact.last_name || ''}" ${company?.company_name || ''} ${contact.title || ''}`

  const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(searchQuery)}&key=${apiKey}&cx=${searchEngineId}`

  interface SearchResponse {
    items?: Array<{
      title: string
      snippet: string
      link: string
    }>
  }

  const data = await safeGoogleApiCall<SearchResponse>(searchUrl, { items: [] })

  const searchResults =
    data.items?.slice(0, 5).map((item) => ({
      title: item.title,
      snippet: item.snippet,
      url: item.link,
    })) || []

  // Analyze with Gemini if we have results
  if (searchResults.length > 0) {
    const prompt = `Based on this public information about a construction industry professional:

Name: ${contact.first_name} ${contact.last_name}
Title: ${contact.title || 'Unknown'}
Company: ${company?.company_name || 'Unknown'}

Search Results:
${JSON.stringify(searchResults, null, 2)}

Provide sales intelligence as JSON:
{
  "communication_style": "recommended approach",
  "interests": ["interest1", "interest2"],
  "topics_to_mention": ["topic1", "topic2"],
  "topics_to_avoid": ["topic1"],
  "outreach_strategy": "best approach"
}`

    const insights = await safeGeminiCall<{
      communication_style?: string
      interests?: string[]
      topics_to_mention?: string[]
      topics_to_avoid?: string[]
      outreach_strategy?: string
    }>(prompt, {})

    return {
      ...baseResult,
      search_results: searchResults,
      ...insights,
    }
  }

  return { ...baseResult, search_results: searchResults }
}

// ============================================
// Competitor Research
// ============================================

export async function findLocalCompetitors(
  lat: number,
  lng: number
): Promise<
  Array<{
    name: string
    address: string
    rating?: number
    total_ratings?: number
    types: string[]
  }>
> {
  const apiKey = getGoogleApiKey()

  const competitorTypes = [
    'telecommunications provider',
    'cable tv installer',
    'structured cabling',
    'security system installer',
    'smart home automation',
  ]

  const competitors: Array<{
    name: string
    address: string
    rating?: number
    total_ratings?: number
    types: string[]
  }> = []

  // Limit API calls - just search for 2 competitor types
  for (const type of competitorTypes.slice(0, 2)) {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=50000&keyword=${encodeURIComponent(type)}&key=${apiKey}`

    const data = await safeGoogleApiCall<NearbySearchResponse>(url, { results: [] })

    if (data.results) {
      competitors.push(
        ...data.results.slice(0, 3).map((comp) => ({
          name: comp.name,
          address: comp.vicinity,
          rating: comp.rating,
          total_ratings: comp.user_ratings_total,
          types: [type],
        }))
      )
    }
  }

  return competitors
}
