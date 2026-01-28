/**
 * Keyboard Navigation Shortcuts System
 *
 * Provides accessible keyboard shortcuts for power users.
 * Includes a help modal and metrics tracking.
 *
 * Usage:
 *   import { useKeyboardShortcuts, KeyboardShortcutsHelp } from '@/lib/keyboardShortcuts';
 *
 *   function MyComponent() {
 *     useKeyboardShortcuts([
 *       { key: '/', action: () => focusSearch(), description: 'Focus search' },
 *       { key: 'f', action: () => toggleFilters(), description: 'Toggle filters' },
 *     ]);
 *   }
 */

'use client';

import { useEffect, useCallback, useState } from 'react';
import { metrics } from '@/lib/metrics';

// ============================================================================
// TYPES
// ============================================================================

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: (event: KeyboardEvent) => void;
  description: string;
  context?: 'global' | 'search' | 'navigation' | 'filter' | 'modal';
  preventDefault?: boolean;
}

export interface ShortcutCategory {
  name: string;
  shortcuts: KeyboardShortcut[];
}

// ============================================================================
// GLOBAL SHORTCUT REGISTRY
// ============================================================================

const globalShortcuts: KeyboardShortcut[] = [
  {
    key: '/',
    description: 'Focus search bar',
    context: 'search',
    preventDefault: true,
    action: (e) => {
      const searchInput = document.querySelector<HTMLInputElement>('input[type="search"], input[placeholder*="Search" i]');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    },
  },
  {
    key: 'Escape',
    description: 'Close modal or clear search',
    context: 'navigation',
    action: () => {
      // Close any open modals
      const closeButtons = document.querySelectorAll('[aria-label="Close"], [data-close-modal]');
      if (closeButtons.length > 0) {
        (closeButtons[0] as HTMLElement).click();
      }

      // Clear focused search
      const focusedInput = document.activeElement as HTMLInputElement;
      if (focusedInput && focusedInput.tagName === 'INPUT') {
        focusedInput.blur();
      }
    },
  },
  {
    key: '?',
    shift: true,
    description: 'Show keyboard shortcuts help',
    context: 'global',
    preventDefault: true,
    action: () => {
      // Toggle keyboard shortcuts modal
      const event = new CustomEvent('toggle-keyboard-shortcuts');
      window.dispatchEvent(event);
    },
  },
  {
    key: 'h',
    description: 'Go to home',
    context: 'navigation',
    action: () => {
      window.location.href = '/';
    },
  },
  {
    key: 'd',
    description: 'Go to destinations',
    context: 'navigation',
    action: () => {
      window.location.href = '/destinations';
    },
  },
  {
    key: 'g',
    description: 'Go to guardians',
    context: 'navigation',
    action: () => {
      window.location.href = '/guardians';
    },
  },
  {
    key: 't',
    description: 'Go to TripKits',
    context: 'navigation',
    action: () => {
      window.location.href = '/tripkits';
    },
  },
];

// ============================================================================
// HOOK: useKeyboardShortcuts
// ============================================================================

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: {
    enabled?: boolean;
    includeGlobal?: boolean;
  } = {}
) {
  const { enabled = true, includeGlobal = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const allShortcuts = includeGlobal ? [...globalShortcuts, ...shortcuts] : shortcuts;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs (except for special cases)
      const target = event.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true';

      for (const shortcut of allShortcuts) {
        const keyMatch = event.key === shortcut.key || event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl === undefined || shortcut.ctrl === event.ctrlKey;
        const shiftMatch = shortcut.shift === undefined || shortcut.shift === event.shiftKey;
        const altMatch = shortcut.alt === undefined || shortcut.alt === event.altKey;
        const metaMatch = shortcut.meta === undefined || shortcut.meta === event.metaKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
          // Allow '/' and 'Escape' to work in inputs
          if (isInput && !['/', 'Escape'].includes(event.key)) {
            continue;
          }

          if (shortcut.preventDefault) {
            event.preventDefault();
          }

          shortcut.action(event);

          // Track usage
          metrics.keyboard.shortcutUsed({
            shortcut: formatShortcutKey(shortcut),
            action: shortcut.description,
            context: shortcut.context || 'global',
          });

          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled, includeGlobal]);
}

// ============================================================================
// HELPER: Format shortcut key for display
// ============================================================================

export function formatShortcutKey(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.meta) parts.push('Cmd');

  parts.push(shortcut.key.toUpperCase());

  return parts.join(' + ');
}

// ============================================================================
// COMPONENT: KeyboardShortcutsHelp
// ============================================================================

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => {
      setIsOpen((prev) => {
        const newState = !prev;

        if (newState) {
          metrics.keyboard.shortcutHelpOpened({
            trigger: 'keyboard',
          });
        }

        return newState;
      });
    };

    window.addEventListener('toggle-keyboard-shortcuts', handleToggle);
    return () => window.removeEventListener('toggle-keyboard-shortcuts', handleToggle);
  }, []);

  if (!isOpen) return null;

  const categories: ShortcutCategory[] = [
    {
      name: 'Navigation',
      shortcuts: globalShortcuts.filter((s) => s.context === 'navigation'),
    },
    {
      name: 'Search',
      shortcuts: globalShortcuts.filter((s) => s.context === 'search'),
    },
    {
      name: 'General',
      shortcuts: globalShortcuts.filter((s) => s.context === 'global'),
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto animate-slideUpFadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcuts-title"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <h2 id="shortcuts-title" className="text-2xl font-bold text-white">
                ⌨️ Keyboard Shortcuts
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-blue-100">
              Use these shortcuts to navigate faster
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {categories.map((category) => (
              <div key={category.name}>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{category.name}</h3>
                <div className="space-y-2">
                  {category.shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-gray-700">{shortcut.description}</span>
                      <kbd className="px-3 py-1.5 text-sm font-mono font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded-lg shadow-sm">
                        {formatShortcutKey(shortcut)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Press <kbd className="px-2 py-1 text-xs font-mono bg-white border border-gray-300 rounded">?</kbd> to toggle this help
            </p>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUpFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUpFadeIn {
          animation: slideUpFadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

// ============================================================================
// UTILITY: Trap focus within modal
// ============================================================================

export function useFocusTrap(containerRef: React.RefObject<HTMLElement>, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey as EventListener);
    firstElement?.focus();

    metrics.keyboard.focusTrapped({
      component: container.getAttribute('role') || 'modal',
      action: 'enter',
    });

    return () => {
      container.removeEventListener('keydown', handleTabKey as EventListener);

      metrics.keyboard.focusTrapped({
        component: container.getAttribute('role') || 'modal',
        action: 'exit',
      });
    };
  }, [containerRef, enabled]);
}
