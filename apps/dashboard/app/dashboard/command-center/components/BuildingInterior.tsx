'use client';

import React, { useState, useEffect } from 'react';
import { Win95Window, Win95Panel, Win95Button } from './Win95Window';

interface Department {
  id: string;
  name: string;
  description: string;
  agents: Agent[];
}

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'phase2' | 'future' | 'inactive';
  avatar?: string;
}

interface BuildingInteriorProps {
  isOpen: boolean;
  onClose: () => void;
  buildingId: string | null;
  buildingName: string | null;
  onSelectAgent: (agentId: string, agentName: string, agentRole: string) => void;
  onBack: () => void;
}

// Mock data - in production this would come from the API
const BUILDING_DEPARTMENTS: Record<string, Department[]> = {
  'wasatchwise-capitol': [
    {
      id: 'd001-0001-0001-0001-000000000001',
      name: 'Executive Office',
      description: 'Strategic leadership and cross-venture coordination',
      agents: [
        { id: 'A001', name: 'The Mayor', role: 'CEO & Founder', status: 'active' },
      ],
    },
    {
      id: 'd001-0001-0001-0001-000000000002',
      name: 'Treasury',
      description: 'Financial oversight and cash management',
      agents: [
        { id: 'A002', name: 'CFO', role: 'Chief Financial Officer', status: 'active' },
      ],
    },
  ],
  'slctrips': [
    {
      id: 'd002-0001-0001-0001-000000000001',
      name: 'Content Operations',
      description: 'Content strategy and production',
      agents: [
        { id: 'A003', name: 'Park Director', role: 'Content Strategy Lead', status: 'active' },
      ],
    },
    {
      id: 'd002-0001-0001-0001-000000000002',
      name: 'Guest Relations',
      description: 'Social media and community',
      agents: [],
    },
  ],
  'rock-salt': [
    {
      id: 'd003-0001-0001-0001-000000000001',
      name: 'Artist Relations',
      description: 'Artist database and bookings',
      agents: [
        { id: 'A004', name: 'Concert Manager', role: 'Music Platform Lead', status: 'active' },
      ],
    },
    {
      id: 'd003-0001-0001-0001-000000000002',
      name: 'Programming',
      description: 'Radio shows and playlists',
      agents: [],
    },
  ],
  'adult-ai-academy': [
    {
      id: 'd004-0001-0001-0001-000000000001',
      name: 'Curriculum',
      description: 'Course development and content',
      agents: [
        { id: 'A005', name: 'The Dean', role: 'Training Program Lead', status: 'phase2' },
      ],
    },
    {
      id: 'd004-0001-0001-0001-000000000002',
      name: 'Student Services',
      description: 'Enrollment and support',
      agents: [],
    },
  ],
  'ask-before-you-app': [
    {
      id: 'd006-0001-0001-0001-000000000001',
      name: 'Compliance',
      description: 'Privacy frameworks and audits',
      agents: [
        { id: 'A007', name: 'Superintendent', role: 'Compliance & Privacy Lead', status: 'phase2' },
      ],
    },
    {
      id: 'd006-0001-0001-0001-000000000002',
      name: 'Training',
      description: 'District workshops and materials',
      agents: [],
    },
  ],
  'wasatchwise-bank': [
    {
      id: 'd007-0001-0001-0001-000000000001',
      name: 'Treasury Operations',
      description: 'Daily cash management',
      agents: [
        { id: 'A008', name: 'Bank Manager', role: 'Daily Treasury Operations', status: 'phase2' },
      ],
    },
  ],
  'daite': [
    {
      id: 'd005-0001-0001-0001-000000000001',
      name: 'Community',
      description: 'User growth and engagement',
      agents: [
        { id: 'A006', name: 'Park Ranger', role: 'Community & Connections Lead', status: 'phase2' },
      ],
    },
  ],
};

const BUILDING_ICONS: Record<string, string> = {
  'wasatchwise-capitol': '🏛️',
  'wasatchwise-bank': '🏦',
  'adult-ai-academy': '🎓',
  'ask-before-you-app': '📚',
  'rock-salt': '🎸',
  'slctrips': '🎢',
  'daite': '🌳',
};

export default function BuildingInterior({
  isOpen,
  onClose,
  buildingId,
  buildingName,
  onSelectAgent,
  onBack,
}: BuildingInteriorProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedDepartment(null);
    }
  }, [isOpen]);

  if (!isOpen || !buildingId) return null;

  const departments = BUILDING_DEPARTMENTS[buildingId] || [];
  const buildingIcon = BUILDING_ICONS[buildingId] || '🏢';

  return (
    <Win95Window
      title={`${buildingName || 'Building'} - Interior View`}
      onClose={onClose}
      className="fixed top-16 left-16 z-50 w-[500px]"
    >
      <div className="flex flex-col gap-3 p-2">
        {/* Building Header */}
        <div className="flex gap-3 items-center border-b border-gray-400 pb-2">
          <Win95Panel className="w-12 h-12 flex items-center justify-center bg-gray-200">
            <span className="text-2xl">{buildingIcon}</span>
          </Win95Panel>
          <div className="flex-1">
            <div className="font-bold text-sm">{buildingName}</div>
            <div className="text-[10px] text-gray-600">
              {departments.length} department{departments.length !== 1 ? 's' : ''}
            </div>
          </div>
          <Win95Button onClick={onBack}>← Back</Win95Button>
        </div>

        {/* Floor Plan View */}
        <div className="text-[10px] text-gray-500 mb-1">FLOOR PLAN</div>
        <div className="grid grid-cols-2 gap-2">
          {departments.map((dept) => (
            <Win95Panel
              key={dept.id}
              className={`cursor-pointer hover:bg-blue-50 transition-colors ${
                selectedDepartment?.id === dept.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <button
                onClick={() => setSelectedDepartment(dept)}
                className="w-full text-left p-2"
              >
                <div className="font-bold text-xs">{dept.name}</div>
                <div className="text-[9px] text-gray-600 mt-1">{dept.description}</div>
                <div className="flex gap-1 mt-2">
                  {dept.agents.length > 0 ? (
                    dept.agents.map((agent) => (
                      <span
                        key={agent.id}
                        className={`text-[8px] px-1 py-0.5 rounded ${
                          agent.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : agent.status === 'phase2'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {agent.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-[8px] text-gray-400">No agents assigned</span>
                  )}
                </div>
              </button>
            </Win95Panel>
          ))}
        </div>

        {/* Selected Department Details */}
        {selectedDepartment && (
          <Win95Panel className="bg-[#c0c0c0]">
            <div className="font-bold text-sm mb-2">{selectedDepartment.name}</div>
            <div className="text-[10px] text-gray-600 mb-3">{selectedDepartment.description}</div>

            <div className="text-[10px] text-gray-500 mb-2">STAFF</div>
            <div className="space-y-2">
              {selectedDepartment.agents.length > 0 ? (
                selectedDepartment.agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center gap-2 bg-white border border-gray-300 p-2"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-sm">
                      {agent.status === 'active' ? '👤' : '👻'}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-xs">{agent.name}</div>
                      <div className="text-[9px] text-gray-600">{agent.role}</div>
                    </div>
                    <div className="flex gap-1">
                      <span
                        className={`text-[8px] px-1 py-0.5 rounded ${
                          agent.status === 'active'
                            ? 'bg-green-500 text-white'
                            : agent.status === 'phase2'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-gray-400 text-white'
                        }`}
                      >
                        {agent.status === 'active' ? 'Online' : agent.status === 'phase2' ? 'Coming Soon' : 'Future'}
                      </span>
                    </div>
                    {agent.status === 'active' && (
                      <Win95Button
                        onClick={() => onSelectAgent(agent.id, agent.name, agent.role)}
                        className="text-[10px]"
                      >
                        Chat
                      </Win95Button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-[10px] text-gray-500 italic">
                  No staff assigned to this department yet.
                </div>
              )}
            </div>
          </Win95Panel>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-400">
          <Win95Button onClick={onClose}>Close</Win95Button>
        </div>
      </div>
    </Win95Window>
  );
}
