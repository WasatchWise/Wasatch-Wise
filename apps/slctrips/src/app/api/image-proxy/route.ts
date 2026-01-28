import { NextRequest, NextResponse } from 'next/server';

// Allowed domains for image proxy (security: prevent SSRF attacks)
const ALLOWED_DOMAINS = [
  'maps.googleapis.com',
  'lh3.googleusercontent.com',
  'lh4.googleusercontent.com',
  'lh5.googleusercontent.com',
  'storage.googleapis.com',
  'images.unsplash.com',
  'mkepcjzqnbowrgbvjfem.supabase.co', // Supabase storage
];

function isAllowedUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    // Only allow HTTPS (except for localhost in dev)
    if (url.protocol !== 'https:') {
      return false;
    }
    // Check against whitelist
    return ALLOWED_DOMAINS.some(domain => url.hostname === domain || url.hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
  }

  // Security: Validate URL against whitelist
  if (!isAllowedUrl(imageUrl)) {
    console.warn('Image proxy blocked unauthorized URL:', imageUrl.substring(0, 100));
    return NextResponse.json({ error: 'URL not allowed' }, { status: 403 });
  }

  try {
    // If it's a Google Maps Place Photo URL, replace the old API key with the new one
    let proxyUrl = imageUrl;

    if (imageUrl.includes('maps.googleapis.com/maps/api/place/photo')) {
      // Replace any existing key parameter with the current API key
      const currentApiKey = process.env.GOOGLE_PLACES_API_KEY;

      if (currentApiKey) {
        // Remove old key parameter and add new one
        proxyUrl = imageUrl.replace(/&key=[^&]+/, '') + `&key=${currentApiKey}`;
      }
    }

    // Fetch the image
    const response = await fetch(proxyUrl);

    if (!response.ok) {
      console.error(`Image proxy failed for ${proxyUrl}: ${response.status}`);
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: response.status });
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json({ error: 'Image proxy failed' }, { status: 500 });
  }
}
