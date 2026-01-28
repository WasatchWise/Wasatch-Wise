#!/usr/bin/env tsx
/**
 * HCI Metrics Analysis Script
 * Analyzes collected HCI metrics and generates reports
 * 
 * Usage:
 *   npx tsx scripts/analyze-hci-metrics.ts
 */

import dotenv from 'dotenv'
import { createServiceSupabaseClient } from '../lib/supabase/service'

dotenv.config({ path: '.env.local' })

interface MetricAnalysis {
  totalMetrics: number
  byType: Record<string, number>
  byDevice: Record<string, number>
  byCategory: Record<string, number>
  errorRate: number
  averageInteractions: number
  topActions: Array<{ action: string; count: number }>
  deviceBreakdown: {
    mobile: number
    desktop: number
    tablet: number
  }
  timeRange: {
    earliest: string | null
    latest: string | null
  }
}

async function analyzeMetrics() {
  const supabase = createServiceSupabaseClient()
  
  console.log('📊 HCI Metrics Analysis')
  console.log('='.repeat(50))
  
  // Check if hci_metrics table exists
  const { data: tables, error: tableError } = await supabase
    .from('hci_metrics')
    .select('*')
    .limit(1)
  
  if (tableError) {
    console.log('\n⚠️  HCI metrics table not found in database.')
    console.log('   Metrics are currently being logged to console only.')
    console.log('\n   To enable database storage, create the table:')
    console.log(`
CREATE TABLE hci_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT,
  user_id TEXT,
  metric_type TEXT,
  category TEXT,
  action TEXT,
  metadata JSONB,
  device_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hci_metrics_session ON hci_metrics(session_id);
CREATE INDEX idx_hci_metrics_type ON hci_metrics(metric_type);
CREATE INDEX idx_hci_metrics_created ON hci_metrics(created_at);
    `)
    return
  }
  
  // Get all metrics
  const { data: metrics, error } = await supabase
    .from('hci_metrics')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('❌ Error fetching metrics:', error)
    return
  }
  
  if (!metrics || metrics.length === 0) {
    console.log('\n📭 No metrics found in database.')
    console.log('   Run some tests or use the app to generate metrics.')
    return
  }
  
  // Analyze
  const analysis: MetricAnalysis = {
    totalMetrics: metrics.length,
    byType: {},
    byDevice: {},
    byCategory: {},
    errorRate: 0,
    averageInteractions: 0,
    topActions: [],
    deviceBreakdown: {
      mobile: 0,
      desktop: 0,
      tablet: 0,
    },
    timeRange: {
      earliest: null,
      latest: null,
    },
  }
  
  const actionCounts: Record<string, number> = {}
  let interactionCount = 0
  let errorCount = 0
  
  metrics.forEach((metric: any) => {
    // By type
    analysis.byType[metric.metric_type] = (analysis.byType[metric.metric_type] || 0) + 1
    
    // By category
    if (metric.category) {
      analysis.byCategory[metric.category] = (analysis.byCategory[metric.category] || 0) + 1
    }
    
    // By device
    if (metric.device_info?.type) {
      analysis.byDevice[metric.device_info.type] = (analysis.byDevice[metric.device_info.type] || 0) + 1
      if (metric.device_info.type === 'mobile') analysis.deviceBreakdown.mobile++
      if (metric.device_info.type === 'desktop') analysis.deviceBreakdown.desktop++
      if (metric.device_info.type === 'tablet') analysis.deviceBreakdown.tablet++
    }
    
    // Actions
    if (metric.action) {
      actionCounts[metric.action] = (actionCounts[metric.action] || 0) + 1
    }
    
    // Counts
    if (metric.metric_type === 'interaction') interactionCount++
    if (metric.metric_type === 'error') errorCount++
    
    // Time range
    if (!analysis.timeRange.earliest || metric.created_at < analysis.timeRange.earliest) {
      analysis.timeRange.earliest = metric.created_at
    }
    if (!analysis.timeRange.latest || metric.created_at > analysis.timeRange.latest) {
      analysis.timeRange.latest = metric.created_at
    }
  })
  
  // Calculate rates
  analysis.errorRate = metrics.length > 0 ? (errorCount / metrics.length) * 100 : 0
  analysis.averageInteractions = interactionCount
  
  // Top actions
  analysis.topActions = Object.entries(actionCounts)
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
  
  // Print report
  console.log(`\n📈 Total Metrics: ${analysis.totalMetrics}`)
  console.log(`\n⏰ Time Range:`)
  console.log(`   Earliest: ${analysis.timeRange.earliest ? new Date(analysis.timeRange.earliest).toLocaleString() : 'N/A'}`)
  console.log(`   Latest: ${analysis.timeRange.latest ? new Date(analysis.timeRange.latest).toLocaleString() : 'N/A'}`)
  
  console.log(`\n📊 By Type:`)
  Object.entries(analysis.byType).forEach(([type, count]) => {
    const percentage = ((count / analysis.totalMetrics) * 100).toFixed(1)
    console.log(`   ${type}: ${count} (${percentage}%)`)
  })
  
  console.log(`\n📱 By Device:`)
  Object.entries(analysis.byDevice).forEach(([device, count]) => {
    const percentage = ((count / analysis.totalMetrics) * 100).toFixed(1)
    console.log(`   ${device}: ${count} (${percentage}%)`)
  })
  
  console.log(`\n📂 By Category:`)
  Object.entries(analysis.byCategory).forEach(([category, count]) => {
    const percentage = ((count / analysis.totalMetrics) * 100).toFixed(1)
    console.log(`   ${category}: ${count} (${percentage}%)`)
  })
  
  console.log(`\n⚠️  Error Rate: ${analysis.errorRate.toFixed(2)}%`)
  console.log(`\n👆 Total Interactions: ${analysis.averageInteractions}`)
  
  console.log(`\n🔥 Top 10 Actions:`)
  analysis.topActions.forEach((item, index) => {
    console.log(`   ${index + 1}. ${item.action}: ${item.count}`)
  })
  
  console.log(`\n📱 Device Breakdown:`)
  console.log(`   Mobile: ${analysis.deviceBreakdown.mobile}`)
  console.log(`   Desktop: ${analysis.deviceBreakdown.desktop}`)
  console.log(`   Tablet: ${analysis.deviceBreakdown.tablet}`)
  
  console.log('\n' + '='.repeat(50))
}

analyzeMetrics().catch(console.error)

