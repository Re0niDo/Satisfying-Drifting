/**
 * Track configuration data and helper functions.
 * Defines all available tracks and provides utilities for track selection and progression.
 */

import { ITrackConfig, TrackDifficulty } from '../types/TrackTypes';

/**
 * Tutorial Circuit Track Configuration
 * 
 * A simple oval track designed to teach basic drift mechanics.
 * No quality requirements, generous boundaries, clear visual feedback.
 */
const TUTORIAL_TRACK: ITrackConfig = {
    id: 'tutorial-circuit',
    name: 'Tutorial Circuit',
    description: 'Learn the basics of drift control',
    difficulty: TrackDifficulty.Tutorial,
    
    imageKey: 'track_tutorial',
    thumbnailKey: 'track_tutorial_thumb',
    
    width: 150,  // Wide track for forgiving learning
    
    // Spawn point: Center of track, facing right
    spawnPoint: {
        x: 640,
        y: 360,
        angle: 0
    },
    
    // Placeholder drive area (simple rectangle for now)
    // Will be replaced with actual track polygon in visual implementation story
    driveArea: {
        outerBoundary: [
            { x: 200, y: 200 },
            { x: 1080, y: 200 },
            { x: 1080, y: 520 },
            { x: 200, y: 520 }
        ],
        innerBoundaries: [
            [
                { x: 350, y: 350 },
                { x: 350, y: 370 },
                { x: 930, y: 370 },
                { x: 930, y: 350 }
            ]
        ]
    },
    
    optimalTime: 30,        // 30 seconds target time
    minimumQuality: 0,      // No quality requirement for tutorial
    
    unlockRequirement: undefined  // Always unlocked
};

/**
 * All track configurations
 * Tracks are defined in unlock order
 */
export const TRACKS: ITrackConfig[] = [
    TUTORIAL_TRACK
    // Additional tracks will be added in future stories:
    // - Serpentine Run (story 2.2.x)
    // - Hairpin Challenge (story 2.2.x)
    // - The Gauntlet (story 2.2.x)
    // - Sandbox Arena (story 2.2.x)
];

/**
 * Get track configuration by ID
 * @param trackId - Unique track identifier
 * @returns Track configuration or undefined if not found
 */
export function getTrackById(trackId: string): ITrackConfig | undefined {
    return TRACKS.find(track => track.id === trackId);
}

/**
 * Get all unlocked tracks based on completed track IDs
 * @param completedTrackIds - Array of track IDs that have been completed
 * @returns Array of unlocked track configurations
 */
export function getUnlockedTracks(completedTrackIds: string[]): ITrackConfig[] {
    return TRACKS.filter(track => {
        // Always unlocked if no requirement
        if (!track.unlockRequirement) {
            return true;
        }
        // Unlocked if requirement is completed
        return completedTrackIds.includes(track.unlockRequirement);
    });
}

/**
 * Check if a specific track is unlocked
 * @param trackId - Track ID to check
 * @param completedTrackIds - Array of completed track IDs
 * @returns True if track is unlocked
 */
export function isTrackUnlocked(trackId: string, completedTrackIds: string[]): boolean {
    const track = getTrackById(trackId);
    if (!track) {
        return false;
    }
    
    // Always unlocked if no requirement
    if (!track.unlockRequirement) {
        return true;
    }
    
    // Check if requirement is met
    return completedTrackIds.includes(track.unlockRequirement);
}

/**
 * Development-mode validation for track configurations
 * Validates that all tracks have required fields and sensible values
 */
export function validateTrackData(): void {
    if (process.env.NODE_ENV !== 'development') {
        return;
    }
    
    TRACKS.forEach(track => {
        // Validate required fields
        if (!track.id || typeof track.id !== 'string') {
            throw new Error(`Track missing or invalid ID: ${JSON.stringify(track)}`);
        }
        
        if (!track.name || typeof track.name !== 'string') {
            throw new Error(`Track ${track.id} missing or invalid name`);
        }
        
        if (!track.imageKey || typeof track.imageKey !== 'string') {
            throw new Error(`Track ${track.id} missing or invalid imageKey`);
        }
        
        // Validate numeric ranges
        if (track.width <= 0) {
            throw new Error(`Track ${track.id} has invalid width: ${track.width}`);
        }
        
        if (track.optimalTime <= 0) {
            throw new Error(`Track ${track.id} has invalid optimalTime: ${track.optimalTime}`);
        }
        
        if (track.minimumQuality < 0 || track.minimumQuality > 100) {
            throw new Error(`Track ${track.id} has invalid minimumQuality: ${track.minimumQuality}`);
        }
        
        // Validate drive area geometry
        if (!track.driveArea || !Array.isArray(track.driveArea.outerBoundary) || track.driveArea.outerBoundary.length < 3) {
            throw new Error(`Track ${track.id} must have an outer boundary with at least 3 points`);
        }

        track.driveArea.outerBoundary.forEach(point => {
            if (typeof point.x !== 'number' || typeof point.y !== 'number') {
                throw new Error(`Track ${track.id} has invalid outer boundary point: ${JSON.stringify(point)}`);
            }
        });

        track.driveArea.innerBoundaries?.forEach((hole, holeIndex) => {
            if (!Array.isArray(hole) || hole.length < 3) {
                throw new Error(`Track ${track.id} has invalid inner boundary at index ${holeIndex}`);
            }

            hole.forEach(point => {
                if (typeof point.x !== 'number' || typeof point.y !== 'number') {
                    throw new Error(`Track ${track.id} has invalid inner boundary point: ${JSON.stringify(point)}`);
                }
            });
        });
        
        // Validate spawn point
        if (typeof track.spawnPoint.x !== 'number' || 
            typeof track.spawnPoint.y !== 'number' || 
            typeof track.spawnPoint.angle !== 'number') {
            throw new Error(`Track ${track.id} has invalid spawn point`);
        }
        
        // Validate unlock requirements
        if (track.unlockRequirement) {
            const requiredTrack = TRACKS.find(t => t.id === track.unlockRequirement);
            if (!requiredTrack) {
                throw new Error(`Track ${track.id} has invalid unlock requirement: ${track.unlockRequirement}`);
            }
        }
    });
    
    console.log(`✅ Track data validation passed for ${TRACKS.length} track(s)`);
}

// Run validation in development mode
if (typeof window === 'undefined') {
    // Only run during module import in Node.js (testing environment)
    validateTrackData();
}
