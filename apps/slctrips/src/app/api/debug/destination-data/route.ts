import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerComponent';

/**
 * Diagnostic API endpoint to check destination data structure
 * Usage: /api/debug/destination-data?slug=international-peace-gardens
 */
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { error: 'Please provide a slug parameter, e.g., ?slug=international-peace-gardens' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();
    
    // Fetch the destination
    const { data: destination, error } = await supabase
      .from('public_destinations')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: 'Database error', details: error },
        { status: 500 }
      );
    }

    if (!destination) {
      return NextResponse.json(
        { error: 'Destination not found', slug },
        { status: 404 }
      );
    }

    // Analyze the data structure
    const analysis = {
      slug,
      name: destination.name,
      id: destination.id,
      fields: {
        photo_gallery: {
          value: destination.photo_gallery,
          type: typeof destination.photo_gallery,
          isArray: Array.isArray(destination.photo_gallery),
          isNull: destination.photo_gallery === null,
          isUndefined: destination.photo_gallery === undefined,
          length: Array.isArray(destination.photo_gallery) ? destination.photo_gallery.length : 'N/A',
        },
        contact_info: {
          value: destination.contact_info,
          type: typeof destination.contact_info,
          isObject: typeof destination.contact_info === 'object' && destination.contact_info !== null,
          hours: destination.contact_info?.hours,
          hours_type: typeof destination.contact_info?.hours,
          hours_isArray: Array.isArray(destination.contact_info?.hours),
        },
        nearby_food: {
          value: destination.nearby_food,
          type: typeof destination.nearby_food,
          isNull: destination.nearby_food === null,
          isUndefined: destination.nearby_food === undefined,
          isString: typeof destination.nearby_food === 'string',
          stringLength: typeof destination.nearby_food === 'string' ? destination.nearby_food.length : 'N/A',
          isArray: Array.isArray(destination.nearby_food),
          arrayLength: Array.isArray(destination.nearby_food) ? destination.nearby_food.length : 'N/A',
        },
        nearby_lodging: {
          value: destination.nearby_lodging,
          type: typeof destination.nearby_lodging,
          isNull: destination.nearby_lodging === null,
          isUndefined: destination.nearby_lodging === undefined,
          isString: typeof destination.nearby_lodging === 'string',
          stringLength: typeof destination.nearby_lodging === 'string' ? destination.nearby_lodging.length : 'N/A',
          isArray: Array.isArray(destination.nearby_lodging),
          arrayLength: Array.isArray(destination.nearby_lodging) ? destination.nearby_lodging.length : 'N/A',
        },
        nearby_attractions: {
          value: destination.nearby_attractions,
          type: typeof destination.nearby_attractions,
          isNull: destination.nearby_attractions === null,
          isUndefined: destination.nearby_attractions === undefined,
          isString: typeof destination.nearby_attractions === 'string',
          stringLength: typeof destination.nearby_attractions === 'string' ? destination.nearby_attractions.length : 'N/A',
          isArray: Array.isArray(destination.nearby_attractions),
          arrayLength: Array.isArray(destination.nearby_attractions) ? destination.nearby_attractions.length : 'N/A',
        },
        video_urls: {
          value: (destination as any).video_urls,
          type: typeof (destination as any).video_urls,
          exists: (destination as any).video_urls !== undefined,
        },
        podcast_url: {
          value: (destination as any).podcast_url,
          type: typeof (destination as any).podcast_url,
          exists: (destination as any).podcast_url !== undefined,
        },
      },
    };

    return NextResponse.json(analysis, { status: 200 });
  } catch (error) {
    console.error('Error in diagnostic endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

