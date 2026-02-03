'use client';
import { useEffect, useState } from 'react';
import Scene from './Scene';
import BuildingInspector from './components/BuildingInspector';
import AgentChat from './components/AgentChat';
import BuildingInterior from './components/BuildingInterior';
import CouncilRoom, { COUNCIL_LIST } from './components/CouncilRoom';
import AffiliateRevenueCard from './components/AffiliateRevenueCard';
import type { BuildingHealth } from '@/lib/pixi/entities/BaseBuilding';

// Map building IDs to their primary agent IDs
const BUILDING_AGENTS: Record<string, { id: string; name: string; role: string; avatar: string }> = {
    'wasatchwise-capitol': { id: 'A001', name: 'The Mayor', role: 'CEO & Founder', avatar: '🏛️' },
    'wasatchwise-bank': { id: 'A008', name: 'Bank Manager', role: 'Treasury Operations', avatar: '🏦' },
    'adult-ai-academy': { id: 'A005', name: 'The Dean', role: 'Training Lead', avatar: '🎓' },
    'ask-before-you-app': { id: 'A007', name: 'Superintendent', role: 'Compliance Lead', avatar: '📚' },
    'rock-salt': { id: 'A004', name: 'Concert Manager', role: 'Music Platform Lead', avatar: '🎸' },
    'slctrips': { id: 'A003', name: 'Park Director', role: 'Content Strategy Lead', avatar: '🎢' },
    'daite': { id: 'A006', name: 'Park Ranger', role: 'Community Lead', avatar: '🌳' },
};

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

    const [agentChatState, setAgentChatState] = useState<{
        isOpen: boolean;
        agentId: string | null;
        agentName: string | null;
        agentRole: string | null;
        agentAvatar: string | null;
    }>({
        isOpen: false,
        agentId: null,
        agentName: null,
        agentRole: null,
        agentAvatar: null,
    });

    const [interiorState, setInteriorState] = useState<{
        isOpen: boolean;
        buildingId: string | null;
        buildingName: string | null;
    }>({
        isOpen: false,
        buildingId: null,
        buildingName: null,
    });

    const [councilState, setCouncilState] = useState<{
        isOpen: boolean;
        councilId: string | null;
    }>({
        isOpen: false,
        councilId: null,
    });

    const [councilMenuOpen, setCouncilMenuOpen] = useState(false);

    const openAgentChat = (buildingId: string) => {
        const agent = BUILDING_AGENTS[buildingId];
        if (agent) {
            setAgentChatState({
                isOpen: true,
                agentId: agent.id,
                agentName: agent.name,
                agentRole: agent.role,
                agentAvatar: agent.avatar,
            });
        }
    };

    const openAgentChatDirect = (agentId: string, agentName: string, agentRole: string) => {
        setAgentChatState({
            isOpen: true,
            agentId,
            agentName,
            agentRole,
            agentAvatar: null,
        });
    };

    const openInterior = () => {
        if (inspectorState.buildingId) {
            setInteriorState({
                isOpen: true,
                buildingId: inspectorState.buildingId,
                buildingName: inspectorState.buildingName,
            });
            setInspectorState(prev => ({ ...prev, isOpen: false }));
        }
    };

    const openCouncil = (councilId: string) => {
        setCouncilState({ isOpen: true, councilId });
        setCouncilMenuOpen(false);
    };

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
                    <div className="relative">
                        <button
                            onClick={() => setCouncilMenuOpen(!councilMenuOpen)}
                            className={`px-2 ${councilMenuOpen ? 'bg-[#000080] text-white' : 'hover:bg-[#000080] hover:text-white'}`}
                        >
                            Councils
                        </button>
                        {councilMenuOpen && (
                            <div className="absolute top-full left-0 bg-[#c0c0c0] border-2 border-white border-b-black border-r-black shadow-lg min-w-48 z-50">
                                {COUNCIL_LIST.map((council) => (
                                    <button
                                        key={council.id}
                                        onClick={() => openCouncil(council.id)}
                                        className="w-full text-left px-3 py-1 hover:bg-[#000080] hover:text-white flex items-center gap-2"
                                    >
                                        <span>{council.icon}</span>
                                        <span>{council.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button className="hover:bg-[#000080] hover:text-white px-2">Windows</button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative">
                <Scene />

                {/* Amazon Affiliate Revenue (city_metrics after migration 008) */}
                <AffiliateRevenueCard />

                {/* Modal Overlay Layer */}
                {inspectorState.isOpen && (
                    <BuildingInspector
                        isOpen={inspectorState.isOpen}
                        onClose={() => setInspectorState(prev => ({ ...prev, isOpen: false }))}
                        buildingId={inspectorState.buildingId}
                        buildingName={inspectorState.buildingName}
                        currentHealth={inspectorState.health}
                        appUrl={inspectorState.appUrl}
                        onTalkToAgent={inspectorState.buildingId && BUILDING_AGENTS[inspectorState.buildingId]
                            ? () => openAgentChat(inspectorState.buildingId!)
                            : undefined
                        }
                        agentName={inspectorState.buildingId ? BUILDING_AGENTS[inspectorState.buildingId]?.name : undefined}
                        onEnterBuilding={openInterior}
                    />
                )}

                {/* Building Interior View */}
                <BuildingInterior
                    isOpen={interiorState.isOpen}
                    onClose={() => setInteriorState(prev => ({ ...prev, isOpen: false }))}
                    buildingId={interiorState.buildingId}
                    buildingName={interiorState.buildingName}
                    onSelectAgent={openAgentChatDirect}
                    onBack={() => {
                        setInteriorState(prev => ({ ...prev, isOpen: false }));
                        if (interiorState.buildingId) {
                            setInspectorState(prev => ({
                                ...prev,
                                isOpen: true,
                                buildingId: interiorState.buildingId,
                                buildingName: interiorState.buildingName,
                            }));
                        }
                    }}
                />

                {/* Council Room */}
                <CouncilRoom
                    isOpen={councilState.isOpen}
                    onClose={() => setCouncilState(prev => ({ ...prev, isOpen: false }))}
                    councilId={councilState.councilId}
                />

                {/* Agent Chat Window */}
                <AgentChat
                    isOpen={agentChatState.isOpen}
                    onClose={() => setAgentChatState(prev => ({ ...prev, isOpen: false }))}
                    agentId={agentChatState.agentId}
                    agentName={agentChatState.agentName || undefined}
                    agentRole={agentChatState.agentRole || undefined}
                    agentAvatar={agentChatState.agentAvatar || undefined}
                />
            </div>

            {/* Status Bar */}
            <div className="h-6 bg-[#c0c0c0] border-t-2 border-gray-600 flex items-center px-2 text-xs font-mono z-10">
                <span className="flex-1">Ready.</span>
                <div className="w-32 border-l border-gray-600 px-2">RAM: 64MB</div>
            </div>
        </main>
    );
}
