'use client';

import { useState } from 'react';
import { Control, DistrictControl } from '@/lib/daros/pce';
import { updateDistrictControlAction } from '@/app/actions/daros';
import { Button } from '@/components/shared/Button';

// Combined type for UI
type ControlItem = Control & {
    districtControl: DistrictControl | null;
};

interface ControlsChecklistProps {
    districtId: string;
    controls: ControlItem[];
}

const DOMAINS: { id: string; label: string }[] = [
    { id: 'all', label: 'All Controls' },
    { id: 'policy', label: 'Policy' },
    { id: 'training', label: 'Training' },
    { id: 'vendor_management', label: 'Vendor Mgmt' },
    { id: 'data_protection', label: 'Data Protection' },
];

export function ControlsChecklist({ districtId, controls }: ControlsChecklistProps) {
    const [activeFilter, setActiveFilter] = useState('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Filter logic
    const filteredControls = activeFilter === 'all'
        ? controls
        : controls.filter(c => c.domain === activeFilter);

    // Stats calculation
    const total = controls.length;
    const completed = controls.filter(c => c.districtControl?.status === 'complete').length;
    const progress = Math.round((completed / total) * 100) || 0;

    async function toggleStatus(controlId: string, currentStatus: string) {
        const newStatus = currentStatus === 'complete' ? 'not_started' : 'complete';
        try {
            await updateDistrictControlAction(districtId, controlId, { status: newStatus });
        } catch (err) {
            console.error(err);
            alert('Failed to update status');
        }
    }

    return (
        <div className="space-y-6">
            {/* Header & Stats */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Privacy by Design Controls</h2>
                    <span className="text-sm font-medium text-blue-600">{progress}% Readiness</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {DOMAINS.map(domain => (
                    <button
                        key={domain.id}
                        onClick={() => setActiveFilter(domain.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === domain.id
                            ? 'bg-gray-900 text-white'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {domain.label}
                    </button>
                ))}
            </div>

            {/* Checklist */}
            <div className="bg-white rounded-lg shadow border border-gray-200 divide-y divide-gray-200">
                {filteredControls.map(control => {
                    const isComplete = control.districtControl?.status === 'complete';
                    const isExpanded = expandedId === control.id;

                    return (
                        <div key={control.id} className="transition-all">
                            <div className="p-4 flex items-start gap-4 hover:bg-gray-50">
                                <div className="pt-1">
                                    <input
                                        type="checkbox"
                                        aria-label={`Toggle status for ${control.title}`}
                                        checked={isComplete}
                                        onChange={() => toggleStatus(control.id, control.districtControl?.status || 'not_started')}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    />
                                </div>
                                <div className="flex-1 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : control.id)}>
                                    <div className="flex justify-between items-start">
                                        <h3 className={`text-base font-medium ${isComplete ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                            {control.title}
                                        </h3>
                                        <div className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${control.priority === 'critical' ? 'bg-red-100 text-red-700' :
                                            control.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                                'bg-gray-100 text-gray-600'
                                            }`}>
                                            {control.priority}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{control.description}</p>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="px-12 pb-4 pt-0 bg-gray-50 border-t border-gray-100">
                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase">Evidence URL</label>
                                            <input
                                                type="text"
                                                placeholder="https://..."
                                                className="w-full mt-1 text-sm p-2 border rounded"
                                                defaultValue={control.districtControl?.evidenceUrl || ''}
                                                onBlur={(e) => updateDistrictControlAction(districtId, control.id, { evidenceUrl: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase">Owner</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. IT Director"
                                                className="w-full mt-1 text-sm p-2 border rounded"
                                                defaultValue={control.districtControl?.ownerRole || ''}
                                                onBlur={(e) => updateDistrictControlAction(districtId, control.id, { ownerRole: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {filteredControls.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No controls found for this filter.
                    </div>
                )}
            </div>
        </div>
    );
}
