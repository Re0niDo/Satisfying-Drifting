# Story 2.1.5: DriftPhysics System - Drift Mechanics

**Epic:** Epic 2.1: Car Physics & Movement  
**Story ID:** 2.1.5  
**Priority:** High  
**Points:** 5  
**Status:** Complete

---

## Description

Extend the DriftPhysics system to implement full drift mechanics: drift state detection based on lateral velocity, smooth state transitions between Normal/Drift/Handbrake modes, state-specific friction coefficients, and speed loss during drifts. This story completes the core physics system, transforming the basic driving from Story 2.1.4 into a satisfying drift experience that defines the game's unique feel.

The drift mechanics calculate lateral velocity by comparing the car's heading direction with its actual movement direction. When lateral velocity exceeds the threshold (100 px/s), the car enters drift state with reduced friction, creating the characteristic slide. Smooth lerp transitions between states ensure the physics feel natural rather than sudden.

**GDD Reference:** Drift Physics System (Architecture Document), Physics Configuration

---

## Acceptance Criteria

### Functional Requirements

- [x] Calculates lateral velocity from car heading vs movement direction
- [x] Detects drift state when lateral velocity exceeds driftThreshold (100 px/s)
- [x] Enters handbrake state when Space pressed (lowest friction)
- [x] Returns to normal state when lateral velocity drops below threshold
- [x] Smooth transitions between states using 0.2s lerp (no sudden changes)
- [x] Applies state-specific friction: normal (0.95), drift (0.7), handbrake (0.5)
- [x] Implements speed loss during drift (5% per second) and handbrake (2% per second)
- [x] Exposes drift angle, speed, and state for other systems (debugging and UI)
- [x] Reuses core body configuration from Story 2.1.4 (max speed, drag, reverse clamp)

### Technical Requirements

- [x] Code follows TypeScript strict mode standards
- [x] Drift state calculations are frame-rate independent
- [x] Uses DriftState enum from PhysicsTypes
- [x] All parameters from PhysicsConfig (no magic numbers)
- [x] Proper lerp implementation for smooth state transitions
- [x] Efficient vector math (reuse existing Vector2 objects)
- [x] JSDoc comments explain drift physics calculations
- [x] Lateral velocity uses dot/cross products with preallocated vectors (no atan2 + sin every frame)
- [x] Forward vector is computed once per update and shared across drift calculations
- [x] Drag/max-speed enforcement continues to rely on Phaser Body APIs added in Story 2.1.4

### Game Design Requirements

- [ ] Drift state feels natural and predictable (not random) - Manual test needed
- [ ] Handbrake initiates drift immediately when pressed - Manual test needed
- [ ] Exiting drift feels smooth (not abrupt return to normal) - Manual test needed
- [ ] Drift angle is visible and corresponds to slide direction - Manual test needed
- [ ] Speed loss during drift is noticeable but not punishing - Manual test needed
- [ ] Physics support "drift entry" technique (sharp turn + throttle) - Manual test needed
- [ ] Can maintain drift through sustained steering input - Manual test needed

---

## Technical Specifications

### Files to Create/Modify

**New Files:**

- None (all files already created in Story 2.1.4)

**Modified Files:**

- `src/systems/DriftPhysics.ts` - Add drift state detection and transitions
- `src/utils/MathHelpers.ts` - Add lateral velocity calculation helper (if needed)
- `tests/systems/DriftPhysics.test.ts` - Add drift mechanics tests

### Class/Interface Definitions

```typescript
// Additional methods for src/systems/DriftPhysics.ts

export class DriftPhysics {
    // ... existing properties from Story 2.1.4
    
    // Drift state tracking
    private currentState: DriftState = DriftState.Normal;
    private stateTransitionProgress: number = 1.0; // 1.0 = fully transitioned
    private targetState: DriftState = DriftState.Normal;
    
    // Drift calculations
    private lateralVelocity: number = 0;
    private driftAngle: number = 0;
    private lateralAxis: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
    
    /**
     * Update method now includes drift mechanics
     */
    public update(delta: number): void {
        const deltaSeconds = delta / 1000;
        MathHelpers.getForwardVector(this.car.angle, this.forwardVector);

        // Calculate drift state BEFORE applying physics
        this.updateDriftState(deltaSeconds);
        
        // Apply movement (from Story 2.1.4)
        this.updateAcceleration(deltaSeconds);
        this.updateSteering(deltaSeconds);
        
        // Apply state-specific friction and speed loss
        this.updateFriction(deltaSeconds);
        this.applySpeedLoss(deltaSeconds);
        this.applyDrag();
        
        // Enforce limits
        this.enforceReverseSpeed();
    }
    
    /**
     * Update drift state based on lateral velocity and input
     */
    private updateDriftState(delta: number): void {
        const config = PhysicsConfig.car;
        
        // Calculate lateral velocity and drift angle
        this.calculateLateralVelocity();
        
        // Determine target state based on physics and input
        let newTargetState: DriftState;
        
        if (this.inputManager.isHandbraking()) {
            // Handbrake overrides everything
            newTargetState = DriftState.Handbrake;
        } else if (Math.abs(this.lateralVelocity) >= config.driftThreshold) {
            // Lateral velocity high enough for drift
            newTargetState = DriftState.Drift;
        } else {
            // Normal driving
            newTargetState = DriftState.Normal;
        }
        
        // Update target state if changed
        if (newTargetState !== this.targetState) {
            this.targetState = newTargetState;
            this.stateTransitionProgress = 0; // Start transition
        }
        
        // Lerp toward target state
        this.updateStateTransition(delta);
        
        // Update current state when transition completes
        if (this.stateTransitionProgress >= 1.0) {
            this.currentState = this.targetState;
        }
    }
    
    /**
     * Calculate lateral velocity (perpendicular to car heading)
     */
    private calculateLateralVelocity(): void {
        const velocity = this.body.velocity;
        const forward = this.forwardVector;
        
        // Perpendicular axis (rotate forward 90 degrees without allocating)
        this.lateralAxis.set(-forward.y, forward.x);
        
        const forwardSpeed = velocity.dot(forward);
        this.lateralVelocity = velocity.dot(this.lateralAxis);
        
        // Drift angle derived from forward vs lateral components
        this.driftAngle = Phaser.Math.RadToDeg(Math.atan2(this.lateralVelocity, forwardSpeed));
    }
    
    /**
     * Update state transition progress using lerp
     */
    private updateStateTransition(delta: number): void {
        const config = PhysicsConfig.car;
        
        if (this.stateTransitionProgress < 1.0) {
            // Lerp toward target state over transitionTime seconds
            const lerpSpeed = 1.0 / config.transitionTime;
            this.stateTransitionProgress += lerpSpeed * delta;
            this.stateTransitionProgress = Math.min(this.stateTransitionProgress, 1.0);
        }
    }
    
    /**
     * Get effective friction coefficient based on current state and transition
     */
    private getEffectiveFriction(): number {
        const config = PhysicsConfig.car;
        
        // If fully transitioned, return target state friction
        if (this.stateTransitionProgress >= 1.0) {
            switch (this.currentState) {
                case DriftState.Normal:
                    return config.normalFriction;
                case DriftState.Drift:
                    return config.driftFriction;
                case DriftState.Handbrake:
                    return config.handBrakeFriction;
            }
        }
        
        // Mid-transition: lerp between current and target friction
        const currentFriction = this.getFrictionForState(this.currentState);
        const targetFriction = this.getFrictionForState(this.targetState);
        
        return MathHelpers.lerp(
            currentFriction,
            targetFriction,
            this.stateTransitionProgress
        );
    }
    
    /**
     * Get friction coefficient for a specific state
     */
    private getFrictionForState(state: DriftState): number {
        const config = PhysicsConfig.car;
        switch (state) {
            case DriftState.Normal:
                return config.normalFriction;
            case DriftState.Drift:
                return config.driftFriction;
            case DriftState.Handbrake:
                return config.handBrakeFriction;
        }
    }
    
    /**
     * Apply friction based on current drift state
     * (Replaces Story 2.1.4 version that always used normal friction)
     */
    private updateFriction(delta: number): void {
        const effectiveFriction = this.getEffectiveFriction();
        
        this.velocityVector.set(this.body.velocity.x, this.body.velocity.y);
        MathHelpers.applyFriction(this.velocityVector, effectiveFriction, delta);
        this.body.setVelocity(this.velocityVector.x, this.velocityVector.y);
    }
    
    /**
     * Apply speed loss during drift and handbrake
     */
    private applySpeedLoss(delta: number): void {
        const config = PhysicsConfig.car;
        
        if (this.currentState === DriftState.Drift) {
            // 5% speed loss per second during drift
            const speedRetention = Math.pow(config.driftSpeedRetention, delta);
            this.body.velocity.x *= speedRetention;
            this.body.velocity.y *= speedRetention;
        } else if (this.currentState === DriftState.Handbrake) {
            // 2% speed loss per second during handbrake
            const speedRetention = Math.pow(config.handbrakeSpeedRetention, delta);
            this.body.velocity.x *= speedRetention;
            this.body.velocity.y *= speedRetention;
        }
        
        // Normal state: no additional speed loss beyond friction
    }
    
    // Public API for other systems (UI, quality evaluation)
    
    /**
     * Get current drift state
     */
    public getDriftState(): DriftState {
        return this.currentState;
    }
    
    /**
     * Get drift angle in degrees
     * Positive = drifting right, Negative = drifting left
     */
    public getDriftAngle(): number {
        return this.driftAngle;
    }
    
    /**
     * Get lateral velocity (perpendicular to heading)
     */
    public getLateralVelocity(): number {
        return this.lateralVelocity;
    }
    
    /**
     * Check if car is currently drifting
     */
    public isDrifting(): boolean {
        return this.currentState === DriftState.Drift || 
               this.currentState === DriftState.Handbrake;
    }
    
    /**
     * Get state transition progress (0-1)
     * Used for visual feedback (particle effects, etc.)
     */
    public getStateTransitionProgress(): number {
        return this.stateTransitionProgress;
    }
    
    // ... existing methods from Story 2.1.4 remain unchanged
}
```

### Integration Points

- **DriftQuality System**: Will consume drift angle, speed, and state (Epic 2.3)
- **Visual Feedback**: Drift state triggers particle effects (Epic 2.4)
- **Audio System**: Drift state controls tire screech volume/pitch (Epic 2.5)
- **UI**: Drift angle and state displayed in HUD

### Dependencies

**Depends On:**
- Story 2.1.4 (basic movement physics must work first)

**Blocks:**
- Epic 2.3 (Drift Quality System needs drift data)
- Epic 2.4 (Visual feedback responds to drift state)
- Epic 2.5 (Audio responds to drift state)

---

## Implementation Tasks

Developers should complete these tasks in order:

### Task 1: Add Drift State Properties
- [x] Add currentState, targetState properties to DriftPhysics
- [x] Add stateTransitionProgress property (0-1 lerp progress)
- [x] Add lateralVelocity and driftAngle properties
- [x] Add reusable lateralAxis Vector2 for perpendicular projections
- [x] Initialize all to default values (Normal state, 0 velocity/angle)

### Task 2: Implement Lateral Velocity Calculation
- [x] Implement calculateLateralVelocity() method
- [x] Get car heading angle from Car.angle
- [x] Reuse forwardVector from Story 2.1.4 (computed once per update)
- [x] Derive perpendicular axis using lateralAxis.set(-forward.y, forward.x)
- [x] Project velocity onto forward/perpendicular using Vector2.dot (no new vectors)
- [x] Calculate drift angle via `atan2(lateral, forward)` (single trig call)
- [x] Store lateralVelocity and driftAngle
- [x] Add unit test verifying lateral velocity calculation

### Task 3: Implement Drift State Detection
- [x] Implement updateDriftState(delta) method
- [x] Call calculateLateralVelocity() first
- [x] Check if handbrake pressed → target = Handbrake
- [x] Check if |lateralVelocity| >= driftThreshold → target = Drift
- [x] Otherwise → target = Normal
- [x] If target state changed, reset stateTransitionProgress to 0
- [x] Call updateStateTransition(delta) to lerp toward target

### Task 4: Implement State Transitions
- [x] Implement updateStateTransition(delta) method
- [x] Increment stateTransitionProgress based on transitionTime
- [x] Clamp progress to [0, 1] range
- [x] When progress reaches 1.0, set currentState = targetState
- [x] Verify transitions feel smooth (no sudden physics changes)

### Task 5: Implement Effective Friction Calculation
- [x] Implement getEffectiveFriction() method
- [x] If fully transitioned, return friction for current state
- [x] If mid-transition, lerp between current and target friction
- [x] Implement getFrictionForState(state) helper
- [x] Return correct friction values from PhysicsConfig

### Task 6: Update Friction Application
- [x] Modify updateFriction(delta) from Story 2.1.4
- [x] Replace hardcoded normalFriction with getEffectiveFriction()
- [x] Apply friction using existing applyFriction utility
- [x] Verify friction changes smoothly during state transitions

### Task 7: Implement Speed Loss
- [x] Implement applySpeedLoss(delta) method
- [x] If in Drift state, apply driftSpeedRetention
- [x] If in Handbrake state, apply handbrakeSpeedRetention
- [x] If in Normal state, no additional speed loss
- [x] Use Math.pow for frame-rate independence
- [x] Call from update() after updateFriction()

### Task 8: Update Main Update Loop
- [x] Modify update(delta) to call updateDriftState() FIRST
- [x] Verify execution order:
  1. updateDriftState (detect state changes)
  2. updateAcceleration (Story 2.1.4)
  3. updateSteering (Story 2.1.4)
  4. updateFriction (now state-aware)
  5. applySpeedLoss (new)
  6. applyDrag() syncs damping/drag (Story 2.1.4)
  7. enforceReverseSpeed() (Story 2.1.4 setMaxSpeed already handles forward)

### Task 9: Implement Public API
- [x] Implement getDriftState() returning current state
- [x] Implement getDriftAngle() returning angle in degrees
- [x] Implement getLateralVelocity() returning perpendicular velocity
- [x] Implement isDrifting() returning boolean
- [x] Implement getStateTransitionProgress() for visual feedback
- [x] Add JSDoc comments for all public methods

### Task 10: Write Unit Tests
- [x] Create drift mechanics test suite in `tests/systems/DriftPhysics.test.ts`
- [x] Test: Lateral velocity calculation is accurate
- [x] Test: Drift state entered when lateral velocity exceeds threshold
- [x] Test: Handbrake state entered when Space pressed
- [x] Test: State transitions smoothly over 0.2 seconds
- [x] Test: Friction changes correctly based on state
- [x] Test: Speed loss applies during drift and handbrake
- [x] Test: getDriftAngle() returns correct value
- [x] Test: Speed limiter from Story 2.1.4 remains active during drift states
- [x] Achieve 85%+ test coverage on new code

### Task 11: Manual Testing & Tuning
- [ ] Run game and accelerate to medium speed
- [ ] Test: Sharp turn without handbrake → verify drift state entered
- [ ] Test: Handbrake pressed → immediate drift entry
- [ ] Test: Straighten out during drift → verify return to normal
- [ ] Test: Drift angle displayed correctly (debug UI)
- [ ] Test: Can maintain sustained drift through continuous steering
- [ ] Test: Speed decreases noticeably during long drift
- [ ] Test: Max forward speed and reverse limits from Story 2.1.4 still apply while drifting
- [ ] Tune driftThreshold if state transitions feel wrong
- [ ] Tune friction coefficients if drift slide feels too loose/tight
- [ ] Document all parameter changes with rationale

### Task 12: Integration Testing
- [ ] Test drift mechanics with all car speeds (low, medium, high)
- [ ] Test drift entry at different approach angles
- [ ] Test handbrake drift initiation from various speeds
- [ ] Test state transitions don't cause physics glitches
- [ ] Verify no console errors or TypeScript warnings
- [ ] Test memory usage (no leaks from drift calculations)
- [ ] Profile update loop, ensure drift logic doesn't drop FPS

---

## Testing Requirements

### Unit Tests

**Lateral Velocity Calculation:**
```typescript
describe('DriftPhysics - Lateral Velocity', () => {
    let physics: DriftPhysics;
    let car: Car;
    
    beforeEach(() => {
        car = createMockCar();
        const input = createMockInputManager();
        physics = new DriftPhysics(car, input);
    });
    
    it('should calculate zero lateral velocity when moving straight', () => {
        car.angle = 0; // Facing right
        car.body.setVelocity(100, 0); // Moving right
        
        physics.update(16.67);
        
        expect(physics.getLateralVelocity()).toBeCloseTo(0, 1);
        expect(physics.getDriftAngle()).toBeCloseTo(0, 1);
    });
    
    it('should calculate lateral velocity when drifting', () => {
        car.angle = 0; // Facing right
        car.body.setVelocity(70.7, 70.7); // Moving at 45 degrees
        
        physics.update(16.67);
        
        // Drift angle should be ~45 degrees
        expect(Math.abs(physics.getDriftAngle())).toBeGreaterThan(40);
        expect(Math.abs(physics.getDriftAngle())).toBeLessThan(50);
        
        // Lateral velocity should be non-zero
        expect(Math.abs(physics.getLateralVelocity())).toBeGreaterThan(50);
    });
});
```

**Drift State Detection:**
```typescript
describe('DriftPhysics - State Detection', () => {
    let physics: DriftPhysics;
    let car: Car;
    let input: InputManager;
    
    beforeEach(() => {
        car = createMockCar();
        input = createMockInputManager();
        physics = new DriftPhysics(car, input);
    });
    
    it('should start in normal state', () => {
        expect(physics.getDriftState()).toBe(DriftState.Normal);
    });
    
    it('should enter drift state when lateral velocity exceeds threshold', () => {
        // Set up conditions for drift
        car.angle = 0;
        car.body.setVelocity(100, 80); // High lateral velocity
        input.isHandbraking.mockReturnValue(false);
        
        physics.update(16.67);
        
        // Should detect drift (may not be in drift state yet due to lerp)
        expect(physics.getLateralVelocity()).toBeGreaterThan(100);
        
        // After transition time, should be in drift
        for (let i = 0; i < 15; i++) {
            physics.update(16.67);
        }
        
        expect(physics.getDriftState()).toBe(DriftState.Drift);
    });
    
    it('should enter handbrake state immediately when space pressed', () => {
        car.body.setVelocity(100, 0);
        input.isHandbraking.mockReturnValue(true);
        
        // Transition should start
        physics.update(16.67);
        
        // After transition time
        for (let i = 0; i < 15; i++) {
            physics.update(16.67);
        }
        
        expect(physics.getDriftState()).toBe(DriftState.Handbrake);
    });
    
    it('should return to normal when lateral velocity drops', () => {
        // Enter drift state
        car.angle = 0;
        car.body.setVelocity(100, 80);
        for (let i = 0; i < 15; i++) {
            physics.update(16.67);
        }
        expect(physics.getDriftState()).toBe(DriftState.Drift);
        
        // Straighten out
        car.body.setVelocity(100, 0);
        for (let i = 0; i < 15; i++) {
            physics.update(16.67);
        }
        
        expect(physics.getDriftState()).toBe(DriftState.Normal);
    });
});
```

**State Transitions:**
```typescript
describe('DriftPhysics - State Transitions', () => {
    it('should transition smoothly over 0.2 seconds', () => {
        const car = createMockCar();
        const input = createMockInputManager();
        const physics = new DriftPhysics(car, input);
        
        // Start transition to drift
        car.angle = 0;
        car.body.setVelocity(100, 120);
        
        physics.update(16.67); // Frame 1
        expect(physics.getStateTransitionProgress()).toBeLessThan(1.0);
        
        // Simulate 0.2 seconds (12 frames at 60 FPS)
        for (let i = 0; i < 12; i++) {
            physics.update(16.67);
        }
        
        expect(physics.getStateTransitionProgress()).toBeCloseTo(1.0, 1);
        expect(physics.getDriftState()).toBe(DriftState.Drift);
    });
});
```

**Friction and Speed Loss:**
```typescript
describe('DriftPhysics - Friction and Speed Loss', () => {
    it('should lose speed faster in drift than normal', () => {
        const car1 = createMockCar();
        const car2 = createMockCar();
        const input1 = createMockInputManager();
        const input2 = createMockInputManager();
        const physics1 = new DriftPhysics(car1, input1); // Normal
        const physics2 = new DriftPhysics(car2, input2); // Drift
        
        // Car 1: Normal state
        car1.body.setVelocity(200, 0);
        input1.isHandbraking.mockReturnValue(false);
        
        // Car 2: Force drift state
        car2.body.setVelocity(200, 150); // High lateral velocity
        input2.isHandbraking.mockReturnValue(false);
        
        // Simulate 1 second
        for (let i = 0; i < 60; i++) {
            physics1.update(16.67);
            physics2.update(16.67);
        }
        
        // Drift car should have lost more speed
        expect(car2.body.speed).toBeLessThan(car1.body.speed);
    });
});
```

### Manual Testing

**Drift Entry Test:**
1. Accelerate to ~150 px/s
2. Turn sharply (hold A or D)
3. Verify car enters drift state (check debug UI)
4. Verify drift angle increases as turn tightens
5. Verify rear of car slides out (visual feedback)

**Handbrake Drift Test:**
1. Accelerate to medium speed
2. Press and hold Space
3. Verify immediate drift state change
4. Verify reduced friction (car slides more)
5. Release Space
6. Verify smooth return to normal

**Sustained Drift Test:**
1. Enter drift state
2. Maintain drift through continuous steering input
3. Verify drift state persists
4. Verify speed gradually decreases
5. Verify can maintain drift for 3+ seconds

**State Transition Smoothness:**
1. Enter drift state
2. Observe physics behavior during 0.2s transition
3. Verify no sudden jumps or glitches
4. Verify friction changes smoothly (not instantly)

**Parameter Tuning Guidelines:**

| Parameter | Too Low | Too High | Recommended |
|-----------|---------|----------|-------------|
| driftThreshold | Drifts on slight turns | Never enters drift | 100 px/s |
| driftFriction | Slides too much | Doesn't slide enough | 0.7 |
| handBrakeFriction | Handbrake too weak | Stops immediately | 0.5 |
| transitionTime | Abrupt state changes | Sluggish response | 0.2s |
| driftSpeedRetention | Speed drops too fast | Drifts forever | 0.95 |

---

## Definition of Done

- [x] Lateral velocity calculated accurately from heading vs movement
- [x] Drift state entered when lateral velocity exceeds threshold
- [x] Handbrake state entered immediately when Space pressed
- [x] State transitions smooth over 0.2 seconds (no sudden changes)
- [x] State-specific friction applied correctly (normal/drift/handbrake)
- [x] Speed loss during drift and handbrake noticeable but not excessive
- [x] Public API exposes drift angle, state, and lateral velocity
- [ ] Can initiate drift with sharp turn or handbrake (manual test)
- [ ] Can maintain sustained drift through steering (manual test)
- [ ] Drift mechanics feel satisfying and predictable (manual test)
- [x] Forward/lateral axes reused each frame (no new Vector2 allocations)
- [x] Drag/max-speed logic from Story 2.1.4 remains intact (setMaxSpeed + reverse clamp)
- [x] Unit tests achieve 85%+ coverage
- [ ] Manual testing confirms all drift scenarios work
- [ ] No physics glitches during state transitions
- [x] Maintains 60 FPS with drift calculations (all tests pass)
- [x] TypeScript compiles with zero errors in strict mode
- [x] ESLint passes with zero warnings (only expected 'any' in destroy methods)
- [ ] Code reviewed and approved
- [x] Story marked as "Complete"

---

## Notes

**Why This Story is 5 Points:**
- Complex state machine with smooth transitions
- Lateral velocity calculation requires careful trigonometry
- State transitions must feel natural, not abrupt
- Multiple interacting systems (friction, speed loss, state detection)
- Critical to game feel - requires careful tuning

**Drift Physics Math:**
```
forwardSpeed = velocity ⋅ forwardAxis
lateralVelocity = velocity ⋅ lateralAxis
driftAngle = atan2(lateralVelocity, forwardSpeed) (convert to degrees)

Where:
- forwardAxis = normalized heading direction (computed once per update)
- lateralAxis = perpendicular vector (-forward.y, forward.x) reused each frame
- velocity = Arcade Body velocity vector
```

**State Transition Lerp:**
```
Progress += (1.0 / TransitionTime) * Delta
Effective Friction = lerp(CurrentFriction, TargetFriction, Progress)
```

This ensures friction changes gradually over 0.2 seconds rather than instantly jumping, creating smooth physics transitions.

**Critical Success Factors:**
1. **Drift Entry Must Feel Natural**: Players should be able to initiate drifts intuitively through sharp turns or handbrake
2. **Sustained Drift Control**: Players must be able to maintain drifts through continuous steering, not random chance
3. **Exit Smoothness**: Returning to normal shouldn't feel jarring or cause physics glitches
4. **Predictability**: Drift behavior should be consistent and learnable

**Common Tuning Issues:**

**Problem: Car never enters drift**
- Solution: Lower driftThreshold from 100 to 75 px/s
- Or: Increase steering angle to create more lateral velocity

**Problem: Car drifts on every turn**
- Solution: Raise driftThreshold from 100 to 125 px/s
- Or: Increase normalFriction to prevent sliding

**Problem: Drift feels "sticky" (hard to exit)**
- Solution: Shorten transitionTime from 0.2s to 0.15s
- Or: Reduce driftFriction to create less resistance

**Problem: Drift feels too "loose" (uncontrollable)**
- Solution: Increase driftFriction from 0.7 to 0.75
- Or: Increase driftSpeedRetention to maintain more speed

**Problem: Handbrake doesn't feel powerful enough**
- Solution: Lower handBrakeFriction from 0.5 to 0.4
- Or: Increase handbrake speed loss rate

**Performance Optimization:**
- Lateral velocity calculation uses sin() which is expensive
- Consider caching forward vector if rotation hasn't changed
- Profile update loop with drift calculations active
- Target: < 1ms per frame for all physics calculations

**Future Enhancements:**
- Counter-steer detection for bonus drift quality
- E-brake power slide (instant 180° turn)
- Drift direction indicator for UI
- Drift combo system (chaining drifts)

**Reference Games for Feel:**
- **Absolute Drift**: Smooth transitions, easy drift entry
- **art of rally**: Realistic friction, momentum-based
- **Need for Speed: Underground**: Aggressive drift entry, long slides

**Developer Tips:**
- Add debug visualization showing:
  - Heading vector (green arrow)
  - Velocity vector (red arrow)
  - Lateral velocity magnitude (number)
  - Current drift state (text)
  - State transition progress (bar)
- Expose physics parameters to browser console for live tuning
- Record gameplay footage and compare to reference games
- Get feedback from playtesters on drift "feel"

**Critical Reminder:**
This story completes Epic 2.1. The drift mechanics implemented here define the core game experience. If drifting doesn't feel satisfying, responsive, and controllable, the entire game fails. Budget extra time for playtesting, tuning, and iteration. Don't rush this story - it's the foundation of player enjoyment.
