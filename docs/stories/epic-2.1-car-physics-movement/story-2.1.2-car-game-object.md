# Story 2.1.2: Car Game Object with Basic Physics Body

**Epic:** Epic 2.1: Car Physics & Movement  
**Story ID:** 2.1.2  
**Priority:** High  
**Points:** 3  
**Status:** Draft

---

## Description

Create the Car game object as a Phaser Sprite with an Arcade Physics body. This story establishes the visual representation and physical presence of the car in the game world, including proper lifecycle management, positioning, rotation, and collision bounds. The Car will serve as the central game entity that the DriftPhysics system will enhance in subsequent stories.

At this stage, the Car is a passive object with physics enabled but no movement logic - it can be placed in the scene and rotated, but won't respond to input or move on its own.

**GDD Reference:** Game Object Pattern (Architecture Document), Car Physics System

---

## Acceptance Criteria

### Functional Requirements

- [ ] Car game object extends Phaser.GameObjects.Sprite
- [ ] Car has Arcade Physics body with proper collision bounds
- [ ] Car can be instantiated with position (x, y) and optional rotation
- [ ] Car is visible in GameScene with placeholder sprite (colored rectangle)
- [ ] Car properly cleans up resources when destroyed (implements preDestroy)
- [ ] Car can be positioned, rotated, and displayed without errors

### Technical Requirements

- [ ] Code follows TypeScript strict mode standards
- [ ] Implements Phaser 3.90+ lifecycle methods (preDestroy, addedToScene, removedFromScene)
- [ ] Uses ICarPhysicsState interface from Story 2.1.1
- [ ] Memory leak prevention: implements removeAllListeners() in cleanup
- [ ] Physics body configuration follows architecture specifications
- [ ] Proper JSDoc comments for all public methods

### Game Design Requirements

- [ ] Car sprite dimensions match intended gameplay scale (placeholder: 32x48px rectangle)
- [ ] Physics body collision bounds are accurate for gameplay (slightly smaller than sprite)
- [ ] Car origin point is centered for correct rotation behavior
- [ ] Default car color is distinguishable from track background (bright red/blue)

---

## Technical Specifications

### Files to Create/Modify

**New Files:**

- `src/gameObjects/Car.ts` - Main Car game object class
- `tests/gameObjects/Car.test.ts` - Unit tests for Car class

**Modified Files:**

- `src/scenes/GameScene.ts` - Instantiate Car and add to scene for testing
- `src/types/PhysicsTypes.ts` - Add ICarConfig interface if not already present

### Class/Interface Definitions

```typescript
// src/gameObjects/Car.ts

import Phaser from 'phaser';
import type { ICarPhysicsState, DriftState } from '../types/PhysicsTypes';

/**
 * Car game object with Arcade Physics body.
 * Represents the player-controlled vehicle in the game.
 * 
 * This is the foundation for the physics system - movement logic
 * will be added by the DriftPhysics component in later stories.
 */
export class Car extends Phaser.GameObjects.Sprite {
    /**
     * Physics body (Arcade Physics)
     */
    public body!: Phaser.Physics.Arcade.Body;
    
    /**
     * Current physics state (for debugging and future physics integration)
     */
    private physicsState: ICarPhysicsState;
    
    /**
     * Create a new Car instance
     * @param scene - The scene this car belongs to
     * @param x - Initial X position
     * @param y - Initial Y position
     * @param texture - Sprite texture key (default: placeholder)
     */
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string = 'car_placeholder'
    ) {
        super(scene, x, y, texture);
        
        // Initialize physics state
        this.physicsState = this.createInitialState(x, y);
        
        // Add to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Configure physics body
        this.setupPhysicsBody();
        
        // Set display properties
        this.setOrigin(0.5, 0.5);  // Center origin for rotation
        this.setDepth(10);         // Render above track
    }
    
    /**
     * Create initial physics state
     */
    private createInitialState(x: number, y: number): ICarPhysicsState {
        return {
            position: { x, y },
            velocity: { x: 0, y: 0 },
            rotation: 0,
            speed: 0,
            lateralVelocity: 0,
            driftAngle: 0,
            driftState: 'GRIP' as DriftState.Grip,
            isAccelerating: false,
            isBraking: false,
            isHandbraking: false
        };
    }
    
    /**
     * Configure the Arcade Physics body
     */
    private setupPhysicsBody(): void {
        // Set collision bounds (slightly smaller than sprite for better feel)
        const boundsWidth = this.width * 0.8;
        const boundsHeight = this.height * 0.9;
        this.body.setSize(boundsWidth, boundsHeight);
        
        // Enable collision
        this.body.setCollideWorldBounds(false);  // Cars can go off-screen
        
        // Set drag to 0 (we'll handle friction in DriftPhysics)
        this.body.setDrag(0);
        this.body.setAngularDrag(0);
        
        // Disable bounce (cars don't bounce off track boundaries)
        this.body.setBounce(0, 0);
        
        // Set max velocity (will be controlled by DriftPhysics)
        this.body.setMaxVelocity(500, 500);  // Generous limit for drift physics
    }
    
    /**
     * Get current physics state (read-only)
     */
    public getPhysicsState(): Readonly<ICarPhysicsState> {
        return { ...this.physicsState };
    }
    
    /**
     * Set car position
     */
    public setCarPosition(x: number, y: number): void {
        this.setPosition(x, y);
        this.physicsState.position = { x, y };
        this.body.reset(x, y);
    }
    
    /**
     * Set car rotation (in degrees)
     */
    public setCarRotation(degrees: number): void {
        this.setAngle(degrees);
        this.physicsState.rotation = degrees;
    }
    
    /**
     * Reset car to initial state
     */
    public reset(x: number, y: number, rotation: number = 0): void {
        this.setCarPosition(x, y);
        this.setCarRotation(rotation);
        this.body.setVelocity(0, 0);
        this.body.setAngularVelocity(0);
        
        this.physicsState = this.createInitialState(x, y);
        this.physicsState.rotation = rotation;
    }
    
    /**
     * Update method (called every frame by scene)
     * Currently empty - physics logic added in later stories
     */
    public update(time: number, delta: number): void {
        // Update physics state from body (for debugging)
        this.physicsState.position = { x: this.x, y: this.y };
        this.physicsState.velocity = { 
            x: this.body.velocity.x, 
            y: this.body.velocity.y 
        };
        this.physicsState.speed = this.body.speed;
        this.physicsState.rotation = this.angle;
        
        // Movement logic will be added by DriftPhysics component in Story 2.1.4
    }
    
    /**
     * Called automatically when added to a scene (Phaser 3.50+)
     */
    addedToScene(): void {
        // Future: Register with physics system
    }
    
    /**
     * Called automatically when removed from a scene (Phaser 3.50+)
     */
    removedFromScene(): void {
        // Future: Unregister from physics system
    }
    
    /**
     * Cleanup before destruction (Phaser 3.50+)
     * CRITICAL: This runs BEFORE parent destroy
     */
    preDestroy(): void {
        // Remove all event listeners to prevent memory leaks
        this.removeAllListeners();
        
        // Future: Clean up DriftPhysics component (Story 2.1.4)
        
        // Note: Don't manually destroy physics body - Phaser handles this
    }
}
```

### Integration Points

- **GameScene**: Car will be instantiated and added to the scene
- **PhysicsTypes**: Uses ICarPhysicsState interface (Story 2.1.1)
- **DriftPhysics**: Future component will control car movement (Story 2.1.4, 2.1.5)
- **AssetManager**: Will load car sprite in future stories (currently uses placeholder)

### Dependencies

**Depends On:**
- Story 2.1.1 (needs ICarPhysicsState interface)

**Blocks:**
- Story 2.1.4 (DriftPhysics needs Car object to control)
- Story 2.1.5 (Drift mechanics operate on Car object)

---

## Implementation Tasks

Developers should complete these tasks in order:

### Task 1: Create Placeholder Car Sprite
- [ ] Create a 32x48px red rectangle as temporary car sprite
- [ ] Add to `src/scenes/GameScene.ts` preload method as graphics texture
- [ ] Generate texture with key 'car_placeholder' using Phaser.GameObjects.Graphics
- [ ] Verify placeholder renders correctly in scene

### Task 2: Implement Car Class
- [ ] Create `src/gameObjects/Car.ts` file
- [ ] Implement Car class extending Phaser.GameObjects.Sprite
- [ ] Implement constructor with scene, position, and optional texture parameters
- [ ] Add Car to scene display list and physics world in constructor
- [ ] Implement setupPhysicsBody() method with proper collision bounds
- [ ] Implement createInitialState() to initialize ICarPhysicsState
- [ ] Add TypeScript type assertion for physics body (body!: Phaser.Physics.Arcade.Body)

### Task 3: Implement Position and Rotation Methods
- [ ] Implement setCarPosition(x, y) method
- [ ] Implement setCarRotation(degrees) method
- [ ] Implement reset(x, y, rotation) method for respawn functionality
- [ ] Implement getPhysicsState() getter returning readonly state
- [ ] Verify all methods update both sprite and internal state

### Task 4: Implement Lifecycle Methods
- [ ] Implement update(time, delta) method (currently syncs state from body)
- [ ] Implement addedToScene() lifecycle callback (placeholder for future)
- [ ] Implement removedFromScene() lifecycle callback (placeholder for future)
- [ ] Implement preDestroy() with removeAllListeners() call
- [ ] Add JSDoc comments for all lifecycle methods

### Task 5: Integrate with GameScene
- [ ] Modify `src/scenes/GameScene.ts` to create Car instance
- [ ] Position Car at spawn point (center of screen for testing)
- [ ] Call Car.update() in GameScene.update() method
- [ ] Add Car reference as private scene property
- [ ] Test Car appears correctly and rotates smoothly

### Task 6: Write Unit Tests
- [ ] Create `tests/gameObjects/Car.test.ts` file
- [ ] Test: Car constructor initializes correctly
- [ ] Test: Physics body is configured with correct bounds
- [ ] Test: setCarPosition updates position and physics body
- [ ] Test: setCarRotation updates rotation correctly
- [ ] Test: reset() method restores initial state
- [ ] Test: getPhysicsState() returns valid state object
- [ ] Test: preDestroy() cleans up listeners
- [ ] Achieve 80%+ test coverage

### Task 7: Manual Testing in Game
- [ ] Run game in development mode
- [ ] Verify Car appears at center of screen
- [ ] Use browser console to manually rotate Car: `car.setCarRotation(45)`
- [ ] Use browser console to move Car: `car.setCarPosition(400, 300)`
- [ ] Verify no console errors or TypeScript warnings
- [ ] Verify Car cleanup when restarting scene (R key)

---

## Testing Requirements

### Unit Tests

**Car Instantiation Tests:**
```typescript
describe('Car', () => {
    let scene: Phaser.Scene;
    let car: Car;
    
    beforeEach(() => {
        // Mock Phaser scene
        scene = {
            add: { existing: jest.fn() },
            physics: { add: { existing: jest.fn() } }
        } as any;
        
        car = new Car(scene, 100, 100);
    });
    
    afterEach(() => {
        car.destroy();
    });
    
    it('should create a car at specified position', () => {
        expect(car.x).toBe(100);
        expect(car.y).toBe(100);
    });
    
    it('should have physics body configured', () => {
        expect(car.body).toBeDefined();
        expect(car.body.width).toBeLessThan(car.width);  // Collision bounds smaller
    });
    
    it('should initialize physics state', () => {
        const state = car.getPhysicsState();
        expect(state.position.x).toBe(100);
        expect(state.position.y).toBe(100);
        expect(state.speed).toBe(0);
        expect(state.driftState).toBe(DriftState.Grip);
    });
    
    it('should update position correctly', () => {
        car.setCarPosition(200, 300);
        expect(car.x).toBe(200);
        expect(car.y).toBe(300);
        
        const state = car.getPhysicsState();
        expect(state.position.x).toBe(200);
        expect(state.position.y).toBe(300);
    });
    
    it('should update rotation correctly', () => {
        car.setCarRotation(45);
        expect(car.angle).toBe(45);
        
        const state = car.getPhysicsState();
        expect(state.rotation).toBe(45);
    });
    
    it('should reset to initial state', () => {
        car.setCarPosition(200, 300);
        car.setCarRotation(90);
        car.body.setVelocity(100, 100);
        
        car.reset(100, 100, 0);
        
        expect(car.x).toBe(100);
        expect(car.y).toBe(100);
        expect(car.angle).toBe(0);
        expect(car.body.velocity.x).toBe(0);
        expect(car.body.velocity.y).toBe(0);
    });
    
    it('should clean up on destroy', () => {
        const removeListenersSpy = jest.spyOn(car, 'removeAllListeners');
        car.destroy();
        expect(removeListenersSpy).toHaveBeenCalled();
    });
});
```

### Manual Testing

**Visual Verification:**
1. Start development server: `npm run dev`
2. Navigate to GameScene
3. Verify red/blue placeholder car appears at center
4. Open browser console
5. Test rotation: `window.debugCar.setCarRotation(45)` (expose car in debug mode)
6. Verify car rotates smoothly around center point
7. Test movement: `window.debugCar.setCarPosition(400, 300)`
8. Verify car moves to new position
9. Press R key to restart scene
10. Verify no memory leaks or console errors

**Physics Body Verification:**
1. Enable physics debug mode in GameConfig: `arcade.debug = true`
2. Verify green collision bounds appear around car
3. Verify collision bounds are slightly smaller than sprite
4. Verify collision bounds rotate with car
5. Disable debug mode before committing

---

## Definition of Done

- [ ] Car class implemented with all required methods
- [ ] Car uses ICarPhysicsState interface correctly
- [ ] Physics body configured with proper collision bounds
- [ ] Lifecycle methods implemented (preDestroy, addedToScene, removedFromScene)
- [ ] Car appears in GameScene with placeholder sprite
- [ ] Unit tests achieve 80%+ coverage
- [ ] Manual testing confirms car renders and behaves correctly
- [ ] No memory leaks when destroying/recreating car
- [ ] TypeScript compiles with zero errors in strict mode
- [ ] ESLint passes with zero warnings
- [ ] Code reviewed and approved
- [ ] Story marked as "Complete"

---

## Notes

**Why This Story is Separate:**
- Establishes the game entity that all physics logic will operate on
- Can be developed in parallel with InputManager (Story 2.1.3)
- Provides a testable foundation before adding complex movement logic
- Allows visual verification that the car renders correctly

**Placeholder Sprite:**
- Using a colored rectangle allows development to proceed without art assets
- Future story will replace with actual car sprite sheet (Epic 1.3 or Phase 2)
- Placeholder should be easily replaceable by changing texture key

**Future Enhancements:**
- Car sprite sheet with 4 rotation frames (N, E, S, W)
- Wheel sprites as child game objects (for visual drift feedback)
- Car color customization (player preference)
- Multiple car models with different physics profiles

**Developer Tips:**
- Expose car in debug mode for manual testing: `(window as any).debugCar = car`
- Use Phaser's physics debug visualization during development
- Keep Car class focused on state management - physics logic lives in DriftPhysics
- Test memory cleanup by creating/destroying cars repeatedly
