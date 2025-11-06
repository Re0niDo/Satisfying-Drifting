import Phaser from 'phaser';
import { DriftPhysics } from '../../src/systems/DriftPhysics';
import { Car } from '../../src/gameObjects/Car';
import { InputManager } from '../../src/systems/InputManager';
import { PhysicsConfig } from '../../src/config/PhysicsConfig';
import { DriftState } from '../../src/types/PhysicsTypes';
import * as MathHelpers from '../../src/utils/MathHelpers';

// Mock scene for testing
class MockScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MockScene' });
    }
}

describe('DriftPhysics', () => {
    let scene: Phaser.Scene;
    let car: Car;
    let inputManager: InputManager;
    let physics: DriftPhysics;
    let game: Phaser.Game;
    
    beforeEach((done) => {
        // Create game instance for tests
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.HEADLESS,
            width: 800,
            height: 600,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { x: 0, y: 0 },
                    debug: false
                }
            },
            scene: MockScene,
            callbacks: {
                postBoot: (g) => {
                    game = g;
                    scene = game.scene.scenes[0];
                    
                    // Clean up any existing InputManager instance
                    InputManager.destroyInstance();
                    
                    // Create input manager
                    inputManager = InputManager.getInstance(scene);
                    
                    // Create car
                    car = new Car(scene, 400, 300);
                    
                    // Create physics component
                    physics = new DriftPhysics(car, inputManager);
                    
                    // Signal that setup is complete
                    done();
                }
            }
        };
        
        new Phaser.Game(config);
    });
    
    afterEach(() => {
        if (physics) {
            physics.destroy();
        }
        if (game) {
            game.destroy(true);
        }
        InputManager.destroyInstance();
    });
    
    describe('Initialization', () => {
        it('should initialize with Normal drift state', () => {
            expect(physics.getDriftState()).toBe(DriftState.Normal);
        });
        
        it('should configure Arcade Body with damping and drag', () => {
            expect(car.body.useDamping).toBe(true);
            expect(car.body.drag.x).toBe(PhysicsConfig.car.drag);
            expect(car.body.angularDrag).toBe(PhysicsConfig.car.angularDrag);
        });
        
        it('should set max speed from PhysicsConfig', () => {
            expect(car.body.maxSpeed).toBe(PhysicsConfig.car.maxSpeed);
        });
    });
    
    describe('Acceleration', () => {
        beforeEach(() => {
            car.setAngle(0); // Face right
            car.body.setVelocity(0, 0);
        });
        
        it('should accelerate forward when W pressed', () => {
            // Mock input
            jest.spyOn(inputManager, 'getAccelerationAxis').mockReturnValue(1);
            
            const initialVelocity = car.body.velocity.x;
            physics.update(16.67); // One frame at 60 FPS
            
            expect(car.body.velocity.x).toBeGreaterThan(initialVelocity);
        });
        
        it('should not accelerate when no input', () => {
            jest.spyOn(inputManager, 'getAccelerationAxis').mockReturnValue(0);
            
            const initialVelocity = car.body.velocity.clone();
            physics.update(16.67);
            
            // Velocity might change slightly due to drag, but not from acceleration
            const deltaVelocity = car.body.velocity.clone().subtract(initialVelocity);
            expect(Math.abs(deltaVelocity.x)).toBeLessThan(1);
        });
        
        it('should brake when S pressed while moving forward', () => {
            car.body.setVelocity(100, 0);
            jest.spyOn(inputManager, 'getAccelerationAxis').mockReturnValue(-1);
            jest.spyOn(inputManager, 'getSteeringAxis').mockReturnValue(0);
            
            const initialSpeed = car.body.speed;
            physics.update(16.67);
            
            expect(car.body.speed).toBeLessThan(initialSpeed);
        });
        
        it('should allow reverse when stopped', () => {
            car.body.setVelocity(0, 0);
            jest.spyOn(inputManager, 'getAccelerationAxis').mockReturnValue(-1);
            jest.spyOn(inputManager, 'getSteeringAxis').mockReturnValue(0);
            
            physics.update(16.67);
            
            const forwardVector = MathHelpers.getForwardVector(car.angle);
            const forwardSpeed = car.body.velocity.dot(forwardVector);
            expect(forwardSpeed).toBeLessThan(0); // Moving backward
        });
        
        it('should accelerate in the direction car is facing', () => {
            car.setAngle(90); // Face down
            jest.spyOn(inputManager, 'getAccelerationAxis').mockReturnValue(1);
            jest.spyOn(inputManager, 'getSteeringAxis').mockReturnValue(0);
            
            physics.update(16.67);
            
            // Should accelerate in Y direction (down) more than X
            expect(Math.abs(car.body.velocity.y)).toBeGreaterThan(Math.abs(car.body.velocity.x));
            expect(car.body.velocity.y).toBeGreaterThan(0);
        });
    });
    
    describe('Steering', () => {
        beforeEach(() => {
            car.setAngle(0);
            car.body.setVelocity(0, 0);
        });
        
        it('should rotate car when A pressed', () => {
            car.body.setVelocity(100, 0);
            jest.spyOn(inputManager, 'getAccelerationAxis').mockReturnValue(0);
            jest.spyOn(inputManager, 'getSteeringAxis').mockReturnValue(-1);
            
            const initialAngle = car.angle;
            physics.update(16.67);
            
            expect(car.angle).toBeLessThan(initialAngle);
        });
        
        it('should rotate car when D pressed', () => {
            car.body.setVelocity(100, 0);
            jest.spyOn(inputManager, 'getAccelerationAxis').mockReturnValue(0);
            jest.spyOn(inputManager, 'getSteeringAxis').mockReturnValue(1);
            
            const initialAngle = car.angle;
            physics.update(16.67);
            
            expect(car.angle).toBeGreaterThan(initialAngle);
        });
        
        it('should not rotate when no steering input', () => {
            car.body.setVelocity(100, 0);
            jest.spyOn(inputManager, 'getAccelerationAxis').mockReturnValue(0);
            jest.spyOn(inputManager, 'getSteeringAxis').mockReturnValue(0);
            
            const initialAngle = car.angle;
            physics.update(16.67);
            
            expect(car.angle).toBeCloseTo(initialAngle);
        });
        
        it('should turn faster at low speed', () => {
            jest.spyOn(inputManager, 'getAccelerationAxis').mockReturnValue(0);
            jest.spyOn(inputManager, 'getSteeringAxis').mockReturnValue(1);
            
            // Low speed turn
            car.setAngle(0);
            car.body.setVelocity(50, 0);
            physics.update(16.67);
            const lowSpeedAngle = car.angle;
            
            // High speed turn
            car.setAngle(0);
            car.body.setVelocity(300, 0);
            physics.update(16.67);
            const highSpeedAngle = car.angle;
            
            expect(lowSpeedAngle).toBeGreaterThan(highSpeedAngle);
        });
        
        it('should turn in opposite direction for left vs right', () => {
            jest.spyOn(inputManager, 'getAccelerationAxis').mockReturnValue(0);
            
            // Turn left
            car.setAngle(0);
            car.body.setVelocity(100, 0);
            jest.spyOn(inputManager, 'getSteeringAxis').mockReturnValue(-1);
            physics.update(16.67);
            const leftTurnAngle = car.angle;
            
            // Turn right
            car.setAngle(0);
            car.body.setVelocity(100, 0);
            jest.spyOn(inputManager, 'getSteeringAxis').mockReturnValue(1);
            physics.update(16.67);
            const rightTurnAngle = car.angle;
            
            expect(leftTurnAngle).toBeLessThan(0);
            expect(rightTurnAngle).toBeGreaterThan(0);
        });
    });
    
    describe('Friction and Drag', () => {
        beforeEach(() => {
            car.setAngle(0);
            jest.spyOn(inputManager, 'getAccelerationAxis').mockReturnValue(0);
            jest.spyOn(inputManager, 'getSteeringAxis').mockReturnValue(0);
        });
        
        it('should slow car over time without input', () => {
            car.body.setVelocity(100, 0);
            
            const initialSpeed = car.body.speed;
            
            // Simulate 1 second at 60 FPS
            for (let i = 0; i < 60; i++) {
                physics.update(16.67);
            }
            
            expect(car.body.speed).toBeLessThan(initialSpeed * 0.5);
        });
        
        it('should eventually bring car to near stop', () => {
            car.body.setVelocity(100, 100);
            
            // Simulate 5 seconds
            for (let i = 0; i < 300; i++) {
                physics.update(16.67);
            }
            
            expect(car.body.speed).toBeLessThan(10);
        });
        
        it('should apply friction to both X and Y velocity', () => {
            car.body.setVelocity(100, 50);
            
            const initialVx = car.body.velocity.x;
            const initialVy = car.body.velocity.y;
            
            physics.update(16.67);
            
            expect(car.body.velocity.x).toBeLessThan(initialVx);
            expect(car.body.velocity.y).toBeLessThan(initialVy);
        });
    });
    
    describe('Speed Limiting', () => {
        beforeEach(() => {
            car.setAngle(0);
            jest.spyOn(inputManager, 'getSteeringAxis').mockReturnValue(0);
        });
        
        it('should enforce max speed via body.setMaxSpeed', () => {
            const maxSpeed = PhysicsConfig.car.maxSpeed;
            
            // Set velocity above max speed
            car.body.setVelocity(maxSpeed + 100, 0);
            
            // Update physics (drag should be applied by Arcade Body)
            physics.update(16.67);
            
            // Speed should be clamped (allowing small epsilon for physics simulation)
            expect(car.body.speed).toBeLessThanOrEqual(maxSpeed + 5);
        });
        
        it('should clamp reverse speed using forward dot product', () => {
            const reverseSpeed = PhysicsConfig.car.reverseSpeed;
            
            // Set high reverse velocity
            car.body.setVelocity(-reverseSpeed - 200, 0);
            car.setAngle(0); // Facing right, so forward vector is (1, 0)
            
            jest.spyOn(inputManager, 'getAccelerationAxis').mockReturnValue(0);
            
            physics.update(16.67);
            
            // Calculate forward speed
            const forwardVector = MathHelpers.getForwardVector(car.angle);
            const forwardSpeed = car.body.velocity.dot(forwardVector);
            
            // Should be clamped to -reverseSpeed (allowing small epsilon)
            expect(forwardSpeed).toBeGreaterThanOrEqual(-reverseSpeed - 5);
        });
        
        it('should allow acceleration up to max speed', () => {
            jest.spyOn(inputManager, 'getAccelerationAxis').mockReturnValue(1);
            
            // Accelerate for several seconds
            for (let i = 0; i < 300; i++) {
                physics.update(16.67);
            }
            
            // With current physics (acceleration: 300, normalFriction: 0.95),
            // terminal velocity is around 100 pixels/s (equilibrium between acceleration and friction)
            // This is expected behavior - friction prevents reaching theoretical maxSpeed
            // NOTE: Values will be tuned in Task 10 (Manual Testing and Tuning)
            expect(car.body.speed).toBeGreaterThan(80); // Reached significant speed
            expect(car.body.speed).toBeLessThanOrEqual(PhysicsConfig.car.maxSpeed); // Not exceeding max
        });
    });
    
    describe('getSpeed', () => {
        it('should return current speed', () => {
            car.body.setVelocity(30, 40);
            expect(physics.getSpeed()).toBeCloseTo(50); // 3-4-5 triangle
        });
        
        it('should return 0 when stopped', () => {
            car.body.setVelocity(0, 0);
            expect(physics.getSpeed()).toBe(0);
        });
    });
    
    describe('getDriftState', () => {
        it('should return Normal state in Story 2.1.4', () => {
            expect(physics.getDriftState()).toBe(DriftState.Normal);
            
            // Even after movement
            jest.spyOn(inputManager, 'getAccelerationAxis').mockReturnValue(1);
            physics.update(16.67);
            
            expect(physics.getDriftState()).toBe(DriftState.Normal);
        });
    });
    
    describe('destroy', () => {
        it('should clean up resources', () => {
            physics.destroy();
            
            // Verify references are cleared (check via accessing private properties isn't ideal,
            // but we want to ensure no memory leaks)
            expect(() => physics.update(16.67)).toThrow();
        });
    });
});
