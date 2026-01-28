/**
 * Vendor & Data Flow Mapper (VDFM)
 * Ties AI usage to vendor risk and privacy compliance
 */

import { createClient } from '@/lib/supabase/server';

export interface Vendor {
  id: string;
  name: string;
  category: string | null;
  website: string | null;
}

export interface DistrictVendor {
  id: string;
  districtId: string;
  vendorId: string;
  contractUrl: string | null;
  dataTypes: string[]; // e.g., ['student_pii', 'behavioral', 'location']
  aiUsageLevel: 'none' | 'embedded' | 'teacher_used' | 'student_facing';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  notes: string | null;
  vendor?: Vendor;
}

export interface VendorRiskSummary {
  total: number;
  byRiskLevel: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  byAIUsage: {
    none: number;
    embedded: number;
    teacher_used: number;
    student_facing: number;
  };
  byDataTypes: Record<string, number>;
}

/**
 * Get all vendors
 */
export async function getAllVendors(): Promise<Vendor[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get district vendors with full vendor details
 */
export async function getDistrictVendors(districtId: string): Promise<DistrictVendor[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('district_vendors')
    .select(`
      *,
      vendor:vendors(*)
    `)
    .eq('district_id', districtId)
    .order('risk_level', { ascending: false });

  if (error) throw error;
  return (data || []).map((dv: any) => ({
    ...dv,
    vendor: dv.vendor,
  }));
}

/**
 * Get vendor risk summary for a district
 */
export async function getVendorRiskSummary(districtId: string): Promise<VendorRiskSummary> {
  const vendors = await getDistrictVendors(districtId);

  const summary: VendorRiskSummary = {
    total: vendors.length,
    byRiskLevel: {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    },
    byAIUsage: {
      none: 0,
      embedded: 0,
      teacher_used: 0,
      student_facing: 0,
    },
    byDataTypes: {},
  };

  for (const vendor of vendors) {
    // Count by risk level
    summary.byRiskLevel[vendor.riskLevel]++;

    // Count by AI usage
    summary.byAIUsage[vendor.aiUsageLevel]++;

    // Count by data types
    for (const dataType of vendor.dataTypes) {
      summary.byDataTypes[dataType] = (summary.byDataTypes[dataType] || 0) + 1;
    }
  }

  return summary;
}

/**
 * Add or update district vendor
 */
export async function upsertDistrictVendor(
  districtId: string,
  vendorId: string,
  data: {
    contractUrl?: string | null;
    dataTypes?: string[];
    aiUsageLevel?: DistrictVendor['aiUsageLevel'];
    riskLevel?: DistrictVendor['riskLevel'];
    notes?: string | null;
  }
): Promise<DistrictVendor> {
  const supabase = await createClient();

  const updateData = {
    district_id: districtId,
    vendor_id: vendorId,
    contract_url: data.contractUrl ?? null,
    data_types: data.dataTypes || [],
    ai_usage_level: data.aiUsageLevel || 'none',
    risk_level: data.riskLevel || 'low',
    notes: data.notes ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data: result, error } = await supabase
    .from('district_vendors')
    .upsert(updateData, {
      onConflict: 'district_id,vendor_id',
    })
    .select(`
      *,
      vendor:vendors(*)
    `)
    .single();

  if (error) throw error;
  return {
    ...result,
    vendor: (result as any).vendor,
  };
}

/**
 * Create or find vendor by name
 */
export async function findOrCreateVendor(name: string, category?: string): Promise<Vendor> {
  const supabase = await createClient();

  // Try to find existing
  const { data: existing } = await supabase
    .from('vendors')
    .select('*')
    .eq('name', name)
    .single();

  if (existing) return existing;

  // Create new
  const { data: created, error } = await supabase
    .from('vendors')
    .insert({
      name,
      category: category || null,
    })
    .select()
    .single();

  if (error) throw error;
  return created;
}

/**
 * Import vendors from CSV/data
 */
export async function importDistrictVendors(
  districtId: string,
  vendors: Array<{
    name: string;
    category?: string;
    contractUrl?: string;
    dataTypes?: string[];
    aiUsageLevel?: DistrictVendor['aiUsageLevel'];
    riskLevel?: DistrictVendor['riskLevel'];
    notes?: string;
  }>
): Promise<DistrictVendor[]> {
  const results: DistrictVendor[] = [];

  for (const vendorData of vendors) {
    const vendor = await findOrCreateVendor(vendorData.name, vendorData.category);
    const districtVendor = await upsertDistrictVendor(districtId, vendor.id, {
      contractUrl: vendorData.contractUrl,
      dataTypes: vendorData.dataTypes,
      aiUsageLevel: vendorData.aiUsageLevel,
      riskLevel: vendorData.riskLevel,
      notes: vendorData.notes,
    });
    results.push(districtVendor);
  }

  return results;
}

/**
 * Calculate vendor risk score (0-100, higher = more risk)
 */
export function calculateVendorRiskScore(vendor: DistrictVendor): number {
  let score = 0;

  // Risk level base score
  const riskScores = {
    low: 10,
    medium: 40,
    high: 70,
    critical: 100,
  };
  score = riskScores[vendor.riskLevel];

  // AI usage adds risk
  const aiRiskScores = {
    none: 0,
    embedded: 10,
    teacher_used: 20,
    student_facing: 30,
  };
  score += aiRiskScores[vendor.aiUsageLevel];

  // Data types add risk
  const highRiskDataTypes = ['student_pii', 'behavioral', 'location', 'biometric'];
  const hasHighRiskData = vendor.dataTypes.some(dt => highRiskDataTypes.includes(dt));
  if (hasHighRiskData) score += 20;

  // No contract = higher risk
  if (!vendor.contractUrl) score += 15;

  return Math.min(100, score);
}

/**
 * Generate vendor risk map artifact
 */
export async function generateVendorRiskMap(districtId: string): Promise<{
  district: any;
  vendors: DistrictVendor[];
  summary: VendorRiskSummary;
  riskScores: Array<{ vendor: Vendor; score: number }>;
}> {
  const [vendors, district] = await Promise.all([
    getDistrictVendors(districtId),
    getDistrict(districtId),
  ]);

  const summary = await getVendorRiskSummary(districtId);

  const riskScores = vendors.map(v => ({
    vendor: v.vendor!,
    score: calculateVendorRiskScore(v),
  })).sort((a, b) => b.score - a.score);

  return {
    district,
    vendors,
    summary,
    riskScores,
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
