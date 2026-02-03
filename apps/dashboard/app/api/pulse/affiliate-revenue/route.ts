import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const AMAZON_AFFILIATE_METRIC_KEYS = [
  'slctrips_amazon_revenue',
  'rocksalt_amazon_revenue',
  'academy_amazon_revenue',
  'pipelineiq_amazon_revenue',
  'fanon_amazon_revenue',
] as const;

export type AmazonAffiliateMetricKey = (typeof AMAZON_AFFILIATE_METRIC_KEYS)[number];

export interface AffiliateRevenueRow {
  metric_key: string;
  value: number;
  display_name: string | null;
  last_updated: string | null;
}

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('city_metrics')
      .select('metric_key, value, display_name, last_updated')
      .in('metric_key', [...AMAZON_AFFILIATE_METRIC_KEYS]);

    if (error) {
      console.error('[pulse/affiliate-revenue]', error);
      return NextResponse.json(
        { error: 'Failed to fetch affiliate revenue', details: error.message },
        { status: 500 }
      );
    }

    const rows: AffiliateRevenueRow[] = (data ?? []).map((row) => ({
      metric_key: row.metric_key,
      value: Number(row.value) ?? 0,
      display_name: row.display_name ?? null,
      last_updated: row.last_updated ?? null,
    }));

    const total = rows.reduce((sum, r) => sum + r.value, 0);

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        metrics: rows,
        total,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error('[pulse/affiliate-revenue]', e);
    return NextResponse.json(
      { error: 'Server error', details: e instanceof Error ? e.message : 'Unknown' },
      { status: 500 }
    );
  }
}
