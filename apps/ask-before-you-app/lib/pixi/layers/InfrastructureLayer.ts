import * as PIXI from 'pixi.js';
import { ProjectionUtility, GridCoordinate } from '../ProjectionUtility';

export class InfrastructureLayer extends PIXI.Container {
    private pipes: PIXI.Graphics;
    private cables: PIXI.Graphics;

    constructor() {
        super();

        // Create graphics containers
        this.pipes = new PIXI.Graphics();
        this.cables = new PIXI.Graphics();

        this.addChild(this.pipes);
        this.addChild(this.cables);

        // Initial mock data generation
        this.generateMockInfrastructure();
    }

    /**
     * Generates a network of pipes and cables for visual effect.
     * In a real version, this would follow actual data paths.
     */
    private generateMockInfrastructure() {
        this.pipes.clear();
        this.cables.clear();

        const ROAD_COLOR = 0x333333;
        const PIPE_COLOR = 0x00AABB; // Teal/Cyan water pipes
        const CABLE_COLOR = 0xFFCC00; // Gold data cables

        // Draw a main artery pipe along the X and Y axes
        this.drawIsoLine(this.pipes, { x: -10, y: 0 }, { x: 10, y: 0 }, PIPE_COLOR, 4);
        this.drawIsoLine(this.pipes, { x: 0, y: -10 }, { x: 0, y: 10 }, PIPE_COLOR, 4);

        // Draw some random data cables
        for (let i = 0; i < 5; i++) {
            // Random connection points
            const start = { x: Math.floor(Math.random() * 10 - 5), y: Math.floor(Math.random() * 10 - 5) };
            const end = { x: Math.floor(Math.random() * 10 - 5), y: Math.floor(Math.random() * 10 - 5) };
            this.drawIsoLine(this.cables, start, end, CABLE_COLOR, 2);
        }
    }

    private drawIsoLine(g: PIXI.Graphics, startGrid: GridCoordinate, endGrid: GridCoordinate, color: number, width: number) {
        const startPos = ProjectionUtility.toScreen(startGrid);
        const endPos = ProjectionUtility.toScreen(endGrid);

        g.moveTo(startPos.x, startPos.y);
        g.lineTo(endPos.x, endPos.y);
        g.stroke({ width, color, alpha: 0.8 });
    }

    /**
     * Updates the visual state based on system health (voltage).
     * @param voltage 0-100
     */
    public updateHealth(voltage: number) {
        // Pulse effect or color shift could go here
        if (voltage < 50) {
            this.cables.tint = 0xFF0000; // Warning red
        } else {
            this.cables.tint = 0xFFFFFF; // Normal
        }
    }
}
