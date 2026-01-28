import { BaseBuilding, BuildingConfig } from './BaseBuilding';

export class BankBuilding extends BaseBuilding {
    constructor(grid = { x: -8, y: -8, z: 0 }) { // Financial District (SW)
        const config: BuildingConfig = {
            id: 'wasatchwise-bank',
            type: 'bank',
            grid,
            footprint: { width: 2, height: 2 },
            spriteSheet: '/sprites/buildings/bank.png',
            aiPersona: 'You are the CFO. Conservative, risk-averse, obsessed with ROI and cash flow.'
        };

        super(config);
    }

    protected updateVisualState(): void {
        super.updateVisualState();
        // Specific bank animations (e.g., coin sparkle)
    }
}
