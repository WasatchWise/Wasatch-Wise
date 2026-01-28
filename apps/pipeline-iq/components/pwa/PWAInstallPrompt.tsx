'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download } from 'lucide-react'
import { getHCITracker } from '@/lib/hci/metrics'

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return
    }

    // Listen for beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Show prompt after 3 seconds
      setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    const tracker = getHCITracker()
    tracker.trackInteraction('pwa_install_clicked')

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    tracker.trackInteraction('pwa_install_result', { outcome })

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    const tracker = getHCITracker()
    tracker.trackInteraction('pwa_install_dismissed')
    setShowPrompt(false)
  }

  if (!showPrompt || !deferredPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
      <div className="bg-card border rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-sm">Install GrooveLeads</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Add to your home screen for quick access
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded hover:bg-accent"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleInstall}
            size="sm"
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            Install
          </Button>
          <Button
            onClick={handleDismiss}
            variant="outline"
            size="sm"
          >
            Later
          </Button>
        </div>
      </div>
    </div>
  )
}

