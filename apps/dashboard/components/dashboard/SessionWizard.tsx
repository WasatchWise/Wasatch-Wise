'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/shared/Button';
import { StakeholderMatrix } from '@/components/dashboard/StakeholderMatrix';
import { ControlsChecklist } from '@/components/dashboard/ControlsChecklist';
import { createBriefingSessionAction, completeBriefingSessionAction } from '@/app/actions/daros';

interface SessionWizardProps {
    districtId: string;
    initialStakeholders: any[];
    initialControls: any[];
}

export function SessionWizard({ districtId, initialStakeholders, initialControls }: SessionWizardProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Step 1: Session Setup
    const [facilitator, setFacilitator] = useState('');

    // Step 4: Wrap-up notes
    const [notes, setNotes] = useState('');

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const startSession = async () => {
        setLoading(true);
        try {
            const result = await createBriefingSessionAction(districtId, {
                sessionDate: new Date().toISOString(),
                facilitator
            });
            if (result.success && result.session) {
                setSessionId(result.session.id);
                nextStep();
            } else {
                alert(result.error);
            }
        } catch (e) {
            console.error(e);
            alert('Failed to start session');
        } finally {
            setLoading(false);
        }
    };

    const finishSession = async () => {
        if (!sessionId) return;
        setLoading(true);
        try {
            const result = await completeBriefingSessionAction(sessionId, {}, notes);
            if (result.success) {
                router.push(`/dashboard/districts/${districtId}?success=session_completed`);
            } else {
                alert(result.error);
            }
        } catch (e) {
            console.error(e);
            alert('Failed to complete session');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
            {/* Wizard Header */}
            <div className="bg-gray-900 text-white p-6 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold">60-Minute Briefing Session</h2>
                    <p className="text-gray-400 text-sm">Step {step} of 4</p>
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`w-3 h-3 rounded-full ${step >= i ? 'bg-blue-500' : 'bg-gray-700'}`} />
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 p-8 overflow-y-auto">
                {step === 1 && (
                    <div className="max-w-md mx-auto space-y-6">
                        <h3 className="text-2xl font-bold text-gray-900">Session Setup</h3>
                        <p className="text-gray-600">Start the timer and define the facilitator. This initializes a new session record.</p>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Facilitator Name</label>
                            <input
                                className="w-full px-4 py-2 border rounded-md"
                                placeholder="e.g. John Doe"
                                value={facilitator}
                                onChange={e => setFacilitator(e.target.value)}
                            />
                        </div>
                        <Button variant="primary" className="w-full" onClick={startSession} disabled={!facilitator || loading}>
                            {loading ? 'Starting...' : 'Start Session Timer'}
                        </Button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-bold text-gray-900">1. Stakeholder Assessment</h3>
                            <div className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">15 Minutes</div>
                        </div>
                        <p className="text-gray-600">Map the current landscape. Identify resistance points and uptake champions.</p>

                        <StakeholderMatrix districtId={districtId} initialData={initialStakeholders} />
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-bold text-gray-900">2. Controls Review</h3>
                            <div className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">30 Minutes</div>
                        </div>
                        <p className="text-gray-600">Review "Privacy by Design" controls. Identify gaps and assign ownership.</p>

                        <ControlsChecklist districtId={districtId} controls={initialControls} />
                    </div>
                )}

                {step === 4 && (
                    <div className="max-w-md mx-auto space-y-6 text-center">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl">✓</div>
                        <h3 className="text-2xl font-bold text-gray-900">Session Complete</h3>
                        <p className="text-gray-600">Great job! Proceed to generate the artifacts.</p>

                        <div className="text-left">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Session Notes / Next Steps</label>
                            <textarea
                                className="w-full px-4 py-2 border rounded-md h-32"
                                placeholder="Key takeaways..."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                            />
                        </div>

                        <Button variant="primary" className="w-full" onClick={finishSession} disabled={loading}>
                            {loading ? 'Generating Artifacts...' : 'Generate Artifacts & Finish'}
                        </Button>
                    </div>
                )}
            </div>

            {/* Footer Navigation */}
            {step > 1 && step < 4 && (
                <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between">
                    <Button variant="outline" onClick={prevStep}>Back</Button>
                    <Button variant="primary" onClick={nextStep}>Next Step</Button>
                </div>
            )}
        </div>
    );
}
