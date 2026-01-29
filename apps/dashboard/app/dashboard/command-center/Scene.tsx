'use client';

import { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { CapitolBuilding } from '@/lib/pixi/entities/CapitolBuilding';
import { BankBuilding } from '@/lib/pixi/entities/BankBuilding';
import { AcademyBuilding } from '@/lib/pixi/entities/AcademyBuilding';
import { SchoolBuilding } from '@/lib/pixi/entities/SchoolBuilding';
import { ParkBuilding } from '@/lib/pixi/entities/ParkBuilding';
import { IndustrialBuilding } from '@/lib/pixi/entities/IndustrialBuilding';
import { CasinoBuilding } from '@/lib/pixi/entities/CasinoBuilding';
import { TelecomBuilding } from '@/lib/pixi/entities/TelecomBuilding';
import { VenueBuilding } from '@/lib/pixi/entities/VenueBuilding';
import { AmusementBuilding } from '@/lib/pixi/entities/AmusementBuilding';
import { RecCenterBuilding } from '@/lib/pixi/entities/RecCenterBuilding';
import { TVStationBuilding } from '@/lib/pixi/entities/TVStationBuilding';
import { InfrastructureLayer } from '@/lib/pixi/layers/InfrastructureLayer';
import { initializeGlobalPulse, GlobalPulse } from '@/lib/supabase/GlobalPulse';
import type { BuildingHealth } from '@/lib/pixi/entities/BaseBuilding';

// SimCity 2000 style isometric grid
const drawGrid = (container: PIXI.Container) => {
    const g = new PIXI.Graphics();
    const TILE_WIDTH = 64;
    const TILE_HEIGHT = 32;

    // SimCity 2000 grid: more visible, with subtle color variation
    const gridColor = 0x008B8B; // Teal base
    const gridColorLight = 0x00A0A0; // Lighter teal for alternating tiles
    
    // Expanded grid to show the full city spread
    for (let x = -20; x <= 20; x++) {
        for (let y = -20; y <= 20; y++) {
            const startX = (x - y) * (TILE_WIDTH / 2);
            const startY = (x + y) * (TILE_HEIGHT / 2);

            // Alternate tile colors for depth (SimCity 2000 style)
            const isEven = (x + y) % 2 === 0;
            const tileColor = isEven ? gridColor : gridColorLight;
            
            // Draw diamond tile
            g.moveTo(startX, startY);
            g.lineTo(startX + 32, startY + 16);
            g.lineTo(startX, startY + 32);
            g.lineTo(startX - 32, startY + 16);
            g.lineTo(startX, startY);
            
            // Fill with subtle color, then stroke
            g.fill({ color: tileColor, alpha: 0.15 });
            g.stroke({ width: 1, color: tileColor, alpha: 0.4 });
        }
    }
    container.addChild(g);
};

export default function DashboardScene() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [app, setApp] = useState<PIXI.Application | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        if (app) return; // Prevent double init

        const pixiApp = new PIXI.Application();
        let isAlive = true;
        let viewport: Viewport | null = null;
        let infrastructureLayer: InfrastructureLayer | null = null;
        let onResize: (() => void) | null = null;
        let onKeyDown: ((e: KeyboardEvent) => void) | null = null;
        let globalPulse: GlobalPulse | null = null;
        const unsubscribeFunctions: (() => void)[] = [];

        (async () => {
            await pixiApp.init({
                width: canvasRef.current?.clientWidth || 1280,
                height: canvasRef.current?.clientHeight || 720,
                backgroundColor: '#006B6B', // SimCity 2000 darker teal background
                antialias: false, // Pixel art - no antialiasing!
                autoDensity: true,
                resolution: 1, // Force 1x for crisp pixel art (SimCity 2000 style)
                preference: 'webgl',
            });

            // If the component unmounted during init, destroy it immediately
            if (!canvasRef.current) {
                pixiApp.destroy();
                return;
            }

            canvasRef.current.appendChild(pixiApp.canvas);
            setApp(pixiApp);

            // Layers
            const gridLayer = new PIXI.Container();
            infrastructureLayer = new InfrastructureLayer(); // New Layer
            const buildingsLayer = new PIXI.Container();

            // Camera / viewport (pan + zoom) - Larger world for spread-out city
            const WORLD_W = 3200;
            const WORLD_H = 2400;
            const worldCenterX = WORLD_W / 2;
            const worldCenterY = WORLD_H / 2;

            viewport = new Viewport({
                screenWidth: pixiApp.screen.width,
                screenHeight: pixiApp.screen.height,
                worldWidth: WORLD_W,
                worldHeight: WORLD_H,
                events: pixiApp.renderer.events,
            });
            viewport
                .drag()
                .pinch()
                .wheel()
                .decelerate();

            // Place world origin at center so our isometric math (0,0) feels natural
            gridLayer.position.set(worldCenterX, worldCenterY);
            infrastructureLayer.position.set(worldCenterX, worldCenterY);
            buildingsLayer.position.set(worldCenterX, worldCenterY);

            viewport.addChild(gridLayer);
            viewport.addChild(infrastructureLayer);
            viewport.addChild(buildingsLayer);
            pixiApp.stage.addChild(viewport);
            viewport.moveCenter(worldCenterX, worldCenterY);

            // Draw foundational grid
            drawGrid(gridLayer);

            // Add Buildings - The WasatchVille City
            const buildings = [
                new CapitolBuilding(),      // Center - WasatchWise HQ
                new BankBuilding(),          // Finance
                new AcademyBuilding(),       // Adult AI Academy - EdTech
                new SchoolBuilding(),        // ABYA - Dept of Education
                new IndustrialBuilding(),    // GMC Mag - Magnesium Mining
                new CasinoBuilding(),        // Munchyslots - Dining/Entertainment
                new TelecomBuilding(),       // Pipeline IQ - Telecommunications
                new VenueBuilding(),         // Rock Salt - Music Venue
                new AmusementBuilding(),     // SLC Trips - Tourism
                new RecCenterBuilding(),     // The Rings - Fitness
                new TVStationBuilding(),     // KDDL Dublin Drive Live
                new ParkBuilding(),          // Daite - Social/Park
            ];

            // Add all buildings to the layer
            buildings.forEach(building => buildingsLayer.addChild(building));

            // Initialize GlobalPulse for real-time subscriptions
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

            if (supabaseUrl && supabaseKey) {
                globalPulse = initializeGlobalPulse(supabaseUrl, supabaseKey);

                // Subscribe to each building's health updates via Realtime (await so cleanup has unsubscribes)
                const unsubs = await Promise.all(
                    buildings.map((building) =>
                        globalPulse!.subscribeToBuildingHealth(
                            building.config.id,
                            (health) => {
                                if (!isAlive) return;
                                building.updateHealth(health);
                            }
                        )
                    )
                );
                unsubscribeFunctions.push(...unsubs);

                // Fetch initial health for all buildings
                Promise.all(
                    buildings.map((b) =>
                        globalPulse!.calculateBuildingHealth(b.config.id).then((health) => {
                            if (isAlive) b.updateHealth(health);
                        })
                    )
                );
            } else {
                console.warn('Supabase environment variables not configured. Real-time updates disabled.');
            }

            // Basic sorting loop
            pixiApp.ticker.add(() => {
                buildingsLayer.children.sort((a, b) => a.zIndex - b.zIndex);
            });

            // Toggle infrastructure overlay with "i"
            onKeyDown = (e: KeyboardEvent) => {
                if (e.key.toLowerCase() === 'i' && infrastructureLayer) {
                    infrastructureLayer.visible = !infrastructureLayer.visible;
                }
            };
            window.addEventListener('keydown', onKeyDown);

            // Handle resize
            onResize = () => {
                if (!canvasRef.current || !viewport) return;
                const w = canvasRef.current.clientWidth || 1280;
                const h = canvasRef.current.clientHeight || 720;
                pixiApp.renderer.resize(w, h);
                viewport.resize(w, h, viewport.worldWidth, viewport.worldHeight);
            };
            window.addEventListener('resize', onResize);
        })();

        return () => {
            // Cleanup
            isAlive = false;
            
            // Unsubscribe from all building health updates
            unsubscribeFunctions.forEach((fn) => fn());
            
            // Destroy GlobalPulse instance
            if (globalPulse) {
                globalPulse.destroy();
            }
            
            if (onResize) window.removeEventListener('resize', onResize);
            if (onKeyDown) window.removeEventListener('keydown', onKeyDown);
            if (pixiApp) {
                pixiApp.destroy(true, { children: true });
            }
        };
    }, []);

    return (
        <div className="relative w-full h-full bg-[#008B8B] overflow-hidden">
            <div ref={canvasRef} className="absolute inset-0" />

            {/* Win95 overlay placeholder */}
            <div className="absolute top-2 left-2 p-2 bg-gray-200 border-2 border-white border-b-gray-800 border-r-gray-800 pointer-events-none">
                <span className="text-xs font-mono text-black">WASATCH WISE v1.0</span>
            </div>
        </div>
    );
}
