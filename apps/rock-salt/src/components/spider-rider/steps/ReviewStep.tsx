'use client'

import { SpiderRiderFormData } from '@/lib/validations/spider-rider'

interface ReviewStepProps {
  formData: SpiderRiderFormData
  bandName: string
  onPublish: () => void
  onSaveDraft: () => void
  isSubmitting: boolean
  isEditing: boolean
  isPublished: boolean
}

export default function ReviewStep({
  formData,
  bandName,
  onPublish,
  onSaveDraft,
  isSubmitting,
  isEditing,
  isPublished,
}: ReviewStepProps) {
  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return 'Not specified'
    return `$${amount.toLocaleString()}`
  }

  const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'Not specified'
    return `${value}%`
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Review Your Spider Rider
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Review your touring terms before publishing. Once published, this rider will be visible to all venues.
        </p>
      </div>

      {/* Contract Preview */}
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-6">
        {/* Header */}
        <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            SPIDER RIDER
          </h3>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {bandName}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Version: {formData.version}
          </p>
        </div>

        {/* Financial Terms */}
        <div>
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>Financial Terms</span>
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Guarantee Range</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(formData.guaranteeMin)}
                {formData.guaranteeMax && ` - ${formatCurrency(formData.guaranteeMax)}`}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Door Split (Band)</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatPercentage(formData.doorSplitPercentage)}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Merch to Venue</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatPercentage(formData.merchSplitToVenuePercentage)}
              </p>
            </div>
          </div>
          {formData.notesFinancial && (
            <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formData.notesFinancial}
              </p>
            </div>
          )}
        </div>

        {/* Technical Requirements */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>Technical Requirements</span>
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Stage Size</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formData.minStageWidthFeet && formData.minStageDepthFeet
                  ? `${formData.minStageWidthFeet}' x ${formData.minStageDepthFeet}'`
                  : 'Flexible'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Input Channels</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formData.minInputChannels || 'Flexible'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">House Drums</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formData.requiresHouseDrums ? 'Required' : 'Not needed'}
              </p>
            </div>
          </div>
          {(formData.stagePlotUrl || formData.inputListUrl) && (
            <div className="mt-4 flex gap-4">
              {formData.stagePlotUrl && (
                <a
                  href={formData.stagePlotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:text-indigo-700 underline"
                >
                  View Stage Plot
                </a>
              )}
              {formData.inputListUrl && (
                <a
                  href={formData.inputListUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:text-indigo-700 underline"
                >
                  View Input List
                </a>
              )}
            </div>
          )}
          {formData.notesTechnical && (
            <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formData.notesTechnical}
              </p>
            </div>
          )}
        </div>

        {/* Hospitality */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>Hospitality</span>
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Meal Buyout</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(formData.mealBuyoutAmount)}/person
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Drink Tickets</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formData.drinkTicketsCount || 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Guest List</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formData.guestListAllocation || 'Not specified'}
              </p>
            </div>
          </div>
          {formData.greenRoomRequirements && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Green Room:</p>
              <p className="text-sm text-gray-900 dark:text-white">
                {formData.greenRoomRequirements}
              </p>
            </div>
          )}
          {formData.notesHospitality && (
            <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formData.notesHospitality}
              </p>
            </div>
          )}
        </div>

        {/* Business Terms */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>Additional Terms</span>
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Age Restriction</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formData.ageRestriction || 'No preference'}
              </p>
            </div>
          </div>
          {formData.notesBusiness && (
            <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formData.notesBusiness}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Warning for publishing */}
      {!isPublished && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
            Before You Publish
          </h3>
          <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1 list-disc list-inside">
            <li>Published riders are visible to all venues on the platform</li>
            <li>Published riders <strong>cannot be edited</strong> - you'll need to create a new version</li>
            <li>Venues can accept your terms and request booking dates</li>
            <li>You can archive a published rider at any time</li>
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      {!isPublished && (
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSubmitting}
            className="flex-1 px-6 py-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={onPublish}
            disabled={isSubmitting}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Publishing...' : 'Publish Spider Rider'}
          </button>
        </div>
      )}

      {/* Published state info */}
      {isPublished && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
          <p className="text-green-800 dark:text-green-200 font-semibold">
            This Spider Rider is live and visible to venues.
          </p>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            To make changes, create a new version from your dashboard.
          </p>
        </div>
      )}
    </div>
  )
}
