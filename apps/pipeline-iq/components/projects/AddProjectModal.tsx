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
import { Building2, MapPin, DollarSign, Briefcase, FileText, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

interface AddProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const PROJECT_TYPES = [
  { value: 'hotel', label: 'Hotel/Hospitality' },
  { value: 'multifamily', label: 'Multifamily' },
  { value: 'senior_living', label: 'Senior Living' },
  { value: 'student_housing', label: 'Student Housing' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'mixed_use', label: 'Mixed Use' },
]

const PROJECT_STAGES = [
  { value: 'planning', label: 'Planning' },
  { value: 'pre-construction', label: 'Pre-Construction' },
  { value: 'design', label: 'Design' },
  { value: 'bidding', label: 'Bidding' },
  { value: 'construction', label: 'Construction' },
]

const PROJECT_SOURCES = [
  { value: 'manual_entry', label: 'Manual Entry' },
  { value: 'referral', label: 'Referral' },
  { value: 'networking', label: 'Networking Event' },
  { value: 'trade_show', label: 'Trade Show' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'other', label: 'Other' },
]

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

export function AddProjectModal({
  isOpen,
  onClose,
  onSuccess,
}: AddProjectModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    project_name: '',
    project_type: 'hotel',
    project_stage: 'planning',
    city: '',
    state: '',
    project_value: '',
    units_count: '',
    developer_name: '',
    notes: '',
    source: 'manual_entry',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.project_name.trim()) {
        toast.error('Project name is required')
        setLoading(false)
        return
      }

      if (!formData.city.trim() || !formData.state) {
        toast.error('City and state are required')
        setLoading(false)
        return
      }

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: formData.project_name.trim(),
          project_type: [formData.project_type],
          project_stage: formData.project_stage,
          city: formData.city.trim(),
          state: formData.state,
          project_value: formData.project_value ? Number(formData.project_value) : undefined,
          units_count: formData.units_count ? Number(formData.units_count) : undefined,
          developer_name: formData.developer_name.trim() || undefined,
          source: formData.source,
          raw_data: {
            notes: formData.notes.trim() || undefined,
            manual_entry: true,
            entry_date: new Date().toISOString(),
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create project')
      }

      toast.success('Project created!', {
        description: `${formData.project_name} added to pipeline`,
      })

      // Reset form
      setFormData({
        project_name: '',
        project_type: 'hotel',
        project_stage: 'planning',
        city: '',
        state: '',
        project_value: '',
        units_count: '',
        developer_name: '',
        notes: '',
        source: 'manual_entry',
      })

      onSuccess()
      onClose()
    } catch (error: unknown) {
      console.error('Error creating project:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Add Project
          </DialogTitle>
          <DialogDescription>
            Manually add a lead from networking, referrals, or other sources.
            The system will auto-calculate the Groove Fit Score.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Name - Required */}
          <div className="space-y-2">
            <Label htmlFor="project_name">
              Project Name <span className="text-red-500">*</span>
            </Label>
            <input
              type="text"
              id="project_name"
              value={formData.project_name}
              onChange={(e) =>
                setFormData({ ...formData, project_name: e.target.value })
              }
              placeholder="e.g., Sunset Ridge Apartments"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          {/* Project Type & Stage Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project_type">
                Project Type <span className="text-red-500">*</span>
              </Label>
              <select
                id="project_type"
                value={formData.project_type}
                onChange={(e) =>
                  setFormData({ ...formData, project_type: e.target.value })
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              >
                {PROJECT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project_stage">Project Stage</Label>
              <select
                id="project_stage"
                value={formData.project_stage}
                onChange={(e) =>
                  setFormData({ ...formData, project_stage: e.target.value })
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {PROJECT_STAGES.map((stage) => (
                  <option key={stage.value} value={stage.value}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                City <span className="text-red-500">*</span>
              </Label>
              <input
                type="text"
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                placeholder="e.g., Austin"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">
                State <span className="text-red-500">*</span>
              </Label>
              <select
                id="state"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              >
                <option value="">Select State</option>
                {US_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Value & Units Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project_value" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Project Value
              </Label>
              <input
                type="number"
                id="project_value"
                value={formData.project_value}
                onChange={(e) =>
                  setFormData({ ...formData, project_value: e.target.value })
                }
                placeholder="e.g., 50000000"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground">Enter value in dollars</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="units_count">Units / Keys</Label>
              <input
                type="number"
                id="units_count"
                value={formData.units_count}
                onChange={(e) =>
                  setFormData({ ...formData, units_count: e.target.value })
                }
                placeholder="e.g., 200"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Developer & Source Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="developer_name" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Developer Name
              </Label>
              <input
                type="text"
                id="developer_name"
                value={formData.developer_name}
                onChange={(e) =>
                  setFormData({ ...formData, developer_name: e.target.value })
                }
                placeholder="e.g., ABC Development"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Lead Source</Label>
              <select
                id="source"
                value={formData.source}
                onChange={(e) =>
                  setFormData({ ...formData, source: e.target.value })
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {PROJECT_SOURCES.map((source) => (
                  <option key={source.value} value={source.value}>
                    {source.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notes / Context
            </Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="How did you find this lead? Any context about the opportunity..."
              rows={3}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Info Box */}
          <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
            <div className="flex items-center gap-2 font-medium">
              <Sparkles className="h-4 w-4" />
              Auto-Scoring Enabled
            </div>
            <p className="text-xs mt-1">
              After saving, the system will automatically calculate a Groove Fit Score
              based on project type, value, and location. You can enrich the project
              with AI to discover contacts and additional details.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
