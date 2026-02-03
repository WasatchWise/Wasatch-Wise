'use client'

import type { VenueCapabilityFormData } from '@/lib/validations/venue-capability'

const AGE_OPTIONS = [
  { value: 'all_ages', label: 'All Ages' },
  { value: '18+', label: '18+' },
  { value: '21+', label: '21+' },
] as const

interface PoliciesStepProps {
  data: VenueCapabilityFormData
  updateData: (updates: Partial<VenueCapabilityFormData>) => void
  onNext: () => void
  onBack: () => void
  onSaveDraft: () => void
  isSaving: boolean
  isFirstStep: boolean
}

export default function PoliciesStep({
  data,
  updateData,
  onNext,
  onBack,
  onSaveDraft,
  isSaving,
  isFirstStep,
}: PoliciesStepProps) {
  const handleAgeToggle = (value: string) => {
    const current = data.age_restrictions || []
    const updated = current.includes(value)
      ? current.filter((a) => a !== value)
      : [...current, value]
    updateData({ age_restrictions: updated })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Venue Policies
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Age restrictions and load-in details.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Age Restrictions (select all that apply)
        </label>
        <div className="flex flex-wrap gap-3">
          {AGE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <input
                type="checkbox"
                checked={(data.age_restrictions || []).includes(opt.value)}
                onChange={() => handleAgeToggle(opt.value)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-gray-900 dark:text-white">{opt.label}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Which age groups can play at your venue?
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Curfew Time
        </label>
        <input
          type="time"
          value={data.curfew_time ?? ''}
          onChange={(e) =>
            updateData({ curfew_time: e.target.value || null })
          }
          className="w-full md:w-48 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
        />
        <p className="text-xs text-gray-500 mt-1">e.g., 11:00 PM</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Load-In Notes
        </label>
        <textarea
          value={data.load_in_notes ?? ''}
          onChange={(e) =>
            updateData({ load_in_notes: e.target.value || null })
          }
          placeholder="Load-in door, parking for trailers, load-in time..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onBack}
            disabled={isFirstStep}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSaving}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-900 dark:text-white"
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
        </div>
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700"
        >
          Next
        </button>
      </div>
    </div>
  )
}
