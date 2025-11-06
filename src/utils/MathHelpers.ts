import Phaser from 'phaser';

/**
 * Math utility functions for physics calculations.
 * All functions are pure (no side effects) for easy testing.
 * 
 * These utilities support the DriftPhysics system with optimized
 * vector math and angle calculations.
 */

/**
 * Convert degrees to radians
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 * @example
 * degToRad(180) // returns Math.PI
 * degToRad(90)  // returns Math.PI / 2
 */
export function degToRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 * @param radians - Angle in radians
 * @returns Angle in degrees
 * @example
 * radToDeg(Math.PI)     // returns 180
 * radToDeg(Math.PI / 2) // returns 90
 */
export function radToDeg(radians: number): number {
    return radians * (180 / Math.PI);
}

/**
 * Normalize angle to 0-360 range
 * @param degrees - Angle in degrees
 * @returns Normalized angle in range [0, 360)
 * @example
 * normalizeAngle(450)  // returns 90
 * normalizeAngle(-90)  // returns 270
 * normalizeAngle(360)  // returns 0
 */
export function normalizeAngle(degrees: number): number {
    degrees = degrees % 360;
    if (degrees < 0) degrees += 360;
    // Handle -0 case
    return degrees === 0 ? 0 : degrees;
}

/**
 * Get shortest angle difference between two angles
 * Returns value in range [-180, 180]
 * @param from - Starting angle in degrees
 * @param to - Target angle in degrees
 * @returns Shortest angular difference (positive = clockwise, negative = counter-clockwise)
 * @example
 * angleDifference(0, 90)    // returns 90
 * angleDifference(350, 10)  // returns 20 (not 340)
 * angleDifference(10, 350)  // returns -20 (not -340)
 */
export function angleDifference(from: number, to: number): number {
    let diff = normalizeAngle(to) - normalizeAngle(from);
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return diff;
}

/**
 * Linear interpolation between two values
 * @param start - Starting value
 * @param end - Ending value
 * @param t - Interpolation factor (clamped to [0, 1])
 * @returns Interpolated value
 * @example
 * lerp(0, 100, 0.5)   // returns 50
 * lerp(0, 100, 0)     // returns 0
 * lerp(0, 100, 1)     // returns 100
 * lerp(0, 100, 1.5)   // returns 100 (clamped)
 */
export function lerp(start: number, end: number, t: number): number {
    const clamped = Math.max(0, Math.min(1, t));
    return start + (end - start) * clamped;
}

/**
 * Calculate velocity magnitude from x,y components
 * @param vx - Velocity X component
 * @param vy - Velocity Y component
 * @returns Magnitude of velocity vector
 * @example
 * getVelocityMagnitude(3, 4)  // returns 5
 * getVelocityMagnitude(0, 0)  // returns 0
 */
export function getVelocityMagnitude(vx: number, vy: number): number {
    return Math.sqrt(vx * vx + vy * vy);
}

/**
 * Get angle of velocity vector in degrees
 * @param vx - Velocity X component
 * @param vy - Velocity Y component
 * @returns Angle in degrees (0 = right, 90 = down in Phaser coordinates)
 * @example
 * getVelocityAngle(1, 0)   // returns 0 (moving right)
 * getVelocityAngle(0, 1)   // returns 90 (moving down)
 * getVelocityAngle(-1, 0)  // returns 180 (moving left)
 */
export function getVelocityAngle(vx: number, vy: number): number {
    return radToDeg(Math.atan2(vy, vx));
}

/**
 * Apply friction to velocity (modifies vector in-place)
 * Uses frame-rate independent exponential decay formula
 * @param velocity - Current velocity (modified in-place)
 * @param friction - Friction coefficient (0-1, where 1 = no friction, 0 = instant stop)
 * @param delta - Time delta in seconds
 * @example
 * const vel = new Phaser.Math.Vector2(100, 0);
 * applyFriction(vel, 0.95, 1/60);
 * // vel.x is now ~99.92 (slight reduction per frame)
 */
export function applyFriction(
    velocity: Phaser.Math.Vector2,
    friction: number,
    delta: number
): void {
    // Friction formula: v = v * friction^(delta * 60)
    // Adjusted for frame-rate independence
    // At 60 FPS (delta = 1/60), this reduces to v = v * friction
    const frictionFactor = Math.pow(friction, delta * 60);
    velocity.x *= frictionFactor;
    velocity.y *= frictionFactor;
}

/**
 * Get forward vector from rotation angle without allocating a new Vector2
 * CRITICAL: Reuses the output vector to avoid garbage collection in update loops
 * @param angleDegrees - Angle in degrees (0 = right, 90 = down in Phaser coordinates)
 * @param out - Vector to populate (optional, creates new if not provided)
 * @returns Reused vector pointing in the specified direction (unit length)
 * @example
 * const forward = new Phaser.Math.Vector2();
 * getForwardVector(0, forward);   // forward = (1, 0)
 * getForwardVector(90, forward);  // forward = (0, 1)
 * getForwardVector(180, forward); // forward = (-1, 0)
 */
export function getForwardVector(
    angleDegrees: number,
    out: Phaser.Math.Vector2 = new Phaser.Math.Vector2()
): Phaser.Math.Vector2 {
    const angleRad = degToRad(angleDegrees);
    return out.setToPolar(angleRad, 1);
}
