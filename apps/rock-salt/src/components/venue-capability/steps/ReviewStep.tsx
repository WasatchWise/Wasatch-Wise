'use client'

import type { VenueCapabilityFormData } from '@/lib/validations/venue-capability'

function formatCurrency(cents: number | null | undefined): string {
  if (cents == null) return 'Not specified'
  return `$${(cents / 100).toLocaleString()}`
}

interface ReviewStepProps {
  data: VenueCapabilityFormData
  venueName: string
  onBack: () => void
  onSave: () => void
  isSaving: boolean
  isFirstStep: boolean
}

export default function ReviewStep({
  data,
  venueName,
  onBack,
  onSave,
  isSaving,
  isFirstStep,
}: ReviewStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Review Your Profile
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Confirm your venue capability profile before saving.
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-6">
        <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {venueName}
          </h3>
          <p className="text-sm text-gray-500">Venue Capability Profile</p>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 dark:text-white mb-3">
            Financial
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Guarantee Range</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(data.typical_guarantee_min)}
                {data.typical_guarantee_max != null &&
                  ` - ${formatCurrency(data.typical_guarantee_max)}`}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Payment Methods</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {(data.payment_methods || []).length > 0
                  ? (data.payment_methods || []).join(', ')
                  : 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">W-9 / COI</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {data.w9_on_file ? '✓ W-9' : ''}{' '}
                {data.insurance_coi_on_file ? '✓ COI' : ''}
                {!data.w9_on_file && !data.insurance_coi_on_file
                  ? 'Not specified'
                  : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="font-bold text-gray-900 dark:text-white mb-3">
            Technical
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Stage Size</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {data.stage_width_feet && data.stage_depth_feet
                  ? `${data.stage_width_feet}' × ${data.stage_depth_feet}'`
                  : 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Input Channels</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {data.input_channels ?? 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">House Drums</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {data.has_house_drums ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Backline</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {data.has_backline ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="font-bold text-gray-900 dark:text-white mb-3">
            Hospitality
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Green Room</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {data.green_room_available ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Meal Buyout</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {data.meal_buyout_available
                  ? formatCurrency(data.typical_meal_buyout_amount) + '/person'
                  : 'No'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Drink Tickets</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {data.drink_tickets_available ?? 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Guest List</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {data.guest_list_spots ?? 'Not specified'} spots
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="font-bold text-gray-900 dark:text-white mb-3">
            Policies
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Age Restrictions</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {(data.age_restrictions || []).length > 0
                  ? (data.age_restrictions || []).join(', ')
                  : 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Curfew</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {data.curfew_time ?? 'Not specified'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
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
          onClick={onSave}
          disabled={isSaving}
          className="px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  )
}
