'use client'

import { useEffect } from 'react'
import { 
  addIOSClasses, 
  optimizeForiPhone14Pro, 
  preventIOSBounce,
  isIOS,
  triggerHaptic 
} from '@/lib/ios/optimizations'
import { getHCITracker } from '@/lib/hci/metrics'

export function IOSOptimizer() {
  useEffect(() => {
    // Add iOS-specific classes
    addIOSClasses()
    
    // Optimize for iPhone 14 Pro
    optimizeForiPhone14Pro()
    
    // Prevent iOS bounce
    preventIOSBounce()

    // Track iOS usage
    if (isIOS()) {
      const tracker = getHCITracker()
      tracker.track('interaction', 'ios_detected', {
        userAgent: navigator.userAgent,
        standalone: (window.navigator as any).standalone === true,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
      }, 'device')
    }

    // Add haptic feedback to button clicks on iOS
    if (isIOS()) {
      const buttons = document.querySelectorAll('button, [role="button"], a[href]')
      buttons.forEach((button) => {
        button.addEventListener('touchstart', () => {
          triggerHaptic('light')
        }, { passive: true })
      })
    }
  }, [])

  return null
}

