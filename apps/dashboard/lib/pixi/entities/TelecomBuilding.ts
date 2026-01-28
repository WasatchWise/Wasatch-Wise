import { BaseBuilding, BuildingConfig } from './BaseBuilding';

/**
 * TelecomBuilding: Pipeline IQ - Telecommunications & CRM
 * Houses the Network Director AI focused on connectivity and customer relationships.
 */
export class TelecomBuilding extends BaseBuilding {
    constructor(grid = { x: -6, y: -10, z: 0 }) { // Tech District (SW)
        const config: BuildingConfig = {
            id: 'pipeline-iq',
            type: 'telecom',
            grid,
            footprint: { width: 2, height: 4 },
            spriteSheet: '/sprites/buildings/telecom.png',
            aiPersona: 'You are the Network Director of Pipeline IQ. You manage telecommunications infrastructure, customer relationship pipelines, and ensure seamless connectivity across the enterprise.',
            anchored: true // Anchored to ground
        };

        super(config);
    }
}
