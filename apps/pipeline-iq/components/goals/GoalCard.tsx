'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Target,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Briefcase,
  Mail,
  Calendar,
  ChevronRight,
  Lightbulb,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export interface Goal {
  id: string
  goal_name: string
  goal_type: string
  target_value: number
  current_value: number
  start_date: string
  end_date: string
  status: string
  service_type?: string
  vertical?: string
  notes?: string
  // Calculated fields from view
  progress_percentage?: number
  days_remaining?: number
  days_elapsed?: number
  gap_to_target?: number
  projected_final_value?: number
  pace_status?: string
  active_recommendations?: number
}

interface GoalCardProps {
  goal: Goal
  onViewDetails?: (goalId: string) => void
  onGetRecommendations?: (goalId: string) => void
}

const GOAL_TYPE_CONFIG: Record<
  string,
  { icon: React.ElementType; label: string; format: (v: number) => string }
> = {
  revenue: {
    icon: DollarSign,
    label: 'Revenue',
    format: (v) => formatCurrency(v),
  },
  deals_closed: {
    icon: Briefcase,
    label: 'Deals Closed',
    format: (v) => v.toString(),
  },
  services_sold: {
    icon: Target,
    label: 'Services Sold',
    format: (v) => v.toString(),
  },
  pipeline_value: {
    icon: TrendingUp,
    label: 'Pipeline Value',
    format: (v) => formatCurrency(v),
  },
  meetings_booked: {
    icon: Calendar,
    label: 'Meetings',
    format: (v) => v.toString(),
  },
  emails_sent: {
    icon: Mail,
    label: 'Emails Sent',
    format: (v) => v.toString(),
  },
  custom: {
    icon: Target,
    label: 'Custom',
    format: (v) => v.toString(),
  },
}

const PACE_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  ahead: {
    label: 'Ahead',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  on_track: {
    label: 'On Track',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  behind: {
    label: 'Behind',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
  },
  at_risk: {
    label: 'At Risk',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
  },
  completed: {
    label: 'Completed',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  not_started: {
    label: 'Not Started',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
  },
}

export function GoalCard({ goal, onViewDetails, onGetRecommendations }: GoalCardProps) {
  const config = GOAL_TYPE_CONFIG[goal.goal_type] || GOAL_TYPE_CONFIG.custom
  const Icon = config.icon

  const progressPercentage = goal.progress_percentage ||
    (goal.target_value > 0 ? Math.min(100, (goal.current_value / goal.target_value) * 100) : 0)

  const paceStatus = goal.pace_status || 'on_track'
  const paceConfig = PACE_STATUS_CONFIG[paceStatus] || PACE_STATUS_CONFIG.on_track

  const daysRemaining = goal.days_remaining ??
    Math.max(0, Math.ceil((new Date(goal.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))

  const gapToTarget = goal.gap_to_target ?? (goal.target_value - goal.current_value)

  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{goal.goal_name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{config.label}</span>
              {goal.vertical && (
                <>
                  <span>•</span>
                  <span className="capitalize">{goal.vertical.replace('_', ' ')}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${paceConfig.bgColor} ${paceConfig.color}`}
        >
          {paceStatus === 'ahead' || paceStatus === 'on_track' ? (
            <TrendingUp className="mr-1 h-3 w-3" />
          ) : (
            <TrendingDown className="mr-1 h-3 w-3" />
          )}
          {paceConfig.label}
        </span>
      </div>

      {/* Progress Section */}
      <div className="space-y-2 mb-4">
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold">{config.format(goal.current_value)}</div>
          <div className="text-sm text-muted-foreground">
            of {config.format(goal.target_value)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              progressPercentage >= 100
                ? 'bg-green-500'
                : progressPercentage >= 70
                ? 'bg-blue-500'
                : progressPercentage >= 40
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(100, progressPercentage)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{progressPercentage.toFixed(0)}% complete</span>
          {gapToTarget > 0 && (
            <span>Need: {config.format(gapToTarget)}</span>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{daysRemaining}</div>
            <div className="text-xs text-muted-foreground">Days Left</div>
          </div>
        </div>

        {goal.projected_final_value !== undefined && goal.projected_final_value > 0 && (
          <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{config.format(goal.projected_final_value)}</div>
              <div className="text-xs text-muted-foreground">Projected</div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {goal.active_recommendations && goal.active_recommendations > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onGetRecommendations?.(goal.id)}
          >
            <Lightbulb className="mr-2 h-4 w-4 text-yellow-500" />
            {goal.active_recommendations} Tips
          </Button>
        )}

        {paceStatus === 'behind' || paceStatus === 'at_risk' ? (
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={() => onGetRecommendations?.(goal.id)}
          >
            <Lightbulb className="mr-2 h-4 w-4" />
            Get Help
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={() => onViewDetails?.(goal.id)}
          >
            View Details
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  )
}
