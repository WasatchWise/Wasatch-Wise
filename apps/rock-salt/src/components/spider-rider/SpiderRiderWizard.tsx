'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  SpiderRiderFormData,
  SpiderRiderFullSchema,
  formDataToDbFormat,
} from '@/lib/validations/spider-rider'

// Step components
import MetaStep from './steps/MetaStep'
import FinancialsStep from './steps/FinancialsStep'
import TechStep from './steps/TechStep'
import HospitalityStep from './steps/HospitalityStep'
import ReviewStep from './steps/ReviewStep'

interface SpiderRiderWizardProps {
  bandId: string
  bandName: string
  existingRider?: Partial<SpiderRiderFormData> & { id?: string; status?: string }
}

type WizardStep = 'meta' | 'financials' | 'tech' | 'hospitality' | 'review'

const STEPS: { key: WizardStep; label: string; number: number }[] = [
  { key: 'meta', label: 'Basics', number: 1 },
  { key: 'financials', label: 'Financials', number: 2 },
  { key: 'tech', label: 'Technical', number: 3 },
  { key: 'hospitality', label: 'Hospitality', number: 4 },
  { key: 'review', label: 'Review', number: 5 },
]

const DEFAULT_FORM_DATA: SpiderRiderFormData = {
  bandId: '',
  version: 'v1',
  guaranteeMin: 500,
  guaranteeMax: null,
  doorSplitPercentage: null,
  merchSplitToVenuePercentage: 15,
  notesFinancial: null,
  minStageWidthFeet: null,
  minStageDepthFeet: null,
  minInputChannels: null,
  requiresHouseDrums: false,
  stagePlotUrl: null,
  inputListUrl: null,
  notesTechnical: null,
  greenRoomRequirements: null,
  mealBuyoutAmount: null,
  drinkTicketsCount: null,
  guestListAllocation: null,
  notesHospitality: null,
  ageRestriction: null,
  notesBusiness: null,
}

export default function SpiderRiderWizard({
  bandId,
  bandName,
  existingRider,
}: SpiderRiderWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<WizardStep>('meta')
  const [formData, setFormData] = useState<SpiderRiderFormData>({
    ...DEFAULT_FORM_DATA,
    bandId,
    ...existingRider,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const isEditing = Boolean(existingRider?.id)
  const isPublished = existingRider?.status === 'published'

  // Get current step index
  const currentStepIndex = STEPS.findIndex(s => s.key === currentStep)

  // Update form data
  const updateFormData = useCallback((updates: Partial<SpiderRiderFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
    // Clear errors for updated fields
    const clearedErrors = { ...errors }
    Object.keys(updates).forEach(key => {
      delete clearedErrors[key]
    })
    setErrors(clearedErrors)
  }, [errors])

  // Navigate to next step
  const goNext = useCallback(() => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].key)
    }
  }, [currentStepIndex])

  // Navigate to previous step
  const goPrev = useCallback(() => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].key)
    }
  }, [currentStepIndex])

  // Go to specific step
  const goToStep = useCallback((step: WizardStep) => {
    setCurrentStep(step)
  }, [])

  // Validate and submit (save as draft)
  const saveDraft = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Validate full form
      const result = SpiderRiderFullSchema.safeParse(formData)
      if (!result.success) {
        const fieldErrors: Record<string, string> = {}
        result.error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[String(err.path[0])] = err.message
          }
        })
        setErrors(fieldErrors)
        setSubmitError('Please fix the validation errors before saving.')
        setIsSubmitting(false)
        return
      }

      // Convert to database format
      const dbData = formDataToDbFormat(result.data)

      // Call API
      const response = await fetch('/api/spider-rider', {
        method: existingRider?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...dbData,
          id: existingRider?.id,
          status: 'draft',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save Spider Rider')
      }

      // Success - redirect to dashboard
      router.push('/dashboard?spider_rider=saved')
      router.refresh()
    } catch (err) {
      console.error('Error saving spider rider:', err)
      setSubmitError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Publish the rider (makes it immutable and visible)
  const publishRider = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Validate full form
      const result = SpiderRiderFullSchema.safeParse(formData)
      if (!result.success) {
        const fieldErrors: Record<string, string> = {}
        result.error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[String(err.path[0])] = err.message
          }
        })
        setErrors(fieldErrors)
        setSubmitError('Please fix all validation errors before publishing.')
        setIsSubmitting(false)
        return
      }

      // Convert to database format
      const dbData = formDataToDbFormat(result.data)

      // First save the rider
      const saveResponse = await fetch('/api/spider-rider', {
        method: existingRider?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...dbData,
          id: existingRider?.id,
        }),
      })

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json()
        throw new Error(errorData.error || 'Failed to save Spider Rider')
      }

      const savedRider = await saveResponse.json()

      // Then publish it
      const publishResponse = await fetch('/api/spider-rider/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riderId: savedRider.id }),
      })

      if (!publishResponse.ok) {
        const errorData = await publishResponse.json()
        throw new Error(errorData.error || 'Failed to publish Spider Rider')
      }

      const publishData = await publishResponse.json()
      // Success - redirect to post-publication success screen
      const params = new URLSearchParams({
        rider_id: publishData.rider?.id ?? savedRider.id,
        rider_code: publishData.riderCode || '',
      })
      router.push(`/dashboard/bands/${bandId}/spider-rider/published?${params.toString()}`)
      router.refresh()
    } catch (err) {
      console.error('Error publishing spider rider:', err)
      setSubmitError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render current step
  const renderStep = () => {
    const commonProps = {
      formData,
      updateFormData,
      errors,
      disabled: isPublished,
    }

    switch (currentStep) {
      case 'meta':
        return <MetaStep {...commonProps} bandName={bandName} />
      case 'financials':
        return <FinancialsStep {...commonProps} />
      case 'tech':
        return <TechStep {...commonProps} />
      case 'hospitality':
        return <HospitalityStep {...commonProps} />
      case 'review':
        return (
          <ReviewStep
            formData={formData}
            bandName={bandName}
            onPublish={publishRider}
            onSaveDraft={saveDraft}
            isSubmitting={isSubmitting}
            isEditing={isEditing}
            isPublished={isPublished}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-8 mb-8">
        <h1 className="text-3xl font-black mb-2">
          {isEditing ? 'Edit Spider Rider' : 'Create Spider Rider'}
        </h1>
        <p className="text-lg opacity-90">
          {isPublished
            ? 'This rider is published and cannot be edited. Create a new version to make changes.'
            : 'Post your touring terms once. Venues can browse and accept your terms to book you.'}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isActive = step.key === currentStep
            const isCompleted = index < currentStepIndex
            const isClickable = index <= currentStepIndex || isEditing

            return (
              <div key={step.key} className="flex items-center">
                <button
                  type="button"
                  onClick={() => isClickable && goToStep(step.key)}
                  disabled={!isClickable}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : isCompleted
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200'
                        : isClickable
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                          : 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                    isActive
                      ? 'bg-white text-indigo-600'
                      : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {isCompleted ? '✓' : step.number}
                  </span>
                  <span className="hidden sm:inline font-medium">{step.label}</span>
                </button>
                {index < STEPS.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    isCompleted
                      ? 'bg-green-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Error display */}
      {submitError && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 font-semibold">{submitError}</p>
        </div>
      )}

      {/* Published notice */}
      {isPublished && (
        <div className="mb-6 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-amber-800 dark:text-amber-200 font-semibold">
            This Spider Rider is published and cannot be edited.
            To make changes, create a new version from your dashboard.
          </p>
        </div>
      )}

      {/* Current Step Content */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
        {renderStep()}
      </div>

      {/* Navigation Buttons (except on review step) */}
      {currentStep !== 'review' && (
        <div className="flex justify-between">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentStepIndex === 0}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            type="button"
            onClick={goNext}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
