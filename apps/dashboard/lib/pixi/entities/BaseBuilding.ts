import * as PIXI from 'pixi.js';
import { ProjectionUtility, GridCoordinate, TILE_HEIGHT, TILE_WIDTH } from '../ProjectionUtility';

export interface BuildingConfig {
    id: string;
    type: 'capitol' | 'bank' | 'academy' | 'school' | 'industrial' | 'casino' | 'telecom' | 'venue' | 'amusement' | 'reccenter' | 'tvstation' | 'park';
    grid: GridCoordinate;
    footprint: { width: number; height: number }; // In grid tiles
    spriteSheet: string; // Path to texture
    aiPersona?: string; // System prompt for AI Executive
    anchored?: boolean; // If false, building floats above the grid plane (default: true)
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
    protected placeholder: PIXI.Graphics;
    protected healthBar: PIXI.Graphics;
    protected statusIcon: PIXI.Sprite | null = null;
    protected glowFilter: PIXI.Filter | null = null;
    protected hasRealSprite = false;
    protected isHovered = false;
    protected visualHeight = 64;
    protected visualTopY = -64;
    protected visualDiamondWidth = 64;

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
        
        // If not anchored, offset vertically to "float" above the plane
        const isAnchored = config.anchored !== false; // default to true
        
        // The building's footprint bottom point is drawn at y=0 relative to container.
        // For anchored buildings, we want this bottom point to align with the grid plane.
        // In isometric projection, the grid tile center is at screenPos.y, but the bottom
        // of the tile diamond is at screenPos.y + TILE_HEIGHT/2.
        // So we offset the container down by TILE_HEIGHT/2 so the bottom point (y=0) aligns with grid.
        const gridBottomOffset = TILE_HEIGHT / 2;
        const floatOffset = isAnchored ? gridBottomOffset : gridBottomOffset - 16; // Floating: 16px above grid
        
        this.position.set(screenPos.x, screenPos.y + floatOffset);

        // Set Z-index for depth sorting.
        // Use the "south-most" tile of the footprint so multi-tile buildings sort correctly.
        const zGrid: GridCoordinate = {
            x: config.grid.x + (config.footprint.width - 1),
            y: config.grid.y + (config.footprint.height - 1),
            z: config.grid.z ?? 0,
        };
        this.zIndex = ProjectionUtility.calculateZIndex(zGrid);

        // Visuals:
        // 1) draw a clean isometric placeholder immediately (so the city is visible even with no assets)
        // 2) attempt to load the real sprite asynchronously; if it loads, swap it in
        this.placeholder = new PIXI.Graphics();
        this.addChild(this.placeholder);

        this.sprite = new PIXI.Sprite(PIXI.Texture.EMPTY);
        this.sprite.visible = false;
        this.sprite.anchor.set(0.5, 1.0); // Bottom-center anchor
        this.addChild(this.sprite);

        // Initialize health bar (hidden by default)
        this.healthBar = new PIXI.Graphics();
        this.healthBar.position.set(-30, -this.visualHeight - 10);
        this.healthBar.visible = false;
        this.addChild(this.healthBar);

        // Render placeholder after healthBar exists (renderPlaceholder positions it)
        this.renderPlaceholder();

        // Best-effort load real texture; keep placeholder if 404/failed
        // Guard: PIXI.Assets may not be available in some builds/bundles.
        const maybeAssets = (PIXI as any).Assets as undefined | { load: (src: string) => Promise<PIXI.Texture> };
        if (maybeAssets?.load) {
            maybeAssets
                .load(config.spriteSheet)
                .then((texture) => {
                    // If destroyed before load completes, do nothing
                    if (this.destroyed) return;
                    this.sprite.texture = texture;
                    this.sprite.visible = true;
                    this.placeholder.visible = false;
                    this.hasRealSprite = true;

                    // Keep native pixel size for pixel art (no scaling here)
                    this.visualHeight = this.sprite.texture.height || this.visualHeight;
                    this.visualTopY = -this.visualHeight;
                    this.healthBar.position.set(-30, this.visualTopY - 10);
                    const w = this.sprite.texture.width || this.visualDiamondWidth;
                    this.hitArea = new PIXI.Rectangle(-w / 2, this.visualTopY, w, this.visualHeight);
                })
                .catch(() => {
                    // Keep placeholder
                });
        }

        // Make interactive
        this.eventMode = 'static';
        this.cursor = 'pointer';
        // Default hit area based on the placeholder dimensions.
        // (If a real sprite loads later, we update hitArea above.)
        this.hitArea = new PIXI.Rectangle(-this.visualDiamondWidth / 2, this.visualTopY, this.visualDiamondWidth, this.visualHeight);

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
        const { statusCode } = this._health;

        // Remove existing filters
        this.filters = [];

        switch (statusCode) {
            case 'healthy':
                this.applyTint(0xFFFFFF);
                break;

            case 'warning':
                // Slight yellow tint
                this.applyTint(0xFFFF99);
                break;

            case 'critical':
                // Pulse red outline (simulated with glow filter)
                // Note: BlurFilter is simple enough in v8
                const glowFilter = new PIXI.BlurFilter();
                glowFilter.blur = 2;
                this.filters = [glowFilter];
                this.applyTint(0xFF6666);
                break;

            case 'offline':
                // Grayscale (power outage)
                this.applyTint(0x888888);
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
        this.isHovered = true;
        this.applyTint(0xFFFFCC); // Slight highlight
    }

    protected handleHoverEnd(): void {
        this.healthBar.visible = false;
        this.isHovered = false;
        this.updateVisualState(); // Restore normal tint
    }

    public destroy(options?: boolean | PIXI.DestroyOptions): void {
        this.off('pointerdown');
        this.off('pointerover');
        this.off('pointerout');
        super.destroy(options);
    }

    private applyTint(tint: number): void {
        if (this.hasRealSprite) {
            this.sprite.tint = tint;
            return;
        }
        // For placeholders, we redraw using a base color influenced by hover/health.
        this.renderPlaceholder(tint);
    }

    private renderPlaceholder(overrideTint?: number): void {
        const { width, height } = this.config.footprint;
        const isAnchored = this.config.anchored !== false;
        
        // Slightly shrink lots to create visible "roads" between buildings.
        const LOT_SCALE = 0.88;
        const w = (width + height) * (TILE_WIDTH / 2) * LOT_SCALE;
        const h = (width + height) * (TILE_HEIGHT / 2) * LOT_SCALE;
        const buildingHeight = 26 + (width + height) * 6;

        // Anchor rule: the bottom-most footprint point sits on y=0 (ground plane).
        // Floating buildings have a shadow offset to show they're not touching ground.
        const shadowOffset = isAnchored ? 0 : 4; // Shadow for floating buildings
        this.visualHeight = buildingHeight + h;
        this.visualTopY = -this.visualHeight;
        this.visualDiamondWidth = w;
        this.healthBar.position.set(-30, this.visualTopY - 10);

        // SimCity 2000 color palette - more muted, retro tones
        const base = this.getBaseColor();
        const tinted = overrideTint ? blend(base, overrideTint, 0.45) : base;
        const roof = adjustColor(tinted, this.isHovered ? 0.18 : 0.12);
        const right = adjustColor(tinted, -0.15); // Darker right face (SimCity style)
        const left = adjustColor(tinted, -0.25); // Darkest left face
        const outline = 0x1a1a2e; // Darker outline for SimCity 2000 look

        this.placeholder.clear();

        // Draw shadow for floating buildings (SimCity 2000 style)
        if (!isAnchored) {
            const shadowAlpha = 0.3;
            this.placeholder
                .poly([0, -h + shadowOffset, w / 2, -h / 2 + shadowOffset, 0, shadowOffset, -w / 2, -h / 2 + shadowOffset])
                .fill({ color: 0x000000, alpha: shadowAlpha });
        }

        // Footprint (ground diamond): bottom point at y=0
        const A = { x: 0, y: -h }; // top
        const B = { x: w / 2, y: -h / 2 }; // right
        const C = { x: 0, y: 0 }; // bottom (ground contact or shadow level)
        const D = { x: -w / 2, y: -h / 2 }; // left

        // Roof (same diamond, lifted up by building height)
        const A2 = { x: A.x, y: A.y - buildingHeight };
        const B2 = { x: B.x, y: B.y - buildingHeight };
        const C2 = { x: C.x, y: C.y - buildingHeight };
        const D2 = { x: D.x, y: D.y - buildingHeight };

        // Roof face
        this.placeholder
            .poly([A2.x, A2.y, B2.x, B2.y, C2.x, C2.y, D2.x, D2.y])
            .fill(roof)
            .stroke({ width: 1, color: outline, alpha: 0.9 });

        // Left face
        this.placeholder
            .poly([D2.x, D2.y, C2.x, C2.y, C.x, C.y, D.x, D.y])
            .fill(left)
            .stroke({ width: 1, color: outline, alpha: 0.9 });

        // Right face
        this.placeholder
            .poly([C2.x, C2.y, B2.x, B2.y, B.x, B.y, C.x, C.y])
            .fill(right)
            .stroke({ width: 1, color: outline, alpha: 0.9 });

        // Simple “status sign” on the front
        const signW = Math.max(18, Math.min(34, w / 2));
        const signH = 10;
        const signX = -signW / 2;
        const signY = -Math.max(16, buildingHeight * 0.55);
        this.placeholder
            .rect(signX, signY, signW, signH)
            .fill(adjustColor(tinted, 0.25))
            .stroke({ width: 1, color: outline, alpha: 1.0 }); // Stronger outline for pixel art feel
    }

    private getBaseColor(): number {
        // SimCity 2000 inspired palette - more muted, retro colors
        const palette: Record<BuildingConfig['type'], number> = {
            capitol: 0x8B9DC3,      // Muted blue-gray (government)
            bank: 0x6B7A8F,         // Darker gray (finance)
            academy: 0xD4A574,     // Warm beige (education)
            school: 0x7BA3CC,       // Soft blue (school)
            industrial: 0x8B8680,   // Industrial gray
            casino: 0xC97BA5,       // Muted pink (entertainment)
            telecom: 0x6BBF8E,      // Muted green (tech)
            venue: 0xCC6B6B,        // Muted red (music)
            amusement: 0xA68BC7,    // Muted purple (tourism)
            reccenter: 0x6BB3D4,   // Soft cyan (recreation)
            tvstation: 0x5BA3C7,    // Medium blue (media)
            park: 0x5BA37A,        // Muted green (nature)
        };
        return palette[this.config.type] ?? 0xCCCCCC;
    }
}

function clamp01(v: number) {
    return Math.max(0, Math.min(1, v));
}

function blend(a: number, b: number, t: number) {
    const tt = clamp01(t);
    const ar = (a >> 16) & 0xff;
    const ag = (a >> 8) & 0xff;
    const ab = a & 0xff;
    const br = (b >> 16) & 0xff;
    const bg = (b >> 8) & 0xff;
    const bb = b & 0xff;
    const r = Math.round(ar + (br - ar) * tt);
    const g = Math.round(ag + (bg - ag) * tt);
    const bl = Math.round(ab + (bb - ab) * tt);
    return (r << 16) | (g << 8) | bl;
}

function adjustColor(color: number, amount: number) {
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;
    const f = (v: number) => Math.max(0, Math.min(255, Math.round(v + 255 * amount)));
    return (f(r) << 16) | (f(g) << 8) | f(b);
}
