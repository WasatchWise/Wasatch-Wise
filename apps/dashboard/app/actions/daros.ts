'use server';

import {
    updateStakeholderMatrix as updateMatrixLogic,
    Stakeholder,
    OutcomeLevel
} from '@/lib/daros/soe';

import {
    updateDistrictControl as updateControlLogic,
    DistrictControl
} from '@/lib/daros/pce';

import {
    createBriefingSession as createSessionLogic,
    completeBriefingSession as completeSessionLogic,
} from '@/lib/daros/briefing';

import { revalidatePath } from 'next/cache';

/**
 * Server Action to update a single stakeholder's matrix entry
 */
export async function updateStakeholderMatrixAction(
    districtId: string,
    stakeholder: Stakeholder,
    data: {
        outcomeLevel: OutcomeLevel;
        uptakeScore: number;
        resistanceScore: number;
        notes: string;
    }
) {
    try {
        await updateMatrixLogic(districtId, stakeholder, data);
        revalidatePath(`/dashboard/districts/${districtId}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to update stakeholder matrix:', error);
        return { success: false, error: 'Failed to update matrix' };
    }
}

/**
 * Server Action to update a district control status
 */
export async function updateDistrictControlAction(
    districtId: string,
    controlId: string,
    data: {
        status?: DistrictControl['status'];
        evidenceUrl?: string | null;
        ownerRole?: string | null;
        riskLevel?: DistrictControl['riskLevel'];
        notes?: string | null;
    }
) {
    try {
        await updateControlLogic(districtId, controlId, data);
        revalidatePath(`/dashboard/districts/${districtId}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to update district control:', error);
        return { success: false, error: 'Failed to update control' };
    }
}

/**
 * Server Action to create a briefing session
 */
export async function createBriefingSessionAction(
    districtId: string,
    data: {
        sessionDate: string;
        facilitator?: string;
    }
) {
    try {
        const session = await createSessionLogic(districtId, data);
        revalidatePath(`/dashboard/districts/${districtId}`);
        return { success: true, session };
    } catch (error) {
        console.error('Failed to create session:', error);
        return { success: false, error: 'Failed to create session' };
    }
}

/**
 * Server Action to complete a briefing session
 */
export async function completeBriefingSessionAction(
    sessionId: string,
    outcomes: Record<string, any>,
    notes?: string
) {
    try {
        await completeSessionLogic(sessionId, outcomes, notes);
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Failed to complete session:', error);
        return { success: false, error: 'Failed to complete session' };
    }
}
