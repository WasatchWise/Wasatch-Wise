/**
 * Briefing Session Workflow
 * Manages 60-minute briefing sessions and artifact generation
 */

import { createClient } from '@/lib/supabase/server';
import { generateBriefingArtifacts } from './artifacts';
import { initializeStakeholderMatrix } from './soe';
import { initializeDistrictControls } from './pce';

export interface BriefingSession {
  id: string;
  districtId: string;
  sessionDate: string;
  facilitator: string | null;
  participants: Array<{
    name: string;
    role: string;
    email?: string;
  }>;
  agendaItems: string[];
  outcomes: Record<string, any>;
  artifactsGenerated: string[]; // Artifact IDs
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes: string | null;
}

/**
 * Create a new briefing session
 */
export async function createBriefingSession(
  districtId: string,
  data: {
    sessionDate: string;
    facilitator?: string;
    participants?: Array<{ name: string; role: string; email?: string }>;
    agendaItems?: string[];
  }
): Promise<BriefingSession> {
  const supabase = await createClient();

  // Initialize district data structures
  await Promise.all([
    initializeStakeholderMatrix(districtId),
    initializeDistrictControls(districtId),
  ]);

  const { data: session, error } = await supabase
    .from('briefing_sessions')
    .insert({
      district_id: districtId,
      session_date: data.sessionDate,
      facilitator: data.facilitator || null,
      participants: data.participants || [],
      agenda_items: data.agendaItems || [
        'Stakeholder assessment',
        'Current state review',
        'Risk identification',
        'Quick wins discussion',
        '30/60/90 plan outline',
      ],
      status: 'scheduled',
    })
    .select()
    .single();

  if (error) throw error;
  return session;
}

/**
 * Start briefing session (mark as in_progress)
 */
export async function startBriefingSession(sessionId: string): Promise<BriefingSession> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('briefing_sessions')
    .update({
      status: 'in_progress',
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Complete briefing session and generate artifacts
 */
export async function completeBriefingSession(
  sessionId: string,
  outcomes: Record<string, any>,
  notes?: string
): Promise<{
  session: BriefingSession;
  artifacts: any[];
}> {
  const supabase = await createClient();

  // Get session
  const { data: session, error: sessionError } = await supabase
    .from('briefing_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (sessionError) throw sessionError;

  // Generate all artifacts
  const { artifacts } = await generateBriefingArtifacts(session.district_id);

  // Update session with outcomes and artifacts
  const { data: updatedSession, error: updateError } = await supabase
    .from('briefing_sessions')
    .update({
      status: 'completed',
      outcomes,
      artifacts_generated: artifacts.map(a => a.id),
      notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (updateError) throw updateError;

  return {
    session: updatedSession,
    artifacts,
  };
}

/**
 * Get briefing session
 */
export async function getBriefingSession(sessionId: string): Promise<BriefingSession> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('briefing_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all briefing sessions for a district
 */
export async function getDistrictBriefingSessions(districtId: string): Promise<BriefingSession[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('briefing_sessions')
    .select('*')
    .eq('district_id', districtId)
    .order('session_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Update briefing session outcomes (during session)
 */
export async function updateBriefingOutcomes(
  sessionId: string,
  outcomes: Record<string, any>
): Promise<BriefingSession> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('briefing_sessions')
    .update({
      outcomes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
