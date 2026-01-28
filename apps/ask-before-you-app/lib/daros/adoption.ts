/**
 * Adoption Plan Generator
 * Creates 30/60/90 day adoption plans based on stakeholder matrix
 */

import { createClient } from '@/lib/supabase/server';
import { getStakeholderMatrixFull, getRecommendedInterventions } from './soe';
import { getControlSummary } from './pce';
import { getVendorRiskSummary } from './vdfm';

export interface AdoptionPhase {
  days: number;
  label: string;
  goals: string[];
  interventions: Array<{
    stakeholder: string;
    type: string;
    title: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  successMetrics: string[];
}

export interface AdoptionPlan {
  id: string;
  districtId: string;
  planType: '30_60_90' | 'custom';
  phases: AdoptionPhase[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Generate 30/60/90 day adoption plan
 */
export async function generateAdoptionPlan(districtId: string): Promise<AdoptionPlan> {
  const [matrix, controls, vendors] = await Promise.all([
    getStakeholderMatrixFull(districtId),
    getControlSummary(districtId),
    getVendorRiskSummary(districtId),
  ]);

  const interventions = getRecommendedInterventions(matrix.stakeholders);

  // Phase 1: 30 Days - Quick Wins
  const phase1: AdoptionPhase = {
    days: 30,
    label: 'Foundation & Quick Wins',
    goals: [
      'Establish policy foundation',
      'Create AI tool inventory',
      'Launch parent communication',
      'Identify 2-3 safe pilot tools',
    ],
    interventions: interventions
      .filter(i => i.priority === 'high')
      .slice(0, 3)
      .map(i => ({
        stakeholder: i.stakeholder,
        type: i.intervention.split(':')[0] || 'training',
        title: i.intervention,
        priority: i.priority,
      })),
    successMetrics: [
      `Draft acceptable use policy completed`,
      `${vendors.total} vendors inventoried`,
      `Parent communication sent`,
      `2-3 pilot tools identified`,
    ],
  };

  // Phase 2: 60 Days - Infrastructure
  const phase2: AdoptionPhase = {
    days: 60,
    label: 'Infrastructure & Training',
    goals: [
      'Complete vendor risk assessments',
      'Launch teacher training program',
      'Establish monitoring process',
      'Board presentation delivered',
    ],
    interventions: interventions
      .filter(i => i.priority === 'medium' || (i.priority === 'high' && !phase1.interventions.some(p1 => p1.stakeholder === i.stakeholder)))
      .slice(0, 4)
      .map(i => ({
        stakeholder: i.stakeholder,
        type: i.intervention.split(':')[0] || 'training',
        title: i.intervention,
        priority: i.priority,
      })),
    successMetrics: [
      `${vendors.total} vendor assessments complete`,
      `Teacher training launched (${matrix.summary.triples} stakeholder groups)`,
      `Monitoring dashboard active`,
      `Board governance framework approved`,
    ],
  };

  // Phase 3: 90 Days - Full Adoption
  const phase3: AdoptionPhase = {
    days: 90,
    label: 'Full Implementation',
    goals: [
      'Full policy implementation',
      'Ongoing training cadence established',
      'Incident response protocols active',
      'Regular board updates scheduled',
    ],
    interventions: interventions
      .filter(i => !phase1.interventions.some(p1 => p1.stakeholder === i.stakeholder) &&
                   !phase2.interventions.some(p2 => p2.stakeholder === i.stakeholder))
      .map(i => ({
        stakeholder: i.stakeholder,
        type: i.intervention.split(':')[0] || 'training',
        title: i.intervention,
        priority: i.priority,
      })),
    successMetrics: [
      `${controls.complete}/${controls.total} controls implemented`,
      `All stakeholder groups at "triple" or better`,
      `Incident response plan tested`,
      `Quarterly board update schedule established`,
    ],
  };

  // Save to database
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from('adoption_plans')
    .select('id')
    .eq('district_id', districtId)
    .single();

  const planData = {
    district_id: districtId,
    plan_type: '30_60_90' as const,
    phases: [phase1, phase2, phase3],
    updated_at: new Date().toISOString(),
  };

  let plan: AdoptionPlan;
  if (existing) {
    const { data, error } = await supabase
      .from('adoption_plans')
      .update(planData)
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    plan = data;
  } else {
    const { data, error } = await supabase
      .from('adoption_plans')
      .insert(planData)
      .select()
      .single();
    if (error) throw error;
    plan = data;
  }

  return plan;
}

/**
 * Get adoption plan for district
 */
export async function getAdoptionPlan(districtId: string): Promise<AdoptionPlan | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('adoption_plans')
    .select('*')
    .eq('district_id', districtId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data || null;
}
