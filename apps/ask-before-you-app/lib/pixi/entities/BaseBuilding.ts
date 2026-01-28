import * as PIXI from 'pixi.js';
import { ProjectionUtility, GridCoordinate, TILE_HEIGHT } from '../ProjectionUtility';

export interface BuildingConfig {
    id: string;
    type: 'capitol' | 'bank' | 'academy' | 'venue' | 'park' | 'office';
    grid: GridCoordinate;
    footprint: { width: number; height: number }; // In grid tiles
    spriteSheet: string; // Path to texture
    aiPersona?: string; // System prompt for AI Executive
}

export interface BuildingHealth {
    voltage: number; // 0-100 (system health)
    revenue: number; // Daily $
    activeUsers: number;
    statusCode: 'healthy' | 'warning' | 'critical' | 'offline';
}

/**
 * BaseBuilding: Abstract class for all isometric structures.
 * Handles sprite rendering, health visualization, and interaction.
 */
export abstract class BaseBuilding extends PIXI.Container {
    public readonly config: BuildingConfig;
    protected sprite: PIXI.Sprite;
    protected healthBar: PIXI.Graphics;
    protected statusIcon: PIXI.Sprite | null = null;
    protected glowFilter: PIXI.Filter | null = null;

    private _health: BuildingHealth = {
        voltage: 100,
        revenue: 0,
        activeUsers: 0,
        statusCode: 'healthy'
    };

    constructor(config: BuildingConfig) {
        super();
        this.config = config;

        // Position in isometric space
        const screenPos = ProjectionUtility.toScreen(config.grid);
        this.position.set(screenPos.x, screenPos.y);

        // Set Z-index for depth sorting
        this.zIndex = ProjectionUtility.calculateZIndex(config.grid);

        // For now, allow placeholders if spriteSheet fails to load or for valid placeholders
        // We will use a graphics placeholder if no texture found, but in v8 we async load usually.
        // For this sync constructor, we assume assets are preloaded or we use a place holder.
        // Simplified for this implementation: use a placeholder graphics if texturess not available yet

        // Fallback to a rectangle if texture is missing
        this.sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
        this.sprite.width = config.footprint.width * TILE_HEIGHT; // Approximate size
        this.sprite.height = config.footprint.width * TILE_HEIGHT;
        this.sprite.tint = 0xFF00FF; // Magenta placeholder

        // Try to load the real thing if possible (async nature of Texture.from might work better outside try/catch for URLs)
        // But for now, this fallback satisfies the linter and provides visual feedback.
        try {
            const texture = PIXI.Texture.from(config.spriteSheet);
            if (texture) {
                this.sprite.texture = texture;
                this.sprite.tint = 0xFFFFFF;
                // Reset size to let texture dictate, or keep scale? 
                // usually we let texture dictate size, but we might want to scale to grid.
                // For pixel art, we usually assume 1:1.
                this.sprite.setSize(this.sprite.texture.width, this.sprite.texture.height);
            }
        } catch (e) {
            console.warn(`Failed to load texture ${config.spriteSheet}`, e);
        }

        this.sprite.anchor.set(0.5, 1.0); // Bottom-center anchor
        this.addChild(this.sprite);

        // Initialize health bar (hidden by default)
        this.healthBar = new PIXI.Graphics();
        this.healthBar.position.set(-30, -this.sprite.height - 10);
        this.healthBar.visible = false;
        this.addChild(this.healthBar);

        // Make interactive
        this.eventMode = 'static';
        this.cursor = 'pointer';
        this.hitArea = new PIXI.Rectangle(
            -config.footprint.width * TILE_HEIGHT / 2,
            -100, // Approximation of height
            config.footprint.width * TILE_HEIGHT,
            100
        );

        // Bind event handlers
        this.on('pointerdown', this.handleClick.bind(this));
        this.on('pointerover', this.handleHover.bind(this));
        this.on('pointerout', this.handleHoverEnd.bind(this));
    }

    /**
     * Updates the building's health state and triggers visual changes.
     */
    public updateHealth(health: Partial<BuildingHealth>): void {
        this._health = { ...this._health, ...health };
        this.renderHealthBar();
        this.updateVisualState();
    }

    public get health(): BuildingHealth {
        return { ...this._health };
    }

    /**
     * Renders the voltage/health bar above the building.
     */
    private renderHealthBar(): void {
        const { voltage } = this._health;

        this.healthBar.clear();

        // Background
        this.healthBar.rect(0, 0, 60, 4);
        this.healthBar.fill(0x333333);

        // Fill based on voltage
        const fillWidth = (voltage / 100) * 60;
        const fillColor = voltage > 70 ? 0x00FF00 : voltage > 40 ? 0xFFFF00 : 0xFF0000;

        this.healthBar.rect(0, 0, fillWidth, 4);
        this.healthBar.fill(fillColor);
    }

    /**
     * Applies visual effects based on status (decay, glow, smoke).
     */
    protected updateVisualState(): void {
        const { statusCode, voltage } = this._health;

        // Remove existing filters
        this.filters = [];

        switch (statusCode) {
            case 'healthy':
                this.sprite.tint = 0xFFFFFF; // Normal color
                break;

            case 'warning':
                // Slight yellow tint
                this.sprite.tint = 0xFFFF99;
                break;

            case 'critical':
                // Pulse red outline (simulated with glow filter)
                // Note: BlurFilter is simple enough in v8
                const glowFilter = new PIXI.BlurFilter();
                glowFilter.blur = 2;
                this.filters = [glowFilter];
                this.sprite.tint = 0xFF6666;
                break;

            case 'offline':
                // Grayscale (power outage)
                this.sprite.tint = 0x888888;
                const grayscaleFilter = new PIXI.ColorMatrixFilter();
                grayscaleFilter.desaturate();
                this.filters = [grayscaleFilter];
                break;
        }
    }

    protected handleClick(event: PIXI.FederatedPointerEvent): void {
        event.stopPropagation();

        // Dispatch custom event to React layer
        window.dispatchEvent(new CustomEvent('openBuildingInspector', {
            detail: {
                buildingId: this.config.id,
                type: this.config.type,
                health: this._health,
                position: { x: event.globalX, y: event.globalY }
            }
        }));
    }

    protected handleHover(): void {
        this.healthBar.visible = true;
        this.sprite.tint = 0xFFFFCC; // Slight highlight
    }

    protected handleHoverEnd(): void {
        this.healthBar.visible = false;
        this.updateVisualState(); // Restore normal tint
    }

    public destroy(options?: boolean | PIXI.DestroyOptions): void {
        this.off('pointerdown');
        this.off('pointerover');
        this.off('pointerout');
        super.destroy(options);
    }
}
