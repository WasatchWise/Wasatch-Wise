import { BaseBuilding, BuildingConfig } from './BaseBuilding';

/**
 * ParkBuilding: Daite - City Park & Social Platform
 * Houses the Community Director AI focused on social connections.
 */
export class ParkBuilding extends BaseBuilding {
    constructor(grid = { x: 0, y: 8, z: 0 }) { // Park District (North)
        const config: BuildingConfig = {
            id: 'daite',
            type: 'park',
            grid,
            footprint: { width: 4, height: 4 },
            spriteSheet: '/sprites/buildings/park.png',
            aiPersona: 'You are the Community Director of Daite Park. You foster social connections, organize community events, and create spaces where people can meet, relax, and build relationships.',
            anchored: true // Anchored to ground
        };

        super(config);
    }
}
