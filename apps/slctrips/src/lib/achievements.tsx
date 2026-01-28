/**
 * Achievement System Foundation
 *
 * Gamification system that rewards user exploration and engagement.
 * Tracks progress, unlocks achievements, and encourages return visits.
 *
 * Usage:
 *   import { useAchievements, AchievementToast } from '@/lib/achievements';
 *
 *   const { checkAchievement, achievements } = useAchievements();
 *   checkAchievement('first_destination_view');
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { metrics } from '@/lib/metrics';

// ============================================================================
// TYPES
// ============================================================================

export interface Achievement {
  id: string;
  name: string;
  description: string;
  type: 'exploration' | 'engagement' | 'completion' | 'social';
  icon: string;
  points: number;
  condition: (userData: UserData) => boolean;
  progress?: (userData: UserData) => { current: number; total: number };
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  hidden?: boolean; // Don't show until unlocked
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: string;
  isNew: boolean;
}

export interface UserData {
  destinationsViewed: string[];
  guardiansViewed: string[];
  tripkitsAccessed: string[];
  daysActive: number;
  totalPageViews: number;
  filtersUsed: number;
  audioPlays: number;
  emailsSubmitted: number;
  lastVisit: string;
  firstVisit: string;
}

// ============================================================================
// ACHIEVEMENT DEFINITIONS
// ============================================================================

export const ACHIEVEMENTS: Achievement[] = [
  // EXPLORATION ACHIEVEMENTS
  {
    id: 'first_destination_view',
    name: 'Explorer',
    description: 'View your first destination',
    type: 'exploration',
    icon: '🗺️',
    points: 10,
    rarity: 'common',
    condition: (data) => data.destinationsViewed.length >= 1,
  },
  {
    id: 'ten_destinations',
    name: 'Curious Traveler',
    description: 'View 10 different destinations',
    type: 'exploration',
    icon: '🧭',
    points: 50,
    rarity: 'uncommon',
    condition: (data) => data.destinationsViewed.length >= 10,
    progress: (data) => ({ current: data.destinationsViewed.length, total: 10 }),
  },
  {
    id: 'fifty_destinations',
    name: 'Destination Hunter',
    description: 'View 50 different destinations',
    type: 'exploration',
    icon: '🎯',
    points: 200,
    rarity: 'rare',
    condition: (data) => data.destinationsViewed.length >= 50,
    progress: (data) => ({ current: data.destinationsViewed.length, total: 50 }),
  },
  {
    id: 'all_guardians',
    name: 'Guardian Master',
    description: 'Meet all 29 county guardians',
    type: 'completion',
    icon: '👑',
    points: 500,
    rarity: 'epic',
    condition: (data) => data.guardiansViewed.length >= 29,
    progress: (data) => ({ current: data.guardiansViewed.length, total: 29 }),
  },
  {
    id: 'first_tripkit',
    name: 'TripKit Enthusiast',
    description: 'Access your first TripKit',
    type: 'engagement',
    icon: '📦',
    points: 25,
    rarity: 'common',
    condition: (data) => data.tripkitsAccessed.length >= 1,
  },

  // ENGAGEMENT ACHIEVEMENTS
  {
    id: 'seven_day_streak',
    name: 'Weekly Explorer',
    description: 'Visit the site for 7 days in a row',
    type: 'engagement',
    icon: '🔥',
    points: 100,
    rarity: 'uncommon',
    condition: (data) => data.daysActive >= 7,
    progress: (data) => ({ current: data.daysActive, total: 7 }),
  },
  {
    id: 'power_user',
    name: 'Power User',
    description: 'Use filters 10 times',
    type: 'engagement',
    icon: '⚡',
    points: 50,
    rarity: 'uncommon',
    condition: (data) => data.filtersUsed >= 10,
    progress: (data) => ({ current: data.filtersUsed, total: 10 }),
  },
  {
    id: 'audio_lover',
    name: 'Audio Aficionado',
    description: 'Listen to 5 audio introductions',
    type: 'engagement',
    icon: '🎧',
    points: 75,
    rarity: 'uncommon',
    condition: (data) => data.audioPlays >= 5,
    progress: (data) => ({ current: data.audioPlays, total: 5 }),
  },
  {
    id: 'email_subscriber',
    name: 'Community Member',
    description: 'Join the SLCTrips community',
    type: 'social',
    icon: '✉️',
    points: 50,
    rarity: 'common',
    condition: (data) => data.emailsSubmitted >= 1,
  },

  // COMPLETION ACHIEVEMENTS
  {
    id: 'hundred_pages',
    name: 'Dedicated Explorer',
    description: 'View 100 pages',
    type: 'completion',
    icon: '📚',
    points: 150,
    rarity: 'rare',
    condition: (data) => data.totalPageViews >= 100,
    progress: (data) => ({ current: data.totalPageViews, total: 100 }),
  },

  // HIDDEN ACHIEVEMENTS (Easter eggs)
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Visit before 6 AM',
    type: 'exploration',
    icon: '🌅',
    points: 25,
    rarity: 'uncommon',
    hidden: true,
    condition: () => {
      const hour = new Date().getHours();
      return hour >= 4 && hour < 6;
    },
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Visit after midnight',
    type: 'exploration',
    icon: '🦉',
    points: 25,
    rarity: 'uncommon',
    hidden: true,
    condition: () => {
      const hour = new Date().getHours();
      return hour >= 0 && hour < 4;
    },
  },
  {
    id: 'olympics_ready',
    name: 'Olympics Ready',
    description: 'View destinations in multiple languages',
    type: 'social',
    icon: '🏔️',
    points: 200,
    rarity: 'epic',
    hidden: true,
    condition: (data) => data.audioPlays >= 3, // Simplified - would track language variety
  },
];

// ============================================================================
// STORAGE UTILITIES
// ============================================================================

const STORAGE_KEY = 'slctrips_achievements';
const USER_DATA_KEY = 'slctrips_user_data';

function loadUserData(): UserData {
  if (typeof window === 'undefined') {
    return getDefaultUserData();
  }

  try {
    const stored = localStorage.getItem(USER_DATA_KEY);
    if (!stored) return getDefaultUserData();
    return JSON.parse(stored);
  } catch {
    return getDefaultUserData();
  }
}

function saveUserData(data: UserData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
  } catch {
    // Storage full or disabled
  }
}

function loadUnlockedAchievements(): UnlockedAchievement[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveUnlockedAchievements(achievements: UnlockedAchievement[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements));
  } catch {
    // Storage full or disabled
  }
}

function getDefaultUserData(): UserData {
  return {
    destinationsViewed: [],
    guardiansViewed: [],
    tripkitsAccessed: [],
    daysActive: 1,
    totalPageViews: 0,
    filtersUsed: 0,
    audioPlays: 0,
    emailsSubmitted: 0,
    lastVisit: new Date().toISOString(),
    firstVisit: new Date().toISOString(),
  };
}

// ============================================================================
// HOOK: useAchievements
// ============================================================================

export function useAchievements() {
  const [userData, setUserData] = useState<UserData>(loadUserData);
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>(
    loadUnlockedAchievements
  );
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  // Update user data
  const updateUserData = useCallback((updates: Partial<UserData>) => {
    setUserData((prev) => {
      const updated = { ...prev, ...updates };
      saveUserData(updated);
      return updated;
    });
  }, []);

  // Check for new achievements
  const checkAchievements = useCallback(() => {
    const newlyUnlocked: Achievement[] = [];

    for (const achievement of ACHIEVEMENTS) {
      // Skip if already unlocked
      const alreadyUnlocked = unlockedAchievements.some(
        (ua) => ua.achievementId === achievement.id
      );
      if (alreadyUnlocked) continue;

      // Check condition
      if (achievement.condition(userData)) {
        newlyUnlocked.push(achievement);

        const unlocked: UnlockedAchievement = {
          achievementId: achievement.id,
          unlockedAt: new Date().toISOString(),
          isNew: true,
        };

        setUnlockedAchievements((prev) => {
          const updated = [...prev, unlocked];
          saveUnlockedAchievements(updated);
          return updated;
        });

        // Track achievement
        metrics.achievement.achieved({
          achievementId: achievement.id,
          achievementName: achievement.name,
          achievementType: achievement.type,
          isFirstTime: true,
        });
      }
    }

    if (newlyUnlocked.length > 0) {
      setNewAchievements(newlyUnlocked);

      // Clear "new" flag after 5 seconds
      setTimeout(() => {
        setNewAchievements([]);
      }, 5000);
    }
  }, [userData, unlockedAchievements]);

  // Track specific actions
  const trackDestinationView = useCallback(
    (slug: string) => {
      if (!userData.destinationsViewed.includes(slug)) {
        updateUserData({
          destinationsViewed: [...userData.destinationsViewed, slug],
          totalPageViews: userData.totalPageViews + 1,
        });
        checkAchievements();
      }
    },
    [userData, updateUserData, checkAchievements]
  );

  const trackGuardianView = useCallback(
    (slug: string) => {
      if (!userData.guardiansViewed.includes(slug)) {
        updateUserData({
          guardiansViewed: [...userData.guardiansViewed, slug],
          totalPageViews: userData.totalPageViews + 1,
        });
        checkAchievements();
      }
    },
    [userData, updateUserData, checkAchievements]
  );

  const trackTripKitAccess = useCallback(
    (slug: string) => {
      if (!userData.tripkitsAccessed.includes(slug)) {
        updateUserData({
          tripkitsAccessed: [...userData.tripkitsAccessed, slug],
        });
        checkAchievements();
      }
    },
    [userData, updateUserData, checkAchievements]
  );

  const trackFilterUse = useCallback(() => {
    updateUserData({
      filtersUsed: userData.filtersUsed + 1,
    });
    checkAchievements();
  }, [userData, updateUserData, checkAchievements]);

  const trackAudioPlay = useCallback(() => {
    updateUserData({
      audioPlays: userData.audioPlays + 1,
    });
    checkAchievements();
  }, [userData, updateUserData, checkAchievements]);

  const trackEmailSubmission = useCallback(() => {
    updateUserData({
      emailsSubmitted: userData.emailsSubmitted + 1,
    });
    checkAchievements();
  }, [userData, updateUserData, checkAchievements]);

  // Calculate total points
  const totalPoints = unlockedAchievements.reduce((sum, ua) => {
    const achievement = ACHIEVEMENTS.find((a) => a.id === ua.achievementId);
    return sum + (achievement?.points || 0);
  }, 0);

  // Get achievement progress
  const getProgress = useCallback(
    (achievementId: string) => {
      const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
      if (!achievement?.progress) return null;
      return achievement.progress(userData);
    },
    [userData]
  );

  return {
    userData,
    unlockedAchievements,
    newAchievements,
    totalPoints,
    trackDestinationView,
    trackGuardianView,
    trackTripKitAccess,
    trackFilterUse,
    trackAudioPlay,
    trackEmailSubmission,
    getProgress,
    checkAchievements,
  };
}

// ============================================================================
// ACHIEVEMENT TOAST COMPONENT
// ============================================================================

export function AchievementToast({ achievement }: { achievement: Achievement }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slideInRight">
      <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white rounded-xl shadow-2xl p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="text-4xl">{achievement.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wide opacity-90">
                Achievement Unlocked
              </span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                +{achievement.points} pts
              </span>
            </div>
            <h3 className="font-bold text-lg mb-1 text-white">{achievement.name}</h3>
            <p className="text-sm opacity-90">{achievement.description}</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
