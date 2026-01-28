'use client';
import { useEffect, useState } from 'react';
import Scene from './Scene';
import BuildingInspector from './components/BuildingInspector';
import type { BuildingHealth } from '@/lib/pixi/entities/BaseBuilding';

const BUILDING_LABELS: Record<string, string> = {
    'wasatchwise-capitol': 'WasatchWise Capitol',
    'wasatchwise-bank': 'The Treasury (Bank)',
    'adult-ai-academy': 'Adult AI Academy',
    'ask-before-you-app': 'Ask Before You App (School)',
    'gmc-mag': 'GMC Mag (Industrial)',
    'munchyslots': 'Munchyslots (Casino)',
    'pipeline-iq': 'Pipeline IQ (Telecom)',
    'rock-salt': 'Rock Salt (Venue)',
    'slctrips': 'SLCTrips (Amusement)',
    'the-rings': 'The Rings (Rec Center)',
    'dublin-drive-live': 'Dublin Drive Live (TV Station)',
    'daite': 'Daite (Park)',
};

// NOTE: Next.js only inlines NEXT_PUBLIC env vars when accessed statically.
const BUILDING_APP_URLS: Record<string, string | undefined> = {
    'wasatchwise-capitol': process.env.NEXT_PUBLIC_VERTICAL_APP_URL_WASATCHWISE_CAPITOL,
    'wasatchwise-bank': process.env.NEXT_PUBLIC_VERTICAL_APP_URL_WASATCHWISE_BANK,
    'adult-ai-academy': process.env.NEXT_PUBLIC_VERTICAL_APP_URL_ADULT_AI_ACADEMY,
    'ask-before-you-app': process.env.NEXT_PUBLIC_VERTICAL_APP_URL_ASK_BEFORE_YOU_APP,
    'gmc-mag': process.env.NEXT_PUBLIC_VERTICAL_APP_URL_GMC_MAG,
    'munchyslots': process.env.NEXT_PUBLIC_VERTICAL_APP_URL_MUNCHYSLOTS,
    'pipeline-iq': process.env.NEXT_PUBLIC_VERTICAL_APP_URL_PIPELINE_IQ,
    'rock-salt': process.env.NEXT_PUBLIC_VERTICAL_APP_URL_ROCK_SALT,
    'slctrips': process.env.NEXT_PUBLIC_VERTICAL_APP_URL_SLCTRIPS,
    'the-rings': process.env.NEXT_PUBLIC_VERTICAL_APP_URL_THE_RINGS,
    'dublin-drive-live': process.env.NEXT_PUBLIC_VERTICAL_APP_URL_DUBLIN_DRIVE_LIVE,
    'daite': process.env.NEXT_PUBLIC_VERTICAL_APP_URL_DAITE,
};

export default function CommandCenterPage() {
    const [inspectorState, setInspectorState] = useState<{
        isOpen: boolean;
        buildingId: string | null;
        buildingName: string | null;
        health: BuildingHealth | null;
        appUrl: string | null;
    }>({
        isOpen: false,
        buildingId: null,
        buildingName: null,
        health: null,
        appUrl: null,
    });

    useEffect(() => {
        const handleOpenInspector = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            const buildingId = detail.buildingId as string | undefined;
            const appUrl = buildingId ? BUILDING_APP_URLS[buildingId] : undefined;
            setInspectorState({
                isOpen: true,
                buildingId: buildingId ?? null,
                buildingName: (buildingId && BUILDING_LABELS[buildingId]) ? BUILDING_LABELS[buildingId] : (detail.type || null),
                health: detail.health,
                appUrl: appUrl ?? null,
            });
        };

        window.addEventListener('openBuildingInspector', handleOpenInspector);
        return () => window.removeEventListener('openBuildingInspector', handleOpenInspector);
    }, []);

    return (
        <main className="w-screen h-screen overflow-hidden bg-gray-900 flex flex-col relative">
            {/* Header / Menu Bar */}
            <div className="h-8 bg-[#c0c0c0] border-b-2 border-white border-r-white border-t-gray-600 border-l-gray-600 flex items-center px-2 select-none z-10">
                <div className="font-bold mr-4 font-mono text-sm">WasatchWise</div>
                <div className="flex gap-4 text-xs font-mono">
                    <button className="hover:bg-[#000080] hover:text-white px-2">File</button>
                    <button className="hover:bg-[#000080] hover:text-white px-2">View</button>
                    <button className="hover:bg-[#000080] hover:text-white px-2">Windows</button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative">
                <Scene />

                {/* Modal Overlay Layer */}
                {inspectorState.isOpen && (
                    <BuildingInspector
                        isOpen={inspectorState.isOpen}
                        onClose={() => setInspectorState(prev => ({ ...prev, isOpen: false }))}
                        buildingId={inspectorState.buildingId}
                        buildingName={inspectorState.buildingName}
                        currentHealth={inspectorState.health}
                        appUrl={inspectorState.appUrl}
                    />
                )}
            </div>

            {/* Status Bar */}
            <div className="h-6 bg-[#c0c0c0] border-t-2 border-gray-600 flex items-center px-2 text-xs font-mono z-10">
                <span className="flex-1">Ready.</span>
                <div className="w-32 border-l border-gray-600 px-2">RAM: 64MB</div>
            </div>
        </main>
    );
}
