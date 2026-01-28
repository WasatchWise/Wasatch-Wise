'use client'

import { useEffect } from 'react'
import { Button } from './button'
import { Card } from './card'

export function ErrorDisplay({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="p-8 max-w-md w-full text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="font-mono text-xl font-bold text-destructive mb-2">
          SYSTEM ERROR
        </h2>
        <p className="text-muted-foreground mb-6">
          {error.message || 'Something went wrong'}
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="default">
            Try Again
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="outline">
            Go Home
          </Button>
        </div>
      </Card>
    </div>
  )
}

