/**
 * iPhone/iOS Specific Optimizations
 * Optimized for iPhone 14 Pro and iOS Safari
 */

/**
 * Detect if running on iOS
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
}

/**
 * Detect if running on iPhone (not iPad)
 */
export function isiPhone(): boolean {
  if (typeof window === 'undefined') return false
  return /iPhone/.test(navigator.userAgent)
}

/**
 * Detect if running in standalone PWA mode
 */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (window.navigator as any).standalone === true || 
         window.matchMedia('(display-mode: standalone)').matches
}

/**
 * Get safe area insets for iPhone notch/Dynamic Island
 */
export function getSafeAreaInsets(): {
  top: number
  bottom: number
  left: number
  right: number
} {
  if (typeof window === 'undefined') {
    return { top: 0, bottom: 0, left: 0, right: 0 }
  }

  const style = getComputedStyle(document.documentElement)
  return {
    top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
    bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
    left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0'),
    right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
  }
}

/**
 * Trigger haptic feedback (iOS only)
 */
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') {
  if (typeof window === 'undefined' || !isIOS()) return

  // Use Web Haptics API if available (iOS 13+)
  if ('vibrate' in navigator) {
    const patterns: { [key: string]: number | number[] } = {
      light: 10,
      medium: 20,
      heavy: 30,
      success: [10, 50, 10],
      warning: [20, 50, 20],
      error: [30, 50, 30, 50, 30],
    }
    navigator.vibrate(patterns[type] || 10)
  }
}

/**
 * Prevent iOS bounce/scroll bounce
 */
export function preventIOSBounce() {
  if (typeof window === 'undefined' || !isIOS()) return

  document.body.style.overscrollBehavior = 'none'
  document.documentElement.style.overscrollBehavior = 'none'
}

/**
 * Optimize viewport for iPhone 14 Pro
 * Screen: 390x844 points (1170x2532 pixels @ 3x)
 */
export function optimizeForiPhone14Pro() {
  if (typeof window === 'undefined' || !isiPhone()) return

  // Set viewport meta tag
  const viewport = document.querySelector('meta[name="viewport"]')
  if (viewport) {
    viewport.setAttribute(
      'content',
      'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
    )
  }

  // Prevent zoom on double tap
  let lastTouchEnd = 0
  document.addEventListener('touchend', (event) => {
    const now = Date.now()
    if (now - lastTouchEnd <= 300) {
      event.preventDefault()
    }
    lastTouchEnd = now
  }, false)

  // Prevent pull-to-refresh (can interfere with scrolling)
  document.body.style.overscrollBehaviorY = 'contain'
}

/**
 * Get device pixel ratio for retina optimization
 */
export function getDevicePixelRatio(): number {
  if (typeof window === 'undefined') return 1
  return window.devicePixelRatio || 1
}

/**
 * Check if device supports 120Hz ProMotion (iPhone 14 Pro)
 */
export function supportsProMotion(): boolean {
  if (typeof window === 'undefined') return false
  
  // iPhone 14 Pro and later support ProMotion
  const isiPhone14Pro = /iPhone/.test(navigator.userAgent) && 
                        (window.screen.width === 390 || window.screen.height === 844)
  
  return isiPhone14Pro && 'requestIdleCallback' in window
}

/**
 * Optimize images for retina displays
 */
export function getRetinaImageSrc(baseSrc: string, scale: number = 2): string {
  if (getDevicePixelRatio() >= scale) {
    // Return @2x or @3x version if available
    const ext = baseSrc.split('.').pop()
    const base = baseSrc.replace(`.${ext}`, '')
    return `${base}@${scale}x.${ext}`
  }
  return baseSrc
}

/**
 * Add iOS-specific CSS classes
 */
export function addIOSClasses() {
  if (typeof document === 'undefined') return

  if (isIOS()) {
    document.documentElement.classList.add('ios')
  }
  if (isiPhone()) {
    document.documentElement.classList.add('iphone')
  }
  if (isStandalone()) {
    document.documentElement.classList.add('standalone')
  }
  
  // Add specific iPhone model class if detectable
  if (isiPhone()) {
    const width = window.screen.width
    const height = window.screen.height
    
    // iPhone 14 Pro: 390x844
    if (width === 390 && height === 844) {
      document.documentElement.classList.add('iphone-14-pro')
    }
  }
}

