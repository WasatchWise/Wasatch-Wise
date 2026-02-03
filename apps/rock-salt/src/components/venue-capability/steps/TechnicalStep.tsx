'use client'

import type { VenueCapabilityFormData } from '@/lib/validations/venue-capability'

interface TechnicalStepProps {
  data: VenueCapabilityFormData
  updateData: (updates: Partial<VenueCapabilityFormData>) => void
  onNext: () => void
  onBack: () => void
  onSaveDraft: () => void
  isSaving: boolean
  isFirstStep: boolean
}

export default function TechnicalStep({
  data,
  updateData,
  onNext,
  onBack,
  onSaveDraft,
  isSaving,
  isFirstStep,
}: TechnicalStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Technical Specs
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Declare your stage and sound capabilities so bands can see compatibility.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Stage Width
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="200"
              value={data.stage_width_feet ?? ''}
              onChange={(e) =>
                updateData({
                  stage_width_feet: e.target.value ? Number(e.target.value) : null,
                })
              }
              placeholder="20"
              className="w-full pr-12 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
            <span className="absolute right-3 top-3 text-gray-500">feet</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Stage Depth
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              value={data.stage_depth_feet ?? ''}
              onChange={(e) =>
                updateData({
                  stage_depth_feet: e.target.value ? Number(e.target.value) : null,
                })
              }
              placeholder="12"
              className="w-full pr-12 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
            <span className="absolute right-3 top-3 text-gray-500">feet</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Input Channels Available
        </label>
        <input
          type="number"
          min="0"
          max="64"
          value={data.input_channels ?? ''}
          onChange={(e) =>
            updateData({
              input_channels: e.target.value ? Number(e.target.value) : null,
            })
          }
          placeholder="16"
          className="w-full md:w-1/2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
        />
        <p className="text-xs text-gray-500 mt-1">How many channels on your mixing board?</p>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.has_house_drums ?? false}
            onChange={(e) => updateData({ has_house_drums: e.target.checked })}
            className="w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500"
          />
          <span className="font-medium text-gray-900 dark:text-white">
            House Drums Available
          </span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.has_backline ?? false}
            onChange={(e) => updateData({ has_backline: e.target.checked })}
            className="w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500"
          />
          <span className="font-medium text-gray-900 dark:text-white">
            House Backline (amps, keys, etc.)
          </span>
        </label>
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
