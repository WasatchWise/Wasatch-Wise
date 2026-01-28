'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

type GuardianProgressTrackerProps = {
  guardianId: string;
  county: string | null;
};

export default function GuardianProgressTracker({ guardianId, county }: GuardianProgressTrackerProps) {
  const { user } = useAuth();
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!user || !county || hasTracked.current) {
      return;
    }

    const trackGuardian = async () => {
      hasTracked.current = true;

      const { data: existing, error: fetchError } = await supabase
        .from('user_guardian_progress')
        .select('id, interaction_count')
        .eq('user_id', user.id)
        .eq('county', county)
        .maybeSingle();

      if (fetchError) {
        console.warn('Guardian progress fetch failed:', fetchError.message);
        return;
      }

      if (existing?.id) {
        const nextCount = (existing.interaction_count || 0) + 1;
        const { error } = await supabase
          .from('user_guardian_progress')
          .update({
            interaction_count: nextCount,
            guardian_id: guardianId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) {
          console.warn('Guardian progress update failed:', error.message);
        }

        return;
      }

      const { error } = await supabase.from('user_guardian_progress').insert({
        user_id: user.id,
        county,
        guardian_id: guardianId,
        discovered_at: new Date().toISOString(),
        interaction_count: 1,
        stewardship_score: 0,
        consent_of_place: 0,
      });

      if (error) {
        console.warn('Guardian progress insert failed:', error.message);
      }
    };

    trackGuardian();
  }, [user, county, guardianId]);

  return null;
}
