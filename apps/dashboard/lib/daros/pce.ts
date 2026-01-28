/**
 * Policy & Controls Engine (PCE)
 * Rules-driven checklist system for privacy-by-design controls
 */

import { createClient } from '@/lib/supabase/server';

export interface Control {
  id: string;
  domain: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string | null;
}

export interface DistrictControl {
  id: string;
  districtId: string;
  controlId: string;
  status: 'not_started' | 'partial' | 'complete' | 'not_applicable';
  evidenceUrl: string | null;
  ownerRole: string | null;
  riskLevel: 'low' | 'medium' | 'high' | null;
  notes: string | null;
  completedAt: string | null;
}

export interface ControlSummary {
  total: number;
  complete: number;
  partial: number;
  notStarted: number;
  notApplicable: number;
  byDomain: Record<string, {
    total: number;
    complete: number;
    critical: number;
  }>;
}

/**
 * Get all available controls
 */
export async function getAllControls(): Promise<Control[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('controls')
    .select('*')
    .order('domain', { ascending: true })
    .order('priority', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get controls by domain
 */
export async function getControlsByDomain(domain: string): Promise<Control[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('controls')
    .select('*')
    .eq('domain', domain)
    .order('priority', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get district's control implementation status
 */
export async function getDistrictControls(districtId: string): Promise<DistrictControl[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('district_controls')
    .select('*')
    .eq('district_id', districtId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get control summary for a district
 */
export async function getControlSummary(districtId: string): Promise<ControlSummary> {
  const [allControls, districtControls] = await Promise.all([
    getAllControls(),
    getDistrictControls(districtId),
  ]);

  const districtControlMap = new Map(
    districtControls.map(dc => [dc.controlId, dc])
  );

  const summary: ControlSummary = {
    total: allControls.length,
    complete: 0,
    partial: 0,
    notStarted: 0,
    notApplicable: 0,
    byDomain: {},
  };

  for (const control of allControls) {
    const districtControl = districtControlMap.get(control.id);
    const status = districtControl?.status || 'not_started';

    // Update counts
    if (status === 'complete') summary.complete++;
    else if (status === 'partial') summary.partial++;
    else if (status === 'not_applicable') summary.notApplicable++;
    else summary.notStarted++;

    // Update domain stats
    if (!summary.byDomain[control.domain]) {
      summary.byDomain[control.domain] = {
        total: 0,
        complete: 0,
        critical: 0,
      };
    }
    summary.byDomain[control.domain].total++;
    if (status === 'complete') {
      summary.byDomain[control.domain].complete++;
    }
    if (control.priority === 'critical') {
      summary.byDomain[control.domain].critical++;
    }
  }

  return summary;
}

/**
 * Update or create district control status
 */
export async function updateDistrictControl(
  districtId: string,
  controlId: string,
  data: {
    status?: DistrictControl['status'];
    evidenceUrl?: string | null;
    ownerRole?: string | null;
    riskLevel?: DistrictControl['riskLevel'];
    notes?: string | null;
  }
): Promise<DistrictControl> {
  const supabase = await createClient();

  const updateData: any = {
    district_id: districtId,
    control_id: controlId,
    ...data,
    updated_at: new Date().toISOString(),
  };

  if (data.status === 'complete' && !updateData.completed_at) {
    updateData.completed_at = new Date().toISOString();
  }

  const { data: result, error } = await supabase
    .from('district_controls')
    .upsert(updateData, {
      onConflict: 'district_id,control_id',
    })
    .select()
    .single();

  if (error) throw error;
  return result;
}

/**
 * Initialize controls for a district (create all district_controls entries)
 */
export async function initializeDistrictControls(districtId: string): Promise<void> {
  const controls = await getAllControls();
  const supabase = await createClient();

  const inserts = controls.map(control => ({
    district_id: districtId,
    control_id: control.id,
    status: 'not_started' as const,
  }));

  const { error } = await supabase
    .from('district_controls')
    .upsert(inserts, {
      onConflict: 'district_id,control_id',
      ignoreDuplicates: true,
    });

  if (error) throw error;
}

/**
 * Generate controls checklist artifact (for PDF generation)
 */
export async function generateControlsChecklist(districtId: string): Promise<{
  district: any;
  controls: Array<Control & { districtControl: DistrictControl | null }>;
  summary: ControlSummary;
}> {
  const [allControls, districtControls, district] = await Promise.all([
    getAllControls(),
    getDistrictControls(districtId),
    getDistrict(districtId),
  ]);

  const districtControlMap = new Map(
    districtControls.map(dc => [dc.controlId, dc])
  );

  const controlsWithStatus = allControls.map(control => ({
    ...control,
    districtControl: districtControlMap.get(control.id) || null,
  }));

  const summary = await getControlSummary(districtId);

  return {
    district,
    controls: controlsWithStatus,
    summary,
  };
}

async function getDistrict(districtId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('districts')
    .select('*')
    .eq('id', districtId)
    .single();

  if (error) throw error;
  return data;
}
