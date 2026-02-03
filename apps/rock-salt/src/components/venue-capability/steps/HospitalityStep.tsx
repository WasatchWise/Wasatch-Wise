'use client'

import type { VenueCapabilityFormData } from '@/lib/validations/venue-capability'

function formatCurrency(cents: number | null | undefined): string {
  if (cents == null) return ''
  return (cents / 100).toString()
}

function parseCurrency(value: string): number | null {
  const parsed = parseFloat(value)
  return isNaN(parsed) ? null : Math.round(parsed * 100)
}

interface HospitalityStepProps {
  data: VenueCapabilityFormData
  updateData: (updates: Partial<VenueCapabilityFormData>) => void
  onNext: () => void
  onBack: () => void
  onSaveDraft: () => void
  isSaving: boolean
  isFirstStep: boolean
}

export default function HospitalityStep({
  data,
  updateData,
  onNext,
  onBack,
  onSaveDraft,
  isSaving,
  isFirstStep,
}: HospitalityStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Hospitality
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Declare what you offer for meals, drinks, and green room.
        </p>
      </div>

      <label className="flex items-center gap-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
        <input
          type="checkbox"
          checked={data.green_room_available ?? false}
          onChange={(e) =>
            updateData({ green_room_available: e.target.checked })
          }
          className="w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500"
        />
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            Green Room Available
          </div>
          <div className="text-sm text-gray-500">Private space for artists</div>
        </div>
      </label>

      {data.green_room_available && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Green Room Description
          </label>
          <textarea
            value={data.green_room_description ?? ''}
            onChange={(e) =>
              updateData({ green_room_description: e.target.value || null })
            }
            placeholder="Private room with couch, fridge, bathroom..."
            rows={2}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
          />
        </div>
      )}

      <label className="flex items-center gap-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
        <input
          type="checkbox"
          checked={data.meal_buyout_available ?? false}
          onChange={(e) =>
            updateData({ meal_buyout_available: e.target.checked })
          }
          className="w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500"
        />
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            Meal Buyout Available
          </div>
          <div className="text-sm text-gray-500">
            Can provide meal buyout per person
          </div>
        </div>
      </label>

      {data.meal_buyout_available && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Typical Meal Buyout Amount ($/person)
          </label>
          <div className="relative w-48">
            <span className="absolute left-3 top-3 text-gray-500">$</span>
            <input
              type="number"
              min="0"
              step="5"
              value={formatCurrency(data.typical_meal_buyout_amount ?? undefined)}
              onChange={(e) =>
                updateData({
                  typical_meal_buyout_amount: parseCurrency(e.target.value),
                })
              }
              placeholder="25"
              className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Drink Tickets (typical)
          </label>
          <input
            type="number"
            min="0"
            value={data.drink_tickets_available ?? ''}
            onChange={(e) =>
              updateData({
                drink_tickets_available: e.target.value
                  ? Number(e.target.value)
                  : null,
              })
            }
            placeholder="4"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Guest List Spots (typical)
          </label>
          <input
            type="number"
            min="0"
            value={data.guest_list_spots ?? ''}
            onChange={(e) =>
              updateData({
                guest_list_spots: e.target.value ? Number(e.target.value) : null,
              })
            }
            placeholder="10"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Parking Spaces
        </label>
        <input
          type="number"
          min="0"
          value={data.parking_spaces ?? ''}
          onChange={(e) =>
            updateData({
              parking_spaces: e.target.value ? Number(e.target.value) : null,
            })
          }
          placeholder="20"
          className="w-full md:w-48 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
        />
        <p className="text-xs text-gray-500 mt-1">Available for artists/crew</p>
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
