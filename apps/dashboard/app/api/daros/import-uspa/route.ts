/**
 * API Route: Import USPA Agreement Hub Data
 * 
 * POST /api/daros/import-uspa
 * 
 * Body: {
 *   type: 'dynamic_menu' | 'negotiation_tracker',
 *   csvContent: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { importDynamicMenu, importNegotiationTracker } from '@/lib/daros/import-uspa';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, csvContent } = body;
    
    if (!type || !csvContent) {
      return NextResponse.json(
        { error: 'Missing required fields: type, csvContent' },
        { status: 400 }
      );
    }
    
    if (type !== 'dynamic_menu' && type !== 'negotiation_tracker') {
      return NextResponse.json(
        { error: 'Invalid type. Must be "dynamic_menu" or "negotiation_tracker"' },
        { status: 400 }
      );
    }
    
    let result;
    
    if (type === 'dynamic_menu') {
      result = await importDynamicMenu(csvContent);
    } else {
      result = await importNegotiationTracker(csvContent);
    }
    
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('USPA import error:', error);
    return NextResponse.json(
      {
        error: 'Import failed',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
