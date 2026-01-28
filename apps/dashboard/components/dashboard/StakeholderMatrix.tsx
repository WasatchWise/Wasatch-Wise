'use client';

import { useState } from 'react';
import { Stakeholder, OutcomeLevel } from '@/lib/daros/soe';
import { updateStakeholderMatrixAction } from '@/app/actions/daros';
import { Button } from '@/components/shared/Button';

interface MatrixEntry {
    stakeholder: Stakeholder;
    outcomeLevel: OutcomeLevel;
    uptakeScore: number | null;
    resistanceScore: number | null;
    notes: string | null;
}

interface StakeholderMatrixProps {
    districtId: string;
    initialData: MatrixEntry[];
}

const STAKEHOLDERS: { id: Stakeholder; label: string; description: string }[] = [
    { id: 'admin', label: 'Administration', description: 'Superintendent, Assistant Sups' },
    { id: 'board', label: 'School Board', description: 'Elected officials' },
    { id: 'teachers', label: 'Teachers', description: 'Instructional staff' },
    { id: 'parents', label: 'Parents', description: 'Community & Guardians' },
    { id: 'students', label: 'Students', description: 'Learners' },
];

export function StakeholderMatrix({ districtId, initialData }: StakeholderMatrixProps) {
    const [editingId, setEditingId] = useState<Stakeholder | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Local state for the form being edited
    const [formData, setFormData] = useState<{
        uptake: number;
        resistance: number;
        notes: string;
    }>({ uptake: 50, resistance: 50, notes: '' });

    const getEntry = (id: Stakeholder) => initialData.find(d => d.stakeholder === id);

    const calculateOutcome = (uptake: number, resistance: number): OutcomeLevel => {
        // Bob's Framework Logic
        // High Uptake (>80) + Low Resistance (<20) = Home Run
        // High Uptake (>70) + Med Resistance (<40) = Triple
        // Med Uptake (>50) + Med Resistance (<50) = Double
        // Low Uptake (>30) + High Resistance (<70) = Single
        // Else = Miss

        if (uptake >= 80 && resistance <= 20) return 'home_run';
        if (uptake >= 70 && resistance <= 40) return 'triple';
        if (uptake >= 50 && resistance <= 50) return 'double';
        if (uptake >= 30 && resistance <= 70) return 'single';
        return 'miss';
    };

    const startEdit = (id: Stakeholder) => {
        const entry = getEntry(id);
        setFormData({
            uptake: entry?.uptakeScore ?? 50,
            resistance: entry?.resistanceScore ?? 50,
            notes: entry?.notes ?? '',
        });
        setEditingId(id);
    };

    const saveEdit = async () => {
        if (!editingId) return;
        setIsSaving(true);

        // Auto-calculate outcome based on new scores
        const outcome = calculateOutcome(formData.uptake, formData.resistance);

        try {
            await updateStakeholderMatrixAction(districtId, editingId, {
                outcomeLevel: outcome,
                uptakeScore: formData.uptake,
                resistanceScore: formData.resistance,
                notes: formData.notes
            });
            setEditingId(null);
        } catch (err) {
            console.error(err);
            alert('Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    const getStatusColor = (outcome: OutcomeLevel) => {
        switch (outcome) {
            case 'home_run': return 'bg-green-100 text-green-800 border-green-200';
            case 'triple': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'double': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'single': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'miss': return 'bg-red-100 text-red-800 border-red-200';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Stakeholder Outcomes Matrix</h3>
                <div className="text-xs text-gray-500">Bob's Framework v1.0</div>
            </div>

            <div className="divide-y divide-gray-200">
                {STAKEHOLDERS.map((stakeholder) => {
                    const entry = getEntry(stakeholder.id);
                    const isEditing = editingId === stakeholder.id;
                    const outcome = isEditing
                        ? calculateOutcome(formData.uptake, formData.resistance)
                        : (entry?.outcomeLevel || 'miss');

                    return (
                        <div key={stakeholder.id} className={`p-6 transition-colors ${isEditing ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-base font-semibold text-gray-900">{stakeholder.label}</h4>
                                    <p className="text-sm text-gray-500">{stakeholder.description}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(outcome)}`}>
                                    {outcome.replace('_', ' ')}
                                </div>
                            </div>

                            {isEditing ? (
                                <div className="space-y-4 animate-in fade-in duration-200">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Uptake Score: {formData.uptake}
                                            </label>
                                            <input
                                                type="range"
                                                min="0" max="100"
                                                aria-label={`Uptake score for ${stakeholder.label}`}
                                                value={formData.uptake}
                                                onChange={(e) => setFormData({ ...formData, uptake: parseInt(e.target.value) })}
                                                className="w-full accent-blue-600"
                                            />
                                            <div className="flex justify-between text-xs text-gray-400">
                                                <span>Reluctant</span>
                                                <span>Enthusiastic</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Resistance Score: {formData.resistance}
                                            </label>
                                            <input
                                                type="range"
                                                min="0" max="100"
                                                aria-label={`Resistance score for ${stakeholder.label}`}
                                                value={formData.resistance}
                                                onChange={(e) => setFormData({ ...formData, resistance: parseInt(e.target.value) })}
                                                className="w-full accent-red-600"
                                            />
                                            <div className="flex justify-between text-xs text-gray-400">
                                                <span>Low Friction</span>
                                                <span>High Friction</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                                        <textarea
                                            className="w-full text-sm p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                            rows={2}
                                            placeholder="Why this score?"
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                                        <Button variant="primary" size="sm" onClick={saveEdit} disabled={isSaving}>
                                            {isSaving ? 'Saving...' : 'Save Assessment'}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="group cursor-pointer" onClick={() => startEdit(stakeholder.id)}>
                                    <div className="flex gap-8 text-sm text-gray-600 mb-2">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-400 uppercase">Uptake</span>
                                            <span className="font-medium text-gray-900">{entry?.uptakeScore ?? '-'}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-400 uppercase">Resistance</span>
                                            <span className="font-medium text-gray-900">{entry?.resistanceScore ?? '-'}</span>
                                        </div>
                                    </div>
                                    {entry?.notes && (
                                        <p className="text-sm text-gray-500 italic">"{entry.notes}"</p>
                                    )}
                                    {!entry?.notes && (
                                        <p className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">Click to assess...</p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
