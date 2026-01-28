import React from 'react';
import { TripKit } from '@/types/database.types';

interface InstructionalDesignProps {
    tripkit: TripKit;
}

export default function InstructionalDesign({ tripkit }: InstructionalDesignProps) {
    const { learning_objectives, curriculum_alignment, difficulty_level, estimated_time } = tripkit;

    if (!learning_objectives || learning_objectives.length === 0) return null;

    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-12">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🎓</span> Instructional Design
                </h2>
                {difficulty_level && (
                    <span className="bg-white/10 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm border border-white/20">
                        Level: {difficulty_level}
                    </span>
                )}
            </div>

            <div className="p-6 md:p-8">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Learning Objectives */}
                    <div className="md:col-span-2">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Learning Objectives
                        </h3>
                        <ul className="space-y-3">
                            {learning_objectives.map((objective, idx) => (
                                <li key={idx} className="flex items-start gap-3 group">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold mt-0.5 group-hover:bg-blue-100 transition-colors">
                                        {idx + 1}
                                    </span>
                                    <span className="text-gray-700 leading-relaxed">{objective}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Metadata & Curriculum */}
                    <div className="space-y-6">
                        {estimated_time && (
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                    Estimated Time
                                </div>
                                <div className="font-bold text-gray-900 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {estimated_time}
                                </div>
                            </div>
                        )}

                        {curriculum_alignment && (
                            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                                <div className="text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-2">
                                    Curriculum Alignment
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subject:</span>
                                        <span className="font-medium text-gray-900">{curriculum_alignment.subject}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Grade:</span>
                                        <span className="font-medium text-gray-900">{curriculum_alignment.grade_level}</span>
                                    </div>
                                    <div className="pt-2 mt-2 border-t border-indigo-100">
                                        <div className="text-xs text-gray-500 mb-1">Standard:</div>
                                        <div className="text-sm font-medium text-indigo-900 leading-snug">
                                            {curriculum_alignment.standard}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
