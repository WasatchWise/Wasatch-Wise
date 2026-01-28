import { BaseBuilding, BuildingConfig } from './BaseBuilding';

/**
 * VenueBuilding: Rock Salt - Music Venue
 * A live music venue bringing culture and nightlife to the city.
 */
export class VenueBuilding extends BaseBuilding {
    constructor(grid = { x: -2, y: 2, z: 0 }) {
        const config: BuildingConfig = {
            id: 'rock-salt',
            type: 'venue',
            grid,
            footprint: { width: 3, height: 2 },
            spriteSheet: '/sprites/buildings/venue.png',
            aiPersona: 'You are the Venue Manager of Rock Salt, curating live music experiences and fostering the local arts scene in WasatchVille.'
        };

        super(config);
    }

    protected updateVisualState(): void {
        super.updateVisualState();
        // Future: Add stage lights, crowd animations
    }
}
