import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use Service Role to bypass RLS (since this is a public lookup)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Control {
  id: string;
  priority: string;
}

interface DistrictControl {
  district_id: string;
  control_id: string;
  status: string;
}

/**
 * Compute status for multiple districts efficiently (single batch query)
 * Red: <50% complete or any critical control incomplete
 * Yellow: 50-80% complete
 * Green: >80% complete with all critical controls done
 */
function computeDistrictStatuses(
  controls: Control[],
  allDistrictControls: DistrictControl[],
  districtIds: string[]
): Map<string, 'red' | 'yellow' | 'green'> {
  const statusMap = new Map<string, 'red' | 'yellow' | 'green'>();

  if (!controls || controls.length === 0) {
    // No controls defined yet - all districts get yellow
    for (const id of districtIds) {
      statusMap.set(id, 'yellow');
    }
    return statusMap;
  }

  // Group district controls by district_id for O(1) lookup
  const controlsByDistrict = new Map<string, Map<string, string>>();
  for (const dc of allDistrictControls || []) {
    if (!controlsByDistrict.has(dc.district_id)) {
      controlsByDistrict.set(dc.district_id, new Map());
    }
    controlsByDistrict.get(dc.district_id)!.set(dc.control_id, dc.status);
  }

  // Compute status for each district
  for (const districtId of districtIds) {
    const districtControlMap = controlsByDistrict.get(districtId) || new Map();
    let complete = 0;
    let criticalIncomplete = false;

    for (const control of controls) {
      const status = districtControlMap.get(control.id) || 'not_started';
      if (status === 'complete' || status === 'not_applicable') {
        complete++;
      } else if (control.priority === 'critical') {
        criticalIncomplete = true;
      }
    }

    const completionRate = complete / controls.length;

    if (criticalIncomplete || completionRate < 0.5) {
      statusMap.set(districtId, 'red');
    } else if (completionRate < 0.8) {
      statusMap.set(districtId, 'yellow');
    } else {
      statusMap.set(districtId, 'green');
    }
  }

  return statusMap;
}

/**
 * GET /api/daros/districts
 * List all districts with computed status
 */
export async function GET() {
  try {
    // Fetch all data in parallel
    const [
      { data: districts, error: districtsError },
      { data: controls, error: controlsError },
      { data: allDistrictControls, error: dcError },
    ] = await Promise.all([
      supabaseAdmin.from('districts').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('controls').select('id, priority'),
      supabaseAdmin.from('district_controls').select('district_id, control_id, status'),
    ]);

    if (districtsError) throw districtsError;
    if (controlsError) throw controlsError;
    if (dcError) throw dcError;

    const districtIds = (districts || []).map(d => d.id);
    const statusMap = computeDistrictStatuses(
      controls || [],
      allDistrictControls || [],
      districtIds
    );

    // Attach status to each district
    const districtsWithStatus = (districts || []).map((district) => ({
      ...district,
      status: statusMap.get(district.id) || 'yellow',
    }));

    return NextResponse.json({ districts: districtsWithStatus });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch districts';
    console.error('Error fetching districts:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

interface CreateDistrictBody {
  name?: string;
  state?: string;
  size_band?: string;
  contacts?: Record<string, unknown>;
}

/**
 * POST /api/daros/districts
 * Create a new district
 */
export async function POST(req: NextRequest) {
  try {
    const body: CreateDistrictBody = await req.json();
    const { name, state, size_band, contacts } = body;

    if (!name || !state) {
      return NextResponse.json(
        { error: 'Name and state are required' },
        { status: 400 }
      );
    }

    // Check if district already exists
    const { data: existing } = await supabaseAdmin
      .from('districts')
      .select('*')
      .eq('name', name)
      .eq('state', state)
      .single();

    if (existing) {
      return NextResponse.json({ district: existing });
    }

    const { data, error } = await supabaseAdmin
      .from('districts')
      .insert({
        name,
        state,
        size_band: size_band || 'medium',
        contacts: contacts || {},
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ district: data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create district';
    console.error('Error creating district:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
