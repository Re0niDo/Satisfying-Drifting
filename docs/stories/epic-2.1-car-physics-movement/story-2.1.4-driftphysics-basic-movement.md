# Story 2.1.4: DriftPhysics System - Basic Movement

**Epic:** Epic 2.1: Car Physics & Movement  
**Story ID:** 2.1.4  
**Priority:** High  
**Points:** 5  
**Status:** Draft

---

## Description

Implement the DriftPhysics system as a component for the Car game object, focusing on basic movement mechanics: acceleration, braking, and velocity-dependent steering. This story establishes the foundation of car control without drift state transitions - the car will move and steer realistically but remain in "normal" state with normal friction at all times.

The DriftPhysics component follows a composition pattern, attaching to the Car object and updating its physics body every frame based on input from InputManager. This creates the tight input-physics-feedback loop that defines the game's feel.

**GDD Reference:** Drift Physics System (Architecture Document), Physics Configuration

---

## Acceptance Criteria

### Functional Requirements

- [ ] DriftPhysics component attaches to Car object and controls its physics body
- [ ] Car accelerates forward when W/Up is held, matching PhysicsConfig.acceleration
- [ ] Car brakes when S/Down is held, matching PhysicsConfig.brakeForce
- [ ] Car steers with velocity-dependent turn rate (faster = wider turns)
- [ ] Car respects maxSpeed limit defined in PhysicsConfig
- [ ] Basic friction (normal state only) slows car when no input
- [ ] Drag and angular drag create natural deceleration
- [ ] Car can be manually reset to position/rotation via Car.reset()
- [ ] Forward and reverse speed limits configured entirely through PhysicsConfig and enforced via Arcade Body APIs

### Technical Requirements

- [ ] Code follows TypeScript strict mode standards
- [ ] Component uses PhysicsConfig for all physics parameters (no magic numbers)
- [ ] update(delta) method called every frame by Car.update()
- [ ] Vector math optimized using Phaser.Math utilities
- [ ] No object allocation in update loop (reuse Vector2 instances)
- [ ] Proper cleanup in destroy() method
- [ ] JSDoc comments for all public methods and complex calculations
- [ ] Configures Arcade Body damping/drag with `setDamping` and `setDrag*` (no manual exponential decay)
- [ ] Sets `body.setMaxSpeed` / `setMaxVelocity` using PhysicsConfig and avoids manual speed clamping
- [ ] Math helper utilities accept an output vector parameter so update loop does not allocate
- [ ] Reverse-speed cap computed from velocity dot forward vector (Body.speed is non-negative)

### Game Design Requirements

- [ ] Car feels responsive to input (acceleration felt within 2 frames)
- [ ] Steering feels smooth and predictable (no sudden jerks)
- [ ] Turn rate difference between high/low speed is noticeable
- [ ] Car gradually slows to stop without input (doesn't slide forever)
- [ ] Max speed feels fast but controllable
- [ ] Physics parameters are tunable via PhysicsConfig for iteration
- [ ] Reverse speed limit feels intentional and matches PhysicsConfig.reverseSpeed

---

## Technical Specifications

### Files to Create/Modify

**New Files:**

- `src/systems/DriftPhysics.ts` - DriftPhysics component class
- `src/utils/MathHelpers.ts` - Vector and physics math utilities
- `tests/systems/DriftPhysics.test.ts` - Unit tests for physics calculations
- `tests/utils/MathHelpers.test.ts` - Unit tests for math utilities

**Modified Files:**

- `src/gameObjects/Car.ts` - Add DriftPhysics component, call update()
- `src/scenes/GameScene.ts` - Test car movement with input

### Class/Interface Definitions

```typescript
// src/utils/MathHelpers.ts

import Phaser from 'phaser';

/**
 * Math utility functions for physics calculations.
 * All functions are pure (no side effects) for easy testing.
 */

/**
 * Convert degrees to radians
 */
export function degToRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
export function radToDeg(radians: number): number {
    return radians * (180 / Math.PI);
}

/**
 * Normalize angle to 0-360 range
 */
export function normalizeAngle(degrees: number): number {
    degrees = degrees % 360;
    if (degrees < 0) degrees += 360;
    return degrees;
}

/**
 * Get shortest angle difference between two angles
 * Returns value in range [-180, 180]
 */
export function angleDifference(from: number, to: number): number {
    let diff = normalizeAngle(to) - normalizeAngle(from);
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return diff;
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * Phaser.Math.Clamp(t, 0, 1);
}

/**
 * Calculate velocity magnitude from x,y components
 */
export function getVelocityMagnitude(vx: number, vy: number): number {
    return Math.sqrt(vx * vx + vy * vy);
}

/**
 * Get angle of velocity vector in degrees
 */
export function getVelocityAngle(vx: number, vy: number): number {
    return radToDeg(Math.atan2(vy, vx));
}

/**
 * Apply friction to velocity
 * @param velocity - Current velocity (modified in-place)
 * @param friction - Friction coefficient (0-1)
 * @param delta - Time delta in seconds
 */
export function applyFriction(
    velocity: Phaser.Math.Vector2,
    friction: number,
    delta: number
): void {
    // Friction formula: v = v * friction^(delta * 60)
    // Adjusted for frame-rate independence
    const frictionFactor = Math.pow(friction, delta * 60);
    velocity.x *= frictionFactor;
    velocity.y *= frictionFactor;
}

/**
 * Set forward vector from rotation angle without allocating a new Vector2
 * @param angleDegrees - Angle in degrees (0 = right, 90 = down)
 * @param out - Vector to populate (optional, defaults to new Vector2 for convenience)
 * @returns Reused vector pointing in direction
 */
export function getForwardVector(
    angleDegrees: number,
    out: Phaser.Math.Vector2 = new Phaser.Math.Vector2()
): Phaser.Math.Vector2 {
    const angleRad = degToRad(angleDegrees);
    return out.setToPolar(angleRad, 1);
}
```

```typescript
// src/systems/DriftPhysics.ts

import Phaser from 'phaser';
import type { Car } from '../gameObjects/Car';
import type { InputManager } from './InputManager';
import { PhysicsConfig } from '../config/PhysicsConfig';
import { DriftState } from '../types/PhysicsTypes';
import * as MathHelpers from '../utils/MathHelpers';

/**
 * DriftPhysics component handles car movement and drift mechanics.
 * This component is attached to a Car game object and updates its
 * physics body based on input from InputManager.
 * 
 * Story 2.1.4: Implements basic movement (acceleration, braking, steering)
 * Story 2.1.5: Will add drift state transitions and advanced mechanics
 */
export class DriftPhysics {
    private car: Car;
    private body: Phaser.Physics.Arcade.Body;
    private inputManager: InputManager;
    
    // Reusable vector objects (no allocation in update loop)
    private velocityVector: Phaser.Math.Vector2;
    private forwardVector: Phaser.Math.Vector2;
    
    // Current state (drift mechanics added in Story 2.1.5)
    private currentState: DriftState = DriftState.Normal;
    
    /**
     * Create DriftPhysics component
     * @param car - Car game object this component controls
     * @param inputManager - Input manager for reading player input
     */
    constructor(car: Car, inputManager: InputManager) {
        this.car = car;
        this.body = car.body;
        this.inputManager = inputManager;
        
        // Initialize reusable vectors
        this.velocityVector = new Phaser.Math.Vector2();
        this.forwardVector = new Phaser.Math.Vector2();

        const config = PhysicsConfig.car;
        this.body.setDamping(true);
        this.body.setDrag(config.drag);
        this.body.setAngularDrag(config.angularDrag);
        this.body.setMaxSpeed(config.maxSpeed);
        this.body.setMaxVelocity(config.maxSpeed, config.maxSpeed);
    }
    
    /**
     * Update physics (called every frame by Car.update)
     * @param delta - Time since last frame in milliseconds
     */
    public update(delta: number): void {
        const deltaSeconds = delta / 1000;
        MathHelpers.getForwardVector(this.car.angle, this.forwardVector);
        
        // Update movement
        this.updateAcceleration(deltaSeconds);
        this.updateSteering(deltaSeconds);
        this.updateFriction(deltaSeconds);
        this.applyDrag();
        
        // Enforce speed limits
        this.enforceReverseSpeed();
    }
    
    /**
     * Update acceleration/braking based on input
     */
    private updateAcceleration(delta: number): void {
        const config = PhysicsConfig.car;
        const accelerationAxis = this.inputManager.getAccelerationAxis();
        const forwardSpeed = this.body.velocity.dot(this.forwardVector);
        
        if (accelerationAxis === 0) {
            // No acceleration input (coasting)
            return;
        }

        if (accelerationAxis > 0) {
            // Accelerate forward
            const accelForce = config.acceleration * delta;
            this.body.velocity.x += this.forwardVector.x * accelForce;
            this.body.velocity.y += this.forwardVector.y * accelForce;
        } else {
            // Brake or reverse
            if (forwardSpeed > 5) {
                // Moving forward - apply brake
                const brakeForce = config.brakeForce * delta;
                this.body.velocity.x -= this.forwardVector.x * brakeForce;
                this.body.velocity.y -= this.forwardVector.y * brakeForce;
            } else {
                // Stopped or very slow - allow reverse
                const reverseForce = config.acceleration * 0.5 * delta; // Reverse slower
                this.body.velocity.x -= this.forwardVector.x * reverseForce;
                this.body.velocity.y -= this.forwardVector.y * reverseForce;
            }
        }
    }
    
    /**
     * Update steering based on input and current speed
     */
    private updateSteering(delta: number): void {
        const config = PhysicsConfig.car;
        const steeringAxis = this.inputManager.getSteeringAxis();
        
        if (steeringAxis === 0) {
            // No steering input
            return;
        }
        
        // Velocity-dependent turn rate
        const currentSpeed = this.body.speed;
        const turnRate = this.calculateTurnRate(currentSpeed);
        
        // Apply rotation
        const rotationChange = turnRate * steeringAxis * delta;
        this.car.angle += rotationChange;
    }
    
    /**
     * Calculate turn rate based on current speed
     * Slower speeds allow tighter turns, faster speeds require wider turns
     */
    private calculateTurnRate(speed: number): number {
        const config = PhysicsConfig.car;
        
        if (speed < config.speedThresholdTight) {
            // Slow speed - tight turns
            return config.turnRateLow;
        }
        
        // Interpolate between low and high turn rates based on speed
        const speedRatio = (speed - config.speedThresholdTight) / 
                          (config.maxSpeed - config.speedThresholdTight);
        const clampedRatio = Phaser.Math.Clamp(speedRatio, 0, 1);
        
        return MathHelpers.lerp(config.turnRateLow, config.turnRateHigh, clampedRatio);
    }
    
    /**
     * Apply friction (normal state only - drift mechanics in Story 2.1.5)
     */
    private updateFriction(delta: number): void {
        const config = PhysicsConfig.car;
        
        // Story 2.1.4: Always use normal friction
        // Story 2.1.5: Will switch between normal/drift/handbrake friction
        this.velocityVector.set(this.body.velocity.x, this.body.velocity.y);
        MathHelpers.applyFriction(this.velocityVector, config.normalFriction, delta);
        this.body.setVelocity(this.velocityVector.x, this.velocityVector.y);
    }
    
    /**
     * Sync drag (air resistance) with configuration
     */
    private applyDrag(): void {
        const config = PhysicsConfig.car;
        this.body.setDamping(true);
        this.body.setDrag(config.drag);
        this.body.setAngularDrag(config.angularDrag);
    }
    
    /**
     * Enforce reverse speed limit (forward speed is handled by setMaxSpeed)
     */
    private enforceReverseSpeed(): void {
        const config = PhysicsConfig.car;
        const forwardSpeed = this.body.velocity.dot(this.forwardVector);
        const targetReverse = -config.reverseSpeed;
        
        if (forwardSpeed < targetReverse) {
            const deltaSpeed = targetReverse - forwardSpeed;
            this.body.velocity.x += this.forwardVector.x * deltaSpeed;
            this.body.velocity.y += this.forwardVector.y * deltaSpeed;
        }
    }
    
    /**
     * Get current drift state (for debugging)
     * Story 2.1.5: Will return actual drift state
     */
    public getDriftState(): DriftState {
        return this.currentState;
    }
    
    /**
     * Get current speed in pixels per second
     */
    public getSpeed(): number {
        return this.body.speed;
    }
    
    /**
     * Clean up resources
     */
    public destroy(): void {
        // Clear references
        this.car = null as any;
        this.body = null as any;
        this.inputManager = null as any;
        this.velocityVector = null as any;
        this.forwardVector = null as any;
    }
}
```

### Integration Points

- **Car**: Car.update() calls driftPhysics.update(delta)
- **InputManager**: DriftPhysics queries input state every frame
- **PhysicsConfig**: All movement parameters from PhysicsConfig.car
- **MathHelpers**: Vector math utilities for physics calculations

### Dependencies

**Depends On:**
- Story 2.1.1 (PhysicsConfig and type definitions)
- Story 2.1.2 (Car game object with physics body)
- Story 2.1.3 (InputManager for reading player input)

**Blocks:**
- Story 2.1.5 (Drift mechanics build on basic movement)

---

## Implementation Tasks

Developers should complete these tasks in order:

### Task 1: Create MathHelpers Utility
- [ ] Create `src/utils/MathHelpers.ts` file
- [ ] Implement degToRad() and radToDeg() conversion functions
- [ ] Implement normalizeAngle() to constrain angles to 0-360
- [ ] Implement angleDifference() for shortest angle between two angles
- [ ] Implement lerp() for linear interpolation
- [ ] Implement getVelocityMagnitude() and getVelocityAngle()
- [ ] Implement applyFriction() that modifies Vector2 in-place
- [ ] Implement getForwardVector(angle, out?) that writes into a provided Vector2 to avoid allocations
- [ ] Add JSDoc comments with examples for all functions
- [ ] Write comprehensive unit tests for all math functions

### Task 2: Implement DriftPhysics Class Structure
- [ ] Create `src/systems/DriftPhysics.ts` file
- [ ] Implement constructor accepting Car and InputManager
- [ ] Store references to car, body, and inputManager
- [ ] Initialize reusable Vector2 objects (no allocation in update)
- [ ] Set initial drift state to Normal
- [ ] Configure Arcade body with `setDamping(true)`, `setDrag`, `setAngularDrag`, and `setMaxSpeed`
- [ ] Implement destroy() method with reference cleanup
- [ ] Add JSDoc class documentation

### Task 3: Implement Acceleration System
- [ ] Implement updateAcceleration(delta) method
- [ ] Get acceleration axis from InputManager (-1, 0, 1)
- [ ] Calculate forward vector once per frame and reuse (no per-call allocations)
- [ ] Apply acceleration force in forward direction
- [ ] Implement braking logic (decelerate when moving forward)
- [ ] Implement reverse logic (accelerate backward when stopped)
- [ ] Use PhysicsConfig.acceleration and brakeForce values
- [ ] Use dot product of velocity and forward vector to determine forward vs reverse motion
- [ ] Verify acceleration feels responsive

### Task 4: Implement Steering System
- [ ] Implement updateSteering(delta) method
- [ ] Get steering axis from InputManager (-1, 0, 1)
- [ ] Implement calculateTurnRate(speed) with velocity-dependent logic
- [ ] Use lerp to smoothly transition between turnRateLow and turnRateHigh
- [ ] Apply rotation to car based on steering input and turn rate
- [ ] Use PhysicsConfig speedThresholdTight for tight turn cutoff
- [ ] Verify tight turns at low speed, wide turns at high speed

### Task 5: Implement Friction and Drag
- [ ] Implement updateFriction(delta) method
- [ ] Apply normalFriction from PhysicsConfig (drift states in Story 2.1.5)
- [ ] Use applyFriction() utility to modify velocity
- [ ] Implement applyDrag() method that syncs Arcade body damping/drag with PhysicsConfig
- [ ] Ensure drag configuration relies on Phaser Body APIs instead of manual velocity scaling

### Task 6: Implement Speed Limiting
- [ ] Configure `body.setMaxSpeed` / `setMaxVelocity` from PhysicsConfig
- [ ] Implement enforceReverseSpeed() method using velocity ⋅ forwardVector
- [ ] Clamp reverse motion to PhysicsConfig.reverseSpeed
- [ ] Verify forward speed never exceeds maxSpeed without manual clamping

### Task 7: Implement Main Update Loop
- [ ] Implement update(delta) method
- [ ] Convert delta from milliseconds to seconds
- [ ] Call updateAcceleration(delta)
- [ ] Call updateSteering(delta)
- [ ] Call updateFriction(delta)
- [ ] Call applyDrag()
- [ ] Call enforceReverseSpeed()
- [ ] Verify execution order matters (document why)

### Task 8: Integrate with Car Object
- [ ] Modify `src/gameObjects/Car.ts` to add DriftPhysics component
- [ ] Store driftPhysics as private property
- [ ] Initialize DriftPhysics in Car constructor (pass InputManager from registry)
- [ ] Call driftPhysics.update(delta) in Car.update()
- [ ] Call driftPhysics.destroy() in Car.preDestroy()
- [ ] Test car moves and steers correctly in GameScene

### Task 9: Write Unit Tests
- [ ] Create `tests/utils/MathHelpers.test.ts`
- [ ] Test all math utility functions with edge cases
- [ ] Create `tests/systems/DriftPhysics.test.ts`
- [ ] Test acceleration increases velocity in forward direction
- [ ] Test braking decreases velocity
- [ ] Test steering changes car rotation
- [ ] Test turn rate varies with speed
- [ ] Test friction slows car over time
- [ ] Test forward speed respects configured max speed
- [ ] Test reverse speed clamps at PhysicsConfig.reverseSpeed
- [ ] Achieve 80%+ test coverage

### Task 10: Manual Testing & Tuning
- [ ] Run game and navigate to GameScene
- [ ] Test: Press W and verify car accelerates forward
- [ ] Test: Release W and verify car gradually slows (friction)
- [ ] Test: Press S while moving and verify car brakes
- [ ] Test: Press A/D and verify car steers
- [ ] Test: Drive at high speed, notice wider turns
- [ ] Test: Drive slowly, notice tighter turns
- [ ] Test: Hold W until max speed, verify speed caps
- [ ] Test: Reverse briefly and confirm car cannot exceed configured reverseSpeed
- [ ] Test: Release all input and confirm damping/drag feel smooth (no axis jitter)
- [ ] Tune physics parameters if movement doesn't feel right
- [ ] Document any parameter changes with rationale

---

## Testing Requirements

### Unit Tests

**MathHelpers Tests:**
```typescript
describe('MathHelpers', () => {
    describe('degToRad', () => {
        it('should convert degrees to radians', () => {
            expect(degToRad(0)).toBeCloseTo(0);
            expect(degToRad(90)).toBeCloseTo(Math.PI / 2);
            expect(degToRad(180)).toBeCloseTo(Math.PI);
            expect(degToRad(360)).toBeCloseTo(Math.PI * 2);
        });
    });
    
    describe('normalizeAngle', () => {
        it('should normalize angles to 0-360 range', () => {
            expect(normalizeAngle(0)).toBe(0);
            expect(normalizeAngle(360)).toBe(0);
            expect(normalizeAngle(450)).toBe(90);
            expect(normalizeAngle(-90)).toBe(270);
        });
    });
    
    describe('angleDifference', () => {
        it('should calculate shortest angle difference', () => {
            expect(angleDifference(0, 90)).toBe(90);
            expect(angleDifference(350, 10)).toBe(20);
            expect(angleDifference(10, 350)).toBe(-20);
        });
    });
    
    describe('applyFriction', () => {
        it('should reduce velocity magnitude', () => {
            const velocity = new Phaser.Math.Vector2(100, 0);
            applyFriction(velocity, 0.95, 1/60);
            expect(velocity.x).toBeLessThan(100);
            expect(velocity.x).toBeGreaterThan(99); // Minimal reduction per frame
        });
    });
});
```

**DriftPhysics Tests:**
```typescript
describe('DriftPhysics', () => {
    let car: Car;
    let inputManager: InputManager;
    let physics: DriftPhysics;
    
    beforeEach(() => {
        car = createMockCar();
        inputManager = createMockInputManager();
        physics = new DriftPhysics(car, inputManager);
    });
    
    afterEach(() => {
        physics.destroy();
    });
    
    describe('Acceleration', () => {
        it('should accelerate forward when W pressed', () => {
            inputManager.getAccelerationAxis.mockReturnValue(1);
            car.angle = 0; // Facing right
            
            const initialVelocity = car.body.velocity.x;
            physics.update(16.67); // One frame at 60 FPS
            
            expect(car.body.velocity.x).toBeGreaterThan(initialVelocity);
        });
        
        it('should brake when S pressed while moving', () => {
            car.body.setVelocity(100, 0);
            inputManager.getAccelerationAxis.mockReturnValue(-1);
            
            const initialSpeed = car.body.speed;
            physics.update(16.67);
            
            expect(car.body.speed).toBeLessThan(initialSpeed);
        });
    });
    
    describe('Steering', () => {
        it('should rotate car when A pressed', () => {
            inputManager.getSteeringAxis.mockReturnValue(-1);
            car.body.setVelocity(100, 0);
            
            const initialAngle = car.angle;
            physics.update(16.67);
            
            expect(car.angle).toBeLessThan(initialAngle);
        });
        
        it('should turn faster at low speed', () => {
            inputManager.getSteeringAxis.mockReturnValue(1);
            
            // Low speed turn
            car.body.setVelocity(50, 0);
            const initialAngle1 = car.angle;
            physics.update(16.67);
            const lowSpeedTurnAmount = car.angle - initialAngle1;
            
            // High speed turn
            car.angle = 0;
            car.body.setVelocity(300, 0);
            const initialAngle2 = car.angle;
            physics.update(16.67);
            const highSpeedTurnAmount = car.angle - initialAngle2;
            
            expect(lowSpeedTurnAmount).toBeGreaterThan(highSpeedTurnAmount);
        });
    });
    
    describe('Friction and Drag', () => {
        it('should slow car over time without input', () => {
            car.body.setVelocity(100, 0);
            inputManager.getAccelerationAxis.mockReturnValue(0);
            inputManager.getSteeringAxis.mockReturnValue(0);
            
            const initialSpeed = car.body.speed;
            
            // Simulate 1 second of no input
            for (let i = 0; i < 60; i++) {
                physics.update(16.67);
            }
            
            expect(car.body.speed).toBeLessThan(initialSpeed * 0.5);
        });
    });
    
    describe('Speed Limiting', () => {
        it('should enforce max speed via body.setMaxSpeed', () => {
            const maxSpeed = PhysicsConfig.car.maxSpeed;
            car.body.setVelocity(maxSpeed + 100, 0);
            
            physics.update(16.67);
            
            expect(car.body.speed).toBeLessThanOrEqual(maxSpeed + 1); // Small epsilon
        });
        
        it('should clamp reverse speed using forward dot product', () => {
            const reverseSpeed = PhysicsConfig.car.reverseSpeed;
            car.body.setVelocity(-reverseSpeed - 200, 0);
            car.angle = 180; // Facing left so forwardVector points left
            
            physics.update(16.67);
            
            const forwardVector = MathHelpers.getForwardVector(car.angle);
            const forwardSpeed = car.body.velocity.dot(forwardVector);
            expect(forwardSpeed).toBeGreaterThanOrEqual(-reverseSpeed - 1);
        });
    });
});
```

### Manual Testing

**Basic Movement Test:**
1. Run game and navigate to GameScene
2. Press and hold W key
3. Verify car accelerates smoothly forward
4. Verify acceleration feels responsive (< 0.1s to noticeable speed)
5. Release W key
6. Verify car gradually slows down (friction)
7. Verify car comes to complete stop within 2-3 seconds

**Steering Test:**
1. Hold W to accelerate to medium speed (~200 px/s)
2. Press A (steer left)
3. Verify car turns smoothly without jerks
4. Press D (steer right)
5. Verify car turns in opposite direction
6. Accelerate to max speed
7. Verify turns are wider at high speed
8. Brake to low speed
9. Verify turns are tighter at low speed

**Braking Test:**
1. Accelerate to high speed
2. Press and hold S
3. Verify car decelerates faster than friction alone
4. Verify car doesn't instantly stop (realistic braking)
5. Continue holding S after car stops
6. Verify car begins reversing slowly

**Parameter Tuning:**
- If acceleration feels sluggish, increase PhysicsConfig.car.acceleration
- If steering feels unresponsive, increase turnRateLow and turnRateHigh
- If car slides too much, increase normalFriction
- If car feels too floaty, increase drag
- Document all parameter changes in story notes

---

## Definition of Done

- [ ] MathHelpers utility implemented with all required functions
- [ ] DriftPhysics class implemented with acceleration, steering, friction
- [ ] Car moves forward/backward based on W/S input
- [ ] Car steers left/right based on A/D input
- [ ] Turn rate varies with speed (tight at low speed, wide at high speed)
- [ ] Friction slows car when no input applied
- [ ] Max speed enforcement uses Arcade Body `setMaxSpeed` / `setMaxVelocity`
- [ ] Reverse speed clamped via velocity ⋅ forwardVector logic
- [ ] Drag/damping configured through Phaser body APIs (no manual scaling)
- [ ] DriftPhysics integrated with Car object
- [ ] Car movement feels responsive and controllable
- [ ] Unit tests achieve 80%+ coverage
- [ ] Manual testing confirms all movement works correctly
- [ ] Physics parameters are tunable via PhysicsConfig
- [ ] No memory leaks (reusable vectors, no allocation in update)
- [ ] TypeScript compiles with zero errors in strict mode
- [ ] ESLint passes with zero warnings
- [ ] Code reviewed and approved
- [ ] Story marked as "Complete"

---

## Notes

**Why This Story is 5 Points:**
- Complex physics calculations with multiple interacting systems
- Requires careful tuning to achieve satisfying "feel"
- Frame-rate independence is critical for consistent behavior
- Vector math optimization for performance
- Foundation for drift mechanics (Story 2.1.5)

**Physics Iteration Expected:**
- Initial parameter values are estimates
- Requires playtesting and tuning for satisfying feel
- Budget time for parameter adjustment
- Document changes to PhysicsConfig with rationale

**Performance Considerations:**
- Reuse Vector2 objects to avoid garbage collection
- Minimize trigonometry calls (cache forward vector when possible)
- Frame-rate independence using delta time
- Use Phaser Arcade Body APIs (`setDamping`, `setDrag`, `setAngularDrag`) instead of manual velocity math for drag
- Profile update loop if FPS drops below 60

**Physics Execution Order:**
1. Acceleration (change velocity based on input)
2. Steering (change rotation based on input and speed)
3. Friction (reduce velocity magnitude)
4. Drag (sync Arcade Body damping/drag to config)
5. Speed limiting (setMaxSpeed for forward, dot-product clamp for reverse)

This order matters: applying friction before acceleration would dampen input responsiveness.

**Future Enhancements (Story 2.1.5):**
- Drift state detection (lateral velocity threshold)
- State-specific friction (normal vs drift vs handbrake)
- Smooth state transitions with lerp
- Speed loss during drift
- Lateral velocity calculations

**Developer Tips:**
- Use physics debug visualization to see velocity vectors
- Add on-screen debug display showing speed, turn rate, friction
- Expose physics parameters to browser console for live tuning
- Compare feel to reference games (Absolute Drift, art of rally)
- Get feedback from playtesters early and often

**Critical Success Factor:**
The car MUST feel good to drive in this story. Drift mechanics in Story 2.1.5 build on this foundation - if basic movement doesn't feel responsive and predictable, the entire physics system fails. Budget extra time for tuning and iteration.
