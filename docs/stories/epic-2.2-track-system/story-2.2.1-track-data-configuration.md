# Story 2.2.1: TrackData Configuration Structure

**Epic:** Epic 2.2: Track System  
**Story ID:** 2.2.1  
**Priority:** High  
**Points:** 2  
**Status:** ✅ Complete

---

## Description

Create the foundational track configuration structure and TypeScript type definitions required for the track system. This includes defining track metadata (name, description, difficulty), geometric data (collision boundaries, spawn points), and gameplay parameters (optimal time, quality requirements) in a centralized configuration file.

This story establishes the data structures that all track-related functionality will depend on, enabling parallel development of visual rendering, collision detection, and track selection systems.

**GDD Reference:** Track System (Architecture Document), Track Data Configuration section  
**Architecture Reference:** Track Data Configuration, Project Structure sections

---

## Acceptance Criteria

### Functional Requirements

- [x] TrackConfig interface defines all required track properties with correct types
- [x] Track configuration includes drivable area geometry (outer boundary + optional holes) and spawn points
- [x] Track configuration includes gameplay metadata (name, description, optimal time, quality threshold)
- [x] Tutorial track configuration is defined with placeholder boundary data
- [x] Configuration supports track progression (unlock requirements)
- [x] All track IDs use consistent kebab-case naming convention

### Technical Requirements

- [x] Code follows TypeScript strict mode standards (no `any` types)
- [x] All interfaces use IPascalCase naming convention
- [x] Configuration uses kebab-case for track IDs
- [x] JSDoc comments document all properties with units and purpose
- [x] Unit tests validate configuration structure and required fields
- [x] No runtime dependencies on Phaser (pure TypeScript/data)
- [x] Configuration file exports both interface and track array

### Game Design Requirements

- [x] Track configuration structure supports 5 planned tracks
- [x] Spawn point includes position (x, y) and initial rotation angle
- [x] Drivable area geometry supports arbitrary polygon shapes (Vector2 arrays)
- [x] Optimal time and minimum quality values are tunable per track
- [x] Track progression system supports sequential unlocking
- [x] Configuration structure allows future expansion (checkpoints, lap counting)

---

## Technical Specifications

### Files to Create/Modify

**New Files:**

- `src/config/TrackData.ts` - Track configuration interfaces and track definitions
- `src/types/TrackTypes.ts` - TypeScript interfaces for track-related data structures
- `tests/config/TrackData.test.ts` - Unit tests for track configuration validation

**Modified Files:**

- None (this is foundational work)

### Class/Interface Definitions

```typescript
// src/types/TrackTypes.ts

/**
 * 2D Vector type for positions and polygon points
 */
export interface Vector2 {
    x: number;  // X coordinate in pixels
    y: number;  // Y coordinate in pixels
}

/**
 * Spawn point configuration for car placement
 */
export interface ISpawnPoint {
    x: number;          // X coordinate in pixels (world space)
    y: number;          // Y coordinate in pixels (world space)
    angle: number;      // Initial rotation angle in degrees (0 = right, 90 = down)
}

/**
 * Geometry describing the drivable portion of a track.
 * Arcade Physics only provides AABB/circle bodies, so polygon checks
 * are handled manually via Phaser.Geom.Polygon.
 */
export interface ITrackDriveArea {
    outerBoundary: Vector2[];        // Clockwise polygon describing drivable outer edge
    innerBoundaries?: Vector2[][];   // Counter-clockwise polygons that carve out holes (e.g., infield)
}

/**
 * Track difficulty level
 */
export enum TrackDifficulty {
    Tutorial = 'TUTORIAL',       // Learning track with no requirements
    Easy = 'EASY',               // Basic drift techniques
    Medium = 'MEDIUM',           // Advanced drift control
    Hard = 'HARD',               // Mastery required
    Sandbox = 'SANDBOX'          // Free practice, no scoring
}

/**
 * Complete track configuration interface
 */
export interface ITrackConfig {
    // Identification
    id: string;                          // Unique track identifier (kebab-case)
    name: string;                        // Display name for menus
    description: string;                 // Short description of track challenge
    difficulty: TrackDifficulty;         // Track difficulty level
    
    // Asset References
    imageKey: string;                    // Asset key for track background image
    thumbnailKey?: string;               // Optional thumbnail for track selection
    
    // Geometry
    width: number;                       // Track width in pixels (for proximity scoring)
    driveArea: ITrackDriveArea;          // Polygon data for point-in-polygon checks
    spawnPoint: ISpawnPoint;             // Car spawn position and rotation
    
    // Gameplay Parameters
    optimalTime: number;                 // Target completion time in seconds
    minimumQuality: number;              // Required average drift quality (0-100) for Score mode
    
    // Progression
    unlockRequirement?: string;          // Track ID that must be completed first (undefined = always unlocked)
    
    // Future Features (optional)
    checkpoints?: Vector2[];             // Checkpoint positions for lap counting
    decorations?: Vector2[];             // Decoration spawn points
    weatherEffects?: string;             // Weather type identifier
}
```

```typescript
// src/config/TrackData.ts
import { ITrackConfig, TrackDifficulty, Vector2, ISpawnPoint } from '../types/TrackTypes';

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
```

---

## Implementation Tasks

### Task 1: Create TrackTypes Interface File
**File:** `src/types/TrackTypes.ts`

- [x] Define `Vector2` interface for 2D coordinates
- [x] Define `ISpawnPoint` interface with position and angle
- [x] Create `TrackDifficulty` enum with 5 difficulty levels
- [x] Define complete `ITrackConfig` interface with all track properties
- [x] Add comprehensive JSDoc comments with units and examples
- [x] Export all types for use across the codebase

### Task 2: Create TrackData Configuration File
**File:** `src/config/TrackData.ts`

- [x] Import TrackTypes interfaces
- [x] Define `TUTORIAL_TRACK` configuration with placeholder data
- [x] Create `TRACKS` array with tutorial track as first entry
- [x] Implement `getTrackById()` helper function
- [x] Implement `getUnlockedTracks()` progression helper
- [x] Implement `isTrackUnlocked()` check function
- [x] Create `validateTrackData()` development validation function
- [x] Add validation call for development environment only

### Task 3: Create Unit Tests
**File:** `tests/config/TrackData.test.ts`

- [x] Test `ITrackConfig` interface structure
- [x] Test `TUTORIAL_TRACK` has all required fields
- [x] Test `TRACKS` array is not empty
- [x] Test `getTrackById()` returns correct track
- [x] Test `getTrackById()` returns undefined for invalid ID
- [x] Test `getUnlockedTracks()` with no completed tracks (only tutorial)
- [x] Test `getUnlockedTracks()` with completed tracks (future tracks)
- [x] Test `isTrackUnlocked()` for various scenarios
- [x] Test `validateTrackData()` catches invalid configurations
- [x] Test spawn point has valid numeric values
- [x] Test collision boundary has minimum 3 points
- [x] Test optimal time and minimum quality are in valid ranges

**Test File:** `tests/types/TrackTypes.test.ts`

- [x] Test `Vector2` interface accepts valid coordinates
- [x] Test `ISpawnPoint` interface structure
- [x] Test `TrackDifficulty` enum has 5 values
- [x] Test `ITrackConfig` interface has all required properties
- [x] Test TypeScript strict mode compliance

### Task 4: Integration Verification

- [x] Verify TypeScript compilation with strict mode succeeds
- [x] Run ESLint and confirm zero warnings/errors
- [x] Run all unit tests and confirm 100% pass rate
- [x] Verify no circular dependencies between config and types
- [x] Confirm configuration can be imported without side effects

---

## Testing Requirements

### Unit Test Coverage

**Target:** 100% coverage on TrackData.ts and TrackTypes.ts

**Critical Test Cases:**

1. **Configuration Structure**
   - All tracks have required fields
   - Track IDs are unique
   - Asset keys follow naming convention

2. **Helper Functions**
   - `getTrackById()` handles valid and invalid IDs
   - `getUnlockedTracks()` correctly filters based on progression
   - `isTrackUnlocked()` respects unlock requirements

3. **Validation Logic**
   - `validateTrackData()` catches missing required fields
   - Validation catches invalid numeric ranges
   - Validation catches invalid collision boundaries
   - Validation catches circular unlock dependencies

4. **Type Safety**
   - All interfaces compile in TypeScript strict mode
   - No `any` types used
   - Enums have correct string literal values

### Integration Testing

- Import TrackData in a test Phaser scene (mock)
- Verify no runtime errors during module import
- Confirm validation runs only in development mode

---

## Definition of Done

### Code Quality
- [x] All TypeScript strict mode checks pass
- [x] ESLint passes with zero warnings
- [x] All JSDoc comments complete and accurate
- [x] No `any` types used
- [x] Naming conventions followed (IPascalCase, kebab-case)

### Testing
- [x] All unit tests pass (minimum 20 tests)
- [x] 100% code coverage on new files
- [x] Edge cases tested (invalid IDs, missing fields)
- [x] Validation logic tested with intentionally bad data

### Documentation
- [x] JSDoc comments on all interfaces and functions
- [x] Inline comments explain validation logic
- [x] Type definitions include units (pixels, degrees, seconds)
- [x] README note about placeholder collision boundary data

### Integration
- [x] Configuration can be imported without side effects
- [x] No circular dependencies
- [x] No Phaser dependencies (pure TypeScript)
- [x] Compatible with existing type definitions (PhysicsTypes, InputTypes)

### Acceptance
- [x] All acceptance criteria met
- [x] Code review completed
- [x] Demonstrates track data structure for future stories
- [x] Tutorial track configuration is complete and valid

---

## Dependencies

**Blocks:**
- Story 2.2.2: Tutorial Track Visual Implementation (needs track configuration)
- Story 2.2.3: TrackBoundary Collision System (needs drive area data)
- Story 2.2.4: Track Selection UI (needs track metadata and progression)

**Blocked By:**
- None (foundational story)

**Parallel Development:**
- Can be developed alongside any Phase 1 or Epic 2.1 stories

---

## Notes

### Placeholder Data
The tutorial track collision boundary is intentionally simplified (rectangle) in this story. The actual track polygon will be defined when implementing visual track rendering in Story 2.2.2.

### Future Expansion
The configuration structure includes optional fields (`checkpoints`, `decorations`, `weatherEffects`) that will be utilized in Phase 3 content development. These should be typed but can remain undefined for now.

### Track ID Naming Convention
All track IDs use kebab-case (e.g., `tutorial-circuit`, `serpentine-run`) for consistency with asset keys and file naming conventions.

### Validation Strategy
Configuration validation only runs in development mode to avoid production overhead. The validation function should be called during unit tests to catch configuration errors early.

---

**Story Created:** 2025-11-09  
**Created By:** Jordan (Game Scrum Master)  
**Epic:** Epic 2.2: Track System  
**Architecture Version:** 1.1
