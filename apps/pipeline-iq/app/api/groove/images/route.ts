/**
 * API endpoint for serving Groove-related images
 * Returns placeholder or actual image URLs based on vertical
 */

import { NextRequest, NextResponse } from 'next/server'

type VerticalType = 'hospitality' | 'senior_living' | 'multifamily' | 'student_commercial' | 'general'

interface ImageResponse {
  hero?: string
  icon?: string
  gallery?: string[]
}

// Placeholder images - replace with actual URLs when available
const IMAGE_URLS: Record<VerticalType, ImageResponse> = {
  hospitality: {
    hero: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&h=600&fit=crop',
    icon: 'https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?w=400&h=400&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop',
    ],
  },
  senior_living: {
    hero: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop',
    icon: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=400&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop',
    ],
  },
  multifamily: {
    hero: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=600&fit=crop',
    icon: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=400&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600&h=400&fit=crop',
    ],
  },
  student_commercial: {
    hero: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&h=600&fit=crop',
    icon: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=400&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop',
    ],
  },
  general: {
    hero: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=600&fit=crop',
    icon: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop',
    gallery: [],
  },
}

/**
 * GET /api/groove/images?vertical=hospitality
 * Returns image URLs for a specific vertical
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const vertical = (searchParams.get('vertical') || 'general') as VerticalType

  const images = IMAGE_URLS[vertical] || IMAGE_URLS.general

  return NextResponse.json({
    vertical,
    images,
    // Include source info for attribution if needed
    source: 'unsplash',
  })
}

