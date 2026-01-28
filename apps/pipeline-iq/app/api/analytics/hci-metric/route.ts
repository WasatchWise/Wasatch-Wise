import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

/**
 * POST /api/analytics/hci-metric
 * Stores HCI metrics for analysis
 */
export async function POST(request: NextRequest) {
  try {
    const metric = await request.json()
    
    // Store in database (you can create an hci_metrics table)
    const supabase = await createServerSupabaseClient()
    
    // For now, just log it. You can create a table later:
    // CREATE TABLE hci_metrics (
    //   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    //   session_id TEXT,
    //   user_id TEXT,
    //   metric_type TEXT,
    //   category TEXT,
    //   action TEXT,
    //   metadata JSONB,
    //   device_info JSONB,
    //   created_at TIMESTAMPTZ DEFAULT NOW()
    // );
    
    logger.info('HCI Metric', {
      sessionId: metric.sessionId,
      type: metric.type,
      action: metric.action,
      device: metric.device?.type,
    })

    // In production, store in database:
    // const { error } = await supabase
    //   .from('hci_metrics')
    //   .insert({
    //     session_id: metric.sessionId,
    //     user_id: metric.userId,
    //     metric_type: metric.type,
    //     category: metric.category,
    //     action: metric.action,
    //     metadata: metric.metadata,
    //     device_info: metric.device,
    //   })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Failed to store HCI metric', { error })
    return NextResponse.json({ error: 'Failed to store metric' }, { status: 500 })
  }
}

