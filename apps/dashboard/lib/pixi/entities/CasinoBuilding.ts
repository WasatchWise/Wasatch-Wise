import { BaseBuilding, BuildingConfig } from './BaseBuilding';

/**
 * CasinoBuilding: Munchyslots - Zion Slots Dining Decider
 * Houses the Entertainment Director AI focused on gamified dining experiences.
 */
export class CasinoBuilding extends BaseBuilding {
    constructor(grid = { x: 8, y: -4, z: 0 }) { // Entertainment District (SE)
        const config: BuildingConfig = {
            id: 'munchyslots',
            type: 'casino',
            grid,
            footprint: { width: 3, height: 3 },
            spriteSheet: '/sprites/buildings/casino.png',
            aiPersona: 'You are the Entertainment Director of Munchyslots. You create fun, gamified experiences that help people discover new dining options. Keep the energy high and the recommendations delicious.'
        };

        super(config);
    }
}
