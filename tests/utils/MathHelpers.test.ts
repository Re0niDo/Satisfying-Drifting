import Phaser from 'phaser';
import {
    degToRad,
    radToDeg,
    normalizeAngle,
    angleDifference,
    lerp,
    getVelocityMagnitude,
    getVelocityAngle,
    applyFriction,
    getForwardVector
} from '../../src/utils/MathHelpers';

describe('MathHelpers', () => {
    let game: Phaser.Game;

    beforeAll(() => {
        // Initialize Phaser in headless mode for Vector2 support
        game = new Phaser.Game({
            type: Phaser.HEADLESS,
            width: 800,
            height: 600
        });
    });

    afterAll(() => {
        if (game) {
            game.destroy(true);
        }
    });

    // Helper to create Phaser Vector2
    const createVector2 = (x: number, y: number) => new Phaser.Math.Vector2(x, y);

    describe('degToRad', () => {
        it('should convert degrees to radians', () => {
            expect(degToRad(0)).toBeCloseTo(0);
            expect(degToRad(90)).toBeCloseTo(Math.PI / 2);
            expect(degToRad(180)).toBeCloseTo(Math.PI);
            expect(degToRad(360)).toBeCloseTo(Math.PI * 2);
            expect(degToRad(45)).toBeCloseTo(Math.PI / 4);
        });
        
        it('should handle negative angles', () => {
            expect(degToRad(-90)).toBeCloseTo(-Math.PI / 2);
            expect(degToRad(-180)).toBeCloseTo(-Math.PI);
        });
    });
    
    describe('radToDeg', () => {
        it('should convert radians to degrees', () => {
            expect(radToDeg(0)).toBeCloseTo(0);
            expect(radToDeg(Math.PI / 2)).toBeCloseTo(90);
            expect(radToDeg(Math.PI)).toBeCloseTo(180);
            expect(radToDeg(Math.PI * 2)).toBeCloseTo(360);
            expect(radToDeg(Math.PI / 4)).toBeCloseTo(45);
        });
        
        it('should handle negative radians', () => {
            expect(radToDeg(-Math.PI / 2)).toBeCloseTo(-90);
            expect(radToDeg(-Math.PI)).toBeCloseTo(-180);
        });
    });
    
    describe('normalizeAngle', () => {
        it('should normalize angles to 0-360 range', () => {
            expect(normalizeAngle(0)).toBe(0);
            expect(normalizeAngle(180)).toBe(180);
            expect(normalizeAngle(359)).toBe(359);
        });
        
        it('should wrap angles above 360', () => {
            expect(normalizeAngle(360)).toBe(0);
            expect(normalizeAngle(450)).toBe(90);
            expect(normalizeAngle(720)).toBe(0);
            expect(normalizeAngle(725)).toBe(5);
        });
        
        it('should wrap negative angles', () => {
            expect(normalizeAngle(-90)).toBe(270);
            expect(normalizeAngle(-180)).toBe(180);
            expect(normalizeAngle(-1)).toBe(359);
            expect(normalizeAngle(-360)).toBe(0);
            expect(normalizeAngle(-450)).toBe(270);
        });
    });
    
    describe('angleDifference', () => {
        it('should calculate shortest angle difference', () => {
            expect(angleDifference(0, 90)).toBe(90);
            expect(angleDifference(0, 180)).toBe(180);
            expect(angleDifference(90, 0)).toBe(-90);
        });
        
        it('should choose shortest path across 360/0 boundary', () => {
            expect(angleDifference(350, 10)).toBe(20);
            expect(angleDifference(10, 350)).toBe(-20);
            expect(angleDifference(0, 270)).toBe(-90);
            expect(angleDifference(270, 0)).toBe(90);
        });
        
        it('should return values in range [-180, 180]', () => {
            expect(angleDifference(0, 180)).toBe(180);
            expect(angleDifference(0, 181)).toBe(-179);
            expect(angleDifference(0, 359)).toBe(-1);
        });
        
        it('should handle same angle', () => {
            expect(angleDifference(45, 45)).toBe(0);
            expect(angleDifference(180, 180)).toBe(0);
        });
    });
    
    describe('lerp', () => {
        it('should linearly interpolate between values', () => {
            expect(lerp(0, 100, 0)).toBe(0);
            expect(lerp(0, 100, 0.5)).toBe(50);
            expect(lerp(0, 100, 1)).toBe(100);
            expect(lerp(50, 150, 0.5)).toBe(100);
        });
        
        it('should clamp t to [0, 1]', () => {
            expect(lerp(0, 100, -0.5)).toBe(0);
            expect(lerp(0, 100, 1.5)).toBe(100);
            expect(lerp(0, 100, 2)).toBe(100);
        });
        
        it('should handle negative ranges', () => {
            expect(lerp(-100, 0, 0.5)).toBe(-50);
            expect(lerp(100, -100, 0.5)).toBe(0);
        });
        
        it('should handle zero range', () => {
            expect(lerp(50, 50, 0.5)).toBe(50);
        });
    });
    
    describe('getVelocityMagnitude', () => {
        it('should calculate velocity magnitude', () => {
            expect(getVelocityMagnitude(3, 4)).toBeCloseTo(5);
            expect(getVelocityMagnitude(0, 5)).toBeCloseTo(5);
            expect(getVelocityMagnitude(5, 0)).toBeCloseTo(5);
            expect(getVelocityMagnitude(0, 0)).toBeCloseTo(0);
        });
        
        it('should handle negative components', () => {
            expect(getVelocityMagnitude(-3, -4)).toBeCloseTo(5);
            expect(getVelocityMagnitude(-5, 0)).toBeCloseTo(5);
        });
        
        it('should handle floating point values', () => {
            expect(getVelocityMagnitude(1.5, 2.0)).toBeCloseTo(2.5);
        });
    });
    
    describe('getVelocityAngle', () => {
        it('should calculate angle of velocity vector', () => {
            expect(getVelocityAngle(1, 0)).toBeCloseTo(0);
            expect(getVelocityAngle(0, 1)).toBeCloseTo(90);
            expect(getVelocityAngle(-1, 0)).toBeCloseTo(180);
            expect(getVelocityAngle(0, -1)).toBeCloseTo(-90);
        });
        
        it('should handle diagonal vectors', () => {
            expect(getVelocityAngle(1, 1)).toBeCloseTo(45);
            expect(getVelocityAngle(-1, 1)).toBeCloseTo(135);
            expect(getVelocityAngle(-1, -1)).toBeCloseTo(-135);
            expect(getVelocityAngle(1, -1)).toBeCloseTo(-45);
        });
        
        it('should handle zero velocity', () => {
            expect(getVelocityAngle(0, 0)).toBeCloseTo(0);
        });
    });
    
    describe('applyFriction', () => {
        it('should reduce velocity magnitude', () => {
            const velocity = createVector2(100, 0);
            applyFriction(velocity, 0.95, 1/60);
            
            expect(velocity.x).toBeLessThan(100);
            expect(velocity.x).toBeGreaterThan(90); // Noticeable reduction per frame
        });
        
        it('should be frame-rate independent', () => {
            const vel1 = createVector2(100, 0);
            const vel2 = createVector2(100, 0);
            
            // One frame at 60 FPS
            applyFriction(vel1, 0.95, 1/60);
            
            // Two frames at 120 FPS (should equal one 60 FPS frame)
            applyFriction(vel2, 0.95, 1/120);
            applyFriction(vel2, 0.95, 1/120);
            
            expect(vel1.x).toBeCloseTo(vel2.x, 1);
        });
        
        it('should reduce both X and Y components', () => {
            const velocity = createVector2(100, 50);
            applyFriction(velocity, 0.9, 1/60);
            
            expect(velocity.x).toBeLessThan(100);
            expect(velocity.y).toBeLessThan(50);
        });
        
        it('should eventually bring velocity to near zero', () => {
            const velocity = createVector2(100, 100);
            
            // Simulate 10 seconds at 60 FPS with high friction
            for (let i = 0; i < 600; i++) {
                applyFriction(velocity, 0.9, 1/60);
            }
            
            expect(velocity.length()).toBeLessThan(1);
        });
        
        it('should handle friction of 1 (no friction)', () => {
            const velocity = createVector2(100, 50);
            const originalX = velocity.x;
            const originalY = velocity.y;
            
            applyFriction(velocity, 1.0, 1/60);
            
            expect(velocity.x).toBeCloseTo(originalX);
            expect(velocity.y).toBeCloseTo(originalY);
        });
        
        it('should handle friction of 0 (instant stop)', () => {
            const velocity = createVector2(100, 50);
            applyFriction(velocity, 0, 1/60);
            
            expect(velocity.x).toBeCloseTo(0);
            expect(velocity.y).toBeCloseTo(0);
        });
    });
    
    describe('getForwardVector', () => {
        it('should return unit vector pointing in direction', () => {
            const forward = getForwardVector(0);
            expect(forward.x).toBeCloseTo(1);
            expect(forward.y).toBeCloseTo(0);
            expect(forward.length()).toBeCloseTo(1);
        });
        
        it('should calculate cardinal directions', () => {
            const right = getForwardVector(0);
            expect(right.x).toBeCloseTo(1);
            expect(right.y).toBeCloseTo(0);
            
            const down = getForwardVector(90);
            expect(down.x).toBeCloseTo(0);
            expect(down.y).toBeCloseTo(1);
            
            const left = getForwardVector(180);
            expect(left.x).toBeCloseTo(-1);
            expect(left.y).toBeCloseTo(0);
            
            const up = getForwardVector(270);
            expect(up.x).toBeCloseTo(0);
            expect(up.y).toBeCloseTo(-1);
        });
        
        it('should calculate diagonal directions', () => {
            const downRight = getForwardVector(45);
            expect(downRight.x).toBeCloseTo(Math.SQRT1_2);
            expect(downRight.y).toBeCloseTo(Math.SQRT1_2);
            expect(downRight.length()).toBeCloseTo(1);
        });
        
        it('should reuse output vector to avoid allocation', () => {
            const output = createVector2(0, 0);
            const result1 = getForwardVector(0, output);
            const result2 = getForwardVector(90, output);
            
            // Should be the same object
            expect(result1).toBe(output);
            expect(result2).toBe(output);
            
            // Should update values
            expect(output.x).toBeCloseTo(0);
            expect(output.y).toBeCloseTo(1);
        });
        
        it('should create new vector if no output provided', () => {
            const result1 = getForwardVector(0);
            const result2 = getForwardVector(0);
            
            // Should be different objects
            expect(result1).not.toBe(result2);
        });
    });
});
