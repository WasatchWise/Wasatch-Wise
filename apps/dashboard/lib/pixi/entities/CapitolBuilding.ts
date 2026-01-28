import { BaseBuilding, BuildingConfig } from './BaseBuilding';

/**
 * CapitolBuilding: The WasatchWise umbrella headquarters.
 * Center of the grid (0, 0). Houses the CEO AI Executive.
 */
export class CapitolBuilding extends BaseBuilding {
    constructor(grid = { x: 0, y: 0, z: 0 }) {
        const config: BuildingConfig = {
            id: 'wasatchwise-capitol',
            type: 'capitol',
            grid,
            footprint: { width: 4, height: 4 },
            spriteSheet: '/sprites/buildings/capitol.png',
            aiPersona: 'You are the CEO of WasatchWise, a strategic thinker focused on holistic growth and risk management across all verticals.'
        };

        super(config);
    }

    /**
     * Override to add custom animations (flag waving, dome lights).
     */
    protected updateVisualState(): void {
        super.updateVisualState();

        // Future expansion: Add custom functionality or sub-sprites here
    }
}
