/**
 * Stakeholder Outcomes Engine (SOE)
 * Implements Bob's framework: Home Run/Triple/Double/Single/Miss outcomes
 */

import { createClient } from '@/lib/supabase/server';

export type Stakeholder = 'admin' | 'teachers' | 'parents' | 'students' | 'board';
export type OutcomeLevel = 'home_run' | 'triple' | 'double' | 'single' | 'miss';

export interface StakeholderMatrix {
  id: string;
  districtId: string;
  stakeholder: Stakeholder;
  outcomeLevel: OutcomeLevel;
  uptakeScore: number | null; // 0-100
  resistanceScore: number | null; // 0-100
  notes: string | null;
}

export interface StakeholderMatrixFull {
  district: any;
  stakeholders: StakeholderMatrix[];
  summary: {
    totalStakeholders: number;
    homeRuns: number;
    triples: number;
    doubles: number;
    singles: number;
    misses: number;
    averageUptake: number;
    averageResistance: number;
  };
}

/**
 * Get stakeholder matrix for a district
 */
export async function getStakeholderMatrix(districtId: string): Promise<StakeholderMatrix[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('stakeholder_matrix')
    .select('*')
    .eq('district_id', districtId)
    .order('stakeholder', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get full stakeholder matrix with summary
 */
export async function getStakeholderMatrixFull(districtId: string): Promise<StakeholderMatrixFull> {
  const [stakeholders, district] = await Promise.all([
    getStakeholderMatrix(districtId),
    getDistrict(districtId),
  ]);

  const summary = {
    totalStakeholders: stakeholders.length,
    homeRuns: stakeholders.filter(s => s.outcomeLevel === 'home_run').length,
    triples: stakeholders.filter(s => s.outcomeLevel === 'triple').length,
    doubles: stakeholders.filter(s => s.outcomeLevel === 'double').length,
    singles: stakeholders.filter(s => s.outcomeLevel === 'single').length,
    misses: stakeholders.filter(s => s.outcomeLevel === 'miss').length,
    averageUptake: calculateAverage(stakeholders.map(s => s.uptakeScore)),
    averageResistance: calculateAverage(stakeholders.map(s => s.resistanceScore)),
  };

  return {
    district,
    stakeholders,
    summary,
  };
}

/**
 * Update or create stakeholder matrix entry
 */
export async function updateStakeholderMatrix(
  districtId: string,
  stakeholder: Stakeholder,
  data: {
    outcomeLevel: OutcomeLevel;
    uptakeScore?: number | null;
    resistanceScore?: number | null;
    notes?: string | null;
  }
): Promise<StakeholderMatrix> {
  const supabase = await createClient();

  const updateData = {
    district_id: districtId,
    stakeholder,
    outcome_level: data.outcomeLevel,
    uptake_score: data.uptakeScore ?? null,
    resistance_score: data.resistanceScore ?? null,
    notes: data.notes ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data: result, error } = await supabase
    .from('stakeholder_matrix')
    .upsert(updateData, {
      onConflict: 'district_id,stakeholder',
    })
    .select()
    .single();

  if (error) throw error;
  return result;
}

/**
 * Initialize stakeholder matrix for a district (create all entries)
 */
export async function initializeStakeholderMatrix(districtId: string): Promise<void> {
  const stakeholders: Stakeholder[] = ['admin', 'teachers', 'parents', 'students', 'board'];
  const supabase = await createClient();

  const inserts = stakeholders.map(stakeholder => ({
    district_id: districtId,
    stakeholder,
    outcome_level: 'miss' as OutcomeLevel, // Default to miss until assessed
    uptake_score: null,
    resistance_score: null,
  }));

  const { error } = await supabase
    .from('stakeholder_matrix')
    .upsert(inserts, {
      onConflict: 'district_id,stakeholder',
      ignoreDuplicates: true,
    });

  if (error) throw error;
}

/**
 * Calculate "Least Resistance Plan" score
 * Formula: (Uptake × Coverage) / (Resistance × Cost)
 * Simplified: (averageUptake * stakeholderCount) / (averageResistance * 1)
 */
export function calculateLeastResistanceScore(matrix: StakeholderMatrix[]): number {
  if (matrix.length === 0) return 0;

  const avgUptake = calculateAverage(matrix.map(m => m.uptakeScore));
  const avgResistance = calculateAverage(matrix.map(m => m.resistanceScore));
  const coverage = matrix.length / 5; // 5 total stakeholder groups

  if (avgResistance === 0) return 100; // No resistance = perfect score

  const score = (avgUptake * coverage) / (avgResistance / 100); // Normalize resistance
  return Math.min(100, Math.max(0, score));
}

/**
 * Get recommended interventions based on stakeholder matrix
 */
export function getRecommendedInterventions(matrix: StakeholderMatrix[]): Array<{
  stakeholder: Stakeholder;
  priority: 'high' | 'medium' | 'low';
  intervention: string;
  reason: string;
}> {
  const interventions: Array<{
    stakeholder: Stakeholder;
    priority: 'high' | 'medium' | 'low';
    intervention: string;
    reason: string;
  }> = [];

  for (const entry of matrix) {
    if (entry.outcomeLevel === 'miss' || entry.outcomeLevel === 'single') {
      const priority = entry.outcomeLevel === 'miss' ? 'high' : 'medium';
      let intervention = '';
      let reason = '';

      switch (entry.stakeholder) {
        case 'admin':
          intervention = '60-minute AI governance training + board-ready policy framework';
          reason = 'Admin needs foundation to lead change';
          break;
        case 'teachers':
          intervention = '45-minute practical AI session + acceptable use guidelines';
          reason = 'Teachers need hands-on confidence';
          break;
        case 'parents':
          intervention = '20-minute info session + FAQ sheet + opt-out process';
          reason = 'Parents need transparency and control';
          break;
        case 'students':
          intervention = 'Age-appropriate AI literacy curriculum';
          reason = 'Students need safe AI usage skills';
          break;
        case 'board':
          intervention = 'Executive briefing + risk/benefit analysis';
          reason = 'Board needs governance clarity';
          break;
      }

      interventions.push({ stakeholder: entry.stakeholder, priority, intervention, reason });
    }
  }

  return interventions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

function calculateAverage(values: Array<number | null>): number {
  const validValues = values.filter((v): v is number => v !== null && v !== undefined);
  if (validValues.length === 0) return 0;
  return validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
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
