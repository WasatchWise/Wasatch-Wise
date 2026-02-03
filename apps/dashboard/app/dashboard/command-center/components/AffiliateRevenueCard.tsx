'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Win95Window, Win95Panel, Win95Button } from './Win95Window';

const METRIC_LABELS: Record<string, { short: string; icon: string }> = {
  slctrips_amazon_revenue: { short: 'SLC Trips', icon: '🎢' },
  rocksalt_amazon_revenue: { short: 'Rock Salt', icon: '🎸' },
  academy_amazon_revenue: { short: 'Academy', icon: '🎓' },
  pipelineiq_amazon_revenue: { short: 'Pipeline IQ', icon: '📡' },
  fanon_amazon_revenue: { short: 'Fanon Movies', icon: '🎬' },
};

const REFRESH_INTERVAL_MS = 60_000; // 60 seconds

interface AffiliateRevenueRow {
  metric_key: string;
  value: number;
  display_name: string | null;
  last_updated: string | null;
}

interface AffiliateRevenueResponse {
  timestamp: string;
  metrics: AffiliateRevenueRow[];
  total: number;
}

export default function AffiliateRevenueCard() {
  const [data, setData] = useState<AffiliateRevenueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    try {
      const res = await fetch('/api/pulse/affiliate-revenue', { cache: 'no-store' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.details ?? body?.error ?? res.statusText);
      }
      const json = (await res.json()) as AffiliateRevenueResponse;
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => fetchData(false), REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <Win95Window title="Amazon Affiliate Revenue" className="fixed top-10 right-4 z-40 w-64">
        <Win95Panel className="text-gray-500">Loading…</Win95Panel>
      </Win95Window>
    );
  }

  if (error) {
    return (
      <Win95Window title="Amazon Affiliate Revenue" className="fixed top-10 right-4 z-40 w-64">
        <Win95Panel className="text-red-600 text-[10px]">{error}</Win95Panel>
      </Win95Window>
    );
  }

  const metrics = data?.metrics ?? [];
  const total = data?.total ?? 0;

  return (
    <Win95Window title="Amazon Affiliate Revenue" className="fixed top-10 right-4 z-40 w-64">
      <Win95Panel className="space-y-1">
        {metrics.map((row) => {
          const label = METRIC_LABELS[row.metric_key] ?? { short: row.metric_key, icon: '📦' };
          return (
            <div key={row.metric_key} className="flex justify-between items-center gap-2">
              <span className="text-gray-700 truncate" title={row.display_name ?? row.metric_key}>
                {label.icon} {label.short}
              </span>
              <span className="font-bold text-green-700 font-mono shrink-0">
                ${Number(row.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          );
        })}
        {metrics.length > 0 && (
          <div className="border-t border-gray-400 pt-1 mt-1 flex justify-between items-center">
            <span className="font-bold text-gray-800">Total</span>
            <span className="font-bold text-green-800 font-mono">
              ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}
        {metrics.length === 0 && (
          <div className="text-gray-500 text-[10px]">No affiliate metrics yet. Run migration 008 and sync from Amazon.</div>
        )}
        <div className="flex justify-end gap-1 mt-2 pt-1 border-t border-gray-400">
          {refreshing && <span className="text-[10px] text-gray-500 mr-1">Refreshing…</span>}
          <Win95Button onClick={() => fetchData(false)}>
            Refresh
          </Win95Button>
        </div>
      </Win95Panel>
    </Win95Window>
  );
}
