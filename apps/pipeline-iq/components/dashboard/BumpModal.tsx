'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CalendarIcon, Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { addDays, addWeeks, addMonths, format } from 'date-fns'

interface BumpModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    projectId: string
    projectTitle: string
    onSuccess: () => void
}

export function BumpModal({ open, onOpenChange, projectId, projectTitle, onSuccess }: BumpModalProps) {
    const [loading, setLoading] = useState(false)

    const handleBump = async (date: Date) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/projects/${projectId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    next_contact_date: date.toISOString(),
                    // Optional: If we bump, maybe we also set status to "connected" or keep "new"? 
                    // Usually Bumping implies we want to touch it later, so keeping status is cleaner.
                })
            })

            if (!res.ok) throw new Error('Failed to schedule bump')

            toast.success('Project scheduled for follow up', {
                description: `We'll remind you on ${format(date, 'MMM d, yyyy')}`
            })
            onOpenChange(false)
            onSuccess()
        } catch (error) {
            toast.error('Failed to bump project')
        } finally {
            setLoading(false)
        }
    }

    const options = [
        { label: 'Tomorrow', icon: '1d', date: addDays(new Date(), 1) },
        { label: 'Next Week', icon: '1w', date: addWeeks(new Date(), 1) },
        { label: 'Two Weeks', icon: '2w', date: addWeeks(new Date(), 2) },
        { label: 'One Month', icon: '1m', date: addMonths(new Date(), 1) },
    ]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Bump Project</DialogTitle>
                    <DialogDescription>
                        When should we remind you about <span className="font-medium text-foreground">{projectTitle}</span>?
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-3 py-4">
                    {options.map((option) => (
                        <Button
                            key={option.label}
                            variant="outline"
                            className="h-20 flex flex-col gap-1 items-center justify-center hover:border-primary hover:bg-primary/5 hover:text-primary transition-all"
                            onClick={() => handleBump(option.date)}
                            disabled={loading}
                        >
                            <span className="text-xl font-bold">{option.icon}</span>
                            <span className="text-xs font-medium">{option.label}</span>
                        </Button>
                    ))}
                </div>

                <DialogFooter className="sm:justify-start">
                    <div className="text-xs text-muted-foreground w-full text-center">
                        Project will disappear from Focus Feed until the valid date.
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
