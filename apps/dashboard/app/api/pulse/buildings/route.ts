import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { BuildingHealth } from '@/lib/pixi/entities/BaseBuilding';
import type { SupabaseClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

type BuildingId =
  | 'wasatchwise-capitol'
  | 'wasatchwise-bank'
  | 'adult-ai-academy'
  | 'ask-before-you-app'
  | 'gmc-mag'
  | 'munchyslots'
  | 'pipeline-iq'
  | 'rock-salt'
  | 'slctrips'
  | 'the-rings'
  | 'dublin-drive-live'
  | 'daite';

const BUILDING_IDS: BuildingId[] = [
  'wasatchwise-capitol',
  'wasatchwise-bank',
  'adult-ai-academy',
  'ask-before-you-app',
  'gmc-mag',
  'munchyslots',
  'pipeline-iq',
  'rock-salt',
  'slctrips',
  'the-rings',
  'dublin-drive-live',
  'daite',
];

function buildingEnvSuffix(buildingId: string) {
  return buildingId.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
}

function normalizeHealthUrl(raw: string) {
  const trimmed = raw.trim().replace(/\/+$/, '');
  if (!trimmed) return null;
  return trimmed.endsWith('/api/health') ? trimmed : `${trimmed}/api/health`;
}

function mapServiceHealthToVoltage(input: unknown): number | null {
  if (typeof input !== 'string') return null;
  // Common patterns across apps
  if (input === 'healthy' || input === 'ok') return 100;
  if (input === 'degraded') return 60;
  if (input === 'unhealthy') return 10;
  return null;
}

function statusCodeFromVoltage(voltage: number): BuildingHealth['statusCode'] {
  if (voltage <= 0) return 'offline';
  if (voltage < 40) return 'critical';
  if (voltage < 70) return 'warning';
  return 'healthy';
}

async function getCentralMetrics(
  supabase: SupabaseClient,
  buildingId: string
): Promise<Partial<BuildingHealth> | null> {
  const keys = [
    `${buildingId}_voltage`,
    `${buildingId}_revenue`,
    `${buildingId}_active_users`,
  ];

  const { data, error } = await supabase
    .from('city_metrics')
    .select('metric_key,value')
    .in('metric_key', keys);

  if (error) {
    console.error('[pulse] Failed to query city_metrics:', error);
    return null;
  }

  const byKey = new Map<string, number>();
  for (const row of data || []) {
    const v = Number(row.value);
    if (!Number.isFinite(v)) continue;
    byKey.set(row.metric_key, v);
  }

  const voltage = byKey.get(`${buildingId}_voltage`);
  const revenue = byKey.get(`${buildingId}_revenue`);
  const activeUsers = byKey.get(`${buildingId}_active_users`);

  return {
    ...(voltage !== undefined ? { voltage } : {}),
    ...(revenue !== undefined ? { revenue } : {}),
    ...(activeUsers !== undefined ? { activeUsers } : {}),
  };
}

async function getVerticalVoltage(buildingId: string): Promise<number | null> {
  const suffix = buildingEnvSuffix(buildingId);
  const rawUrl =
    process.env[`VERTICAL_HEALTH_URL_${suffix}`] ??
    process.env[`NEXT_PUBLIC_VERTICAL_HEALTH_URL_${suffix}`];

  if (!rawUrl) return null;

  const url = normalizeHealthUrl(rawUrl);
  if (!url) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      // keep this snappy; we don't want the game to feel laggy
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!res.ok) {
      return 0;
    }

    const json = (await res.json()) as any;

    // Most apps return { status: 'ok' } or { status: 'healthy'|'degraded'|'unhealthy' }
    const voltageFromStatus = mapServiceHealthToVoltage(json?.status);
    if (voltageFromStatus !== null) return voltageFromStatus;

    // Fallback: if it responded 200 and we can't interpret it, treat as up.
    return 100;
  } catch (e) {
    return 0;
  }
}

export async function GET() {
  let admin: SupabaseClient | null = null;
  try {
    admin = createAdminClient();
  } catch (e) {
    // No central Supabase configured; we can still compute voltage from per-vertical health URLs.
    admin = null;
  }

  const buildings: Record<string, BuildingHealth> = {};

  await Promise.all(
    BUILDING_IDS.map(async (buildingId) => {
      const defaults: BuildingHealth = {
        voltage: 100,
        revenue: 0,
        activeUsers: 0,
        statusCode: 'healthy',
      };

      const central = admin ? await getCentralMetrics(admin, buildingId) : null;
      const verticalVoltage = await getVerticalVoltage(buildingId);

      const voltage =
        (central?.voltage ?? null) !== null ? (central!.voltage as number) : (verticalVoltage ?? 100);
      const revenue = central?.revenue ?? 0;
      const activeUsers = central?.activeUsers ?? 0;

      buildings[buildingId] = {
        ...defaults,
        voltage,
        revenue,
        activeUsers,
        statusCode: statusCodeFromVoltage(voltage),
      };
    })
  );

  return NextResponse.json(
    {
      timestamp: new Date().toISOString(),
      buildings,
    },
    { status: 200 }
  );
}

