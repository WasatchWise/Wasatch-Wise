import { NextResponse } from 'next/server'

interface UnsplashPhoto {
  id: string
  urls: {
    regular: string
    full: string
    raw: string
    small: string
    thumb: string
  }
  alt_description?: string
  description?: string
  user: {
    name: string
    username: string
  }
  color?: string
}

interface UnsplashResponse {
  results: UnsplashPhoto[]
  total: number
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || 'Gene Fullmer boxing'
    const perPage = parseInt(searchParams.get('per_page') || '5')

    const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY

    if (!unsplashAccessKey) {
      // Return placeholder structure if no API key
      return NextResponse.json({
        photos: [],
        error: 'Unsplash API key not configured',
        fallback: true,
      })
    }

    // Search Unsplash for photos
    const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`

    const response = await fetch(unsplashUrl, {
      headers: {
        'Authorization': `Client-ID ${unsplashAccessKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.statusText}`)
    }

    const data: UnsplashResponse = await response.json()

    // Transform results to include necessary info
    const photos = data.results.map((photo) => ({
      id: photo.id,
      url: photo.urls.regular,
      fullUrl: photo.urls.full,
      thumbUrl: photo.urls.thumb,
      alt: photo.alt_description || photo.description || query,
      color: photo.color || '#3d2914',
      photographer: photo.user.name,
      photographerUsername: photo.user.username,
      photographerUrl: `https://unsplash.com/@${photo.user.username}`,
    }))

    return NextResponse.json({
      photos,
      query,
      total: data.total,
    })
  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json(
      {
        photos: [],
        error: error instanceof Error ? error.message : 'Failed to fetch images',
        fallback: true,
      },
      { status: 500 }
    )
  }
}

