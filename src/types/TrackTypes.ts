/**
 * Track-related type definitions for the track system.
 * These types define track metadata, geometry, and gameplay parameters.
 */

/**
 * 2D Vector type for positions and polygon points
 */
export interface Vector2 {
    /** X coordinate in pixels */
    x: number;
    /** Y coordinate in pixels */
    y: number;
}

/**
 * Spawn point configuration for car placement
 */
export interface ISpawnPoint {
    /** X coordinate in pixels (world space) */
    x: number;
    /** Y coordinate in pixels (world space) */
    y: number;
    /** Initial rotation angle in degrees (0 = right, 90 = down) */
    angle: number;
}

/**
 * Geometry describing the drivable portion of a track.
 * Arcade Physics only provides AABB/circle bodies, so polygon checks
 * are handled manually via Phaser.Geom.Polygon.
 */
export interface ITrackDriveArea {
    /** Clockwise polygon describing drivable outer edge */
    outerBoundary: Vector2[];
    /** Counter-clockwise polygons that carve out holes (e.g., infield) */
    innerBoundaries?: Vector2[][];
}

/**
 * Track difficulty level
 */
export enum TrackDifficulty {
    /** Learning track with no requirements */
    Tutorial = 'TUTORIAL',
    /** Basic drift techniques */
    Easy = 'EASY',
    /** Advanced drift control */
    Medium = 'MEDIUM',
    /** Mastery required */
    Hard = 'HARD',
    /** Free practice, no scoring */
    Sandbox = 'SANDBOX'
}

/**
 * Complete track configuration interface
 */
export interface ITrackConfig {
    // Identification
    /** Unique track identifier (kebab-case) */
    id: string;
    /** Display name for menus */
    name: string;
    /** Short description of track challenge */
    description: string;
    /** Track difficulty level */
    difficulty: TrackDifficulty;
    
    // Asset References
    /** Asset key for track background image */
    imageKey: string;
    /** Optional thumbnail for track selection */
    thumbnailKey?: string;
    
    // Geometry
    /** Track width in pixels (for proximity scoring) */
    width: number;
    /** Polygon data for point-in-polygon checks */
    driveArea: ITrackDriveArea;
    /** Car spawn position and rotation */
    spawnPoint: ISpawnPoint;
    
    // Gameplay Parameters
    /** Target completion time in seconds */
    optimalTime: number;
    /** Required average drift quality (0-100) for Score mode */
    minimumQuality: number;
    
    // Progression
    /** Track ID that must be completed first (undefined = always unlocked) */
    unlockRequirement?: string;
    
    // Future Features (optional)
    /** Checkpoint positions for lap counting */
    checkpoints?: Vector2[];
    /** Decoration spawn points */
    decorations?: Vector2[];
    /** Weather type identifier */
    weatherEffects?: string;
}
