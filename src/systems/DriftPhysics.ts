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
 * 
 * Design Philosophy:
 * - Component pattern: Attached to Car, not inherited
 * - Frame-rate independent: All calculations use delta time
 * - Zero allocation: Reuses Vector2 objects in update loop
 * - Configuration-driven: All parameters from PhysicsConfig
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

        // Configure Arcade Physics body with damping and speed limits
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
     * 
     * Execution order is critical:
     * 1. Calculate forward vector (used by all other systems)
     * 2. Acceleration (change velocity based on input)
     * 3. Steering (change rotation based on input and speed)
     * 4. Friction (reduce velocity magnitude)
     * 5. Drag (sync Arcade Body damping/drag)
     * 6. Speed limiting (enforce forward and reverse speed caps)
     */
    public update(delta: number): void {
        const deltaSeconds = delta / 1000;
        
        // Calculate forward vector once per frame (reuse for all calculations)
        MathHelpers.getForwardVector(this.car.angle, this.forwardVector);
        
        // Update movement systems
        this.updateAcceleration(deltaSeconds);
        this.updateSteering(deltaSeconds);
        this.updateFriction(deltaSeconds);
        this.applyDrag();
        
        // Enforce speed limits
        this.enforceMaxSpeed();
        this.enforceReverseSpeed();
    }
    
    /**
     * Update acceleration/braking based on input
     * @param delta - Time delta in seconds
     * 
     * Input axis values:
     * - 1: Accelerate forward
     * - 0: Coast (no input)
     * - -1: Brake or reverse
     */
    private updateAcceleration(delta: number): void {
        const config = PhysicsConfig.car;
        const accelerationAxis = this.inputManager.getAccelerationAxis();
        
        if (accelerationAxis === 0) {
            // No acceleration input (coasting)
            return;
        }

        // Calculate forward speed using dot product
        // Positive = moving forward, negative = moving backward
        const forwardSpeed = this.body.velocity.dot(this.forwardVector);
        
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
     * @param delta - Time delta in seconds
     * 
     * Implements velocity-dependent steering:
     * - Low speed: Tight turns (high turn rate)
     * - High speed: Wide turns (low turn rate)
     */
    private updateSteering(delta: number): void {
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
     * @param speed - Current speed in pixels per second
     * @returns Turn rate in degrees per second
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
     * @param delta - Time delta in seconds
     * 
     * Story 2.1.4: Always uses normal friction
     * Story 2.1.5: Will switch between normal/drift/handbrake friction
     */
    private updateFriction(delta: number): void {
        const config = PhysicsConfig.car;
        
        // Copy velocity to vector for friction calculation
        this.velocityVector.set(this.body.velocity.x, this.body.velocity.y);
        
        // Apply friction (modifies vector in-place)
        MathHelpers.applyFriction(this.velocityVector, config.normalFriction, delta);
        
        // Update body velocity
        this.body.setVelocity(this.velocityVector.x, this.velocityVector.y);
    }
    
    /**
     * Sync drag (air resistance) with configuration
     * 
     * Uses Phaser Arcade Body damping APIs instead of manual velocity scaling
     * for better integration with the physics engine.
     */
    private applyDrag(): void {
        const config = PhysicsConfig.car;
        this.body.setDamping(true);
        this.body.setDrag(config.drag);
        this.body.setAngularDrag(config.angularDrag);
    }
    
    /**
     * Enforce maximum forward speed limit
     * 
     * Clamps total velocity magnitude to maxSpeed. While Arcade Physics
     * can do this via setMaxSpeed, we enforce it manually for consistent
     * behavior in tests and to ensure deterministic physics updates.
     */
    private enforceMaxSpeed(): void {
        const config = PhysicsConfig.car;
        const currentSpeed = this.body.velocity.length();
        
        // If exceeding max speed, scale velocity down
        if (currentSpeed > config.maxSpeed) {
            const scale = config.maxSpeed / currentSpeed;
            this.body.velocity.x *= scale;
            this.body.velocity.y *= scale;
            
            // Also update body.speed to reflect the new velocity
            this.body.speed = config.maxSpeed;
        }
    }
    
    /**
     * Enforce reverse speed limit (forward speed is handled by enforceMaxSpeed)
     * 
     * We use the dot product of velocity and forward vector to determine
     * forward vs reverse motion, since body.speed is always non-negative.
     */
    private enforceReverseSpeed(): void {
        const config = PhysicsConfig.car;
        const forwardSpeed = this.body.velocity.dot(this.forwardVector);
        const targetReverse = -config.reverseSpeed;
        
        // If moving backward faster than reverse speed limit
        if (forwardSpeed < targetReverse) {
            // Calculate how much to adjust velocity
            const deltaSpeed = targetReverse - forwardSpeed;
            
            // Adjust velocity in forward direction to clamp reverse speed
            this.body.velocity.x += this.forwardVector.x * deltaSpeed;
            this.body.velocity.y += this.forwardVector.y * deltaSpeed;
        }
    }
    
    /**
     * Get current drift state (for debugging)
     * Story 2.1.5: Will return actual drift state
     * @returns Current drift state
     */
    public getDriftState(): DriftState {
        return this.currentState;
    }
    
    /**
     * Get current speed in pixels per second
     * @returns Speed magnitude
     */
    public getSpeed(): number {
        return this.body.speed;
    }
    
    /**
     * Clean up resources
     * Called by Car.preDestroy()
     */
    public destroy(): void {
        // Clear references to prevent memory leaks
        this.car = null as any;
        this.body = null as any;
        this.inputManager = null as any;
        this.velocityVector = null as any;
        this.forwardVector = null as any;
    }
}
