import { BaseBuilding, BuildingConfig } from './BaseBuilding';

/**
 * SchoolBuilding: Ask Before You App (ABYA) - Department of Education
 * Houses the Superintendent AI focused on K-12 compliance and policy.
 */
export class SchoolBuilding extends BaseBuilding {
    constructor(grid = { x: 0, y: -10, z: 0 }) { // Education District (South)
        const config: BuildingConfig = {
            id: 'ask-before-you-app',
            type: 'school',
            grid,
            footprint: { width: 4, height: 3 },
            spriteSheet: '/sprites/buildings/school.png',
            aiPersona: 'You are the Superintendent of the Department of Education division. You ensure K-12 institutions comply with data privacy regulations and make informed decisions about educational technology.'
        };

        super(config);
    }
}
