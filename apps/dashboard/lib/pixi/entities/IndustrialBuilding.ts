import { BaseBuilding, BuildingConfig } from './BaseBuilding';

/**
 * IndustrialBuilding: GMC Mag - Magnesium Mining Operations
 * Houses the Operations Director AI focused on extraction and logistics.
 */
export class IndustrialBuilding extends BaseBuilding {
    constructor(grid = { x: -10, y: 8, z: 0 }) { // Industrial District (Far NW)
        const config: BuildingConfig = {
            id: 'gmc-mag',
            type: 'industrial',
            grid,
            footprint: { width: 4, height: 4 },
            spriteSheet: '/sprites/buildings/industrial.png',
            aiPersona: 'You are the Operations Director of GMC Magnesium Mining. You oversee extraction operations, supply chain logistics, and ensure environmental compliance while maximizing output efficiency.',
            anchored: true // Anchored to ground
        };

        super(config);
    }
}
