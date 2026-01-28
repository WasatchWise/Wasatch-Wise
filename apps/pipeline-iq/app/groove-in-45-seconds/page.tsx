'use client'

import { Suspense } from 'react'
import Groove45PageContent from '@/components/groove/Groove45PageContent'
import { Loader2 } from 'lucide-react'

export default function Groove45Page() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
        }>
            <Groove45PageContent />
        </Suspense>
    )
}
