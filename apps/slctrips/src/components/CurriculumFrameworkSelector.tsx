'use client';

import { useState } from 'react';
import { CURRICULUM_FRAMEWORKS, CurriculumFramework } from '@/types/curriculum.types';

interface CurriculumFrameworkSelectorProps {
  onSelectFramework: (framework: CurriculumFramework | null) => void;
  selectedFramework: CurriculumFramework | null;
}

export default function CurriculumFrameworkSelector({
  onSelectFramework,
  selectedFramework
}: CurriculumFrameworkSelectorProps) {
  const [showDetails, setShowDetails] = useState<string | null>(null);

  if (selectedFramework) {
    return (
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-300">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{selectedFramework.icon}</div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {selectedFramework.name}
              </h3>
              <p className="text-gray-600 font-medium">{selectedFramework.subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => onSelectFramework(null)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
          >
            Change Framework
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm font-semibold text-gray-500 mb-1">Teaching Style</div>
            <div className="text-gray-900 font-medium">{selectedFramework.teachingStyle}</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm font-semibold text-gray-500 mb-1">Duration</div>
            <div className="text-gray-900 font-medium">{selectedFramework.duration}</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm font-semibold text-gray-500 mb-1">Assessment</div>
            <div className="text-gray-900 font-medium">{selectedFramework.assessmentType}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-3">
          Choose Your Learning Path
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Select a curriculum framework that best fits your classroom goals. Each path uses
          the 29 County Guardians to teach Utah studies in unique, engaging ways.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CURRICULUM_FRAMEWORKS.map((framework) => {
          const isExpanded = showDetails === framework.id;

          return (
            <div
              key={framework.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border-2 border-gray-200 hover:border-blue-400"
            >
              {/* Card Header */}
              <div className={`bg-gradient-to-br ${framework.gradientFrom} ${framework.gradientTo} p-6 text-white`}>
                <div className="text-5xl mb-3 text-center">{framework.icon}</div>
                <h3 className="text-2xl font-bold text-center mb-2 text-white">
                  {framework.name}
                </h3>
                <p className="text-sm text-center opacity-90">
                  {framework.subtitle}
                </p>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <p className="text-gray-700 mb-6 leading-relaxed text-base">
                  {framework.description}
                </p>

                <div className="space-y-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-600">
                    <span className="text-blue-900 font-bold text-sm block mb-1">Style:</span>
                    <span className="text-gray-900 text-base leading-relaxed">{framework.teachingStyle}</span>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-600">
                    <span className="text-green-900 font-bold text-sm block mb-1">Duration:</span>
                    <span className="text-gray-900 text-base">{framework.duration}</span>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 border-l-4 border-purple-600">
                    <span className="text-purple-900 font-bold text-sm block mb-1">Assessment:</span>
                    <span className="text-gray-900 text-base leading-relaxed">{framework.assessmentType}</span>
                  </div>
                </div>

                {/* Expandable Details */}
                {isExpanded && (
                  <div className="mt-4 space-y-4 border-t pt-4">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Key Objectives:</h4>
                      <ul className="space-y-1">
                        {framework.objectives.slice(0, 3).map((obj, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-blue-500">•</span>
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Standards Aligned:</h4>
                      <div className="text-xs text-gray-600 space-y-1">
                        {framework.standards.slice(0, 2).map((std, idx) => (
                          <div key={idx} className="bg-gray-50 rounded p-2">
                            {std.length > 80 ? std.substring(0, 80) + '...' : std}
                          </div>
                        ))}
                      </div>
                    </div>

                    {framework.digitalTools && (
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">Digital Tools:</h4>
                        <div className="flex flex-wrap gap-2">
                          {framework.digitalTools.slice(0, 4).map((tool, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => onSelectFramework(framework)}
                    className={`flex-1 bg-gradient-to-r ${framework.gradientFrom} ${framework.gradientTo} text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-all`}
                  >
                    Select This Path
                  </button>
                  <button
                    onClick={() => setShowDetails(isExpanded ? null : framework.id)}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors"
                  >
                    {isExpanded ? '▲' : '▼'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Teacher Notes Section */}
      <div className="mt-12 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 border-2 border-amber-200">
        <div className="flex items-start gap-4">
          <div className="text-4xl">👩‍🏫</div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">For Teachers</h3>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>All frameworks are aligned to Utah 4th Grade Core Standards</strong> and
                grounded in 300+ verified sources about Utah counties.
              </p>
              <p>
                Each framework offers a different pedagogical approach - from hands-on cultural
                activities to data-driven analysis to digital storytelling. Choose based on:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Your teaching style and classroom resources</li>
                <li>Your students' learning preferences</li>
                <li>The time you have available (6-12 weeks)</li>
                <li>Your comfort with technology integration</li>
              </ul>
              <p className="mt-3 font-semibold text-amber-900">
                💡 Tip: You can preview each framework by expanding the details before selecting!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
