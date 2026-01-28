'use client'

import { SpiderRiderFormData } from '@/lib/validations/spider-rider'

interface TechStepProps {
  formData: SpiderRiderFormData
  updateFormData: (updates: Partial<SpiderRiderFormData>) => void
  errors: Record<string, string>
  disabled?: boolean
}

export default function TechStep({
  formData,
  updateFormData,
  errors,
  disabled,
}: TechStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Technical Requirements
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Specify your stage and sound requirements so venues know if they can accommodate you.
        </p>
      </div>

      {/* Stage Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Minimum Stage Width
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="200"
              value={formData.minStageWidthFeet || ''}
              onChange={(e) => updateFormData({ minStageWidthFeet: e.target.value ? Number(e.target.value) : null })}
              disabled={disabled}
              className={`w-full pr-12 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed ${
                errors.minStageWidthFeet
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="20"
            />
            <span className="absolute right-3 top-3 text-gray-500">feet</span>
          </div>
          {errors.minStageWidthFeet && (
            <p className="text-red-500 text-sm mt-1">{errors.minStageWidthFeet}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Minimum Stage Depth
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              value={formData.minStageDepthFeet || ''}
              onChange={(e) => updateFormData({ minStageDepthFeet: e.target.value ? Number(e.target.value) : null })}
              disabled={disabled}
              className={`w-full pr-12 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed ${
                errors.minStageDepthFeet
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="12"
            />
            <span className="absolute right-3 top-3 text-gray-500">feet</span>
          </div>
          {errors.minStageDepthFeet && (
            <p className="text-red-500 text-sm mt-1">{errors.minStageDepthFeet}</p>
          )}
        </div>
      </div>

      {/* Input Channels */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Minimum Input Channels
        </label>
        <input
          type="number"
          min="0"
          max="64"
          value={formData.minInputChannels || ''}
          onChange={(e) => updateFormData({ minInputChannels: e.target.value ? Number(e.target.value) : null })}
          disabled={disabled}
          className={`w-full md:w-1/2 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed ${
            errors.minInputChannels
              ? 'border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="16"
        />
        {errors.minInputChannels && (
          <p className="text-red-500 text-sm mt-1">{errors.minInputChannels}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          How many channels do you need on the mixing board?
        </p>
      </div>

      {/* House Drums */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.requiresHouseDrums}
            onChange={(e) => updateFormData({ requiresHouseDrums: e.target.checked })}
            disabled={disabled}
            className="w-5 h-5 text-indigo-600 rounded disabled:opacity-60"
          />
          <div>
            <span className="font-medium text-gray-900 dark:text-white">
              Require House Drums / Backline
            </span>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Check if you need the venue to provide a drum kit
            </p>
          </div>
        </label>
      </div>

      {/* Stage Plot URL */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Stage Plot URL
        </label>
        <input
          type="url"
          value={formData.stagePlotUrl || ''}
          onChange={(e) => updateFormData({ stagePlotUrl: e.target.value || null })}
          disabled={disabled}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed ${
            errors.stagePlotUrl
              ? 'border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="https://example.com/stage-plot.pdf"
        />
        {errors.stagePlotUrl && (
          <p className="text-red-500 text-sm mt-1">{errors.stagePlotUrl}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Link to your stage plot diagram (PDF or image)
        </p>
      </div>

      {/* Input List URL */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Input List URL
        </label>
        <input
          type="url"
          value={formData.inputListUrl || ''}
          onChange={(e) => updateFormData({ inputListUrl: e.target.value || null })}
          disabled={disabled}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed ${
            errors.inputListUrl
              ? 'border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="https://example.com/input-list.pdf"
        />
        {errors.inputListUrl && (
          <p className="text-red-500 text-sm mt-1">{errors.inputListUrl}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Link to your channel/input list document
        </p>
      </div>

      {/* Technical Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Additional Technical Notes
        </label>
        <textarea
          value={formData.notesTechnical || ''}
          onChange={(e) => updateFormData({ notesTechnical: e.target.value || null })}
          disabled={disabled}
          rows={4}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed ${
            errors.notesTechnical
              ? 'border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="e.g., We bring our own bass amp, need 4 monitor mixes, in-ears preferred..."
        />
        {errors.notesTechnical && (
          <p className="text-red-500 text-sm mt-1">{errors.notesTechnical}</p>
        )}
      </div>

      {/* Info box */}
      <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
          Tech Rider Tips
        </h3>
        <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1 list-disc list-inside">
          <li>Be realistic about your minimum requirements</li>
          <li>Include links to detailed stage plot and input list</li>
          <li>Specify what you bring vs. what you need provided</li>
          <li>Mention any special power requirements (110v/220v)</li>
        </ul>
      </div>
    </div>
  )
}
