'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Pipeline IQ / Groove page error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1e3a5f] text-white px-4">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-white/90">
          We&apos;re sorry — this page hit an error. Please try again or use the
          links below.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => reset()}
            className="bg-white text-[#1e3a5f] hover:bg-white/90"
          >
            Try again
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white text-white hover:bg-white/10"
          >
            <a href="/">Go to Groove overview</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
