# Story 2.2.2: Tutorial Track Visual Implementation

**Epic:** Epic 2.2: Track System  
**Story ID:** 2.2.2  
**Priority:** High  
**Points:** 3  
**Status:** Draft

---

## Description

Implement the visual rendering of the Tutorial Circuit track in the GameScene. This includes loading the track background image, rendering it as a static game object, and updating the track configuration with accurate drive-area polygon data (outer boundary + infield hole) based on the visual track layout.

This story focuses on the visual representation and accurate geometric definition of the tutorial track, preparing the foundation for collision detection (Story 2.2.3) and gameplay testing.

**GDD Reference:** Track System (Architecture Document), Tutorial Circuit track definition  
**Architecture Reference:** Track Data Configuration, Asset Management System, Performance Architecture (Static Layers)

---

## Acceptance Criteria

### Functional Requirements

- [ ] Tutorial track background image loads successfully in GameScene
- [ ] Track background renders at correct position (centered in game view)
- [ ] Track background is a static object (removed from update list for performance)
- [ ] Track drive area polygon accurately matches the visual track edges
- [ ] Spawn point position is visible on the track and correctly oriented
- [ ] Track dimensions (1280x720) fit within game viewport
- [ ] Track visual is clearly distinguishable (track vs off-track areas)

### Technical Requirements

- [ ] Code follows TypeScript strict mode standards (no `any` types)
- [ ] Track background uses Phaser.GameObjects.Image or TileSprite
- [ ] Background image is removed from update list (static optimization)
- [ ] Collision boundary polygon has minimum 8 points for smooth edges
- [ ] TrackData.ts updated with accurate driveArea coordinates
- [ ] Asset key follows naming convention (`track_tutorial`)
- [ ] Z-index/depth properly set (track background behind car)
- [ ] No memory leaks (proper cleanup if track is reloaded)

### Game Design Requirements

- [ ] Track layout is simple oval shape suitable for learning basic drifts
- [ ] Track width (150 pixels) allows forgiving drift practice
- [ ] Visual clarity: track surface vs boundary vs off-track is obvious
- [ ] Spawn point places car in optimal starting position (facing first turn)
- [ ] Track design supports completing at least one full lap
- [ ] Visual style matches game aesthetic (minimal, focused on gameplay)

---

## Technical Specifications

### Files to Create/Modify

**New Files:**

- `assets/images/tracks/track_tutorial.png` - Tutorial track background image (1280x720 PNG)
- `src/gameObjects/Track.ts` - Reusable Track game object for rendering track backgrounds
- `tests/gameObjects/Track.test.ts` - Unit tests for Track game object

**Modified Files:**

- `src/config/TrackData.ts` - Update TUTORIAL_TRACK.driveArea with accurate polygons
- `src/scenes/GameScene.ts` - Integrate Track rendering into scene creation
- `src/config/AssetConfig.ts` - Add tutorial track asset key and path

### Track Game Object Definition

```typescript
// src/gameObjects/Track.ts
import Phaser from 'phaser';
import { ITrackConfig, Vector2 } from '../types/TrackTypes';

/**
 * Track background game object
 * Renders the visual track layout as a static background image
 */
export class Track extends Phaser.GameObjects.Image {
    private trackConfig: ITrackConfig;

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
        // Track background is completely static
        this.removeFromUpdateList();
    }

    /**
     * Get the track configuration
     */
    public getConfig(): ITrackConfig {
        return this.trackConfig;
    }

    /**
     * Debug method: Draw drive area boundaries on the track
     * Only used in development mode with physics debug enabled
     */
    public debugDrawBoundary(graphics: Phaser.GameObjects.Graphics): void {
        if (process.env.NODE_ENV !== 'development') {
            return;
        }

        graphics.lineStyle(2, 0xff0000, 1);
        const { outerBoundary, innerBoundaries } = this.trackConfig.driveArea;

        this.drawPolygon(graphics, outerBoundary);
        innerBoundaries?.forEach(hole => this.drawPolygon(graphics, hole));

        // Draw spawn point
        graphics.fillStyle(0x00ff00, 1);
        graphics.fillCircle(
            this.trackConfig.spawnPoint.x,
            this.trackConfig.spawnPoint.y,
            10
        );

        // Draw spawn direction indicator
        const angle = Phaser.Math.DegToRad(this.trackConfig.spawnPoint.angle);
        const dirX = Math.cos(angle) * 30;
        const dirY = Math.sin(angle) * 30;
        graphics.lineStyle(3, 0x00ff00, 1);
        graphics.lineTo(
            this.trackConfig.spawnPoint.x + dirX,
            this.trackConfig.spawnPoint.y + dirY
        );
        graphics.strokePath();
    }

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
     * Cleanup method (called automatically by Phaser)
     */
    preDestroy(): void {
        // Track is static, no listeners or timers to clean up
        // Just null out reference
        this.trackConfig = null as any;
    }
}
```

### Updated Track Configuration

```typescript
// Update to src/config/TrackData.ts - TUTORIAL_TRACK.driveArea

/**
 * Tutorial Circuit Track Configuration
 * 
 * Simple oval track with wide corners for learning basic drift mechanics.
 * Collision boundary defines the drivable area (outer and inner edges).
 */
const TUTORIAL_TRACK: ITrackConfig = {
    id: 'tutorial-circuit',
    name: 'Tutorial Circuit',
    description: 'Learn the basics of drift control',
    difficulty: TrackDifficulty.Tutorial,
    
    imageKey: 'track_tutorial',
    thumbnailKey: 'track_tutorial_thumb',
    
    width: 150,  // Track width in pixels
    
    // Spawn point: Bottom center, facing up toward first turn
    spawnPoint: {
        x: 640,   // Center X of 1280 width
        y: 600,   // Near bottom of 720 height
        angle: 270 // Facing up (270 degrees = north)
    },
    
    // Drive area polygon (outer boundary clockwise, inner hole counter-clockwise)
    driveArea: {
        outerBoundary: [
            { x: 200, y: 150 },   // Top-left outer
            { x: 1080, y: 150 },  // Top-right outer
            { x: 1150, y: 220 },  // Right curve start
            { x: 1150, y: 500 },  // Right curve end
            { x: 1080, y: 570 },  // Bottom-right outer
            { x: 200, y: 570 },   // Bottom-left outer
            { x: 130, y: 500 },   // Left curve start
            { x: 130, y: 220 },   // Left curve end
            { x: 200, y: 150 }    // Close outer boundary
        ],
        innerBoundaries: [
            [
                { x: 350, y: 270 },   // Top-left inner
                { x: 280, y: 340 },   // Left inner curve start
                { x: 280, y: 380 },   // Left inner curve end
                { x: 350, y: 450 },   // Bottom-left inner
                { x: 930, y: 450 },   // Bottom-right inner
                { x: 1000, y: 380 },  // Right inner curve start
                { x: 1000, y: 340 },  // Right inner curve end
                { x: 930, y: 270 },   // Top-right inner
                { x: 350, y: 270 }    // Close inner boundary
            ]
        ]
    },
    
    optimalTime: 30,        // 30 seconds target time
    minimumQuality: 0,      // No quality requirement for tutorial
    
    unlockRequirement: undefined  // Always unlocked
};
```

### GameScene Integration

```typescript
// Addition to src/scenes/GameScene.ts - create() method

import { Track } from '../gameObjects/Track';
import { getTrackById } from '../config/TrackData';

export class GameScene extends Phaser.Scene {
    private track?: Track;
    private debugGraphics?: Phaser.GameObjects.Graphics;

    create(data: { trackId: string }): void {
        // Load track configuration
        const trackConfig = getTrackById(data.trackId);
        if (!trackConfig) {
            console.error(`Track not found: ${data.trackId}`);
            this.scene.start('MenuScene');
            return;
        }

        // Create track background
        this.track = new Track(this, trackConfig);

        // Development mode: Draw debug drive area boundaries
        if (process.env.NODE_ENV === 'development') {
            this.debugGraphics = this.add.graphics();
            this.track.debugDrawBoundary(this.debugGraphics);
        }

        // TODO (Story 2.2.3): Create TrackBoundary collision objects
        // TODO (Story 2.1.2): Create Car at spawn point
    }

    shutdown(): void {
        // Clean up graphics
        if (this.debugGraphics) {
            this.debugGraphics.destroy();
            this.debugGraphics = undefined;
        }
        
        // Track will be destroyed automatically by Phaser
        this.track = undefined;
    }
}
```

---

## Implementation Tasks

### Task 1: Create Track Asset

**Asset Creation:**
- [ ] Design tutorial track layout as simple oval (1280x720 PNG)
- [ ] Clear visual distinction: track surface vs boundaries vs off-track
- [ ] Use contrasting colors (e.g., dark gray track, white boundaries, black off-track)
- [ ] Export as PNG with transparency (or solid background)
- [ ] Optimize file size (target <200KB)
- [ ] Place in `assets/images/tracks/track_tutorial.png`

**Visual Requirements:**
- Oval shape with gentle curves (suitable for learning)
- Track width approximately 150 pixels
- Clear start/spawn position indicator (optional visual cue)
- Simple, minimal aesthetic matching game style

### Task 2: Update Asset Configuration

**File:** `src/config/AssetConfig.ts`

- [ ] Add `TRACK_TUTORIAL` asset key constant
- [ ] Define asset path: `assets/images/tracks/track_tutorial.png`
- [ ] Add to track assets category
- [ ] Ensure PreloadScene loads this asset

### Task 3: Create Track Game Object

**File:** `src/gameObjects/Track.ts`

- [ ] Create Track class extending Phaser.GameObjects.Image
- [ ] Accept scene and ITrackConfig in constructor
- [ ] Position track at scene center
- [ ] Set depth to 0 (behind all other objects)
- [ ] Remove from update list for performance
- [ ] Implement getConfig() accessor method
- [ ] Implement debugDrawBoundary() for development visualization
- [ ] Implement preDestroy() for cleanup

### Task 4: Update Track Configuration

**File:** `src/config/TrackData.ts`

- [ ] Map out tutorial track drive area (outer + inner polygons) by analyzing image
- [ ] Define outer boundary polygon (clockwise, 8-10 points minimum)
- [ ] Define inner boundary polygon (counter-clockwise, creates hole)
- [ ] Update spawn point to match visual starting position
- [ ] Verify spawn point angle (270° for facing up)
- [ ] Test drive area polygons match visual track edges
- [ ] Add detailed comments explaining boundary structure

### Task 5: Integrate Track into GameScene

**File:** `src/scenes/GameScene.ts`

- [ ] Import Track class and getTrackById helper
- [ ] Load track configuration in create() based on scene data
- [ ] Create Track instance with configuration
- [ ] Store track reference as private member
- [ ] In development mode: create debug graphics
- [ ] In development mode: call debugDrawBoundary()
- [ ] Add proper cleanup in shutdown() method
- [ ] Handle invalid track ID (return to menu)

### Task 6: Create Unit Tests

**File:** `tests/gameObjects/Track.test.ts`

- [ ] Test Track constructor creates valid game object
- [ ] Test track is positioned at scene center
- [ ] Test track depth is set to 0
- [ ] Test track is removed from update list
- [ ] Test getConfig() returns correct configuration
- [ ] Test debugDrawBoundary() in development mode
- [ ] Test preDestroy() cleanup
- [ ] Mock Phaser scene and texture dependencies

**File:** `tests/config/TrackData.test.ts` (additions)

- [ ] Test TUTORIAL_TRACK.driveArea outer boundary has minimum 8 points
- [ ] Test outer boundary is clockwise
- [ ] Test inner boundary is counter-clockwise
- [ ] Test boundary points are within game viewport (0-1280, 0-720)
- [ ] Test spawn point is within track boundaries
- [ ] Test spawn point angle is valid (0-360)

### Task 7: Visual Verification

**Manual Testing:**

- [ ] Run game in development mode
- [ ] Start GameScene with tutorial track
- [ ] Verify track background renders correctly
- [ ] Verify debug boundary visualization matches track edges
- [ ] Verify spawn point indicator is in correct position
- [ ] Verify spawn direction arrow points correctly
- [ ] Take screenshots for documentation
- [ ] Verify no console warnings or errors

---

## Testing Requirements

### Unit Test Coverage

**Target:** 100% coverage on Track.ts, updated TrackData.ts validation

**Critical Test Cases:**

1. **Track Game Object**
   - Constructor initializes correctly
   - Positioned at scene center (640, 360)
   - Depth set to 0 (background layer)
   - Removed from update list
   - getConfig() returns provided configuration

2. **Collision Boundary Validation**
   - Minimum 8 points for smooth curves
   - All points within viewport bounds
   - Outer boundary clockwise order
   - Inner boundary counter-clockwise order
   - Polygon forms valid closed shape

3. **Spawn Point Validation**
   - X coordinate within track width
   - Y coordinate within track height
   - Angle between 0-360 degrees
   - Position is on the track (not off-track)

4. **Debug Visualization**
   - debugDrawBoundary() only runs in development
   - Graphics draws complete boundary polygon
   - Spawn point circle rendered
   - Direction arrow rendered at correct angle

### Integration Testing

**Manual Verification:**
- Load GameScene with tutorial track ID
- Verify track renders at correct position
- Verify debug boundary matches visual track
- Test with physics debug mode enabled
- Verify track stays static (no movement or updates)

### Visual Testing

**Acceptance Criteria:**
- Track background is crisp and clear (no blurriness)
- Collision boundary accurately follows track edges (within 5 pixels)
- Spawn point is clearly visible in debug mode
- Track fits completely within game viewport
- No visual artifacts or rendering issues

---

## Definition of Done

### Code Quality
- [ ] All TypeScript strict mode checks pass
- [ ] ESLint passes with zero warnings
- [ ] Track.ts has comprehensive JSDoc comments
- [ ] No `any` types used
- [ ] Proper error handling for missing assets

### Testing
- [ ] All unit tests pass (minimum 15 new tests)
- [ ] 100% code coverage on Track.ts
- [ ] TrackData validation tests updated and passing
- [ ] Manual visual testing completed successfully

### Documentation
- [ ] JSDoc comments on Track class and methods
- [ ] Inline comments explain drive area structure
- [ ] Debug visualization documented in code comments
- [ ] Screenshots of visual track and debug boundary captured

### Visual Quality
- [ ] Track asset is visually clear and matches game style
- [ ] Collision boundary accurately represents drivable area
- [ ] Spawn point is positioned correctly
- [ ] Track renders correctly at all supported resolutions

### Integration
- [ ] GameScene successfully loads and renders track
- [ ] Track integrates with existing scene lifecycle
- [ ] Debug mode properly visualizes boundaries
- [ ] No memory leaks (verified with multiple track loads)

### Performance
- [ ] Track background removed from update list
- [ ] Static rendering (no unnecessary draw calls)
- [ ] Asset loads in <100ms on target hardware
- [ ] 60 FPS maintained with track rendered

### Acceptance
- [ ] All acceptance criteria met
- [ ] Code review completed
- [ ] Visual inspection passed
- [ ] Ready for Story 2.2.3 (TrackBoundary detection system)

---

## Dependencies

**Blocks:**
- Story 2.2.3: TrackBoundary Collision System (needs drive area data)
- Story 2.1.2: Car Game Object (needs spawn point for car placement)
- Story 2.2.4: Track Selection UI (needs visual track for preview/selection)

**Blocked By:**
- Story 2.2.1: TrackData Configuration Structure (COMPLETE - provides ITrackConfig interface)

**Related:**
- Story 1.3.x: Asset Loading System (track image must be loaded via AssetManager)
- Story 1.2.x: GameScene Foundation (scene must exist to render track)

---

## Notes

### Collision Boundary Accuracy

The drive area must accurately represent the drivable track area. Use these guidelines:
- **Outer Boundary**: Follow the outer edge of the track surface (where off-track begins)
- **Inner Boundary**: Follow the inner edge of the track surface
- **Point Spacing**: Use more points on curves, fewer on straight sections
- **Testing**: Overlay debug visualization on track to verify accuracy

### Asset Creation Guidelines

If creating the track asset from scratch:
- Use vector graphics tool (Illustrator, Figma, Inkscape) for clean lines
- Export at 1280x720 exactly (matches game viewport)
- Use high contrast colors for clarity
- Keep file size under 200KB (PNG-8 or optimized PNG-24)
- Consider using procedural generation for future tracks

### Development Debug Mode

The debug visualization is crucial for verifying drive area boundaries during development:
- Red lines: drive area polygons
- Green circle: spawn point position
- Green arrow: spawn direction (initial car orientation)
- Only rendered when `NODE_ENV === 'development'`

### Performance Considerations

Tracks are completely static and should never update:
- ✅ Removed from update list immediately
- ✅ No physics body on track background
- ✅ Static texture (no animations)
- ✅ Depth set once at creation
- ❌ Never call update() on track objects

---

**Story Created:** 2025-11-09  
**Created By:** Jordan (Game Scrum Master)  
**Epic:** Epic 2.2: Track System  
**Architecture Version:** 1.1
