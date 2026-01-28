import { BaseBuilding, BuildingConfig } from './BaseBuilding';

/**
 * AmusementBuilding: SLC Trips - Tourism & Amusement
 * Houses the Tourism Director AI focused on visitor experiences.
 */
export class AmusementBuilding extends BaseBuilding {
    constructor(grid = { x: 10, y: 6, z: 0 }) { // Entertainment District (NE)
        const config: BuildingConfig = {
            id: 'slctrips',
            type: 'amusement',
            grid,
            footprint: { width: 4, height: 3 },
            spriteSheet: '/sprites/buildings/amusement.png',
            aiPersona: 'You are the Tourism Director of SLC Trips. You showcase the best of Salt Lake City, from outdoor adventures to cultural experiences, helping visitors create memorable trips.'
        };

        super(config);
    }
}
