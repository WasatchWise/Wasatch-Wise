/**
 * TripKit Learning Objectives
 *
 * Each TripKit has specific learning objectives mapped to Bloom's taxonomy.
 * This supports both the LearningResource schema (SEO) and the
 * InstructionalDesign component (marketing).
 *
 * Bloom's Taxonomy Levels:
 * - remember: Recall facts and basic concepts
 * - understand: Explain ideas or concepts
 * - apply: Use information in new situations
 * - analyze: Draw connections among ideas
 * - evaluate: Justify a decision or course of action
 * - create: Produce new or original work
 *
 * Categories:
 * - geography: Physical landscape, navigation, terrain
 * - culture: Local customs, communities, vibe
 * - history: Historical context, how places evolved
 * - safety: Risk awareness, preparation, conditions
 * - planning: Logistics, timing, efficiency
 * - local-knowledge: Insider tips, secrets, what locals know
 */

import { LearningObjective } from '@/components/SchemaMarkup';

export const tripkitLearningObjectives: Record<string, LearningObjective[]> = {
  // ============================================
  // TK-002: SKI UTAH - THE COMPLETE GUIDE
  // ============================================
  'TK-002': [
    // Geography
    {
      id: 'ski-geo-1',
      objective: 'Distinguish between Little Cottonwood and Big Cottonwood canyons and their distinct characteristics',
      bloomsLevel: 'understand',
      category: 'geography',
    },
    {
      id: 'ski-geo-2',
      objective: 'Navigate between Wasatch Front resorts efficiently using optimal routes',
      bloomsLevel: 'apply',
      category: 'geography',
    },
    {
      id: 'ski-geo-3',
      objective: 'Identify which resort terrain matches your skill level and preferences',
      bloomsLevel: 'analyze',
      category: 'geography',
    },

    // History
    {
      id: 'ski-hist-1',
      objective: 'Explain how Utah\'s mining history shaped modern ski resort development',
      bloomsLevel: 'understand',
      category: 'history',
    },
    {
      id: 'ski-hist-2',
      objective: 'Recall key dates and events in Utah skiing history (1939 Alta opening, 2002 Olympics)',
      bloomsLevel: 'remember',
      category: 'history',
    },

    // Safety
    {
      id: 'ski-safety-1',
      objective: 'Assess avalanche conditions and understand when canyons close',
      bloomsLevel: 'evaluate',
      category: 'safety',
    },
    {
      id: 'ski-safety-2',
      objective: 'Apply the "buddy system" and resort safety protocols',
      bloomsLevel: 'apply',
      category: 'safety',
    },
    {
      id: 'ski-safety-3',
      objective: 'Recognize signs of altitude sickness and cold-related conditions',
      bloomsLevel: 'analyze',
      category: 'safety',
    },

    // Planning
    {
      id: 'ski-plan-1',
      objective: 'Plan a multi-day ski trip with optimal resort sequencing',
      bloomsLevel: 'create',
      category: 'planning',
    },
    {
      id: 'ski-plan-2',
      objective: 'Calculate realistic drive times accounting for canyon traffic patterns',
      bloomsLevel: 'apply',
      category: 'planning',
    },
    {
      id: 'ski-plan-3',
      objective: 'Compare Ikon Pass vs individual tickets for your specific trip',
      bloomsLevel: 'evaluate',
      category: 'planning',
    },

    // Local Knowledge
    {
      id: 'ski-local-1',
      objective: 'Identify the best runs at each resort that locals prioritize',
      bloomsLevel: 'remember',
      category: 'local-knowledge',
    },
    {
      id: 'ski-local-2',
      objective: 'Apply the "7% rule" to understand why Utah powder is different',
      bloomsLevel: 'understand',
      category: 'local-knowledge',
    },
    {
      id: 'ski-local-3',
      objective: 'Use the UTA ski bus system like a local to avoid canyon traffic',
      bloomsLevel: 'apply',
      category: 'local-knowledge',
    },

    // Culture
    {
      id: 'ski-culture-1',
      objective: 'Understand the unwritten rules of ski culture in Utah (Alta\'s no-snowboard policy, etc.)',
      bloomsLevel: 'understand',
      category: 'culture',
    },
    {
      id: 'ski-culture-2',
      objective: 'Describe the personality differences between Park City and Cottonwood resorts',
      bloomsLevel: 'analyze',
      category: 'culture',
    },
  ],

  // ============================================
  // TK-000: UTAH UNLOCKED (Free TripKit)
  // ============================================
  'TK-000': [
    {
      id: 'utah-geo-1',
      objective: 'Recall Utah\'s five national parks and their primary features',
      bloomsLevel: 'remember',
      category: 'geography',
    },
    {
      id: 'utah-geo-2',
      objective: 'Explain Utah\'s diverse climate zones from desert to alpine',
      bloomsLevel: 'understand',
      category: 'geography',
    },
    {
      id: 'utah-plan-1',
      objective: 'Use drive times from SLC to plan realistic day trips',
      bloomsLevel: 'apply',
      category: 'planning',
    },
    {
      id: 'utah-hist-1',
      objective: 'Understand the role of pioneer settlement in shaping Utah\'s communities',
      bloomsLevel: 'understand',
      category: 'history',
    },
    {
      id: 'utah-culture-1',
      objective: 'Navigate cultural considerations unique to Utah',
      bloomsLevel: 'apply',
      category: 'culture',
    },
  ],

  // ============================================
  // TK-005: SECRET SPRINGS
  // ============================================
  'TK-005': [
    {
      id: 'springs-geo-1',
      objective: 'Locate hot springs across Utah using geological indicators',
      bloomsLevel: 'apply',
      category: 'geography',
    },
    {
      id: 'springs-geo-2',
      objective: 'Explain how geothermal activity creates hot springs',
      bloomsLevel: 'understand',
      category: 'geography',
    },
    {
      id: 'springs-safety-1',
      objective: 'Assess spring safety including temperature, depth, and access risks',
      bloomsLevel: 'evaluate',
      category: 'safety',
    },
    {
      id: 'springs-safety-2',
      objective: 'Apply flash flood awareness protocols for canyon springs',
      bloomsLevel: 'apply',
      category: 'safety',
    },
    {
      id: 'springs-local-1',
      objective: 'Time your visits to avoid crowds at popular springs',
      bloomsLevel: 'apply',
      category: 'local-knowledge',
    },
    {
      id: 'springs-culture-1',
      objective: 'Practice leave-no-trace ethics at primitive hot springs',
      bloomsLevel: 'apply',
      category: 'culture',
    },
  ],

  // ============================================
  // TK-024: BREWERY TRAIL
  // ============================================
  'TK-024': [
    {
      id: 'brew-hist-1',
      objective: 'Trace the evolution of brewing in Utah from prohibition to craft renaissance',
      bloomsLevel: 'understand',
      category: 'history',
    },
    {
      id: 'brew-culture-1',
      objective: 'Navigate Utah\'s unique liquor laws as a visitor',
      bloomsLevel: 'apply',
      category: 'culture',
    },
    {
      id: 'brew-local-1',
      objective: 'Identify signature beers from each Utah craft brewery',
      bloomsLevel: 'remember',
      category: 'local-knowledge',
    },
    {
      id: 'brew-plan-1',
      objective: 'Plan a brewery crawl with transportation and timing logistics',
      bloomsLevel: 'create',
      category: 'planning',
    },
    {
      id: 'brew-culture-2',
      objective: 'Understand the "Zion Curtain" history and current bar regulations',
      bloomsLevel: 'understand',
      category: 'culture',
    },
  ],

  // ============================================
  // TK-055: GOLF
  // ============================================
  'TK-055': [
    {
      id: 'golf-geo-1',
      objective: 'Adjust your game for Utah\'s altitude (ball travels 10% farther)',
      bloomsLevel: 'apply',
      category: 'geography',
    },
    {
      id: 'golf-plan-1',
      objective: 'Use twilight rates strategically for budget-conscious golf',
      bloomsLevel: 'apply',
      category: 'planning',
    },
    {
      id: 'golf-local-1',
      objective: 'Identify which private courses offer Monday public access',
      bloomsLevel: 'remember',
      category: 'local-knowledge',
    },
    {
      id: 'golf-geo-2',
      objective: 'Compare desert courses (St. George) vs mountain courses (Park City)',
      bloomsLevel: 'analyze',
      category: 'geography',
    },
    {
      id: 'golf-hist-1',
      objective: 'Recall the history of Utah golf from 1899 to present',
      bloomsLevel: 'remember',
      category: 'history',
    },
  ],

  // ============================================
  // TK-045: 250 UNDER $25
  // ============================================
  'TK-045': [
    {
      id: 'budget-plan-1',
      objective: 'Identify free museum days and state park fee waivers',
      bloomsLevel: 'remember',
      category: 'planning',
    },
    {
      id: 'budget-local-1',
      objective: 'Use library cards for free attraction passes',
      bloomsLevel: 'apply',
      category: 'local-knowledge',
    },
    {
      id: 'budget-plan-2',
      objective: 'Plan a full day of activities for under $25 per person',
      bloomsLevel: 'create',
      category: 'planning',
    },
    {
      id: 'budget-geo-1',
      objective: 'Locate the best free natural attractions in each region',
      bloomsLevel: 'remember',
      category: 'geography',
    },
    {
      id: 'budget-culture-1',
      objective: 'Access free community events and local festivals',
      bloomsLevel: 'apply',
      category: 'culture',
    },
  ],
};

/**
 * Get learning objectives for a TripKit by code
 */
export function getLearningObjectives(tripkitCode: string): LearningObjective[] {
  return tripkitLearningObjectives[tripkitCode] || [];
}

/**
 * Get learning objectives grouped by category
 */
export function getLearningObjectivesByCategory(tripkitCode: string): Record<string, LearningObjective[]> {
  const objectives = getLearningObjectives(tripkitCode);
  return objectives.reduce((acc, obj) => {
    if (!acc[obj.category]) acc[obj.category] = [];
    acc[obj.category].push(obj);
    return acc;
  }, {} as Record<string, LearningObjective[]>);
}

/**
 * Get learning objectives grouped by Bloom's level
 */
export function getLearningObjectivesByBloomsLevel(tripkitCode: string): Record<string, LearningObjective[]> {
  const objectives = getLearningObjectives(tripkitCode);
  return objectives.reduce((acc, obj) => {
    if (!acc[obj.bloomsLevel]) acc[obj.bloomsLevel] = [];
    acc[obj.bloomsLevel].push(obj);
    return acc;
  }, {} as Record<string, LearningObjective[]>);
}

/**
 * Generate a summary of learning objectives for a TripKit
 */
export function getLearningObjectivesSummary(tripkitCode: string): {
  total: number;
  byCategory: Record<string, number>;
  byBloomsLevel: Record<string, number>;
} {
  const objectives = getLearningObjectives(tripkitCode);
  const byCategory = objectives.reduce((acc, obj) => {
    acc[obj.category] = (acc[obj.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byBloomsLevel = objectives.reduce((acc, obj) => {
    acc[obj.bloomsLevel] = (acc[obj.bloomsLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: objectives.length,
    byCategory,
    byBloomsLevel,
  };
}
