'use client';

import React, { useEffect, useState } from 'react';
import { Win95Window, Win95Panel, Win95Button } from './Win95Window';
import type { BuildingHealth } from '@/lib/pixi/entities/BaseBuilding';

interface BuildingInspectorProps {
    isOpen: boolean;
    onClose: () => void;
    buildingId: string | null;
    buildingName: string | null;
    currentHealth: BuildingHealth | null;
    appUrl?: string | null;
    onTalkToAgent?: () => void;
    agentName?: string;
    onEnterBuilding?: () => void;
}

export default function BuildingInspector({ isOpen, onClose, buildingId, buildingName, currentHealth, appUrl, onTalkToAgent, agentName, onEnterBuilding }: BuildingInspectorProps) {
    if (!isOpen) return null;

    return (
        <Win95Window
            title={buildingName || 'Building Inspector'}
            onClose={onClose}
            className="fixed top-20 left-20 z-50 w-80"
        >
            <div className="flex flex-col gap-4 p-2">
                <div className="flex gap-4 items-start">
                    {/* Icon placeholder */}
                    <Win95Panel className="w-16 h-16 flex items-center justify-center bg-gray-200">
                        <span className="text-2xl">🏛️</span>
                    </Win95Panel>

                    <div className="flex-1 space-y-2">
                        <div className="text-sm font-bold">{buildingName}</div>
                        <div className="text-[10px] text-gray-600">ID: {buildingId}</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-gray-600">
                    <div className="bg-[#c0c0c0] border-t border-l border-r border-white border-b-0 px-2 py-1 -mb-[1px] z-10 pb-2">Stats</div>
                    <div className="bg-gray-400 border border-gray-600 px-2 py-1 text-gray-700">Staff</div>
                    <div className="bg-gray-400 border border-gray-600 px-2 py-1 text-gray-700">AI Logs</div>
                </div>

                <Win95Panel className="bg-[#c0c0c0] h-48 space-y-4">
                    {/* Voltage Meter */}
                    <div>
                        <div className="flex justify-between mb-1">
                            <span>System Voltage</span>
                            <span>{currentHealth?.voltage.toFixed(0)}%</span>
                        </div>
                        <div className="h-4 bg-black border-b border-r border-white border-t border-l border-gray-600 relative">
                            <div
                                className={`h-full ${(currentHealth?.voltage || 0) > 70 ? 'bg-green-500' :
                                        (currentHealth?.voltage || 0) > 40 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                style={{ width: `${currentHealth?.voltage || 0}%` }}
                            />
                            {/* Grid lines overlay */}
                            <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzjwqgAAkABAeXl5/2H8X38AKWYcCCtE7+kAAAAASUVORK5CYII=')] opacity-20 pointer-events-none"></div>
                        </div>
                    </div>

                    {/* Revenue Status */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="border border-gray-600 p-1">
                            <div className="text-gray-600">Daily Revenue</div>
                            <div className="font-bold text-green-700 font-mono text-right">
                                ${currentHealth?.revenue.toLocaleString()}
                            </div>
                        </div>
                        <div className="border border-gray-600 p-1">
                            <div className="text-gray-600">Active Users</div>
                            <div className="font-bold text-blue-700 font-mono text-right">
                                {currentHealth?.activeUsers.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Status Message */}
                    <div className="bg-white border inset p-1 h-12 overflow-y-auto text-[10px]">
                        {currentHealth?.statusCode === 'healthy' && <span className="text-green-600">✓ Systems operational. No alerts.</span>}
                        {currentHealth?.statusCode === 'warning' && <span className="text-yellow-600">⚠ Latency detected in sector 7G.</span>}
                        {currentHealth?.statusCode === 'critical' && <span className="text-red-600">⚡ CRITICAL FAILURE. REROUTING POWER.</span>}
                        {currentHealth?.statusCode === 'offline' && <span className="text-gray-500">System Offline. Check connection.</span>}
                    </div>
                </Win95Panel>

                <div className="flex justify-end gap-2 flex-wrap">
                    {onEnterBuilding && (
                        <Win95Button onClick={onEnterBuilding}>
                            🚪 Enter Building
                        </Win95Button>
                    )}
                    {onTalkToAgent && (
                        <Win95Button onClick={onTalkToAgent}>
                            💬 Talk to {agentName || 'Agent'}
                        </Win95Button>
                    )}
                    <Win95Button onClick={() => console.log('Ping')}>Ping</Win95Button>
                    {appUrl && (
                        <Win95Button
                            onClick={() => window.open(appUrl, '_blank', 'noopener,noreferrer')}
                        >
                            Open App
                        </Win95Button>
                    )}
                    <Win95Button onClick={onClose}>Close</Win95Button>
                </div>
            </div>
        </Win95Window>
    );
}
