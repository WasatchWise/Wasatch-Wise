'use client';

import { LearningObjective } from './SchemaMarkup';

interface InstructionalDesignProps {
  tripkitName: string;
  destinationCount: number;
  estimatedTime?: string | null;
  learningObjectives?: LearningObjective[] | null;
  showDetailed?: boolean;
}

// Bloom's taxonomy icons and colors
const bloomsConfig: Record<string, { icon: string; color: string; label: string }> = {
  remember: { icon: '🧠', color: 'bg-slate-100 text-slate-700 border-slate-200', label: 'Knowledge' },
  understand: { icon: '💡', color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Comprehension' },
  apply: { icon: '🎯', color: 'bg-green-50 text-green-700 border-green-200', label: 'Application' },
  analyze: { icon: '🔍', color: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Analysis' },
  evaluate: { icon: '⚖️', color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Evaluation' },
  create: { icon: '✨', color: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Creation' },
};

// Category icons
const categoryConfig: Record<string, { icon: string; label: string }> = {
  geography: { icon: '🗺️', label: 'Geography' },
  culture: { icon: '🎭', label: 'Culture' },
  history: { icon: '📜', label: 'History' },
  safety: { icon: '🛡️', label: 'Safety' },
  planning: { icon: '📋', label: 'Planning' },
  'local-knowledge': { icon: '🏔️', label: 'Local Knowledge' },
};

/**
 * InstructionalDesign Component
 *
 * Displays the educational value proposition of a TripKit.
 * Based on HCI principles and Bloom's taxonomy for learning objectives.
 *
 * This component serves two purposes:
 * 1. Marketing: Shows customers the real value they're getting
 * 2. SEO: Supports the LearningResource schema with visible content
 */
export default function InstructionalDesign({
  tripkitName,
  destinationCount,
  estimatedTime,
  learningObjectives,
  showDetailed = false,
}: InstructionalDesignProps) {
  // Parse estimated time (format: "PT3H" or "3-4 hours")
  const formatTime = (time: string | null | undefined) => {
    if (!time) return '3-4 hours';
    if (time.startsWith('PT')) {
      const hours = time.match(/(\d+)H/)?.[1];
      const mins = time.match(/(\d+)M/)?.[1];
      if (hours && mins) return `${hours}h ${mins}m`;
      if (hours) return `${hours} hours`;
      if (mins) return `${mins} minutes`;
    }
    return time;
  };

  // Group objectives by category
  const objectivesByCategory = learningObjectives?.reduce((acc, obj) => {
    if (!acc[obj.category]) acc[obj.category] = [];
    acc[obj.category].push(obj);
    return acc;
  }, {} as Record<string, LearningObjective[]>);

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl p-6 border border-indigo-100 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-lg">What You&apos;ll Learn</h3>
          <p className="text-sm text-gray-500">Place-based learning designed for real exploration</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-lg p-3 border border-gray-100 text-center">
          <div className="text-2xl font-bold text-indigo-600">{destinationCount}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Destinations</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-100 text-center">
          <div className="text-2xl font-bold text-indigo-600">{formatTime(estimatedTime)}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Est. Time</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-100 text-center">
          <div className="text-2xl font-bold text-indigo-600">{learningObjectives?.length || 6}+</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Skills</div>
        </div>
      </div>

      {/* Learning Objectives - Simple View */}
      {!showDetailed && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">After this TripKit, you&apos;ll know:</h4>
          <ul className="space-y-2">
            {learningObjectives?.slice(0, 5).map((obj, idx) => (
              <li key={obj.id || idx} className="flex items-start gap-2">
                <span className="text-indigo-500 mt-0.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-gray-700 text-sm">{obj.objective}</span>
              </li>
            )) || (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-gray-700 text-sm">Navigate the region like a local, not a tourist</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-gray-700 text-sm">Understand the history and culture that shaped these places</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-gray-700 text-sm">Make informed decisions about where to go and when</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-gray-700 text-sm">Avoid common mistakes that waste time and money</span>
                </li>
              </>
            )}
          </ul>
        </div>
      )}

      {/* Learning Objectives - Detailed View (with Bloom's taxonomy) */}
      {showDetailed && objectivesByCategory && Object.keys(objectivesByCategory).length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Learning Objectives by Category</h4>
          {Object.entries(objectivesByCategory).map(([category, objectives]) => (
            <div key={category} className="bg-white rounded-lg p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{categoryConfig[category]?.icon || '📚'}</span>
                <span className="font-medium text-gray-800">{categoryConfig[category]?.label || category}</span>
              </div>
              <ul className="space-y-2">
                {objectives.map((obj, idx) => (
                  <li key={obj.id || idx} className="flex items-start gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${bloomsConfig[obj.bloomsLevel]?.color || 'bg-gray-100'}`}>
                      {bloomsConfig[obj.bloomsLevel]?.icon} {bloomsConfig[obj.bloomsLevel]?.label}
                    </span>
                    <span className="text-gray-700 text-sm flex-1">{obj.objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Credibility Footer */}
      <div className="mt-6 pt-4 border-t border-indigo-100">
        <p className="text-xs text-gray-500 text-center">
          Designed with evidence-based instructional design principles.
          <br />
          Real knowledge transfer, not just pretty pictures.
        </p>
      </div>
    </div>
  );
}

/**
 * Compact version for use in cards/lists
 */
export function InstructionalDesignBadge({
  destinationCount,
  estimatedTime,
}: {
  destinationCount: number;
  estimatedTime?: string | null;
}) {
  const formatTime = (time: string | null | undefined) => {
    if (!time) return '3-4h';
    if (time.startsWith('PT')) {
      const hours = time.match(/(\d+)H/)?.[1];
      if (hours) return `${hours}h`;
    }
    return time;
  };

  return (
    <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm border border-indigo-100">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
      <span>{destinationCount} destinations</span>
      <span className="text-indigo-300">|</span>
      <span>{formatTime(estimatedTime)}</span>
    </div>
  );
}
