'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'

interface GoalProgressData {
  id: string
  goal_name: string
  goal_type: string
  target_value: number
  current_value: number
  start_date: string
  end_date: string
  progress_percentage?: number
  pace_status?: string
  days_remaining?: number
  projected_final_value?: number
}

interface Props {
  goal: GoalProgressData
  progressHistory?: Array<{
    snapshot_date: string
    current_value: number
    progress_percentage: number
  }>
}

export function GoalProgressChart({ goal, progressHistory = [] }: Props) {
  const progressPercentage = goal.progress_percentage ||
    (goal.target_value > 0 ? (goal.current_value / goal.target_value) * 100 : 0)

  const paceStatus = goal.pace_status || 'unknown'

  // Calculate days remaining
  const daysRemaining = goal.days_remaining ||
    Math.max(0, Math.ceil((new Date(goal.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))

  // Calculate total days
  const totalDays = Math.ceil(
    (new Date(goal.end_date).getTime() - new Date(goal.start_date).getTime()) / (1000 * 60 * 60 * 24)
  )
  const daysElapsed = totalDays - daysRemaining

  // Calculate expected progress based on time elapsed
  const expectedPercentage = totalDays > 0 ? (daysElapsed / totalDays) * 100 : 0

  // Generate chart data points (simplified bar visualization)
  const chartBars = useMemo(() => {
    if (progressHistory.length > 0) {
      // Use actual history if available
      return progressHistory.slice(-10).map((p, i) => ({
        date: new Date(p.snapshot_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: p.current_value,
        percentage: p.progress_percentage,
      }))
    }

    // Generate synthetic milestones
    const milestones = []
    const quarterPoint = goal.target_value * 0.25
    const halfPoint = goal.target_value * 0.5
    const threeQuarterPoint = goal.target_value * 0.75

    milestones.push({ label: '25%', value: quarterPoint, achieved: goal.current_value >= quarterPoint })
    milestones.push({ label: '50%', value: halfPoint, achieved: goal.current_value >= halfPoint })
    milestones.push({ label: '75%', value: threeQuarterPoint, achieved: goal.current_value >= threeQuarterPoint })
    milestones.push({ label: '100%', value: goal.target_value, achieved: goal.current_value >= goal.target_value })

    return milestones
  }, [progressHistory, goal])

  const getPaceIcon = () => {
    switch (paceStatus) {
      case 'ahead':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'on_track':
        return <Target className="h-4 w-4 text-blue-500" />
      case 'behind':
        return <TrendingDown className="h-4 w-4 text-yellow-500" />
      case 'at_risk':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      default:
        return <Target className="h-4 w-4 text-gray-500" />
    }
  }

  const getPaceColor = () => {
    switch (paceStatus) {
      case 'ahead':
        return 'text-green-600 bg-green-50'
      case 'on_track':
        return 'text-blue-600 bg-blue-50'
      case 'behind':
        return 'text-yellow-600 bg-yellow-50'
      case 'at_risk':
        return 'text-red-600 bg-red-50'
      case 'completed':
        return 'text-green-600 bg-green-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const formatValue = (value: number) => {
    if (goal.goal_type === 'revenue' || goal.goal_type === 'pipeline_value') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(value)
    }
    return value.toLocaleString()
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{goal.goal_name}</CardTitle>
            <CardDescription className="capitalize">{goal.goal_type.replace('_', ' ')}</CardDescription>
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getPaceColor()}`}>
            {getPaceIcon()}
            <span className="capitalize">{paceStatus.replace('_', ' ')}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">{formatValue(goal.current_value)}</span>
            <span className="text-muted-foreground">of {formatValue(goal.target_value)}</span>
          </div>
          <div className="relative h-4 bg-muted rounded-full overflow-hidden">
            {/* Expected progress marker */}
            <div
              className="absolute top-0 h-full w-0.5 bg-yellow-500 z-10"
              style={{ left: `${Math.min(100, expectedPercentage)}%` }}
              title={`Expected: ${expectedPercentage.toFixed(0)}%`}
            />
            {/* Actual progress */}
            <div
              className={`h-full transition-all duration-500 ${
                progressPercentage >= expectedPercentage ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, progressPercentage)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{progressPercentage.toFixed(1)}% complete</span>
            <span>{expectedPercentage.toFixed(0)}% expected</span>
          </div>
        </div>

        {/* Milestone Visualization */}
        {!progressHistory.length && (
          <div className="mb-4">
            <div className="text-xs font-medium text-muted-foreground mb-2">Milestones</div>
            <div className="flex gap-2">
              {(chartBars as any[]).map((milestone, i) => (
                <div key={i} className="flex-1 text-center">
                  <div
                    className={`h-8 rounded flex items-center justify-center text-xs font-medium ${
                      milestone.achieved
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {milestone.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatValue(milestone.value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Time Remaining */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{daysRemaining} days left</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Ends: </span>
            <span className="font-medium">
              {new Date(goal.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Projected Value */}
        {goal.projected_final_value && goal.projected_final_value !== goal.current_value && (
          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Projected at current pace:</span>
              <span className={`font-medium ${
                goal.projected_final_value >= goal.target_value
                  ? 'text-green-600'
                  : 'text-yellow-600'
              }`}>
                {formatValue(goal.projected_final_value)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {goal.projected_final_value >= goal.target_value
                ? `On track to exceed target by ${formatValue(goal.projected_final_value - goal.target_value)}`
                : `${formatValue(goal.target_value - goal.projected_final_value)} short of target`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
