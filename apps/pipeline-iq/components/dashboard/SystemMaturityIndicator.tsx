'use client'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle2,
  Clock,
  Zap,
  AlertCircle,
  TrendingUp,
} from 'lucide-react'

interface SystemMaturityStage {
  name: string
  description: string
  status: 'complete' | 'active' | 'pending'
  automation: 'manual' | 'semi-auto' | 'auto'
}

const SYSTEM_STAGES: SystemMaturityStage[] = [
  {
    name: 'Data Ingestion',
    description: 'Scraping Construction Wire',
    status: 'active',
    automation: 'semi-auto', // GitHub Actions scheduled, but needs monitoring
  },
  {
    name: 'Lead Scoring',
    description: 'Groove Fit Score calculation',
    status: 'complete',
    automation: 'auto',
  },
  {
    name: 'AI Enrichment',
    description: 'Project insights and location data',
    status: 'active',
    automation: 'manual', // Mike triggers, but ready for automation
  },
  {
    name: 'Campaign Generation',
    description: 'NEPQ-framed email campaigns',
    status: 'active',
    automation: 'manual', // Mike approves before sending
  },
  {
    name: 'Email Sending',
    description: 'Outreach delivery',
    status: 'active',
    automation: 'manual', // Manual send for now
  },
  {
    name: 'Meeting Tracking',
    description: 'Schedule and log meetings',
    status: 'complete',
    automation: 'manual', // Intentionally manual - Mike's judgment
  },
  {
    name: 'Proposal Creation',
    description: 'NEPQ-framed proposals',
    status: 'complete',
    automation: 'manual', // Intentionally manual - Mike's judgment
  },
  {
    name: 'Deal Closing',
    description: 'Track won/lost with commission',
    status: 'complete',
    automation: 'manual', // Intentionally manual - Mike's judgment
  },
]

export function SystemMaturityIndicator() {
  // Calculate overall maturity
  const completeStages = SYSTEM_STAGES.filter((s) => s.status === 'complete').length
  const totalStages = SYSTEM_STAGES.length
  const maturityPercent = Math.round((completeStages / totalStages) * 100)

  // Count automation levels
  const autoCount = SYSTEM_STAGES.filter((s) => s.automation === 'auto').length
  const semiAutoCount = SYSTEM_STAGES.filter((s) => s.automation === 'semi-auto').length
  const manualCount = SYSTEM_STAGES.filter((s) => s.automation === 'manual').length

  // Determine current phase
  const getCurrentPhase = () => {
    if (completeStages >= 6) return 'Phase A: Complete'
    if (completeStages >= 3) return 'Phase A: Active'
    return 'Phase A: Setup'
  }

  const getAutomationLevel = () => {
    const autoPercent = Math.round((autoCount / totalStages) * 100)
    if (autoPercent >= 50) return 'Highly Automated'
    if (autoPercent >= 25) return 'Partially Automated'
    return 'Manual with Guidance'
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            System Maturity
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {getCurrentPhase()} • {getAutomationLevel()}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{maturityPercent}%</div>
          <div className="text-xs text-muted-foreground">Complete</div>
        </div>
      </div>

      {/* Overall Progress */}
      <Progress value={maturityPercent} className="mb-6" />

      {/* Stage Breakdown */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-muted-foreground mb-2">
          System Components
        </div>
        {SYSTEM_STAGES.map((stage, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg border bg-card"
          >
            <div className="flex items-center gap-3 flex-1">
              {stage.status === 'complete' ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : stage.status === 'active' ? (
                <Clock className="h-4 w-4 text-blue-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-gray-400" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{stage.name}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      stage.automation === 'auto'
                        ? 'bg-green-100 text-green-700'
                        : stage.automation === 'semi-auto'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {stage.automation === 'auto'
                      ? 'Auto'
                      : stage.automation === 'semi-auto'
                      ? 'Semi-Auto'
                      : 'Manual'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stage.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Automation Summary */}
      <div className="mt-6 pt-4 border-t grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{autoCount}</div>
          <div className="text-xs text-muted-foreground">Automated</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-yellow-600">{semiAutoCount}</div>
          <div className="text-xs text-muted-foreground">Semi-Auto</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{manualCount}</div>
          <div className="text-xs text-muted-foreground">Manual</div>
        </div>
      </div>

      {/* Current Focus */}
      <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
        <div className="flex items-start gap-2">
          <Zap className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-xs text-blue-800">
            <p className="font-medium">Current Focus: Observing & Learning</p>
            <p className="mt-1">
              System is capturing real data. We&apos;re learning what to automate next based on actual usage patterns.
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}

