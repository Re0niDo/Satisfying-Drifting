# Story 2.1.3: Input Manager System

**Epic:** Epic 2.1: Car Physics & Movement  
**Story ID:** 2.1.3  
**Priority:** High  
**Points:** 3  
**Status:** Complete

---

## Description

Implement the InputManager singleton system to handle all player keyboard input with frame-perfect detection. The InputManager polls input every frame, tracks key states (pressed this frame, held, released), implements input buffering for the restart key, and provides a clean API for other systems to query input state. This system operates independently of the Car object and will be consumed by the DriftPhysics system.

The InputManager follows the singleton pattern and is registered in the scene registry for global access, ensuring consistent input handling across all scenes.

**GDD Reference:** Input Management System (Architecture Document)

---

## Acceptance Criteria

### Functional Requirements

- [x] InputManager singleton can be instantiated once and accessed globally
- [x] Polls keyboard input every frame (WASD, Arrows, Space, R, ESC)
- [x] Tracks key states: pressed this frame, currently held, released this frame
- [x] Implements input buffering for R key (prevents accidental double-restart)
- [x] Provides clean getter methods for all input actions
- [x] Registered in scene registry for access by other systems
- [x] Properly cleans up keyboard listeners on destroy
- [x] Prevents default browser behavior for all mapped keys (Space, arrows, etc.)

### Technical Requirements

- [x] Code follows TypeScript strict mode standards
- [x] Uses IInputState and IKeyMapping interfaces from Story 2.1.1
- [x] Implements singleton pattern with private constructor
- [x] Memory leak prevention: removes all keyboard listeners on destroy
- [x] No dependencies on Car or physics systems (pure input handling)
- [x] Frame-accurate input detection (polling, not event-based)
- [x] Uses Phaser `JustDown` / `JustUp` helpers for single-frame detection
- [x] Uses scene time (e.g., `scene.time.now` or update `time` param) for restart cooldown instead of `Date.now()`
- [x] Hooks into scene shutdown events to guarantee cleanup even if `destroy()` is not called manually

### Game Design Requirements

- [x] WASD and Arrow keys both work for movement (accessibility)
- [x] Space bar triggers handbrake (easily accessible during driving)
- [x] R key requires 300ms cooldown between restarts (prevent spam)
- [x] ESC key for pause works immediately without buffering
- [x] Input response feels instant (< 16ms latency at 60 FPS)

---

## Technical Specifications

### Files to Create/Modify

**New Files:**

- `src/systems/InputManager.ts` - Main InputManager singleton class
- `tests/systems/InputManager.test.ts` - Unit tests for input handling

**Modified Files:**

- `src/scenes/BootScene.ts` - Instantiate InputManager and register in scene registry
- `src/scenes/GameScene.ts` - Access InputManager and log input for testing

### Class/Interface Definitions

```typescript
// src/systems/InputManager.ts

import Phaser from 'phaser';
import type { IInputState, IKeyMapping, InputAction } from '../types/InputTypes';
import { DEFAULT_KEY_MAPPING } from '../types/InputTypes';

/**
 * InputManager singleton handles all player input.
 * Provides frame-accurate input polling for responsive controls.
 * 
 * Usage:
 *   const input = InputManager.getInstance();
 *   if (input.isAccelerating()) { ... }
 */
export class InputManager {
    private static instance: InputManager | null = null;
    
    private scene: Phaser.Scene;
    private keyboard!: Phaser.Input.Keyboard.KeyboardPlugin;
    private keyMapping: IKeyMapping;
    private inputState: IInputState;
    
    // Input buffering
    private lastRestartTime: number = 0;
    private restartCooldown: number = 300; // milliseconds
    
    // Key objects for fast polling
    private keys: {
        accelerate: Phaser.Input.Keyboard.Key[];
        brake: Phaser.Input.Keyboard.Key[];
        steerLeft: Phaser.Input.Keyboard.Key[];
        steerRight: Phaser.Input.Keyboard.Key[];
        handbrake: Phaser.Input.Keyboard.Key[];
        restart: Phaser.Input.Keyboard.Key[];
        pause: Phaser.Input.Keyboard.Key[];
    };
    
    /**
     * Private constructor (singleton pattern)
     */
    private constructor(scene: Phaser.Scene, keyMapping?: IKeyMapping) {
        this.scene = scene;
        this.keyboard = scene.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin;
        this.keyMapping = keyMapping || DEFAULT_KEY_MAPPING;
        
        this.inputState = this.createInitialState();
        this.keys = this.createKeyObjects();

        // Ensure singleton cleans itself up with the scene
        this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    }
    
    /**
     * Get or create singleton instance
     */
    public static getInstance(scene?: Phaser.Scene, keyMapping?: IKeyMapping): InputManager {
        if (!InputManager.instance) {
            if (!scene) {
                throw new Error('InputManager: First call to getInstance must provide a scene');
            }
            InputManager.instance = new InputManager(scene, keyMapping);
        }
        return InputManager.instance;
    }
    
    /**
     * Check if instance exists (for testing)
     */
    public static hasInstance(): boolean {
        return InputManager.instance !== null;
    }
    
    /**
     * Destroy singleton instance
     */
    public static destroyInstance(): void {
        if (InputManager.instance) {
            InputManager.instance.destroy();
            InputManager.instance = null;
        }
    }
    
    /**
     * Create initial input state
     */
    private createInitialState(): IInputState {
        return {
            accelerate: false,
            brake: false,
            steerLeft: false,
            steerRight: false,
            handbrake: false,
            restart: false,
            pause: false,
            acceleratePressed: false,
            brakePressed: false,
            handbrakePressed: false,
            restartPressed: false,
            pausePressed: false
        };
    }
    
    /**
     * Create Phaser key objects from key mapping
     */
    private createKeyObjects(): typeof this.keys {
        const addKeys = (keyCodes: string[]): Phaser.Input.Keyboard.Key[] => {
            return keyCodes.map(code => this.keyboard.addKey(code, true));
        };
        
        return {
            accelerate: addKeys(this.keyMapping.ACCELERATE),
            brake: addKeys(this.keyMapping.BRAKE),
            steerLeft: addKeys(this.keyMapping.STEER_LEFT),
            steerRight: addKeys(this.keyMapping.STEER_RIGHT),
            handbrake: addKeys(this.keyMapping.HANDBRAKE),
            restart: addKeys(this.keyMapping.RESTART),
            pause: addKeys(this.keyMapping.PAUSE)
        };
    }
    
    /**
     * Update input state (call every frame before physics update)
     */
    public update(time?: number): void {
        const now = (time ?? this.scene.time.now) || 0;
        
        // Update held states
        this.inputState.accelerate = this.isAnyKeyDown(this.keys.accelerate);
        this.inputState.brake = this.isAnyKeyDown(this.keys.brake);
        this.inputState.steerLeft = this.isAnyKeyDown(this.keys.steerLeft);
        this.inputState.steerRight = this.isAnyKeyDown(this.keys.steerRight);
        this.inputState.handbrake = this.isAnyKeyDown(this.keys.handbrake);
        this.inputState.pause = this.isAnyKeyDown(this.keys.pause);
        
        // Update "pressed this frame" states via Phaser helpers
        this.inputState.acceleratePressed = this.wasAnyJustDown(this.keys.accelerate);
        this.inputState.brakePressed = this.wasAnyJustDown(this.keys.brake);
        this.inputState.handbrakePressed = this.wasAnyJustDown(this.keys.handbrake);
        this.inputState.pausePressed = this.wasAnyJustDown(this.keys.pause);
        
        // Restart with cooldown buffering
        const restartJustDown = this.wasAnyJustDown(this.keys.restart);
        const timeSinceLastRestart = now - this.lastRestartTime;
        
        if (restartJustDown && timeSinceLastRestart >= this.restartCooldown) {
            this.inputState.restart = true;
            this.inputState.restartPressed = true;
            this.lastRestartTime = now;
        } else {
            this.inputState.restart = false;
            this.inputState.restartPressed = false;
        }
    }
    
    /**
     * Check if any key in array is currently down
     */
    private isAnyKeyDown(keys: Phaser.Input.Keyboard.Key[]): boolean {
        return keys.some(key => key.isDown);
    }

    private wasAnyJustDown(keys: Phaser.Input.Keyboard.Key[]): boolean {
        return keys.some(key => Phaser.Input.Keyboard.JustDown(key));
    }
    
    // Public getters for input state
    
    public isAccelerating(): boolean {
        return this.inputState.accelerate;
    }
    
    public isBraking(): boolean {
        return this.inputState.brake;
    }
    
    public isSteeringLeft(): boolean {
        return this.inputState.steerLeft;
    }
    
    public isSteeringRight(): boolean {
        return this.inputState.steerRight;
    }
    
    public isHandbraking(): boolean {
        return this.inputState.handbrake;
    }
    
    public isRestarting(): boolean {
        return this.inputState.restart;
    }
    
    public isPausing(): boolean {
        return this.inputState.pause;
    }
    
    /**
     * Get steering input as -1 (left), 0 (none), or 1 (right)
     */
    public getSteeringAxis(): number {
        if (this.inputState.steerLeft && this.inputState.steerRight) {
            return 0; // Both pressed, cancel out
        }
        if (this.inputState.steerLeft) return -1;
        if (this.inputState.steerRight) return 1;
        return 0;
    }
    
    /**
     * Get acceleration input as -1 (brake), 0 (coast), or 1 (accelerate)
     */
    public getAccelerationAxis(): number {
        if (this.inputState.accelerate && this.inputState.brake) {
            return 0; // Both pressed, cancel out
        }
        if (this.inputState.accelerate) return 1;
        if (this.inputState.brake) return -1;
        return 0;
    }
    
    /**
     * Check if action was pressed THIS FRAME
     */
    public wasPressed(action: InputAction): boolean {
        switch (action) {
            case 'ACCELERATE': return this.inputState.acceleratePressed;
            case 'BRAKE': return this.inputState.brakePressed;
            case 'HANDBRAKE': return this.inputState.handbrakePressed;
            case 'RESTART': return this.inputState.restartPressed;
            case 'PAUSE': return this.inputState.pausePressed;
            default: return false;
        }
    }
    
    /**
     * Get full input state (read-only)
     */
    public getState(): Readonly<IInputState> {
        return { ...this.inputState };
    }
    
    /**
     * Reset all input to default state
     */
    public reset(): void {
        this.inputState = this.createInitialState();
        this.lastRestartTime = 0;
    }
    
    /**
     * Clean up resources
     */
    public destroy(): void {
        // Remove all keyboard listeners
        Object.values(this.keys).flat().forEach(key => {
            this.keyboard.removeKey(key);
        });
        
        // Clear references
        this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
        this.scene = null as any;
        this.keyboard = null as any;
    }
}
```

### Integration Points

- **BootScene**: InputManager instantiated and registered in scene.registry
- **GameScene**: Calls `InputManager.update(time)` every frame before physics so cooldowns follow the scene clock
- **DriftPhysics**: Will query InputManager for movement input (Story 2.1.4)
- **InputTypes**: Uses IInputState and IKeyMapping from Story 2.1.1

### Dependencies

**Depends On:**
- Story 2.1.1 (needs IInputState and IKeyMapping interfaces)

**Blocks:**
- Story 2.1.4 (DriftPhysics needs input to control car movement)

---

## Implementation Tasks

Developers should complete these tasks in order:

### Task 1: Implement InputManager Singleton
- [x] Create `src/systems/InputManager.ts` file
- [x] Implement private constructor with scene and optional key mapping
- [x] Implement getInstance() static method with lazy initialization
- [x] Implement hasInstance() and destroyInstance() static methods
- [x] Add singleton instance as private static property
- [x] Register a `Phaser.Scenes.Events.SHUTDOWN` listener to auto-destroy the singleton when the scene ends
- [x] Verify singleton pattern prevents multiple instances

### Task 2: Implement Key Registration
- [x] Implement createKeyObjects() method using keyboard.addKey()
- [x] Map all InputAction enum values to Phaser key codes
- [x] Support multiple keys per action (WASD + Arrows)
- [x] Store key objects in structured dictionary
- [x] Enable key capture to block default browser behavior for all registered keys
- [x] Verify all keys are registered correctly

### Task 3: Implement Input Polling
- [x] Implement update() method to be called every frame
- [x] Implement isAnyKeyDown() helper for multi-key support
- [x] Update held states for all actions
- [x] Use Phaser `Keyboard.JustDown` helpers to calculate "pressed this frame" states
- [x] Verify input detection is frame-accurate

### Task 4: Implement Restart Buffering
- [x] Add lastRestartTime and restartCooldown properties
- [x] Implement cooldown logic in update() for restart key
- [x] Prevent restart spam by enforcing 300ms cooldown
- [x] Test restart buffering manually
- [x] Use scene time or update `time` argument rather than `Date.now()` so cooldown matches the game clock
- [x] Verify restart only triggers once per cooldown period

### Task 5: Implement Public API
- [x] Implement all getter methods (isAccelerating, isBraking, etc.)
- [x] Implement getSteeringAxis() returning -1, 0, or 1
- [x] Implement getAccelerationAxis() returning -1, 0, or 1
- [x] Implement wasPressed(action) for frame-specific input
- [x] Implement getState() returning readonly copy of state
- [x] Implement reset() method to clear all input
- [x] Add helper(s) (e.g., `wasAnyJustDown`) to keep Phaser-specific polling logic isolated
- [x] Add JSDoc comments for all public methods

### Task 6: Integrate with BootScene
- [x] Modify `src/scenes/BootScene.ts` to instantiate InputManager
- [x] Register InputManager in scene.registry with key 'inputManager'
- [x] Verify InputManager persists across scene transitions
- [x] Test InputManager accessible from GameScene

### Task 7: Integrate with GameScene
- [x] Modify `src/scenes/GameScene.ts` to retrieve InputManager from registry
- [x] Call `inputManager.update(time)` at start of `GameScene.update()`
- [x] Add debug logging to console showing current input state
- [x] Verify input updates every frame
- [x] Test all keys and verify console output

### Task 8: Write Unit Tests
- [x] Create `tests/systems/InputManager.test.ts` file
- [x] Test: Singleton pattern enforces single instance
- [x] Test: getInstance() requires scene on first call
- [x] Test: All keys are registered correctly
- [x] Test: Input state updates correctly when keys pressed
- [x] Test: "Pressed this frame" detection works correctly
- [x] Test: Restart cooldown prevents spam
- [x] Test: getSteeringAxis() returns correct values
- [x] Test: destroy() cleans up keyboard listeners
- [x] Achieve 85%+ test coverage

### Task 9: Manual Testing
- [x] Run game and open browser console
- [x] Press W/Up - verify accelerate = true in console
- [x] Press S/Down - verify brake = true in console
- [x] Press A/Left - verify steerLeft = true in console
- [x] Press D/Right - verify steerRight = true in console
- [x] Press Space - verify handbrake = true in console
- [x] Press R twice rapidly - verify only one restart triggers
- [x] Press ESC - verify pause = true in console
- [x] Verify input feels responsive (no lag)
- [x] Confirm browser window does not scroll or lose focus while pressing Space or Arrow keys

---

## Testing Requirements

### Unit Tests

**Singleton Pattern Tests:**
```typescript
describe('InputManager Singleton', () => {
    let scene: Phaser.Scene;
    
    beforeEach(() => {
        scene = createMockScene();
        InputManager.destroyInstance();
    });
    
    afterEach(() => {
        InputManager.destroyInstance();
    });
    
    it('should throw error if getInstance called without scene first', () => {
        expect(() => InputManager.getInstance()).toThrow();
    });
    
    it('should create instance on first call with scene', () => {
        const instance = InputManager.getInstance(scene);
        expect(instance).toBeDefined();
        expect(InputManager.hasInstance()).toBe(true);
    });
    
    it('should return same instance on subsequent calls', () => {
        const instance1 = InputManager.getInstance(scene);
        const instance2 = InputManager.getInstance();
        expect(instance1).toBe(instance2);
    });
    
    it('should destroy instance when destroyInstance called', () => {
        InputManager.getInstance(scene);
        InputManager.destroyInstance();
        expect(InputManager.hasInstance()).toBe(false);
    });
});
```

**Input Detection Tests:**
```typescript
describe('InputManager Input Detection', () => {
    let scene: Phaser.Scene;
    let input: InputManager;
    let mockKeys: { [key: string]: Phaser.Input.Keyboard.Key };
    
    beforeEach(() => {
        scene = createMockScene();
        mockKeys = createMockKeys();
        scene.input.keyboard = { addKey: jest.fn((code) => mockKeys[code]) } as any;
        
        input = InputManager.getInstance(scene);
    });
    
    afterEach(() => {
        InputManager.destroyInstance();
    });
    
    it('should detect accelerate input', () => {
        mockKeys['W'].isDown = true;
        input.update();
        expect(input.isAccelerating()).toBe(true);
    });
    
    it('should detect steering input', () => {
        mockKeys['A'].isDown = true;
        input.update();
        expect(input.getSteeringAxis()).toBe(-1);
        
        mockKeys['D'].isDown = true;
        mockKeys['A'].isDown = false;
        input.update();
        expect(input.getSteeringAxis()).toBe(1);
    });
    
    it('should cancel opposite inputs', () => {
        mockKeys['W'].isDown = true;
        mockKeys['S'].isDown = true;
        input.update();
        expect(input.getAccelerationAxis()).toBe(0);
    });
    
    it('should detect "pressed this frame"', () => {
        input.update(); // Frame 1: no input
        
        mockKeys['SPACE'].isDown = true;
        input.update(); // Frame 2: handbrake pressed
        
        expect(input.wasPressed(InputAction.Handbrake)).toBe(true);
        
        input.update(); // Frame 3: still held
        expect(input.wasPressed(InputAction.Handbrake)).toBe(false);
    });
});
```

**Restart Buffering Tests:**
```typescript
describe('InputManager Restart Buffering', () => {
    let scene: Phaser.Scene;
    let input: InputManager;
    let mockKeys: { [key: string]: Phaser.Input.Keyboard.Key };
    
    beforeEach(() => {
        scene = createMockScene();
        mockKeys = createMockKeys();
        scene.input.keyboard = { addKey: jest.fn((code) => mockKeys[code]) } as any;
        input = InputManager.getInstance(scene);
    });
    
    afterEach(() => {
        InputManager.destroyInstance();
    });
    
    it('should allow first restart immediately', () => {
        mockKeys['R'].isDown = true;
        input.update();
        expect(input.isRestarting()).toBe(true);
    });
    
    it('should block second restart within cooldown period', () => {
        mockKeys['R'].isDown = true;
        input.update();
        expect(input.isRestarting()).toBe(true);
        
        // Immediate second press (within 300ms)
        input.update();
        expect(input.isRestarting()).toBe(false);
    });
    
    it('should allow restart after cooldown expires', (done) => {
        mockKeys['R'].isDown = true;
        input.update();
        
        mockKeys['R'].isDown = false;
        input.update();
        
        // Wait for cooldown to expire
        setTimeout(() => {
            mockKeys['R'].isDown = true;
            input.update();
            expect(input.isRestarting()).toBe(true);
            done();
        }, 350); // 350ms > 300ms cooldown
    });
});
```

### Manual Testing

**Input Responsiveness Test:**
1. Start game and navigate to GameScene
2. Open browser console (shows input state)
3. Press and hold W key
4. Verify console shows `accelerate: true` immediately
5. Release W key
6. Verify console shows `accelerate: false` immediately (< 1 frame delay)

**Multi-Key Support Test:**
1. Press W to accelerate
2. Press Up Arrow while W is held
3. Verify both work (either triggers accelerate)
4. Release W, keep Up pressed
5. Verify accelerate still true

**Restart Buffering Test:**
1. Press R key 5 times rapidly
2. Verify only first press triggers restart
3. Wait 1 second
4. Press R again
5. Verify restart triggers

---

## Definition of Done

- [x] InputManager singleton implemented with all public methods
- [x] All keyboard inputs registered correctly (WASD, Arrows, Space, R, ESC)
- [x] Input polling happens every frame with accurate state tracking
- [x] "Pressed this frame" detection works correctly
- [x] Restart buffering prevents spam (300ms cooldown)
- [x] Integrated with BootScene (registered in scene registry)
- [x] Integrated with GameScene (update() called every frame)
- [x] Unit tests achieve 85%+ coverage
- [x] Manual testing confirms all keys work and feel responsive
- [x] No memory leaks when destroying InputManager
- [x] Scene shutdown event destroys singleton without manual intervention
- [x] No browser default actions triggered by registered keys
- [x] TypeScript compiles with zero errors in strict mode
- [x] ESLint passes with zero warnings
- [x] Code reviewed and approved
- [x] Story marked as "Complete"

---

## Notes

**Why This Story is Separate:**
- Input handling is a distinct concern from physics calculations
- Can be developed in parallel with Car object (Story 2.1.2)
- Singleton pattern ensures consistent input state across entire game
- Pure input system is easier to test without physics dependencies

**Singleton Pattern Rationale:**
- Only one instance needed (one keyboard)
- Accessible from any scene without passing references
- Scene registry provides global access point
- Easy to mock for testing
- Scene shutdown listener guarantees cleanup even if consumers forget to call `destroy()`

**Frame-Accurate Input:**
- Polling (not events) ensures input checked every frame
- Critical for responsive car controls at 60 FPS
- "Pressed this frame" state enables single-frame actions (restart, pause) using Phaser `JustDown` helpers tied to the keyboard plugin update

**Input Buffering:**
- Restart cooldown prevents accidental scene reload spam
- 300ms cooldown is barely noticeable but prevents rapid double-taps
- Pause has no cooldown (instant response expected)
- Cooldown uses the Phaser scene clock, keeping behavior stable during slow motion, pause, or replay scenarios

**Future Enhancements:**
- Gamepad support (Xbox/PlayStation controllers)
- Touch controls for mobile port
- Configurable key remapping (saved to localStorage)
- Input recording and playback for replay system

**Developer Tips:**
- Expose InputManager in debug mode: `(window as any).debugInput = inputManager`
- Use debug overlay to visualize input state during physics tuning
- Consider adding input visualization (on-screen key display for testing)
