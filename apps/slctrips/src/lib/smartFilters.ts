/**
 * Smart Filter System with Persistence and Suggestions
 *
 * Provides intelligent filtering with:
 * - localStorage persistence
 * - Smart suggestions based on results
 * - Metrics tracking
 * - Filter history
 * - Recent searches
 *
 * Usage:
 *   import { useSmartFilters } from '@/lib/smartFilters';
 *   const filters = useSmartFilters('destinations', initialFilters);
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { metrics } from '@/lib/metrics';

// ============================================================================
// TYPES
// ============================================================================

export interface FilterState {
  search?: string;
  category?: string;
  subcategories?: string[];
  region?: string;
  seasons?: string[];
  [key: string]: any; // Allow custom filter fields
}

export interface FilterSuggestion {
  type: 'clear' | 'add' | 'change' | 'remove';
  label: string;
  description: string;
  action: () => void;
  priority: number; // Higher = more important
  icon?: string;
}

export interface FilterHistory {
  filters: FilterState;
  resultsCount: number;
  timestamp: string;
}

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_PREFIX = 'slctrips_filters_';
const HISTORY_KEY = (namespace: string) => `${STORAGE_PREFIX}${namespace}_history`;
const STATE_KEY = (namespace: string) => `${STORAGE_PREFIX}${namespace}_state`;
const MAX_HISTORY_ITEMS = 10;

// ============================================================================
// STORAGE UTILITIES
// ============================================================================

function loadFilterState(namespace: string): FilterState | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STATE_KEY(namespace));
    if (!stored) return null;

    const state = JSON.parse(stored);

    // Check if state is expired (7 days)
    const savedAt = new Date(state._savedAt || 0);
    const expiryDate = new Date(savedAt);
    expiryDate.setDate(expiryDate.getDate() + 7);

    if (new Date() > expiryDate) {
      localStorage.removeItem(STATE_KEY(namespace));
      return null;
    }

    delete state._savedAt;
    return state;
  } catch {
    return null;
  }
}

function saveFilterState(namespace: string, state: FilterState): void {
  if (typeof window === 'undefined') return;

  try {
    const toSave = {
      ...state,
      _savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STATE_KEY(namespace), JSON.stringify(toSave));
  } catch {
    // Storage full or disabled - silent fail
  }
}

function loadFilterHistory(namespace: string): FilterHistory[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(HISTORY_KEY(namespace));
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveFilterHistory(namespace: string, history: FilterHistory[]): void {
  if (typeof window === 'undefined') return;

  try {
    // Keep only last MAX_HISTORY_ITEMS
    const trimmed = history.slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_KEY(namespace), JSON.stringify(trimmed));
  } catch {
    // Storage full or disabled - silent fail
  }
}

function addToHistory(namespace: string, filters: FilterState, resultsCount: number): void {
  const history = loadFilterHistory(namespace);

  // Don't add if same as most recent
  if (history.length > 0) {
    const recent = history[0];
    if (JSON.stringify(recent.filters) === JSON.stringify(filters)) {
      return;
    }
  }

  const entry: FilterHistory = {
    filters,
    resultsCount,
    timestamp: new Date().toISOString(),
  };

  history.unshift(entry);
  saveFilterHistory(namespace, history);
}

// ============================================================================
// SUGGESTION ENGINE
// ============================================================================

function generateSuggestions(
  currentFilters: FilterState,
  resultsCount: number,
  totalCount: number,
  availableOptions: {
    categories?: string[];
    subcategories?: string[];
    regions?: string[];
    seasons?: string[];
  },
  setFilters: (filters: FilterState) => void
): FilterSuggestion[] {
  const suggestions: FilterSuggestion[] = [];

  // No results - suggest clearing filters
  if (resultsCount === 0 && hasActiveFilters(currentFilters)) {
    suggestions.push({
      type: 'clear',
      label: 'Clear all filters',
      description: 'Reset to show all destinations',
      action: () => setFilters({}),
      priority: 100,
      icon: '🔄',
    });

    // Suggest removing most restrictive filter
    const activeFilters = Object.entries(currentFilters).filter(([_, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== '';
    });

    if (activeFilters.length > 0) {
      activeFilters.forEach(([key, value]) => {
        suggestions.push({
          type: 'remove',
          label: `Remove ${key} filter`,
          description: `Try without filtering by ${key}`,
          action: () => {
            const newFilters = { ...currentFilters };
            delete newFilters[key];
            setFilters(newFilters);
          },
          priority: 80,
          icon: '❌',
        });
      });
    }
  }

  // Too few results - suggest broadening
  if (resultsCount > 0 && resultsCount < totalCount * 0.05) {
    // Less than 5% of total

    if (currentFilters.subcategories && currentFilters.subcategories.length > 0) {
      suggestions.push({
        type: 'change',
        label: 'Try any activity type',
        description: `Show all subcategories (${totalCount} total destinations)`,
        action: () => setFilters({ ...currentFilters, subcategories: [] }),
        priority: 70,
        icon: '📂',
      });
    }

    if (currentFilters.region) {
      suggestions.push({
        type: 'change',
        label: 'Try all regions',
        description: 'Expand search across Utah',
        action: () => setFilters({ ...currentFilters, region: '' }),
        priority: 65,
        icon: '🗺️',
      });
    }

    if (currentFilters.seasons && currentFilters.seasons.length > 0) {
      suggestions.push({
        type: 'change',
        label: 'Try year-round destinations',
        description: 'Include destinations for all seasons',
        action: () => setFilters({ ...currentFilters, seasons: [] }),
        priority: 60,
        icon: '🌦️',
      });
    }
  }

  // Good number of results but could explore more
  if (resultsCount >= 10 && resultsCount < totalCount * 0.2) {
    // 10-20% of total

    // Suggest adding complementary filters
    if (!currentFilters.region && availableOptions.regions && availableOptions.regions.length > 0) {
      const topRegion = availableOptions.regions[0];
      suggestions.push({
        type: 'add',
        label: `Try ${topRegion} region`,
        description: 'Narrow down by region',
        action: () => setFilters({ ...currentFilters, region: topRegion }),
        priority: 40,
        icon: '📍',
      });
    }

    if (
      (!currentFilters.seasons || currentFilters.seasons.length === 0) &&
      availableOptions.seasons
    ) {
      const currentMonth = new Date().getMonth();
      let suggestedSeason = 'summer';
      if (currentMonth >= 2 && currentMonth <= 4) suggestedSeason = 'spring';
      else if (currentMonth >= 5 && currentMonth <= 7) suggestedSeason = 'summer';
      else if (currentMonth >= 8 && currentMonth <= 10) suggestedSeason = 'fall';
      else suggestedSeason = 'winter';

      suggestions.push({
        type: 'add',
        label: `Try ${suggestedSeason} destinations`,
        description: `Perfect for visiting right now`,
        action: () => setFilters({ ...currentFilters, seasons: [suggestedSeason] }),
        priority: 50,
        icon: getSeasonIcon(suggestedSeason),
      });
    }
  }

  // Excellent results - no suggestions needed
  if (resultsCount >= totalCount * 0.2 && resultsCount <= totalCount * 0.8) {
    // Just right - no suggestions
    return suggestions;
  }

  // Too many results - suggest narrowing
  if (resultsCount > totalCount * 0.8 && !hasActiveFilters(currentFilters)) {
    suggestions.push({
      type: 'add',
      label: 'Try filtering by category',
      description: 'Narrow down by drive time',
      action: () => {
        /* Open filter panel */
      },
      priority: 30,
      icon: '🎯',
    });
  }

  // Sort by priority (highest first)
  return suggestions.sort((a, b) => b.priority - a.priority);
}

function hasActiveFilters(filters: FilterState): boolean {
  return Object.entries(filters).some(([key, value]) => {
    if (key === 'search' && value) return true;
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== '' && value !== null;
  });
}

function getSeasonIcon(season: string): string {
  const icons: Record<string, string> = {
    spring: '🌸',
    summer: '☀️',
    fall: '🍂',
    winter: '❄️',
  };
  return icons[season] || '🌦️';
}

// ============================================================================
// REACT HOOK
// ============================================================================

export interface SmartFiltersOptions<T extends FilterState> {
  namespace: string;
  initialFilters?: T;
  persist?: boolean;
  trackMetrics?: boolean;
  availableOptions?: {
    categories?: string[];
    subcategories?: string[];
    regions?: string[];
    seasons?: string[];
  };
}

export function useSmartFilters<T extends FilterState = FilterState>(
  options: SmartFiltersOptions<T>
) {
  const {
    namespace,
    initialFilters = {} as T,
    persist = true,
    trackMetrics = true,
    availableOptions = {},
  } = options;

  // Load persisted state or use initial
  const [filters, setFiltersInternal] = useState<T>(() => {
    if (persist) {
      const loaded = loadFilterState(namespace);
      return loaded ? ({ ...initialFilters, ...loaded } as T) : initialFilters;
    }
    return initialFilters;
  });

  const [resultsCount, setResultsCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Update filter state with persistence and tracking
  const setFilters = useCallback(
    (newFilters: Partial<T> | ((prev: T) => T)) => {
      setFiltersInternal((prev) => {
        const updated = typeof newFilters === 'function' ? newFilters(prev) : { ...prev, ...newFilters };

        if (persist) {
          saveFilterState(namespace, updated);
        }

        if (trackMetrics) {
          // Track filter changes
          const changedKeys = Object.keys(updated).filter(
            (key) => JSON.stringify(prev[key]) !== JSON.stringify(updated[key])
          );

          changedKeys.forEach((key) => {
            metrics.filter.filterApplied({
              filterType: key as any,
              value: String(updated[key]),
              resultsCount,
            });
          });
        }

        return updated;
      });
    },
    [namespace, persist, trackMetrics, resultsCount]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    const clearedFilters = Object.keys(filters);

    setFiltersInternal(initialFilters);

    if (persist) {
      localStorage.removeItem(STATE_KEY(namespace));
    }

    if (trackMetrics) {
      metrics.filter.filterCleared({
        filterType: 'all' as any,
        clearedFilters,
      });
    }
  }, [filters, initialFilters, namespace, persist, trackMetrics]);

  // Update results count (call this after filtering)
  const updateResults = useCallback(
    (count: number, total: number) => {
      setResultsCount(count);
      setTotalCount(total);

      if (persist && hasActiveFilters(filters)) {
        addToHistory(namespace, filters, count);
      }

      if (trackMetrics && count === 0 && hasActiveFilters(filters)) {
        metrics.filter.noResultsShown({
          activeFilters: Object.keys(filters).filter((key) => {
            const value = filters[key];
            if (Array.isArray(value)) return value.length > 0;
            return value !== undefined && value !== '';
          }),
          searchQuery: filters.search,
        });
      }
    },
    [filters, namespace, persist, trackMetrics]
  );

  // Get filter history
  const history = useMemo(() => loadFilterHistory(namespace), [namespace]);

  // Generate smart suggestions
  const suggestions = useMemo(
    () => generateSuggestions(filters, resultsCount, totalCount, availableOptions, setFilters as any),
    [filters, resultsCount, totalCount, availableOptions]
  );

  // Check if any filters are active
  const isFiltered = useMemo(() => hasActiveFilters(filters), [filters]);

  // Get count of active filters
  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).reduce((count, [key, value]) => {
      if (key === 'search' && value) return count + 1;
      if (Array.isArray(value)) return count + value.length;
      if (value !== undefined && value !== '' && value !== null) return count + 1;
      return count;
    }, 0);
  }, [filters]);

  return {
    filters,
    setFilters,
    clearFilters,
    updateResults,
    suggestions,
    history,
    isFiltered,
    activeFilterCount,
    resultsCount,
    totalCount,
  };
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export { loadFilterState, saveFilterState, loadFilterHistory };
