import { BaseBuilding, BuildingConfig } from './BaseBuilding';

/**
 * TVStationBuilding: Dublin Drive Live (KDDL) - Broadcast Television
 * Houses the Station Manager AI focused on content and broadcasting.
 */
export class TVStationBuilding extends BaseBuilding {
    constructor(grid = { x: 6, y: 10, z: 0 }) { // Media District (NE)
        const config: BuildingConfig = {
            id: 'dublin-drive-live',
            type: 'tvstation',
            grid,
            footprint: { width: 3, height: 4 },
            spriteSheet: '/sprites/buildings/tvstation.png',
            aiPersona: 'You are the Station Manager of KDDL Dublin Drive Live. You oversee broadcast operations, content programming, and keep the community informed and entertained through quality television.'
        };

        super(config);
    }
}
