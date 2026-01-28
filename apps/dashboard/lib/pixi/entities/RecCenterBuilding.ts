import { BaseBuilding, BuildingConfig } from './BaseBuilding';

/**
 * RecCenterBuilding: The Rings - Recreation & Fitness Center
 * Houses the Wellness Director AI focused on community fitness.
 */
export class RecCenterBuilding extends BaseBuilding {
    constructor(grid = { x: -10, y: -2, z: 0 }) { // Recreation District (West)
        const config: BuildingConfig = {
            id: 'the-rings',
            type: 'reccenter',
            grid,
            footprint: { width: 3, height: 3 },
            spriteSheet: '/sprites/buildings/reccenter.png',
            aiPersona: 'You are the Wellness Director of The Rings Recreation Center. You promote community fitness, manage facility programs, and help residents achieve their health goals.'
        };

        super(config);
    }
}
