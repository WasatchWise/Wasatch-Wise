'use client'

import { SpiderRiderFormData } from '@/lib/validations/spider-rider'

interface MetaStepProps {
  formData: SpiderRiderFormData
  updateFormData: (updates: Partial<SpiderRiderFormData>) => void
  errors: Record<string, string>
  bandName: string
  disabled?: boolean
}

export default function MetaStep({
  formData,
  updateFormData,
  errors,
  bandName,
  disabled,
}: MetaStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Spider Rider Basics
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Set up the basic information for your touring terms.
        </p>
      </div>

      {/* Band Name (read-only) */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Band
        </label>
        <div className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white">
          {bandName}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          This rider will be associated with your band
        </p>
      </div>

      {/* Version Name */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Version Name *
        </label>
        <input
          type="text"
          value={formData.version}
          onChange={(e) => updateFormData({ version: e.target.value })}
          disabled={disabled}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed ${
            errors.version
              ? 'border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="v1, Club Tour 2026, etc."
        />
        {errors.version && (
          <p className="text-red-500 text-sm mt-1">{errors.version}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Give this rider a name to help you track different versions (e.g., "Club Tour 2026", "Festival Season")
        </p>
      </div>

      {/* Age Restriction */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Age Restriction Preference
        </label>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'all_ages', label: 'All Ages', desc: 'Family-friendly shows' },
            { value: '18+', label: '18+', desc: 'Adult venues' },
            { value: '21+', label: '21+', desc: 'Bar venues' },
          ].map((option) => (
            <label
              key={option.value}
              className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.ageRestriction === option.value
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name="ageRestriction"
                value={option.value}
                checked={formData.ageRestriction === option.value}
                onChange={(e) => updateFormData({ ageRestriction: e.target.value as 'all_ages' | '18+' | '21+' })}
                disabled={disabled}
                className="sr-only"
              />
              <span className="font-semibold text-gray-900 dark:text-white">{option.label}</span>
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center">{option.desc}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Select "All Ages" if you're open to any venue type. Leave unset if you have no preference.
        </p>
        {formData.ageRestriction && (
          <button
            type="button"
            onClick={() => updateFormData({ ageRestriction: null })}
            disabled={disabled}
            className="text-sm text-indigo-600 hover:text-indigo-700 mt-2"
          >
            Clear selection
          </button>
        )}
      </div>

      {/* Business Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          General Notes
        </label>
        <textarea
          value={formData.notesBusiness || ''}
          onChange={(e) => updateFormData({ notesBusiness: e.target.value || null })}
          disabled={disabled}
          rows={4}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed ${
            errors.notesBusiness
              ? 'border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="Any additional information venues should know about your band..."
        />
        {errors.notesBusiness && (
          <p className="text-red-500 text-sm mt-1">{errors.notesBusiness}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          E.g., touring radius, preferred days, special requirements
        </p>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          What is a Spider Rider?
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
          <li>It's your band's "touring terms" in one place</li>
          <li>Venues can browse and accept your terms to book you</li>
          <li>Once published, it becomes a standing offer to all qualified venues</li>
          <li>You can create multiple versions for different types of shows</li>
        </ul>
      </div>
    </div>
  )
}
