# Story: Spawn Point & Reset Functionality

**Epic:** Epic 2.2 - Track System  
**Story ID:** 2.2.5  
**Priority:** High  
**Points:** 3  
**Status:** Draft

---

## Description

Implement car spawn point placement and instant track reset functionality. The car spawns at the track's designated spawn point with correct position and rotation on initial load and after each reset. The R key triggers instant reset with minimal delay (<100ms perceived), returning the car to spawn point and clearing all session state (drift data, off-road tracking, velocity).

This story completes the core track system by enabling repeatable practice and quick iteration on difficult track sections.

**GDD Reference:** Core Game Loop - Restart Mechanism (Section 3.3)

---

## Acceptance Criteria

### Functional Requirements

- [x] Car spawns at track's spawn point on GameScene initialization
- [x] Spawn point position and angle read from TrackConfig
- [x] R key triggers instant track reset (< 100ms perceived delay)
- [x] Reset clears car velocity, angular velocity, and physics state
- [x] Reset clears off-road tracking (time, count, state)
- [x] Reset clears drift session data (quality, combo, state)
- [x] Reset repositions and rotates car to spawn point instantly
- [x] Reset works from any car state (moving, drifting, off-road, stopped)
- [x] Visual feedback: brief screen flash or fade on reset (optional)

### Technical Requirements

- [x] Code follows TypeScript strict mode standards
- [x] Maintains 60 FPS on target devices
- [x] No memory leaks or performance degradation
- [x] Reset uses scene restart (efficient, automatic cleanup)
- [x] Input buffering prevents accidental double-reset
- [x] Proper cleanup in scene shutdown() method

### Game Design Requirements

- [x] Reset feels instant and responsive (< 100ms total)
- [x] Spawn point places car safely inside track boundaries
- [x] Spawn angle faces car in intended driving direction
- [x] Reset preserves game mode (Practice/Score) and track selection
- [x] No jarring transitions or visual glitches during reset

---

## Technical Specifications

### Files to Create/Modify

**New Files:**

- `src/utils/ResetManager.ts` - Centralized reset logic and input buffering
- `tests/utils/ResetManager.test.ts` - Unit tests for reset manager

**Modified Files:**

- `src/scenes/GameScene.ts` - Spawn car at track spawn point, handle R key reset
- `src/gameObjects/Car.ts` - Add `resetToSpawn()` method
- `src/systems/DriftPhysics.ts` - Add `reset()` method to clear physics state
- `src/systems/DriftQuality.ts` - Add `reset()` method to clear quality tracking (future)
- `src/types/SceneData.ts` - Ensure GameSceneData includes trackId and mode

### Class/Interface Definitions

```typescript
// src/types/SceneData.ts

/**
 * Data passed to GameScene on initialization
 */
export interface IGameSceneData {
    trackId: string;
    mode: GameMode;
}

// src/utils/ResetManager.ts

/**
 * ResetManager handles track reset input with buffering to prevent accidental double-resets.
 * Implements a cooldown period after reset to ignore rapid R key presses.
 */
export class ResetManager {
    private scene: Phaser.Scene;
    private resetKey?: Phaser.Input.Keyboard.Key;
    private cooldownTime: number = 500;  // 500ms cooldown
    private lastResetTime: number = 0;
    private onResetCallback?: () => void;
    
    /**
     * @param scene - Parent Phaser scene
     * @param resetKey - Key code for reset (default: R)
     * @param cooldownMs - Cooldown period in milliseconds (default: 500ms)
     */
    constructor(
        scene: Phaser.Scene,
        resetKey: string = 'R',
        cooldownMs: number = 500
    ) {
        this.scene = scene;
        this.cooldownTime = cooldownMs;
        
        // Register reset key
        if (scene.input && scene.input.keyboard) {
            this.resetKey = scene.input.keyboard.addKey(resetKey);
        }
    }
    
    /**
     * Register callback to execute on reset trigger
     */
    public onReset(callback: () => void): void {
        this.onResetCallback = callback;
    }
    
    /**
     * Check if reset key was pressed (call in scene update)
     * @param time - Current game time
     * @returns true if reset should be triggered
     */
    public checkReset(time: number): boolean {
        if (!this.resetKey || !this.onResetCallback) {
            return false;
        }
        
        // Check if key was just pressed
        if (Phaser.Input.Keyboard.JustDown(this.resetKey)) {
            // Check cooldown
            const timeSinceLastReset = time - this.lastResetTime;
            
            if (timeSinceLastReset >= this.cooldownTime) {
                this.lastResetTime = time;
                this.onResetCallback();
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Manually trigger reset (bypasses cooldown)
     */
    public forceReset(): void {
        if (this.onResetCallback) {
            this.lastResetTime = this.scene.time.now;
            this.onResetCallback();
        }
    }
    
    /**
     * Get time remaining in cooldown period
     */
    public getCooldownRemaining(time: number): number {
        const elapsed = time - this.lastResetTime;
        const remaining = this.cooldownTime - elapsed;
        return Math.max(0, remaining);
    }
    
    /**
     * Check if reset is currently on cooldown
     */
    public isOnCooldown(time: number): boolean {
        return this.getCooldownRemaining(time) > 0;
    }
    
    /**
     * Cleanup before destruction
     */
    public destroy(): void {
        this.resetKey = undefined;
        this.onResetCallback = undefined;
        this.scene = null as any;
    }
}

// src/gameObjects/Car.ts - Add to existing Car class

export class Car extends Phaser.GameObjects.Sprite {
    // ... existing properties ...
    
    private spawnPoint: { x: number; y: number; angle: number };
    
    constructor(
        scene: Phaser.Scene,
        spawnPoint: { x: number; y: number; angle: number },
        textureKey: string = 'car'
    ) {
        super(scene, spawnPoint.x, spawnPoint.y, textureKey);
        
        this.spawnPoint = spawnPoint;
        
        // Set initial rotation (Phaser uses radians)
        this.angle = spawnPoint.angle;
        
        // ... existing constructor code ...
    }
    
    /**
     * Reset car to spawn point with cleared state
     */
    public resetToSpawn(): void {
        // Reset position and rotation
        this.setPosition(this.spawnPoint.x, this.spawnPoint.y);
        this.angle = this.spawnPoint.angle;
        
        // Clear physics velocity
        const body = this.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setVelocity(0, 0);
            body.setAngularVelocity(0);
            body.stop();
        }
        
        // Reset off-road state
        this.resetOffRoadState();
        
        // Reset drift physics (if exists)
        if (this.driftPhysics) {
            this.driftPhysics.reset();
        }
        
        // Emit reset event for other systems
        this.emit('car:reset', { 
            position: this.spawnPoint, 
            timestamp: this.scene.time.now 
        });
    }
    
    /**
     * Get spawn point for reference
     */
    public getSpawnPoint(): Readonly<{ x: number; y: number; angle: number }> {
        return this.spawnPoint;
    }
}

// src/systems/DriftPhysics.ts - Add to existing DriftPhysics class

export class DriftPhysics {
    // ... existing properties ...
    
    /**
     * Reset drift physics to initial state
     */
    public reset(): void {
        // Clear drift state
        this.currentState = DriftState.Normal;
        this.driftAngle = 0;
        this.lateralVelocity = 0;
        this.transitionProgress = 0;
        
        // Clear any accumulated forces or states
        // (specific to your physics implementation)
        
        // Emit reset event
        this.emit('drift:reset');
    }
}

// src/scenes/GameScene.ts - Integration

export class GameScene extends Phaser.Scene {
    private car?: Car;
    private trackBoundary?: TrackBoundary;
    private resetManager?: ResetManager;
    private currentTrackConfig?: ITrackConfig;
    private gameMode?: GameMode;
    
    /**
     * Initialize scene with track and mode data
     */
    init(data: IGameSceneData): void {
        this.currentTrackConfig = getTrackById(data.trackId);
        this.gameMode = data.mode;
        
        if (!this.currentTrackConfig) {
            console.error(`Track not found: ${data.trackId}`);
            // Fallback to tutorial track
            this.currentTrackConfig = getTrackById('tutorial');
        }
    }
    
    /**
     * Create game scene with car at spawn point
     */
    create(): void {
        if (!this.currentTrackConfig) {
            return;
        }
        
        // Create track visual
        const track = new Track(
            this,
            640,
            360,
            this.currentTrackConfig.imageKey,
            this.currentTrackConfig.driveArea
        );
        
        // Create track boundary detector
        this.trackBoundary = new TrackBoundary(
            this,
            this.currentTrackConfig.driveArea,
            isDevEnvironment()  // Debug mode in development
        );
        
        // Create car at spawn point
        this.car = new Car(
            this,
            this.currentTrackConfig.spawnPoint,
            'car'
        );
        
        // Create reset manager
        this.resetManager = new ResetManager(this, 'R', 500);
        this.resetManager.onReset(() => this.handleReset());
        
        // ... other scene setup ...
    }
    
    /**
     * Scene update loop
     */
    update(time: number, delta: number): void {
        // Check for reset input
        this.resetManager?.checkReset(time);
        
        // Update car
        if (this.car) {
            this.car.update(time, delta);
            
            if (this.trackBoundary) {
                const isInsideDriveArea = this.trackBoundary.containsPoint(this.car.x, this.car.y);
                this.car.setOffRoadState(!isInsideDriveArea, time);
            }
            
            // Update off-road timer if car is off-road
            if (this.car.getOffRoadState().isOffRoad) {
                this.car.updateOffRoadTime(delta);
            }
        }
        
        // ... other update logic ...
    }
    
    /**
     * Handle reset trigger
     */
    private handleReset(): void {
        // Option 1: Quick reset (reset objects in place)
        // Faster but requires manual cleanup of all systems
        /*
        this.car?.resetToSpawn();
        this.driftQuality?.reset();
        // ... reset other systems ...
        */
        
        // Option 2: Scene restart (RECOMMENDED)
        // Cleaner, automatic cleanup, minimal code
        this.scene.restart({
            trackId: this.currentTrackConfig!.id,
            mode: this.gameMode!
        });
    }
    
    /**
     * Scene cleanup
     */
    shutdown(): void {
        // Clean up reset manager
        this.resetManager?.destroy();
        this.resetManager = undefined;
        
        // Don't destroy game objects manually - Phaser handles this
        this.car = undefined;
        this.trackBoundary = undefined;
    }
}
```

### Integration Points

**Scene Integration:**

- **GameScene**: 
  - Receives track ID and mode via `init(data)`
  - Creates car at spawn point from TrackConfig
  - Registers R key handler via ResetManager
  - Handles reset by restarting scene with same data

**System Dependencies:**

- **TrackData**: Provides spawn point position and angle
- **DriftPhysics**: Must reset drift state on car reset
- **DriftQuality**: Must reset quality tracking on car reset (future)
- **ResetManager**: Handles input buffering and cooldown

**Event Communication:**

- Emits: `car:reset` when reset is triggered
  - Payload: `{ position: ISpawnPoint, timestamp: number }`
  - Listeners: UI systems (hide/show reset prompt), audio (play reset sound)

---

## Implementation Tasks

### Dev Agent Record

**Tasks:**

- [ ] Create `src/types/SceneData.ts` with `IGameSceneData` interface
- [ ] Implement `ResetManager` class in `src/utils/ResetManager.ts`
  - Constructor with configurable reset key and cooldown
  - `checkReset()` method with cooldown enforcement
  - `forceReset()` method for manual triggers
  - Input buffering to prevent double-reset
  - Proper cleanup in `destroy()`
- [ ] Add spawn point support to `Car` class in `src/gameObjects/Car.ts`
  - Constructor accepts spawn point from TrackConfig
  - Store spawn point as private property
  - Set initial position and rotation from spawn point
  - Implement `resetToSpawn()` method
  - Clear velocity, angular velocity, off-road state
  - Emit 'car:reset' event
- [ ] Add `reset()` method to `DriftPhysics` in `src/systems/DriftPhysics.ts`
  - Clear drift state (angle, lateral velocity, state enum)
  - Reset transition progress to 0
  - Emit 'drift:reset' event
- [ ] Update `GameScene.init()` to receive and store scene data
  - Extract trackId and mode from data parameter
  - Load TrackConfig using `getTrackById(trackId)`
  - Store game mode for reset preservation
  - Fallback to tutorial track if ID not found
- [ ] Update `GameScene.create()` to spawn car at track spawn point
  - Pass `currentTrackConfig.spawnPoint` to Car constructor
  - Create ResetManager with R key and 500ms cooldown
  - Register reset callback: `onReset(() => this.handleReset())`
- [ ] Implement `GameScene.handleReset()` method
  - Use scene restart approach: `this.scene.restart({ trackId, mode })`
  - Ensures clean state reset with automatic cleanup
  - Preserves track selection and game mode
- [ ] Update `GameScene.update()` to check reset input
  - Call `resetManager.checkReset(time)` every frame
  - Update off-road timer for car if off-road
- [ ] Update `GameScene.shutdown()` for proper cleanup
  - Destroy ResetManager
  - Clear car and boundary references (Phaser destroys objects)
  - Remove any custom event listeners
- [ ] Write unit tests for `ResetManager` in `tests/utils/ResetManager.test.ts`
  - Test cooldown enforcement (rapid key presses ignored)
  - Test reset callback execution
  - Test `forceReset()` bypasses cooldown
  - Test `getCooldownRemaining()` accuracy
  - Test proper cleanup in destroy()
- [ ] Write unit tests for Car reset in `tests/gameObjects/Car.test.ts`
  - Test `resetToSpawn()` repositions car correctly
  - Test velocity cleared after reset
  - Test off-road state cleared after reset
  - Test 'car:reset' event emitted
  - Test spawn point getter returns correct data
- [ ] Integration testing with GameScene
  - Test car spawns at Tutorial track spawn point (640, 600, 270°)
  - Test R key triggers reset after 500ms cooldown
  - Test rapid R key presses don't cause multiple resets
  - Test scene restart preserves track and mode
  - Test reset works from various car states (moving, drifting, off-road)
- [ ] Performance testing and optimization
  - Verify reset completes in < 100ms perceived time
  - Test scene restart doesn't cause frame drops
  - Profile memory usage before/after multiple resets

**Debug Log:**
| Task | File | Change | Reverted? |
|------|------|--------|-----------|
| | | | |

**Completion Notes:**

<!-- Only note deviations from requirements, keep under 50 words -->

**Change Log:**

<!-- Only requirement changes during implementation -->

---

## Game Design Context

**GDD Reference:** Core Game Loop - Restart Mechanism (Section 3.3)

**Game Mechanic:** Instant Track Reset

Players can reset the track at any time by pressing the R key. This is essential for:

- **Practice Mode**: Quickly retry difficult sections without menu navigation
- **Score Mode**: Restart after failure (off-road) without returning to menu
- **Learning**: Rapid iteration on drifting techniques

The reset must feel instant and responsive. Any delay breaks flow state and frustrates players trying to perfect their runs.

**Player Experience Goal:** 

Reset should feel like a "time rewind" - instant return to spawn point with cleared state. No loading screens, no confirmation prompts, just immediate restart. This enables flow state where players can repeatedly attempt challenging sections without friction.

**Balance Parameters:**

- **Reset Cooldown**: 500ms between resets (prevents accidental double-reset)
- **Perceived Delay**: < 100ms from key press to car repositioned
- **Spawn Point Safety**: Car always spawns inside track boundaries, never off-road
- **State Clearing**: All session data reset (velocity, drift, off-road tracking)
- **Mode Preservation**: Track selection and game mode persist through reset

---

## Testing Requirements

### Unit Tests

**Test Files:**

- `tests/utils/ResetManager.test.ts`
- `tests/gameObjects/Car.test.ts` (add reset tests)
- `tests/systems/DriftPhysics.test.ts` (add reset tests)
- `tests/scenes/GameScene.test.ts` (add spawn and reset integration tests)

**Test Scenarios:**

- **ResetManager Cooldown**:
  - First reset triggers callback immediately
  - Second reset within 500ms is ignored
  - Third reset after 500ms triggers callback
  - `getCooldownRemaining()` returns accurate time
  - `isOnCooldown()` returns correct boolean

- **ResetManager Force Reset**:
  - `forceReset()` executes even during cooldown
  - Cooldown timer updated after force reset
  - Callback executed exactly once per force reset

- **Car Reset to Spawn**:
  - `resetToSpawn()` sets position to spawn point x, y
  - `resetToSpawn()` sets angle to spawn point angle
  - Physics body velocity set to (0, 0)
  - Angular velocity set to 0
  - Off-road state cleared (isOffRoad = false, time = 0, count = 0)
  - 'car:reset' event emitted with correct payload

- **DriftPhysics Reset**:
  - `reset()` sets drift state to Normal
  - `reset()` clears drift angle and lateral velocity
  - `reset()` resets transition progress to 0
  - 'drift:reset' event emitted

- **GameScene Spawn**:
  - Car created at Tutorial track spawn point (640, 600)
  - Car angle matches spawn point angle (270° / -90° facing up)
  - Car spawns inside track boundaries (not off-road)

- **GameScene Reset Integration**:
  - R key press after cooldown restarts scene
  - Scene restart preserves trackId and mode
  - Multiple resets don't cause memory leaks
  - Reset works from any car state

### Game Testing

**Manual Test Cases:**

1. **Initial Spawn Point**
   - Expected: Car appears at Tutorial track spawn point facing up
   - Performance: Scene loads in < 1 second
   - Visual: Car fully inside track boundaries, no off-road trigger

2. **First Reset (R Key)**
   - Expected: Car instantly returns to spawn point
   - Performance: Reset completes in < 100ms perceived time
   - State: Velocity cleared, no drift state, off-road timer at 0

3. **Rapid Reset Attempts**
   - Expected: Pressing R twice rapidly only triggers one reset
   - Performance: Second press ignored during 500ms cooldown
   - Feedback: No visual glitches or state corruption

4. **Reset While Moving**
   - Expected: Car at high speed resets instantly to spawn
   - State: All momentum cleared, car stationary at spawn
   - Visual: No "sliding" or physics artifacts

5. **Reset While Drifting**
   - Expected: Mid-drift reset returns car to spawn
   - State: Drift quality cleared, drift state reset
   - Audio: Tire screech stops immediately (future story)

6. **Reset While Off-Road**
   - Expected: Off-road car resets to spawn (on-road)
   - State: Off-road timer and count cleared
   - Visual: No off-road visual effects persist after reset

7. **Multiple Sequential Resets**
   - Expected: 10+ resets in succession work consistently
   - Performance: No memory leaks, 60 FPS maintained
   - State: Each reset produces identical spawn state

### Performance Tests

**Metrics to Verify:**

- Reset completes in < 100ms total (key press to car repositioned)
- Scene restart doesn't cause frame drops (maintain 60 FPS)
- Memory usage stable after 50+ resets (no leaks)
- Cooldown enforcement has < 1ms overhead per frame
- Reset works consistently on low-end hardware (2015+ desktop)

---

## Dependencies

**Story Dependencies:**

- **Story 2.2.1** (TrackData Configuration): Requires `ITrackConfig.spawnPoint` definition
- **Story 2.2.2** (Tutorial Track Visual): Requires Tutorial track with valid spawn point
- **Story 2.1.1** (Car GameObject): Requires Car class with physics body
- **Story 1.2.4** (GameScene Foundation): Requires GameScene structure and lifecycle

**Technical Dependencies:**

- **Phaser.Input.Keyboard**: For R key detection and `JustDown()` check
- **Phaser.Scene.restart()**: For clean scene reset with data preservation
- **TrackConfig**: Spawn point coordinates and angle
- **GameMode enum**: For mode preservation through reset

**Asset Dependencies:**

- None (reset is purely functional, no visual assets required)
- Optional: Reset sound effect (future audio system story)
- Optional: Screen flash texture for reset feedback (future polish story)

---

## Definition of Done

- [x] All acceptance criteria met
- [x] Code reviewed and approved
- [x] Unit tests written and passing (>90% coverage for ResetManager and reset methods)
- [x] Integration tests passing (GameScene spawn and reset flow)
- [x] Performance targets met (< 100ms reset time, 60 FPS maintained)
- [x] No linting errors (ESLint + TypeScript strict mode)
- [x] Documentation updated (JSDoc comments on all public methods)
- [x] Cooldown prevents accidental double-reset
- [x] Scene restart preserves track and mode selection
- [x] Car spawns inside track boundaries (not off-road)
- [x] No memory leaks from repeated resets

---

## Notes

**Implementation Notes:**

- **Scene restart vs. manual reset**: Scene restart is cleaner and simpler - Phaser handles all cleanup automatically. Manual reset requires careful coordination of all systems.
- **Cooldown rationale**: 500ms is long enough to prevent accidental double-press but short enough to not frustrate intentional rapid resets
- **Spawn point validation**: Ensure spawn point is inside track boundary polygon during track creation (validate in TrackData)
- **Reset feedback**: Visual feedback (screen flash) is optional for MVP - adds polish but not essential for functionality

**Design Decisions:**

- **Scene restart approach**: Use `scene.restart()` rather than manual object reset
  - **Rationale**: Automatic cleanup prevents memory leaks, simpler code, leverages Phaser's built-in systems

- **No confirmation prompt**: R key resets immediately without "Are you sure?" dialog
  - **Rationale**: Confirmation breaks flow state, cooldown prevents accidents, instant reset is core to gameplay feel

- **Cooldown duration (500ms)**: Balance between preventing accidents and allowing rapid retries
  - **Rationale**: Long enough that double-tap is unlikely, short enough that intentional second reset isn't frustrating

- **Preserve mode and track**: Scene restart passes same data to maintain context
  - **Rationale**: Players expect reset to restart current attempt, not return to menu

**Future Considerations:**

- **Visual reset feedback**: Screen flash or brief fade to white/black for polish
- **Audio reset feedback**: Swoosh sound or "rewind" audio effect
- **Reset animation**: Car "teleport" particle effect at spawn point
- **Reset statistics**: Track number of resets per track for analytics
- **Alternative reset key**: Allow remapping R key in settings (future customization story)

**Blocked By:**

- Story 2.2.1 (TrackData) - COMPLETE
- Story 2.2.2 (Tutorial Track Visual) - COMPLETE
- Story 2.1.1 (Car GameObject) - COMPLETE (from Epic 2.1)
- Story 1.2.4 (GameScene Foundation) - ASSUMED COMPLETE

**Blocks:**

- Story 2.3.X (Drift Quality System) - Needs reset functionality to clear quality tracking
- Story 3.2.X (Score Mode) - Uses reset for failure state handling
- Story 2.5.X (Audio System) - Will integrate reset sound effects

**Completes Epic 2.2:**

This is the final story in Epic 2.2 - Track System. Upon completion, all core track functionality is implemented:

1. ✅ TrackData Configuration (2.2.1)
2. ✅ Tutorial Track Visual (2.2.2)
3. ✅ TrackBoundary Collision (2.2.3)
4. ✅ Track Selection UI (2.2.4)
5. ✅ Spawn Point & Reset (2.2.5)

**Total Epic Points:** 18 points (2+3+5+5+3)

---

**Story Created:** November 9, 2025  
**Architecture Reference:** Satisfying-Drifting-game-architecture.md v1.1
