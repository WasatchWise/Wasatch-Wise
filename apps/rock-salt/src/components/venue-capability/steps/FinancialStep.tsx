'use client'

import type { VenueCapabilityFormData } from '@/lib/validations/venue-capability'

const PAYMENT_METHOD_OPTIONS = [
  { value: 'cash', label: 'Cash' },
  { value: 'venmo', label: 'Venmo' },
  { value: 'zelle', label: 'Zelle' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'check', label: 'Check' },
  { value: 'ach', label: 'ACH/Wire' },
]

function formatCurrency(cents: number | null | undefined): string {
  if (cents == null) return ''
  return (cents / 100).toString()
}

function parseCurrency(value: string): number {
  const parsed = parseFloat(value)
  return isNaN(parsed) ? 0 : Math.round(parsed * 100)
}

interface FinancialStepProps {
  data: VenueCapabilityFormData
  updateData: (updates: Partial<VenueCapabilityFormData>) => void
  onNext: () => void
  onBack: () => void
  onSaveDraft: () => void
  isSaving: boolean
  isFirstStep: boolean
}

export default function FinancialStep({
  data,
  updateData,
  onNext,
  onBack,
  onSaveDraft,
  isSaving,
  isFirstStep,
}: FinancialStepProps) {
  const handlePaymentToggle = (method: string) => {
    const current = data.payment_methods || []
    const updated = current.includes(method)
      ? current.filter((m) => m !== method)
      : [...current, method]
    updateData({ payment_methods: updated })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Financial Terms
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Set your typical guarantee range and payment information
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Typical Minimum Guarantee
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">$</span>
            <input
              type="number"
              min="0"
              step="50"
              value={formatCurrency(data.typical_guarantee_min ?? undefined)}
              onChange={(e) =>
                updateData({
                  typical_guarantee_min: parseCurrency(e.target.value) || null,
                })
              }
              placeholder="250"
              className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Minimum you typically offer</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Typical Maximum Guarantee
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">$</span>
            <input
              type="number"
              min="0"
              step="100"
              value={formatCurrency(data.typical_guarantee_max ?? undefined)}
              onChange={(e) =>
                updateData({
                  typical_guarantee_max: parseCurrency(e.target.value) || null,
                })
              }
              placeholder="2000"
              className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Maximum you can offer</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Payment Methods Accepted
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PAYMENT_METHOD_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <input
                type="checkbox"
                checked={(data.payment_methods || []).includes(opt.value)}
                onChange={() => handlePaymentToggle(opt.value)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-gray-900 dark:text-white">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
          <input
            type="checkbox"
            checked={data.w9_on_file ?? false}
            onChange={(e) => updateData({ w9_on_file: e.target.checked })}
            className="w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500"
          />
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              W-9 on File
            </div>
            <div className="text-sm text-gray-500">
              W-9 form ready for payment processing
            </div>
          </div>
        </label>
        <label className="flex items-center gap-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
          <input
            type="checkbox"
            checked={data.insurance_coi_on_file ?? false}
            onChange={(e) =>
              updateData({ insurance_coi_on_file: e.target.checked })
            }
            className="w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500"
          />
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              Certificate of Insurance (COI)
            </div>
            <div className="text-sm text-gray-500">
              Liability insurance and COI available
            </div>
          </div>
        </label>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
          Why this matters
        </h4>
        <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
          <li>• Guarantee ranges help match you with appropriately-sized acts</li>
          <li>• Payment methods reduce booking friction</li>
          <li>• W-9 and insurance show professionalism</li>
        </ul>
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
