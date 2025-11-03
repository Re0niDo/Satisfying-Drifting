# Story 2.1.1: Physics Configuration & Type Definitions

**Epic:** Epic 2.1: Car Physics & Movement  
**Story ID:** 2.1.1  
**Priority:** High  
**Points:** 2  
**Status:** Draft

---

## Description

Create the foundational configuration and TypeScript type definitions required for the car physics system. This includes defining all physics parameters (acceleration, friction, drift thresholds, etc.) in a centralized configuration file and establishing type-safe interfaces for physics state, input handling, and drift mechanics.

This story establishes the data structures and configuration that all subsequent physics stories will depend on, enabling parallel development and ensuring type safety across the physics system.

**GDD Reference:** Drift Physics System (Architecture Document), Physics Configuration section

---

## Acceptance Criteria

### Functional Requirements

- [ ] PhysicsConfig contains all car movement parameters with correct default values
- [ ] PhysicsConfig contains all drift mechanics parameters matching architecture specs
- [ ] All configuration values are typed and validated
- [ ] Configuration is exportable and importable without circular dependencies
- [ ] Default configuration enables basic car movement (even without full physics implementation)

### Technical Requirements

- [ ] Code follows TypeScript strict mode standards (no `any` types)
- [ ] All interfaces use IPascalCase naming convention
- [ ] Configuration uses UPPER_SNAKE_CASE for constant values
- [ ] JSDoc comments document all parameters with units
- [ ] Unit tests validate configuration structure and default values
- [ ] No runtime dependencies on Phaser (pure TypeScript/data)

### Game Design Requirements

- [ ] Physics parameters match the architecture document specifications
- [ ] Drift threshold values are tunable for gameplay iteration
- [ ] All values include units in comments (px/s, degrees, seconds, etc.)
- [ ] Configuration supports future expansion (speed modifiers, difficulty settings)

---

## Technical Specifications

### Files to Create/Modify

**New Files:**

- `src/config/PhysicsConfig.ts` - All physics and drift configuration parameters
- `src/types/PhysicsTypes.ts` - Interfaces for physics state and drift mechanics
- `src/types/InputTypes.ts` - Interfaces for input state and key mappings
- `tests/config/PhysicsConfig.test.ts` - Unit tests for configuration validation

**Modified Files:**

- None (this is foundational work)

### Class/Interface Definitions

```typescript
// src/types/PhysicsTypes.ts

/**
 * Enum representing the current drift state of the car
 */
export enum DriftState {
    Grip = 'GRIP',           // Normal driving with high friction
    Drift = 'DRIFT',         // Controlled drift with reduced friction
    Handbrake = 'HANDBRAKE'  // Handbrake drift with lowest friction
}

/**
 * Interface for car physics state data
 */
export interface ICarPhysicsState {
    position: { x: number; y: number };
    velocity: { x: number; y: number };
    rotation: number;              // Degrees
    speed: number;                 // Pixels per second
    lateralVelocity: number;       // Lateral velocity component (px/s)
    driftAngle: number;            // Angle between heading and velocity (degrees)
    driftState: DriftState;
    isAccelerating: boolean;
    isBraking: boolean;
    isHandbraking: boolean;
}

/**
 * Interface for drift physics calculations
 */
export interface IDriftData {
    angle: number;                 // Drift angle in degrees
    speed: number;                 // Current speed in px/s
    lateralVelocity: number;       // Lateral velocity component
    state: DriftState;
    stateTransitionProgress: number; // 0-1 lerp progress between states
}

/**
 * Configuration interface for physics parameters
 */
export interface IPhysicsConfig {
    car: ICarConfig;
    quality: IQualityConfig;
}

export interface ICarConfig {
    // Movement parameters
    maxSpeed: number;
    acceleration: number;
    brakeForce: number;
    reverseSpeed: number;
    
    // Steering parameters
    turnRateHigh: number;
    turnRateLow: number;
    speedThresholdTight: number;
    
    // Drift physics
    driftThreshold: number;
    gripFriction: number;
    driftFriction: number;
    handBrakeFriction: number;
    transitionTime: number;
    
    // Speed loss during drift
    driftSpeedRetention: number;
    handbrakeSpeedRetention: number;
    
    // Physical properties
    mass: number;
    drag: number;
    angularDrag: number;
}

export interface IQualityConfig {
    // Drift angle scoring (40% weight)
    perfectAngleMin: number;
    perfectAngleMax: number;
    extremeAngle: number;
    
    // Speed scoring (30% weight)
    highSpeedThreshold: number;
    mediumSpeedThreshold: number;
    lowSpeedThreshold: number;
    
    // Proximity scoring (20% weight)
    veryCloseDistance: number;
    closeDistance: number;
    safeDistance: number;
    
    // Smoothness (10% weight)
    smoothnessWindowFrames: number;
    
    // Combo system
    comboDecayTime: number;
    minimumQualityForCombo: number;
    
    // Quality tiers
    poorMax: number;
    goodMax: number;
    perfectMin: number;
}
```

```typescript
// src/types/InputTypes.ts

/**
 * Enum for input actions
 */
export enum InputAction {
    Accelerate = 'ACCELERATE',
    Brake = 'BRAKE',
    SteerLeft = 'STEER_LEFT',
    SteerRight = 'STEER_RIGHT',
    Handbrake = 'HANDBRAKE',
    Restart = 'RESTART',
    Pause = 'PAUSE'
}

/**
 * Interface for input state tracking
 */
export interface IInputState {
    accelerate: boolean;
    brake: boolean;
    steerLeft: boolean;
    steerRight: boolean;
    handbrake: boolean;
    restart: boolean;
    pause: boolean;
    
    // Frame-specific tracking
    acceleratePressed: boolean;    // Pressed this frame
    brakePressed: boolean;
    handbrakePressed: boolean;
    restartPressed: boolean;
    pausePressed: boolean;
}

/**
 * Interface for key mapping configuration
 */
export interface IKeyMapping {
    [InputAction.Accelerate]: string[];   // e.g., ['W', 'UP']
    [InputAction.Brake]: string[];        // e.g., ['S', 'DOWN']
    [InputAction.SteerLeft]: string[];    // e.g., ['A', 'LEFT']
    [InputAction.SteerRight]: string[];   // e.g., ['D', 'RIGHT']
    [InputAction.Handbrake]: string[];    // e.g., ['SPACE']
    [InputAction.Restart]: string[];      // e.g., ['R']
    [InputAction.Pause]: string[];        // e.g., ['ESC']
}

/**
 * Default key mapping
 */
export const DEFAULT_KEY_MAPPING: IKeyMapping = {
    [InputAction.Accelerate]: ['W', 'UP'],
    [InputAction.Brake]: ['S', 'DOWN'],
    [InputAction.SteerLeft]: ['A', 'LEFT'],
    [InputAction.SteerRight]: ['D', 'RIGHT'],
    [InputAction.Handbrake]: ['SPACE'],
    [InputAction.Restart]: ['R'],
    [InputAction.Pause]: ['ESC']
};
```

```typescript
// src/config/PhysicsConfig.ts

import type { IPhysicsConfig } from '../types/PhysicsTypes';

/**
 * Physics configuration for car movement and drift mechanics.
 * All values are tunable for gameplay iteration.
 * 
 * IMPORTANT: Values match the Game Architecture Document specifications.
 * Modifications should be playtested and documented.
 */
export const PhysicsConfig: IPhysicsConfig = {
    car: {
        // Movement
        maxSpeed: 400,              // pixels/second - maximum forward speed
        acceleration: 300,          // pixels/second² - rate of speed increase
        brakeForce: 400,            // pixels/second² - deceleration when braking
        reverseSpeed: 150,          // pixels/second - maximum reverse speed
        
        // Steering
        turnRateHigh: 180,          // degrees/second at max speed - tighter turns
        turnRateLow: 360,           // degrees/second at low speed - sharper turns
        speedThresholdTight: 100,   // speed (px/s) below which tight turns enabled
        
        // Drift Physics
        driftThreshold: 100,        // lateral velocity (px/s) to enter drift state
        gripFriction: 0.95,         // friction coefficient in normal driving (0-1)
        driftFriction: 0.7,         // friction coefficient during drift (0-1)
        handBrakeFriction: 0.5,     // friction coefficient during handbrake (0-1)
        transitionTime: 0.2,        // seconds to lerp between grip/drift states
        
        // Speed Loss During Drift
        driftSpeedRetention: 0.95,      // 5% speed loss per second in drift
        handbrakeSpeedRetention: 0.98,  // 2% speed loss per second in handbrake
        
        // Physical Properties
        mass: 100,                  // for collision calculations (arbitrary units)
        drag: 0.99,                 // air resistance multiplier per frame (0-1)
        angularDrag: 0.95           // rotation dampening per frame (0-1)
    },
    
    quality: {
        // Drift Angle Scoring (40% weight)
        perfectAngleMin: 15,        // degrees - minimum angle for perfect score
        perfectAngleMax: 45,        // degrees - maximum angle for perfect score
        extremeAngle: 60,           // degrees - beyond this, no points
        
        // Speed Scoring (30% weight)
        highSpeedThreshold: 300,    // px/s - maximum multiplier
        mediumSpeedThreshold: 200,  // px/s - good multiplier
        lowSpeedThreshold: 100,     // px/s - reduced multiplier
        
        // Proximity Scoring (20% weight)
        veryCloseDistance: 50,      // pixels from edge - 2x bonus
        closeDistance: 100,         // pixels from edge - 1.5x bonus
        safeDistance: 200,          // pixels from edge - 1x normal
        
        // Smoothness (10% weight)
        smoothnessWindowFrames: 60, // frames to average steering input variance
        
        // Combo System
        comboDecayTime: 1.0,        // seconds before combo starts decaying
        minimumQualityForCombo: 31, // "Good" tier minimum (poor = 0-30)
        
        // Quality Tiers
        poorMax: 30,                // 0-30 = Poor drift
        goodMax: 70,                // 31-70 = Good drift
        perfectMin: 71              // 71-100 = Perfect drift
    }
};

/**
 * Validate physics configuration on module load (development only)
 */
if (process.env.NODE_ENV !== 'production') {
    const validateConfig = (config: IPhysicsConfig): void => {
        const { car, quality } = config;
        
        // Validate car parameters
        if (car.maxSpeed <= 0) throw new Error('maxSpeed must be positive');
        if (car.acceleration <= 0) throw new Error('acceleration must be positive');
        if (car.gripFriction < 0 || car.gripFriction > 1) throw new Error('gripFriction must be 0-1');
        if (car.driftFriction < 0 || car.driftFriction > 1) throw new Error('driftFriction must be 0-1');
        if (car.handBrakeFriction < 0 || car.handBrakeFriction > 1) throw new Error('handBrakeFriction must be 0-1');
        
        // Validate quality tiers
        if (quality.poorMax >= quality.goodMax) throw new Error('Quality tier boundaries must be ascending');
        if (quality.goodMax >= quality.perfectMin) throw new Error('Quality tier boundaries must be ascending');
    };
    
    validateConfig(PhysicsConfig);
}
```

### Integration Points

- **Game Architecture**: Implements the PhysicsConfig section from architecture document
- **DriftPhysics System**: Will consume these types and configuration (Story 2.1.4, 2.1.5)
- **Car Game Object**: Will use ICarPhysicsState interface (Story 2.1.2)
- **InputManager**: Will use IInputState and IKeyMapping interfaces (Story 2.1.3)
- **DriftQuality System**: Will use quality configuration for scoring (Epic 2.3)

### Dependencies

**Depends On:**
- None (this is foundational work)

**Blocks:**
- Story 2.1.2 (Car Game Object needs ICarPhysicsState)
- Story 2.1.3 (InputManager needs IInputState and IKeyMapping)
- Story 2.1.4 (DriftPhysics needs all type definitions)
- Story 2.1.5 (Drift mechanics need drift-specific types)

---

## Implementation Tasks

Developers should complete these tasks in order:

### Task 1: Create PhysicsTypes.ts
- [ ] Create `src/types/PhysicsTypes.ts` file
- [ ] Define DriftState enum with three states (Grip, Drift, Handbrake)
- [ ] Define ICarPhysicsState interface with all state properties
- [ ] Define IDriftData interface for drift calculations
- [ ] Define IPhysicsConfig, ICarConfig, and IQualityConfig interfaces
- [ ] Add JSDoc comments for all types with units and descriptions
- [ ] Verify no TypeScript errors in strict mode

### Task 2: Create InputTypes.ts
- [ ] Create `src/types/InputTypes.ts` file
- [ ] Define InputAction enum with all game actions
- [ ] Define IInputState interface for frame-by-frame input tracking
- [ ] Define IKeyMapping interface for configurable controls
- [ ] Export DEFAULT_KEY_MAPPING constant with WASD + Arrow key defaults
- [ ] Add JSDoc comments for all types
- [ ] Verify no TypeScript errors in strict mode

### Task 3: Create PhysicsConfig.ts
- [ ] Create `src/config/PhysicsConfig.ts` file
- [ ] Implement PhysicsConfig constant with all car movement parameters
- [ ] Implement all drift physics parameters matching architecture specs
- [ ] Implement all quality scoring parameters matching architecture specs
- [ ] Add comprehensive JSDoc comments with units for every parameter
- [ ] Add development-only validation function to catch config errors early
- [ ] Verify all values match the Game Architecture Document exactly

### Task 4: Write Unit Tests
- [ ] Create `tests/config/PhysicsConfig.test.ts` file
- [ ] Test: PhysicsConfig exports without errors
- [ ] Test: All car parameters are numbers and within valid ranges
- [ ] Test: Friction coefficients are between 0 and 1
- [ ] Test: Quality tier boundaries are ascending (poor < good < perfect)
- [ ] Test: Configuration is deeply frozen in production (immutable)
- [ ] Test: Validation function catches invalid configurations
- [ ] Achieve 100% test coverage on configuration structure

### Task 5: Documentation & Review
- [ ] Verify all JSDoc comments include units and valid ranges
- [ ] Confirm configuration matches architecture document values
- [ ] Run ESLint and fix any warnings
- [ ] Run TypeScript compiler in strict mode, ensure zero errors
- [ ] Document any deviations from architecture document with rationale
- [ ] Update story status to "Ready for Review"

---

## Testing Requirements

### Unit Tests

**Configuration Structure Tests:**
```typescript
describe('PhysicsConfig', () => {
    it('should export a valid physics configuration', () => {
        expect(PhysicsConfig).toBeDefined();
        expect(PhysicsConfig.car).toBeDefined();
        expect(PhysicsConfig.quality).toBeDefined();
    });
    
    it('should have all required car parameters', () => {
        const { car } = PhysicsConfig;
        expect(car.maxSpeed).toBeGreaterThan(0);
        expect(car.acceleration).toBeGreaterThan(0);
        expect(car.driftThreshold).toBeGreaterThan(0);
    });
    
    it('should have friction coefficients between 0 and 1', () => {
        const { car } = PhysicsConfig;
        expect(car.gripFriction).toBeGreaterThanOrEqual(0);
        expect(car.gripFriction).toBeLessThanOrEqual(1);
        expect(car.driftFriction).toBeGreaterThanOrEqual(0);
        expect(car.driftFriction).toBeLessThanOrEqual(1);
        expect(car.handBrakeFriction).toBeGreaterThanOrEqual(0);
        expect(car.handBrakeFriction).toBeLessThanOrEqual(1);
    });
    
    it('should have ascending quality tier boundaries', () => {
        const { quality } = PhysicsConfig;
        expect(quality.poorMax).toBeLessThan(quality.goodMax);
        expect(quality.goodMax).toBeLessThan(quality.perfectMin);
    });
    
    it('should match architecture document specifications', () => {
        const { car } = PhysicsConfig;
        expect(car.maxSpeed).toBe(400);
        expect(car.driftThreshold).toBe(100);
        expect(car.gripFriction).toBe(0.95);
        expect(car.driftFriction).toBe(0.7);
        expect(car.handBrakeFriction).toBe(0.5);
    });
});
```

**Type Definition Tests:**
```typescript
describe('PhysicsTypes', () => {
    it('should define DriftState enum with correct values', () => {
        expect(DriftState.Grip).toBe('GRIP');
        expect(DriftState.Drift).toBe('DRIFT');
        expect(DriftState.Handbrake).toBe('HANDBRAKE');
    });
    
    it('should allow valid ICarPhysicsState objects', () => {
        const state: ICarPhysicsState = {
            position: { x: 0, y: 0 },
            velocity: { x: 0, y: 0 },
            rotation: 0,
            speed: 0,
            lateralVelocity: 0,
            driftAngle: 0,
            driftState: DriftState.Grip,
            isAccelerating: false,
            isBraking: false,
            isHandbraking: false
        };
        
        expect(state).toBeDefined();
        expect(state.driftState).toBe(DriftState.Grip);
    });
});

describe('InputTypes', () => {
    it('should export DEFAULT_KEY_MAPPING with all actions', () => {
        expect(DEFAULT_KEY_MAPPING[InputAction.Accelerate]).toContain('W');
        expect(DEFAULT_KEY_MAPPING[InputAction.Brake]).toContain('S');
        expect(DEFAULT_KEY_MAPPING[InputAction.Handbrake]).toContain('SPACE');
    });
});
```

### Manual Testing

**Configuration Validation:**
1. Import PhysicsConfig in a test file
2. Verify no TypeScript errors
3. Verify all parameters are accessible
4. Modify a friction value to 1.5 (invalid) and verify validation catches it in dev mode

**Type Safety:**
1. Create a test function accepting ICarPhysicsState
2. Pass an object missing required properties
3. Verify TypeScript compiler catches the error
4. Verify IntelliSense provides autocomplete for all properties

---

## Definition of Done

- [ ] All files created and placed in correct directories
- [ ] PhysicsConfig matches architecture document specifications exactly
- [ ] All TypeScript interfaces defined with proper types (no `any`)
- [ ] JSDoc comments include units and valid ranges for all parameters
- [ ] Unit tests achieve 100% coverage on configuration structure
- [ ] TypeScript compiles with zero errors in strict mode
- [ ] ESLint passes with zero warnings
- [ ] Configuration is immutable (frozen in production builds)
- [ ] Development validation catches common configuration errors
- [ ] Code reviewed and approved by team
- [ ] Story marked as "Complete" and ready for next stories to begin

---

## Notes

**Why This Story is Separate:**
- Foundational work that enables parallel development of Stories 2.1.2, 2.1.3
- Configuration changes are common during gameplay tuning - centralized location critical
- Type definitions ensure compile-time safety across the entire physics system
- No Phaser dependencies means fast unit testing without engine overhead

**Future Considerations:**
- Configuration could be loaded from JSON for runtime tuning (post-MVP)
- Additional difficulty modes could modify these values (e.g., "Arcade" vs "Simulation")
- Track-specific physics modifiers could reference these base values

**Developer Tips:**
- Use const assertions (`as const`) for readonly configuration
- Consider using `Object.freeze()` in production to prevent accidental mutations
- Export individual sub-configs if other systems only need specific parts
- Keep validation logic in development mode only to avoid production overhead
