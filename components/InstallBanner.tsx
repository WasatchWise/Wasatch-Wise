import React, { useState, useEffect } from 'react';

export const InstallBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if already dismissed or installed
    const dismissed = localStorage.getItem('helplist::install_banner_dismissed');
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;

    if (dismissed || isInstalled) {
      return;
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS/Safari (no beforeinstallprompt)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isIOS && isSafari && !isInstalled) {
      // Show iOS-specific banner after 3 seconds
      setTimeout(() => setShowBanner(true), 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // iOS Safari - show instructions
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowBanner(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem('helplist::install_banner_dismissed', 'true');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dignity-purple text-white p-4 shadow-2xl z-50 animate-slide-in">
      <div className="container mx-auto flex items-center justify-between gap-4 max-w-4xl">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-2xl">📱</span>
          <div className="flex-1">
            <p className="font-bold text-sm">Install The Help List</p>
            <p className="text-xs opacity-90">
              {isIOS
                ? 'Tap Share → Add to Home Screen for quick access'
                : 'Get app-like experience with offline access'
              }
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isIOS && (
            <button
              onClick={handleInstall}
              className="px-4 py-2 bg-white text-dignity-purple rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              Install
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="px-3 py-2 text-white hover:bg-white/20 rounded-lg transition-colors text-sm"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};
