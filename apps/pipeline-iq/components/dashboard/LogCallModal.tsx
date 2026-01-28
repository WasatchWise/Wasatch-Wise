'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Phone, CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react'
import { toast } from 'sonner'

interface LogCallModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    projectId: string
    projectTitle: string
    contactId?: string
    onSuccess: () => void
}

export function LogCallModal({ open, onOpenChange, projectId, projectTitle, contactId, onSuccess }: LogCallModalProps) {
    const [step, setStep] = useState<'connect' | 'outcome'>('connect')
    const [loading, setLoading] = useState(false)

    const handleLog = async (outcome: string, notes?: string) => {
        setLoading(true)
        try {
            const res = await fetch('/api/activity/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    contactId,
                    outcome,
                    notes
                }),
            })

            if (!res.ok) throw new Error('Failed to log call')

            toast.success('Call logged successfully')
            onSuccess()
            onOpenChange(false)
            setStep('connect') // Reset
        } catch (error) {
            toast.error('Failed to save call log')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Log Call: {projectTitle}</DialogTitle>
                    <DialogDescription>
                        Chart what happened on the call.
                    </DialogDescription>
                </DialogHeader>

                {step === 'connect' ? (
                    <div className="grid gap-4 py-4">
                        <Button
                            variant="outline"
                            className="h-24 flex flex-col items-center justify-center gap-2 border-green-200 hover:bg-green-50 hover:border-green-500 hover:text-green-700"
                            onClick={() => setStep('outcome')}
                        >
                            <Phone className="h-8 w-8" />
                            <span className="font-semibold">Connected</span>
                        </Button>

                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                className="h-24 flex flex-col items-center justify-center gap-2"
                                onClick={() => handleLog('voicemail')}
                                disabled={loading}
                            >
                                <Clock className="h-6 w-6 text-muted-foreground" />
                                <span>Left Voicemail</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-24 flex flex-col items-center justify-center gap-2"
                                onClick={() => handleLog('no_answer')}
                                disabled={loading}
                            >
                                <XCircle className="h-6 w-6 text-muted-foreground" />
                                <span>No Answer</span>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4 py-4">
                        <Button
                            variant="default"
                            className="h-16 text-lg bg-green-600 hover:bg-green-700"
                            onClick={() => handleLog('meeting_booked')}
                            disabled={loading}
                        >
                            <Calendar className="mr-2 h-6 w-6" />
                            Meeting Booked!
                        </Button>

                        <Button
                            variant="outline"
                            className="h-12"
                            onClick={() => handleLog('call_later')}
                            disabled={loading}
                        >
                            Request to Call Later
                        </Button>

                        <Button
                            variant="outline"
                            className="h-12"
                            onClick={() => handleLog('not_interested')}
                            disabled={loading}
                        >
                            Not Interested
                        </Button>

                        <Button variant="ghost" size="sm" onClick={() => setStep('connect')}>
                            Back
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
