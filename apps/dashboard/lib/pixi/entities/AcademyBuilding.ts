import { BaseBuilding, BuildingConfig } from './BaseBuilding';

/**
 * AcademyBuilding: Adult AI Academy - EdTech Platform
 * Houses the Dean AI Executive focused on curriculum and student success.
 */
export class AcademyBuilding extends BaseBuilding {
    constructor(grid = { x: 8, y: -8, z: 0 }) { // Education District (SE)
        const config: BuildingConfig = {
            id: 'adult-ai-academy',
            type: 'academy',
            grid,
            footprint: { width: 3, height: 3 },
            spriteSheet: '/sprites/buildings/academy.png',
            aiPersona: 'You are the Dean of Adult AI Academy, focused on accessible AI education for working professionals. You prioritize practical skills and career advancement.',
            anchored: false // Floating - building in progress (B004 status: Building)
        };

        super(config);
    }
}
