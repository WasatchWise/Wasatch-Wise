'use client'

import { SpiderRiderFormData } from '@/lib/validations/spider-rider'

interface HospitalityStepProps {
  formData: SpiderRiderFormData
  updateFormData: (updates: Partial<SpiderRiderFormData>) => void
  errors: Record<string, string>
  disabled?: boolean
}

export default function HospitalityStep({
  formData,
  updateFormData,
  errors,
  disabled,
}: HospitalityStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Hospitality Requirements
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Let venues know what you need to perform your best. Be reasonable - this affects booking decisions.
        </p>
      </div>

      {/* Meal Buyout */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Meal Buyout Amount (per person)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-3 text-gray-500">$</span>
          <input
            type="number"
            min="0"
            max="500"
            step="5"
            value={formData.mealBuyoutAmount || ''}
            onChange={(e) => updateFormData({ mealBuyoutAmount: e.target.value ? Number(e.target.value) : null })}
            disabled={disabled}
            className={`w-full md:w-1/2 pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed ${
              errors.mealBuyoutAmount
                ? 'border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="25"
          />
        </div>
        {errors.mealBuyoutAmount && (
          <p className="text-red-500 text-sm mt-1">{errors.mealBuyoutAmount}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Cash for food if venue doesn't provide a meal. Industry standard is $15-25/person.
        </p>
      </div>

      {/* Drink Tickets */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Drink Tickets
        </label>
        <input
          type="number"
          min="0"
          max="50"
          value={formData.drinkTicketsCount || ''}
          onChange={(e) => updateFormData({ drinkTicketsCount: e.target.value ? Number(e.target.value) : null })}
          disabled={disabled}
          className={`w-full md:w-1/2 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed ${
            errors.drinkTicketsCount
              ? 'border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="4"
        />
        {errors.drinkTicketsCount && (
          <p className="text-red-500 text-sm mt-1">{errors.drinkTicketsCount}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Number of complimentary drink tickets for the band
        </p>
      </div>

      {/* Guest List */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Guest List Spots
        </label>
        <input
          type="number"
          min="0"
          max="50"
          value={formData.guestListAllocation || ''}
          onChange={(e) => updateFormData({ guestListAllocation: e.target.value ? Number(e.target.value) : null })}
          disabled={disabled}
          className={`w-full md:w-1/2 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed ${
            errors.guestListAllocation
              ? 'border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="10"
        />
        {errors.guestListAllocation && (
          <p className="text-red-500 text-sm mt-1">{errors.guestListAllocation}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          How many free entries for friends, family, and crew
        </p>
      </div>

      {/* Green Room Requirements */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Green Room / Private Space Requirements
        </label>
        <textarea
          value={formData.greenRoomRequirements || ''}
          onChange={(e) => updateFormData({ greenRoomRequirements: e.target.value || null })}
          disabled={disabled}
          rows={3}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed ${
            errors.greenRoomRequirements
              ? 'border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="e.g., Private room with seating, mirror, and outlet for getting ready..."
        />
        {errors.greenRoomRequirements && (
          <p className="text-red-500 text-sm mt-1">{errors.greenRoomRequirements}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Describe your backstage/green room needs
        </p>
      </div>

      {/* Hospitality Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Additional Hospitality Notes
        </label>
        <textarea
          value={formData.notesHospitality || ''}
          onChange={(e) => updateFormData({ notesHospitality: e.target.value || null })}
          disabled={disabled}
          rows={4}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed ${
            errors.notesHospitality
              ? 'border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="e.g., Vegetarian options preferred, bottled water on stage, towels..."
        />
        {errors.notesHospitality && (
          <p className="text-red-500 text-sm mt-1">{errors.notesHospitality}</p>
        )}
      </div>

      {/* Info box */}
      <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
          Hospitality Rider Tips
        </h3>
        <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 list-disc list-inside">
          <li>Be reasonable - excessive demands turn off venues</li>
          <li>Meal buyout is often easier for venues than providing food</li>
          <li>Keep in mind smaller venues have limited resources</li>
          <li>Mention any dietary restrictions or allergies</li>
        </ul>
      </div>
    </div>
  )
}
