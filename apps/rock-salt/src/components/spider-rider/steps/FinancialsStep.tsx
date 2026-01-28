'use client'

import { SpiderRiderFormData } from '@/lib/validations/spider-rider'

interface FinancialsStepProps {
  formData: SpiderRiderFormData
  updateFormData: (updates: Partial<SpiderRiderFormData>) => void
  errors: Record<string, string>
  disabled?: boolean
}

export default function FinancialsStep({
  formData,
  updateFormData,
  errors,
  disabled,
}: FinancialsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Financial Terms
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Set your guarantee range and payment terms. We don't do "exposure" gigs - minimum $100.
        </p>
      </div>

      {/* Guarantee Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Minimum Guarantee *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">$</span>
            <input
              type="number"
              min="100"
              step="50"
              value={formData.guaranteeMin || ''}
              onChange={(e) => updateFormData({ guaranteeMin: Number(e.target.value) || 0 })}
              disabled={disabled}
              className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed ${
                errors.guaranteeMin
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="500"
            />
          </div>
          {errors.guaranteeMin && (
            <p className="text-red-500 text-sm mt-1">{errors.guaranteeMin}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">Minimum $100 required</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Maximum Guarantee
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">$</span>
            <input
              type="number"
              min="100"
              step="50"
              value={formData.guaranteeMax || ''}
              onChange={(e) => updateFormData({ guaranteeMax: e.target.value ? Number(e.target.value) : null })}
              disabled={disabled}
              className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed ${
                errors.guaranteeMax
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="2000"
            />
          </div>
          {errors.guaranteeMax && (
            <p className="text-red-500 text-sm mt-1">{errors.guaranteeMax}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Optional - leave blank for flat rate
          </p>
        </div>
      </div>

      {/* Door Split */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Door Split (Band's Percentage)
        </label>
        <div className="relative">
          <input
            type="number"
            min="0"
            max="100"
            value={formData.doorSplitPercentage || ''}
            onChange={(e) => updateFormData({ doorSplitPercentage: e.target.value ? Number(e.target.value) : null })}
            disabled={disabled}
            className={`w-full pr-10 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed ${
              errors.doorSplitPercentage
                ? 'border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="80"
          />
          <span className="absolute right-3 top-3 text-gray-500">%</span>
        </div>
        {errors.doorSplitPercentage && (
          <p className="text-red-500 text-sm mt-1">{errors.doorSplitPercentage}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          e.g., 80 = 80/20 split in your favor
        </p>
      </div>

      {/* Merch Split */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Merch Commission to Venue
        </label>
        <div className="relative">
          <input
            type="number"
            min="0"
            max="50"
            value={formData.merchSplitToVenuePercentage || ''}
            onChange={(e) => updateFormData({ merchSplitToVenuePercentage: e.target.value ? Number(e.target.value) : 15 })}
            disabled={disabled}
            className={`w-full pr-10 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed ${
              errors.merchSplitToVenuePercentage
                ? 'border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="15"
          />
          <span className="absolute right-3 top-3 text-gray-500">%</span>
        </div>
        {errors.merchSplitToVenuePercentage && (
          <p className="text-red-500 text-sm mt-1">{errors.merchSplitToVenuePercentage}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Industry standard is 10-20%
        </p>
      </div>

      {/* Financial Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Additional Financial Notes
        </label>
        <textarea
          value={formData.notesFinancial || ''}
          onChange={(e) => updateFormData({ notesFinancial: e.target.value || null })}
          disabled={disabled}
          rows={3}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed ${
            errors.notesFinancial
              ? 'border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="e.g., 50% deposit required, payment night-of..."
        />
        {errors.notesFinancial && (
          <p className="text-red-500 text-sm mt-1">{errors.notesFinancial}</p>
        )}
      </div>

      {/* Info box */}
      <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
          Pricing Tips
        </h3>
        <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1 list-disc list-inside">
          <li>Research what similar bands in your market charge</li>
          <li>Factor in travel, equipment, and time costs</li>
          <li>Consider offering a range to attract different venue sizes</li>
          <li>Door splits work well for smaller venues</li>
        </ul>
      </div>
    </div>
  )
}
