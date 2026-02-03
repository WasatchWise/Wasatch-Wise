'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SafeImage from '@/components/SafeImage';
import { TripKit, Destination, Guardian } from '@/types/database.types';

const GUARDIAN_PLACEHOLDER = '/images/default-guardian.webp';
import { CurriculumFramework } from '@/types/curriculum.types';

interface FrameworkViewerProps {
  tripkit: TripKit;
  destinations: Destination[];
  guardians: Guardian[];
  framework: CurriculumFramework;
  accessCode: string;
}

export default function FrameworkViewer({
  tripkit,
  destinations,
  guardians,
  framework,
  accessCode
}: FrameworkViewerProps) {
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [completedActivities, setCompletedActivities] = useState<Set<string>>(new Set());

  // Group destinations by county for easy access
  const destinationsByCounty: Record<string, Destination[]> = {};
  destinations.forEach(dest => {
    if (dest.county) {
      const countyName = dest.county.replace(/ County$/i, '').trim();
      if (!destinationsByCounty[countyName]) {
        destinationsByCounty[countyName] = [];
      }
      destinationsByCounty[countyName].push(dest);
    }
  });

  // Map guardians by county
  const guardiansByCounty: Record<string, Guardian> = {};
  guardians.forEach(g => {
    if (g.county) {
      guardiansByCounty[g.county] = g;
    }
  });

  const toggleActivity = (activityId: string) => {
    setCompletedActivities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  };

  const completedCount = completedActivities.size;
  const totalActivities = framework.modules?.reduce((sum, mod) => sum + mod.activities.length, 0) || 0;
  const progress = totalActivities > 0 ? Math.round((completedCount / totalActivities) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Hero Section */}
      <div className={`mb-12 bg-gradient-to-br ${framework.gradientFrom} ${framework.gradientTo} rounded-2xl shadow-2xl overflow-hidden text-white p-8`}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <span className="font-mono text-sm">{accessCode}</span>
          </div>

          <div className="text-6xl mb-4">{framework.icon}</div>

          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-white">
            {framework.name}
          </h1>

          <p className="text-xl md:text-2xl mb-6 opacity-90">
            {framework.subtitle}
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
            <p className="text-lg mb-4">{framework.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mt-6">
              <div>
                <div className="text-3xl font-bold text-yellow-300">{framework.duration}</div>
                <div className="text-sm opacity-90">Duration</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-300">{completedCount}/{totalActivities}</div>
                <div className="text-sm opacity-90">Activities Completed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-300">{progress}%</div>
                <div className="text-sm opacity-90">Progress</div>
              </div>
            </div>
          </div>

          <div className="h-4 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Framework Objectives */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          🎯 Learning Objectives
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {framework.objectives.map((obj, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-white rounded-lg p-4 shadow-sm">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                {idx + 1}
              </div>
              <p className="text-gray-700 leading-relaxed">{obj}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Standards Alignment */}
      <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          📚 Utah Core Standards Alignment
        </h2>
        <div className="space-y-3">
          {framework.standards.map((standard, idx) => (
            <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
              <p className="text-gray-700">{standard}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modules/Activities Section */}
      {framework.modules && framework.modules.length > 0 && (
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">
            📖 Curriculum Modules
          </h2>
          <div className="space-y-6">
            {framework.modules.map((module, moduleIdx) => {
              const isExpanded = expandedModule === module.id;
              const moduleCompletedActivities = module.activities.filter(act =>
                completedActivities.has(act.id)
              ).length;
              const moduleProgress = module.activities.length > 0
                ? Math.round((moduleCompletedActivities / module.activities.length) * 100)
                : 0;

              return (
                <div
                  key={module.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200"
                >
                  {/* Module Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                            {moduleIdx + 1}
                          </span>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {module.name}
                          </h3>
                        </div>
                        <p className="text-gray-600 ml-13 mb-3">{module.description}</p>
                        <div className="ml-13 flex items-center gap-6">
                          <span className="text-sm font-semibold text-blue-600">
                            ⏱️ {module.duration}
                          </span>
                          <span className="text-sm font-semibold text-green-600">
                            ✓ {moduleCompletedActivities}/{module.activities.length} activities
                          </span>
                          <span className="text-sm font-semibold text-purple-600">
                            {moduleProgress}% complete
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setExpandedModule(isExpanded ? null : module.id)}
                        className="flex-shrink-0 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-semibold transition-colors"
                      >
                        {isExpanded ? '▲ Collapse' : '▼ Expand'}
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="ml-13 mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${moduleProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Module Content */}
                  {isExpanded && (
                    <div className="p-6 bg-gray-50">
                      {/* Activities */}
                      <div className="mb-6">
                        <h4 className="text-xl font-bold text-gray-900 mb-4">
                          🎨 Activities
                        </h4>
                        <div className="space-y-4">
                          {module.activities.map((activity, actIdx) => {
                            const isCompleted = completedActivities.has(activity.id);
                            const activityTypeColors: Record<string, string> = {
                              'hands-on': 'bg-orange-100 text-orange-700',
                              'digital': 'bg-blue-100 text-blue-700',
                              'discussion': 'bg-purple-100 text-purple-700',
                              'research': 'bg-green-100 text-green-700',
                              'creative': 'bg-pink-100 text-pink-700'
                            };

                            return (
                              <div
                                key={activity.id}
                                className={`bg-white rounded-lg p-5 shadow-sm border-2 transition-all ${
                                  isCompleted ? 'border-green-400 bg-green-50' : 'border-gray-200'
                                }`}
                              >
                                <div className="flex items-start gap-4">
                                  <button
                                    onClick={() => toggleActivity(activity.id)}
                                    className={`flex-shrink-0 w-8 h-8 rounded-lg border-2 flex items-center justify-center font-bold transition-all ${
                                      isCompleted
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'bg-white border-gray-300 text-gray-400 hover:border-green-400'
                                    }`}
                                  >
                                    {isCompleted ? '✓' : actIdx + 1}
                                  </button>

                                  <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                      <h5 className="text-lg font-bold text-gray-900">
                                        {activity.name}
                                      </h5>
                                      <div className="flex items-center gap-2">
                                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${activityTypeColors[activity.type]}`}>
                                          {activity.type}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                          ⏱️ {activity.duration}
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-gray-700 mb-3">{activity.description}</p>
                                    {activity.materials && activity.materials.length > 0 && (
                                      <div className="bg-gray-50 rounded p-3 border border-gray-200">
                                        <p className="text-sm font-semibold text-gray-700 mb-1">
                                          📦 Materials Needed:
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                          {activity.materials.map((material, matIdx) => (
                                            <span
                                              key={matIdx}
                                              className="text-xs bg-white px-2 py-1 rounded border border-gray-300"
                                            >
                                              {material}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Assessments */}
                      {module.assessments && module.assessments.length > 0 && (
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 mb-4">
                            📊 Assessments
                          </h4>
                          <div className="space-y-3">
                            {module.assessments.map((assessment) => {
                              const assessmentTypeColors: Record<string, string> = {
                                'formative': 'border-blue-400 bg-blue-50',
                                'summative': 'border-purple-400 bg-purple-50',
                                'peer-review': 'border-green-400 bg-green-50',
                                'self-reflection': 'border-amber-400 bg-amber-50'
                              };

                              return (
                                <div
                                  key={assessment.id}
                                  className={`rounded-lg p-4 border-l-4 ${assessmentTypeColors[assessment.type]}`}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <h5 className="font-bold text-gray-900">
                                      {assessment.name}
                                    </h5>
                                    <span className="text-xs font-semibold text-gray-600 uppercase">
                                      {assessment.type}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 text-sm mb-2">{assessment.description}</p>
                                  {assessment.rubric && (
                                    <div className="mt-2 text-xs text-gray-600 bg-white rounded p-2 border border-gray-200">
                                      <strong>Rubric:</strong> {assessment.rubric}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Regions Section (for frameworks with regional structure) */}
      {framework.regions && framework.regions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">
            🗺️ Regional Structure
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {framework.regions.map((region) => (
              <div
                key={region.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200"
              >
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6">
                  <h3 className="text-2xl font-bold mb-2 text-white">{region.name}</h3>
                  <p className="text-sm opacity-90">{region.theme}</p>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <h4 className="font-bold text-gray-900 mb-2">Counties:</h4>
                    <div className="flex flex-wrap gap-2">
                      {region.counties.map((county, idx) => (
                        <span
                          key={idx}
                          className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full"
                        >
                          {county}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-bold text-gray-900 mb-2">Guardians:</h4>
                    <div className="space-y-2">
                      {region.guardians.slice(0, 4).map((guardian, idx) => (
                        <div key={idx} className="text-sm text-gray-700 bg-gray-50 rounded p-2">
                          {guardian}
                        </div>
                      ))}
                      {region.guardians.length > 4 && (
                        <div className="text-sm text-gray-500 italic">
                          +{region.guardians.length - 4} more...
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r">
                    <p className="text-sm font-semibold text-gray-700">
                      <strong>Regional Conflict:</strong> {region.conflict}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Digital Tools Section */}
      {framework.digitalTools && framework.digitalTools.length > 0 && (
        <div className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            💻 Digital Tools & Resources
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {framework.digitalTools.map((tool, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg p-4 shadow-sm text-center font-semibold text-gray-700 hover:shadow-md transition-shadow"
              >
                {tool}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* County Guardians Quick Reference - ENHANCED */}
      <div className="mb-8 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          🛡️ County Guardians Reference
        </h2>
        <p className="text-gray-700 mb-6">
          Use these guardian characters throughout your framework activities to make learning engaging and memorable!
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {guardians.slice(0, 18).map((guardian) => (
            <div
              key={guardian.id}
              className="group bg-white rounded-xl p-3 shadow-md hover:shadow-2xl transition-all transform hover:-translate-y-2 duration-300 relative overflow-visible"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-2 mb-2 flex items-center justify-center h-24 relative">
                  <SafeImage
                    src={guardian.image_url || GUARDIAN_PLACEHOLDER}
                    alt={guardian.display_name}
                    fill
                    className="object-contain drop-shadow-xl transform group-hover:scale-110 transition-transform duration-300"
                    fallbackSrc={GUARDIAN_PLACEHOLDER}
                  />
                </div>
                <div className="text-center">
                  <div className="font-bold text-sm text-gray-900 mb-1">{guardian.display_name}</div>
                  <div className="text-xs text-gray-600">{guardian.county}</div>
                  {guardian.element && (
                    <div className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded-full mt-2 font-semibold">
                      {guardian.element}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {guardians.length > 18 && (
            <Link
              href="/guardians"
              className="bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-xl p-3 shadow-md hover:shadow-2xl transition-all transform hover:-translate-y-2 duration-300 flex flex-col items-center justify-center font-bold text-center group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">✨</div>
              <div className="text-xs">View All</div>
              <div className="text-lg">{guardians.length}</div>
              <div className="text-xs">Guardians</div>
            </Link>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 text-center">
        <h3 className="text-2xl font-bold mb-4 text-gray-900">Ready to Begin Your Journey?</h3>
        <p className="text-gray-700 max-w-2xl mx-auto mb-6">
          You've selected {framework.name}. Start working through the modules above,
          or explore the full collection of Utah destinations and guardians.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/guardians"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Meet All Guardians
          </Link>
          <Link
            href="/destinations"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Explore Destinations
          </Link>
          <Link
            href={`/tripkits/${tripkit.slug}`}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Back to TripKit Info
          </Link>
        </div>
      </div>
    </div>
  );
}
