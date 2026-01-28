import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 1800; // Cache for 30 minutes

export async function GET() {
  try {
    // Check for API key (support both env var names)
    const API_KEY = process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

    if (!API_KEY || API_KEY === 'demo') {
      // Return default weather if API key not configured
      return NextResponse.json({
        temp: 65,
        condition: 'clear',
        cached: false
      });
    }

    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=Salt Lake City,US&appid=${API_KEY}&units=imperial`,
      { next: { revalidate: 1800 } } // Cache for 30 minutes
    );

    if (!weatherRes.ok) {
      throw new Error('Weather API request failed');
    }

    const weatherData = await weatherRes.json();

    return NextResponse.json({
      temp: Math.round(weatherData.main.temp),
      condition: weatherData.weather[0].main.toLowerCase(),
      cached: false
    });
  } catch (error) {
    console.error('Weather fetch error:', error);

    // Return default weather on error
    return NextResponse.json({
      temp: 65,
      condition: 'clear',
      cached: false
    });
  }
}
