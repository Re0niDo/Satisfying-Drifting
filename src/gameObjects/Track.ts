/**
 * Track game object for rendering track backgrounds
 * 
 * Renders the visual track layout as a static background image.
 * Completely static - removed from update list for optimal performance.
 */

import Phaser from 'phaser';
import type { ITrackConfig, Vector2 } from '../types/TrackTypes';
import { isDevEnvironment } from '../utils/env';

/**
 * Track background game object
 * Renders the visual track layout as a static background image
 */
export class Track extends Phaser.GameObjects.Image {
    private trackConfig: ITrackConfig;

    /**
     * Create a new Track background
     * @param scene - The scene this track belongs to
     * @param trackConfig - Track configuration data
     */
    constructor(scene: Phaser.Scene, trackConfig: ITrackConfig) {
        // Center the track in the game view
        const x = scene.cameras.main.width / 2;
        const y = scene.cameras.main.height / 2;
        
        super(scene, x, y, trackConfig.imageKey);
        
        this.trackConfig = trackConfig;
        
        // Add to scene
        scene.add.existing(this);
        
        // Set depth to be behind all game objects
        this.setDepth(0);
        
        // Set origin to center
        this.setOrigin(0.5, 0.5);
        
        // CRITICAL: Remove from update list for performance
        // Track background is completely static - no need for preUpdate calls
        this.removeFromUpdateList();
    }

    /**
     * Get the track configuration
     * @returns The track configuration data
     */
    public getConfig(): ITrackConfig {
        return this.trackConfig;
    }

    /**
     * Debug method: Draw drive area boundaries on the track
     * Only used in development mode with physics debug enabled
     * @param graphics - Graphics object to draw debug visualization
     */
    public debugDrawBoundary(graphics: Phaser.GameObjects.Graphics): void {
        if (!isDevEnvironment()) {
            return;
        }

        // Draw outer and inner boundaries in red
        graphics.lineStyle(2, 0xff0000, 1);
        const { outerBoundary, innerBoundaries } = this.trackConfig.driveArea;

        this.drawPolygon(graphics, outerBoundary);
        if (innerBoundaries) {
            innerBoundaries.forEach(hole => this.drawPolygon(graphics, hole));
        }

        // Draw spawn point as green circle
        graphics.fillStyle(0x00ff00, 1);
        graphics.fillCircle(
            this.trackConfig.spawnPoint.x,
            this.trackConfig.spawnPoint.y,
            10
        );

        // Draw spawn direction indicator as green arrow
        const angle = Phaser.Math.DegToRad(this.trackConfig.spawnPoint.angle);
        const dirX = Math.cos(angle) * 30;
        const dirY = Math.sin(angle) * 30;
        
        graphics.lineStyle(3, 0x00ff00, 1);
        graphics.beginPath();
        graphics.moveTo(
            this.trackConfig.spawnPoint.x,
            this.trackConfig.spawnPoint.y
        );
        graphics.lineTo(
            this.trackConfig.spawnPoint.x + dirX,
            this.trackConfig.spawnPoint.y + dirY
        );
        graphics.strokePath();
    }

    /**
     * Helper method to draw a polygon from an array of points
     * @param graphics - Graphics object to draw on
     * @param points - Array of Vector2 points defining the polygon
     */
    private drawPolygon(graphics: Phaser.GameObjects.Graphics, points: Vector2[]): void {
        if (points.length < 3) {
            console.warn('Track boundary has fewer than 3 points');
            return;
        }

        graphics.beginPath();
        graphics.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            graphics.lineTo(points[i].x, points[i].y);
        }
        graphics.closePath();
        graphics.strokePath();
    }

    /**
     * Cleanup method (called automatically by Phaser when object is destroyed)
     * Track is static, so no listeners or timers to clean up
     */
    preDestroy(): void {
        // Track is static, no listeners or timers to clean up
        // Phaser handles texture cleanup automatically
        // Clear the reference for garbage collection
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.trackConfig as any) = null;
    }
}
