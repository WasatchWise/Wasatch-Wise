'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FinancialStep from './steps/FinancialStep'
import TechnicalStep from './steps/TechnicalStep'
import HospitalityStep from './steps/HospitalityStep'
import PoliciesStep from './steps/PoliciesStep'
import ReviewStep from './steps/ReviewStep'
import {
  venueCapabilityToDbFormat,
  type VenueCapabilityFormData,
} from '@/lib/validations/venue-capability'

interface VenueCapabilityWizardProps {
  venueId: string
  venueName: string
  initialData?: Partial<VenueCapabilityFormData>
}

const STEPS = [
  { id: 1, key: 'financial', label: 'Financial' },
  { id: 2, key: 'technical', label: 'Technical' },
  { id: 3, key: 'hospitality', label: 'Hospitality' },
  { id: 4, key: 'policies', label: 'Policies' },
  { id: 5, key: 'review', label: 'Review' },
] as const

const DEFAULT_FORM_DATA: VenueCapabilityFormData = {
  typical_guarantee_min: null,
  typical_guarantee_max: null,
  payment_methods: [],
  w9_on_file: false,
  insurance_coi_on_file: false,
  stage_width_feet: null,
  stage_depth_feet: null,
  input_channels: null,
  has_house_drums: false,
  has_backline: false,
  green_room_available: false,
  green_room_description: null,
  meal_buyout_available: false,
  typical_meal_buyout_amount: null,
  drink_tickets_available: null,
  guest_list_spots: null,
  parking_spaces: null,
  age_restrictions: [],
  load_in_notes: null,
  curfew_time: null,
}

export default function VenueCapabilityWizard({
  venueId,
  venueName,
  initialData,
}: VenueCapabilityWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<VenueCapabilityFormData>({
    ...DEFAULT_FORM_DATA,
    ...initialData,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const updateFormData = (updates: Partial<VenueCapabilityFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const handleNext = () => setCurrentStep((p) => Math.min(p + 1, STEPS.length))
  const handleBack = () => setCurrentStep((p) => Math.max(p - 1, 1))
  const handleStepClick = (stepId: number) => setCurrentStep(stepId)

  const handleSaveDraft = async () => {
    setSaveStatus('saving')
    setIsSaving(true)
    try {
      const dbData = venueCapabilityToDbFormat(formData)
      const response = await fetch(`/api/venues/${venueId}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbData),
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to save draft')
      }
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (err) {
      console.error('Save draft error:', err)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const saveProfile = async () => {
    setIsSaving(true)
    try {
      const dbData = venueCapabilityToDbFormat(formData)
      const response = await fetch(`/api/venues/${venueId}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbData),
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to save profile')
      }
      router.push(`/dashboard/venues/${venueId}?tab=capabilities&success=1`)
      router.refresh()
    } catch (err) {
      console.error('Save error:', err)
      alert(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === STEPS.length

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          Venue Capability Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Complete your venue profile to improve compatibility matching with Spider Riders
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id
            return (
              <div key={step.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => handleStepClick(step.id)}
                  disabled={currentStep < step.id}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold transition-colors ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isActive
                        ? 'bg-amber-600 border-amber-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                  } ${currentStep >= step.id ? 'cursor-pointer hover:opacity-90' : 'cursor-not-allowed opacity-50'}`}
                >
                  {isCompleted ? '✓' : step.id}
                </button>
                <span className="ml-2 text-sm font-medium hidden sm:inline text-gray-700 dark:text-gray-300">
                  {step.label}
                </span>
                {index < STEPS.length - 1 && (
                  <div className="w-8 sm:w-12 h-0.5 bg-gray-300 dark:bg-gray-600 mx-2" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        {saveStatus === 'saved' && (
          <div className="mb-4 p-3 bg-green-100 border border-green-200 rounded-md text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200">
            ✓ Draft saved successfully
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-md text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
            ✗ Failed to save draft. Please try again.
          </div>
        )}
        {currentStep === 1 && (
          <FinancialStep
            data={formData}
            updateData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
            onSaveDraft={handleSaveDraft}
            isSaving={isSaving}
            isFirstStep={isFirstStep}
          />
        )}
        {currentStep === 2 && (
          <TechnicalStep
            data={formData}
            updateData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
            onSaveDraft={handleSaveDraft}
            isSaving={isSaving}
            isFirstStep={isFirstStep}
          />
        )}
        {currentStep === 3 && (
          <HospitalityStep
            data={formData}
            updateData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
            onSaveDraft={handleSaveDraft}
            isSaving={isSaving}
            isFirstStep={isFirstStep}
          />
        )}
        {currentStep === 4 && (
          <PoliciesStep
            data={formData}
            updateData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
            onSaveDraft={handleSaveDraft}
            isSaving={isSaving}
            isFirstStep={isFirstStep}
          />
        )}
        {currentStep === 5 && (
          <ReviewStep
            data={formData}
            venueName={venueName}
            onBack={handleBack}
            onSave={saveProfile}
            isSaving={isSaving}
            isFirstStep={isFirstStep}
          />
        )}
      </div>
    </div>
  )
}
