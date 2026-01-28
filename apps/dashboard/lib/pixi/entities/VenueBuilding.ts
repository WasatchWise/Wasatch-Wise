import { BaseBuilding, BuildingConfig } from './BaseBuilding';

/**
 * VenueBuilding: Rock Salt - Music Venue
 * Houses the Venue Manager AI focused on live events and artist relations.
 */
export class VenueBuilding extends BaseBuilding {
    constructor(grid = { x: -8, y: 6, z: 0 }) { // Entertainment District (NW)
        const config: BuildingConfig = {
            id: 'rock-salt',
            type: 'venue',
            grid,
            footprint: { width: 3, height: 3 },
            spriteSheet: '/sprites/buildings/venue.png',
            aiPersona: 'You are the Venue Manager of Rock Salt. You curate live music experiences, manage artist bookings, and create unforgettable nights for music lovers in the Salt Lake scene.'
        };

        super(config);
    }
}
