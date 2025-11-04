import Phaser from 'phaser';
import type { ICarPhysicsState } from '../types/PhysicsTypes';
import { DriftState } from '../types/PhysicsTypes';

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
            driftState: DriftState.Normal,
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
    public update(_time: number, _delta: number): void {
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
