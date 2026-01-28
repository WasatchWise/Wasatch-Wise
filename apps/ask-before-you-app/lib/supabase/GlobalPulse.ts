import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import type { BuildingHealth } from '../pixi/entities/BaseBuilding';

interface CityMetric {
    metric_key: string;
    value: number;
    trend: 'rising' | 'falling' | 'stable' | 'volatile';
    unit: string;
    last_updated: string;
}

interface Resident {
    id: string;
    ltv_score: number;
    engagement_score: number;
    churn_probability: number;
    tier: string;
    grid_x: number;
    grid_y: number;
}

/**
 * GlobalPulse: The nervous system connecting Supabase to the PixiJS simulation.
 * Handles real-time subscriptions, health calculations, and cross-project polling.
 */
export class GlobalPulse {
    private client: SupabaseClient;
    private channels: Map<string, RealtimeChannel> = new Map();
    private healthCallbacks: Map<string, Set<(health: BuildingHealth) => void>> = new Map();

    // Map of project clients for the 9 different projects
    // In a real app, these keys would come from a secure config store
    private projectClients: Map<string, SupabaseClient> = new Map();

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.client = createClient(supabaseUrl, supabaseKey, {
            realtime: {
                params: {
                    eventsPerSecond: 10 // Throttle
                }
            }
        });

        // Initialize connections to other projects if env vars exist
        // This is a placeholder for the multi-tenant architecture mentioned
        // const aaaUrl = process.env.NEXT_PUBLIC_SUPABASE_AAA_URL;
        // if (aaaUrl) this.projectClients.set('aaa', createClient(aaaUrl, ...));
    }

    /**
     * Subscribes to real-time changes for a specific building's health metrics.
     */
    async subscribeToBuildingHealth(
        buildingId: string,
        callback: (health: BuildingHealth) => void
    ): Promise<() => void> {
        // Register callback
        if (!this.healthCallbacks.has(buildingId)) {
            this.healthCallbacks.set(buildingId, new Set());
        }
        this.healthCallbacks.get(buildingId)!.add(callback);

        // Create or reuse channel
        if (!this.channels.has(buildingId)) {
            const channel = this.client
                .channel(`building-${buildingId}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'city_metrics',
                        filter: `metric_key=eq.${buildingId}_voltage`
                    },
                    async (payload) => {
                        const health = await this.calculateBuildingHealth(buildingId);
                        this.notifyHealthCallbacks(buildingId, health);
                    }
                )
                .subscribe();

            this.channels.set(buildingId, channel);
        }

        // Return unsubscribe function
        return () => {
            const callbacks = this.healthCallbacks.get(buildingId);
            if (callbacks) {
                callbacks.delete(callback);
                if (callbacks.size === 0) {
                    // No more listeners, clean up channel
                    const channel = this.channels.get(buildingId);
                    if (channel) {
                        channel.unsubscribe();
                        this.channels.delete(buildingId);
                    }
                    this.healthCallbacks.delete(buildingId);
                }
            }
        };
    }

    async calculateBuildingHealth(buildingId: string): Promise<BuildingHealth> {
        try {
            // Mock data for initial implementation until real metrics are flowing
            // This ensures the dashboard lights up immediately

            const { data: voltageData } = await this.client
                .from('city_metrics')
                .select('value')
                .eq('metric_key', `${buildingId}_voltage`)
                .single();

            // If no data, return a default "healthy" state to prevent blackouts
            const voltage = voltageData?.value ?? 100;
            const revenue = 0;
            const activeUsers = 0;

            let statusCode: BuildingHealth['statusCode'] = 'healthy';
            if (voltage === 0) statusCode = 'offline';
            else if (voltage < 40) statusCode = 'critical';
            else if (voltage < 70) statusCode = 'warning';

            return {
                voltage,
                revenue,
                activeUsers,
                statusCode
            };
        } catch (error) {
            console.error(`Failed to calculate health for ${buildingId}:`, error);
            return {
                voltage: 0,
                revenue: 0,
                activeUsers: 0,
                statusCode: 'offline'
            };
        }
    }

    private notifyHealthCallbacks(buildingId: string, health: BuildingHealth): void {
        const callbacks = this.healthCallbacks.get(buildingId);
        if (callbacks) {
            callbacks.forEach((callback) => callback(health));
        }
    }

    // ... (Other methods for global metrics and residents can be added here)

    destroy(): void {
        this.channels.forEach((channel) => channel.unsubscribe());
        this.channels.clear();
        this.healthCallbacks.clear();
    }
}

// Singleton instance wrapper
let globalPulseInstance: GlobalPulse | null = null;

export function initializeGlobalPulse(supabaseUrl: string, supabaseKey: string): GlobalPulse {
    if (!globalPulseInstance) {
        globalPulseInstance = new GlobalPulse(supabaseUrl, supabaseKey);
    }
    return globalPulseInstance;
}

export function getGlobalPulse(): GlobalPulse {
    if (!globalPulseInstance) {
        throw new Error('GlobalPulse not initialized. Call initializeGlobalPulse() first.');
    }
    return globalPulseInstance;
}
