import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/daros/districts/[id]
 * Get a single district with all related data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch district and all related data in parallel
    const [
      { data: district, error: districtError },
      { data: controls },
      { data: districtControls },
      { data: stakeholderMatrix },
      { data: artifacts },
      { data: briefingSessions },
      { data: vendors },
      { data: adoptionPlans },
    ] = await Promise.all([
      supabase.from('districts').select('*').eq('id', id).single(),
      supabase.from('controls').select('*').order('domain').order('priority', { ascending: false }),
      supabase.from('district_controls').select('*').eq('district_id', id),
      supabase.from('stakeholder_matrix').select('*').eq('district_id', id),
      supabase.from('artifacts').select('*').eq('district_id', id).order('created_at', { ascending: false }),
      supabase.from('briefing_sessions').select('*').eq('district_id', id).order('session_date', { ascending: false }),
      supabase
        .from('district_vendors')
        .select('*, vendor:vendors(*)')
        .eq('district_id', id),
      supabase.from('adoption_plans').select('*').eq('district_id', id).order('created_at', { ascending: false }),
    ]);

    if (districtError) {
      if (districtError.code === 'PGRST116') {
        return NextResponse.json({ error: 'District not found' }, { status: 404 });
      }
      throw districtError;
    }

    // Build controls with their district-specific status
    const controlStatusMap = new Map(
      (districtControls || []).map(dc => [dc.control_id, dc])
    );

    const controlsWithStatus = (controls || []).map(control => ({
      ...control,
      districtControl: controlStatusMap.get(control.id) || null,
    }));

    // Compute control summary
    let complete = 0;
    let partial = 0;
    let notStarted = 0;
    let criticalIncomplete = false;

    for (const control of controls || []) {
      const status = controlStatusMap.get(control.id)?.status || 'not_started';
      if (status === 'complete' || status === 'not_applicable') complete++;
      else if (status === 'partial') partial++;
      else notStarted++;

      if (control.priority === 'critical' && status !== 'complete' && status !== 'not_applicable') {
        criticalIncomplete = true;
      }
    }

    const totalControls = controls?.length || 0;
    const completionRate = totalControls > 0 ? complete / totalControls : 0;

    let status: 'red' | 'yellow' | 'green';
    if (criticalIncomplete || completionRate < 0.5) {
      status = 'red';
    } else if (completionRate < 0.8) {
      status = 'yellow';
    } else {
      status = 'green';
    }

    // Build stakeholder matrix map for easy lookup
    const stakeholderMap = new Map(
      (stakeholderMatrix || []).map(sm => [sm.stakeholder, sm])
    );

    return NextResponse.json({
      district: {
        ...district,
        status,
      },
      controls: controlsWithStatus,
      controlsSummary: {
        total: totalControls,
        complete,
        partial,
        notStarted,
        completionRate: Math.round(completionRate * 100),
      },
      stakeholderMatrix: {
        admin: stakeholderMap.get('admin') || null,
        teachers: stakeholderMap.get('teachers') || null,
        parents: stakeholderMap.get('parents') || null,
        students: stakeholderMap.get('students') || null,
        board: stakeholderMap.get('board') || null,
      },
      artifacts: artifacts || [],
      briefingSessions: briefingSessions || [],
      vendors: vendors || [],
      adoptionPlans: adoptionPlans || [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch district';
    console.error('Error fetching district:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

interface UpdateDistrictBody {
  name?: string;
  state?: string;
  size_band?: string;
  contacts?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

interface DistrictUpdateData {
  updated_at: string;
  name?: string;
  state?: string;
  size_band?: string;
  contacts?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * PATCH /api/daros/districts/[id]
 * Update a district
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateDistrictBody = await request.json();
    const { name, state, size_band, contacts, metadata } = body;

    const supabase = await createClient();

    const updateData: DistrictUpdateData = { updated_at: new Date().toISOString() };
    if (name !== undefined) updateData.name = name;
    if (state !== undefined) updateData.state = state;
    if (size_band !== undefined) updateData.size_band = size_band;
    if (contacts !== undefined) updateData.contacts = contacts;
    if (metadata !== undefined) updateData.metadata = metadata;

    const { data, error } = await supabase
      .from('districts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'District not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ district: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update district';
    console.error('Error updating district:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/daros/districts/[id]
 * Delete a district
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase.from('districts').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete district';
    console.error('Error deleting district:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
