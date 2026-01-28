'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Target,
  DollarSign,
  Briefcase,
  Calendar,
  Mail,
  FileText,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'

interface CreateGoalModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const GOAL_TYPES = [
  {
    value: 'revenue',
    label: 'Revenue',
    description: 'Track total revenue earned',
    icon: DollarSign,
    placeholder: '500000',
  },
  {
    value: 'deals_closed',
    label: 'Deals Closed',
    description: 'Track number of closed deals',
    icon: Briefcase,
    placeholder: '12',
  },
  {
    value: 'services_sold',
    label: 'Services Sold',
    description: 'Track specific service installations',
    icon: Target,
    placeholder: '20',
  },
  {
    value: 'pipeline_value',
    label: 'Pipeline Value',
    description: 'Track total pipeline opportunity',
    icon: TrendingUp,
    placeholder: '2000000',
  },
  {
    value: 'meetings_booked',
    label: 'Meetings Booked',
    description: 'Track discovery calls and demos',
    icon: Calendar,
    placeholder: '50',
  },
  {
    value: 'emails_sent',
    label: 'Emails Sent',
    description: 'Track outreach volume',
    icon: Mail,
    placeholder: '500',
  },
]

const SERVICE_TYPES = [
  { value: 'wifi', label: 'WiFi Infrastructure' },
  { value: 'access_control', label: 'Access Control' },
  { value: 'cabling', label: 'Structured Cabling' },
  { value: 'security', label: 'Security Systems' },
  { value: 'tv', label: 'TV/Entertainment' },
  { value: 'smart_home', label: 'Smart Home/IoT' },
]

const VERTICALS = [
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'senior_living', label: 'Senior Living' },
  { value: 'multifamily', label: 'Multifamily' },
  { value: 'student', label: 'Student Housing' },
]

const TIME_PERIODS = [
  { value: 'month', label: 'This Month', days: 30 },
  { value: 'quarter', label: 'This Quarter', days: 90 },
  { value: 'year', label: 'This Year', days: 365 },
  { value: 'custom', label: 'Custom Dates', days: 0 },
]

export function CreateGoalModal({ isOpen, onClose, onSuccess }: CreateGoalModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    goal_name: '',
    goal_type: 'revenue',
    target_value: '',
    time_period: 'quarter',
    start_date: '',
    end_date: '',
    service_type: '',
    vertical: '',
    notes: '',
  })

  // Calculate dates based on time period
  const calculateDates = (period: string) => {
    const now = new Date()
    let startDate = new Date()
    let endDate = new Date()

    switch (period) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), quarter * 3, 1)
        endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now.getFullYear(), 11, 31)
        break
      default:
        return { startDate: '', endDate: '' }
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    }
  }

  const handleTimePeriodChange = (period: string) => {
    setFormData((prev) => {
      const dates = calculateDates(period)
      return {
        ...prev,
        time_period: period,
        start_date: dates.startDate || prev.start_date,
        end_date: dates.endDate || prev.end_date,
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate
      if (!formData.goal_name.trim()) {
        toast.error('Goal name is required')
        setLoading(false)
        return
      }

      if (!formData.target_value || Number(formData.target_value) <= 0) {
        toast.error('Target value must be greater than 0')
        setLoading(false)
        return
      }

      // Calculate dates if using preset period
      let startDate = formData.start_date
      let endDate = formData.end_date

      if (formData.time_period !== 'custom') {
        const dates = calculateDates(formData.time_period)
        startDate = dates.startDate
        endDate = dates.endDate
      }

      if (!startDate || !endDate) {
        toast.error('Please select a time period or enter custom dates')
        setLoading(false)
        return
      }

      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal_name: formData.goal_name.trim(),
          goal_type: formData.goal_type,
          target_value: Number(formData.target_value),
          start_date: startDate,
          end_date: endDate,
          service_type: formData.service_type || undefined,
          vertical: formData.vertical || undefined,
          notes: formData.notes.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create goal')
      }

      toast.success('Goal created!', {
        description: `${formData.goal_name} is now being tracked`,
      })

      // Reset form
      setFormData({
        goal_name: '',
        goal_type: 'revenue',
        target_value: '',
        time_period: 'quarter',
        start_date: '',
        end_date: '',
        service_type: '',
        vertical: '',
        notes: '',
      })

      onSuccess()
      onClose()
    } catch (error: unknown) {
      console.error('Error creating goal:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create goal')
    } finally {
      setLoading(false)
    }
  }

  const selectedGoalType = GOAL_TYPES.find((t) => t.value === formData.goal_type)
  const TypeIcon = selectedGoalType?.icon || Target

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Create New Goal
          </DialogTitle>
          <DialogDescription>
            Set a target to track your progress. The system will automatically calculate your pace
            and provide recommendations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Goal Name */}
          <div className="space-y-2">
            <Label htmlFor="goal_name">
              Goal Name <span className="text-red-500">*</span>
            </Label>
            <input
              type="text"
              id="goal_name"
              value={formData.goal_name}
              onChange={(e) => setFormData({ ...formData, goal_name: e.target.value })}
              placeholder="e.g., Q1 2025 Revenue, January Deals"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          {/* Goal Type */}
          <div className="space-y-2">
            <Label>
              Goal Type <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {GOAL_TYPES.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, goal_type: type.value })}
                    className={`flex items-start gap-3 rounded-md border p-3 text-left transition-colors ${
                      formData.goal_type === type.value
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:bg-muted/50'
                    }`}
                  >
                    <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Target Value */}
          <div className="space-y-2">
            <Label htmlFor="target_value" className="flex items-center gap-2">
              <TypeIcon className="h-4 w-4" />
              Target Value <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              {formData.goal_type === 'revenue' || formData.goal_type === 'pipeline_value' ? (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
              ) : null}
              <input
                type="number"
                id="target_value"
                value={formData.target_value}
                onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                placeholder={selectedGoalType?.placeholder || '0'}
                className={`w-full rounded-md border bg-background py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring ${
                  formData.goal_type === 'revenue' || formData.goal_type === 'pipeline_value'
                    ? 'pl-7 pr-3'
                    : 'px-3'
                }`}
                min="1"
                required
              />
            </div>
          </div>

          {/* Time Period */}
          <div className="space-y-2">
            <Label>Time Period</Label>
            <div className="grid grid-cols-4 gap-2">
              {TIME_PERIODS.map((period) => (
                <button
                  key={period.value}
                  type="button"
                  onClick={() => handleTimePeriodChange(period.value)}
                  className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                    formData.time_period === period.value
                      ? 'border-primary bg-primary/5 font-medium'
                      : 'border-muted hover:bg-muted/50'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Dates */}
          {formData.time_period === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <input
                  type="date"
                  id="start_date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <input
                  type="date"
                  id="end_date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
            </div>
          )}

          {/* Optional Filters */}
          <div className="grid grid-cols-2 gap-4">
            {/* Service Type (for services_sold) */}
            {formData.goal_type === 'services_sold' && (
              <div className="space-y-2">
                <Label htmlFor="service_type">Service Type</Label>
                <select
                  id="service_type"
                  value={formData.service_type}
                  onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">All Services</option>
                  {SERVICE_TYPES.map((service) => (
                    <option key={service.value} value={service.value}>
                      {service.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Vertical Filter */}
            <div className="space-y-2">
              <Label htmlFor="vertical">Vertical (Optional)</Label>
              <select
                id="vertical"
                value={formData.vertical}
                onChange={(e) => setFormData({ ...formData, vertical: e.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Verticals</option>
                {VERTICALS.map((vertical) => (
                  <option key={vertical.value} value={vertical.value}>
                    {vertical.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notes (Optional)
            </Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any context or breakdown for this goal..."
              rows={2}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Info Box */}
          <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
            <p className="font-medium">Progress Tracking</p>
            <p className="text-xs mt-1">
              Your goal progress will be automatically calculated from closed deals and activities.
              When you fall behind pace, the system will provide NEPQ-powered recommendations to help
              you catch up.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Goal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
