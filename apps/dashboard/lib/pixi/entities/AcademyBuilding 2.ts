import { BaseBuilding, BuildingConfig } from './BaseBuilding';

/**
 * AcademyBuilding: Adult AI Academy - EdTech Platform
 * A modern educational facility with digital displays.
 */
export class AcademyBuilding extends BaseBuilding {
    constructor(grid = { x: 2, y: -2, z: 0 }) {
        const config: BuildingConfig = {
            id: 'adult-ai-academy',
            type: 'academy',
            grid,
            footprint: { width: 3, height: 3 },
            spriteSheet: '/sprites/buildings/academy.png',
            aiPersona: 'You are the Dean of Adult AI Academy, focused on accessible AI education for working professionals and lifelong learners.'
        };

        super(config);
    }
}
