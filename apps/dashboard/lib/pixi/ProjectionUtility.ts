/**
 * ProjectionUtility: Implements the exact 2:1 dimetric projection
 * used in SimCity 2000 (26.565° angle).
 * 
 * Mathematical Foundation:
 * screenX = (gridX - gridY) × (TILE_WIDTH / 2)
 * screenY = (gridX + gridY) × (TILE_HEIGHT / 2)
 */

export const TILE_WIDTH = 64;  // Logical pixels
export const TILE_HEIGHT = 32; // Maintains 2:1 ratio

export interface GridCoordinate {
    x: number;
    y: number;
    z?: number; // Elevation (for multi-story buildings)
}

export interface ScreenCoordinate {
    x: number;
    y: number;
}

export class ProjectionUtility {
    /**
     * Converts 2D grid coordinates to isometric screen space.
     * @param grid - The cartesian grid position
     * @returns The screen pixel position for PixiJS
     */
    static toScreen(grid: GridCoordinate): ScreenCoordinate {
        const { x, y, z = 0 } = grid;

        return {
            x: (x - y) * (TILE_WIDTH / 2),
            y: (x + y) * (TILE_HEIGHT / 2) - (z * TILE_HEIGHT) // Z elevation
        };
    }

    /**
     * Converts screen coordinates back to grid space (for mouse picking).
     * @param screen - The pixel coordinates from the mouse/viewport
     * @returns The grid tile coordinates
     */
    static toGrid(screen: ScreenCoordinate): GridCoordinate {
        const { x: screenX, y: screenY } = screen;

        const gridX = (screenX / (TILE_WIDTH / 2) + screenY / (TILE_HEIGHT / 2)) / 2;
        const gridY = (screenY / (TILE_HEIGHT / 2) - screenX / (TILE_WIDTH / 2)) / 2;

        return {
            x: Math.floor(gridX),
            y: Math.floor(gridY),
            z: 0
        };
    }

    /**
     * Calculates the Z-index for proper depth sorting.
     * Formula: (x + y) + (z × 0.001)
     * 
     * @param grid - The entity's grid position
     * @returns A float value for PixiJS Container.zIndex
     */
    static calculateZIndex(grid: GridCoordinate): number {
        const { x, y, z = 0 } = grid;
        return (x + y) + (z * 0.001);
    }

    /**
     * Determines if a grid tile is visible within the viewport bounds.
     * (Used for culling optimization)
     */
    static isInViewport(
        grid: GridCoordinate,
        viewportBounds: { minX: number; maxX: number; minY: number; maxY: number }
    ): boolean {
        const screen = this.toScreen(grid);

        return (
            screen.x >= viewportBounds.minX &&
            screen.x <= viewportBounds.maxX &&
            screen.y >= viewportBounds.minY &&
            screen.y <= viewportBounds.maxY
        );
    }

    /**
     * Converts a linear distance in grid tiles to screen pixels.
     * (Used for resident pathfinding visualization)
     */
    static gridDistanceToScreen(gridDistance: number): number {
        // Pythagorean theorem for isometric space
        return gridDistance * Math.sqrt(
            Math.pow(TILE_WIDTH / 2, 2) +
            Math.pow(TILE_HEIGHT / 2, 2)
        );
    }
}
