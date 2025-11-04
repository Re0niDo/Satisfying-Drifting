/**
 * Physics configuration for car movement and drift mechanics.
 * All values are tunable for gameplay iteration.
 * 
 * IMPORTANT: Values match the Game Architecture Document specifications.
 * Modifications should be playtested and documented.
 */

import type { IPhysicsConfig } from '../types/PhysicsTypes';

/**
 * Complete physics configuration for the game.
 * Contains all parameters for car movement, drift mechanics, and quality scoring.
 */
export const PhysicsConfig: IPhysicsConfig = {
    car: {
        // Movement parameters
        maxSpeed: 400,              // pixels/second - maximum forward speed
        acceleration: 300,          // pixels/second² - rate of speed increase
        brakeForce: 400,            // pixels/second² - deceleration when braking
        reverseSpeed: 150,          // pixels/second - maximum reverse speed
        
        // Steering parameters
        turnRateHigh: 180,          // degrees/second at max speed - tighter turns
        turnRateLow: 360,           // degrees/second at low speed - sharper turns
        speedThresholdTight: 100,   // speed (px/s) below which tight turns enabled
        
        // Drift physics
        driftThreshold: 100,        // lateral velocity (px/s) to enter drift state
        normalFriction: 0.95,       // friction coefficient in normal driving (0-1)
        driftFriction: 0.7,         // friction coefficient during drift (0-1)
        handBrakeFriction: 0.5,     // friction coefficient during handbrake (0-1)
        transitionTime: 0.2,        // seconds to lerp between normal/drift states
        
        // Speed loss during drift
        driftSpeedRetention: 0.95,      // 5% speed loss per second in drift
        handbrakeSpeedRetention: 0.98,  // 2% speed loss per second in handbrake
        
        // Physical properties
        mass: 100,                  // for collision calculations (arbitrary units)
        drag: 0.99,                 // air resistance multiplier per frame (0-1)
        angularDrag: 0.95           // rotation dampening per frame (0-1)
    },
    
    quality: {
        // Drift angle scoring (40% weight)
        perfectAngleMin: 15,        // degrees - minimum angle for perfect score
        perfectAngleMax: 45,        // degrees - maximum angle for perfect score
        extremeAngle: 60,           // degrees - beyond this, no points
        
        // Speed scoring (30% weight)
        highSpeedThreshold: 300,    // px/s - maximum multiplier
        mediumSpeedThreshold: 200,  // px/s - good multiplier
        lowSpeedThreshold: 100,     // px/s - reduced multiplier
        
        // Proximity scoring (20% weight)
        veryCloseDistance: 50,      // pixels from edge - 2x bonus
        closeDistance: 100,         // pixels from edge - 1.5x bonus
        safeDistance: 200,          // pixels from edge - 1x normal
        
        // Smoothness (10% weight)
        smoothnessWindowFrames: 60, // frames to average steering input variance
        
        // Combo system
        comboDecayTime: 1.0,        // seconds before combo starts decaying
        minimumQualityForCombo: 31, // "Good" tier minimum (poor = 0-30)
        
        // Quality tiers
        poorMax: 30,                // 0-30 = Poor drift
        goodMax: 70,                // 31-70 = Good drift
        perfectMin: 71              // 71-100 = Perfect drift
    }
};

/**
 * Validate physics configuration on module load (development only)
 * Throws errors if configuration contains invalid values
 */
if (process.env.NODE_ENV !== 'production') {
    const validateConfig = (config: IPhysicsConfig): void => {
        const { car, quality } = config;
        
        // Validate car movement parameters
        if (car.maxSpeed <= 0) {
            throw new Error('PhysicsConfig: maxSpeed must be positive');
        }
        if (car.acceleration <= 0) {
            throw new Error('PhysicsConfig: acceleration must be positive');
        }
        if (car.brakeForce <= 0) {
            throw new Error('PhysicsConfig: brakeForce must be positive');
        }
        if (car.reverseSpeed < 0) {
            throw new Error('PhysicsConfig: reverseSpeed must be non-negative');
        }
        
        // Validate steering parameters
        if (car.turnRateHigh <= 0 || car.turnRateLow <= 0) {
            throw new Error('PhysicsConfig: turn rates must be positive');
        }
        if (car.speedThresholdTight < 0) {
            throw new Error('PhysicsConfig: speedThresholdTight must be non-negative');
        }
        
        // Validate friction coefficients (must be 0-1)
        if (car.normalFriction < 0 || car.normalFriction > 1) {
            throw new Error('PhysicsConfig: normalFriction must be between 0 and 1');
        }
        if (car.driftFriction < 0 || car.driftFriction > 1) {
            throw new Error('PhysicsConfig: driftFriction must be between 0 and 1');
        }
        if (car.handBrakeFriction < 0 || car.handBrakeFriction > 1) {
            throw new Error('PhysicsConfig: handBrakeFriction must be between 0 and 1');
        }
        
        // Validate drift parameters
        if (car.driftThreshold < 0) {
            throw new Error('PhysicsConfig: driftThreshold must be non-negative');
        }
        if (car.transitionTime <= 0) {
            throw new Error('PhysicsConfig: transitionTime must be positive');
        }
        
        // Validate speed retention (must be 0-1)
        if (car.driftSpeedRetention < 0 || car.driftSpeedRetention > 1) {
            throw new Error('PhysicsConfig: driftSpeedRetention must be between 0 and 1');
        }
        if (car.handbrakeSpeedRetention < 0 || car.handbrakeSpeedRetention > 1) {
            throw new Error('PhysicsConfig: handbrakeSpeedRetention must be between 0 and 1');
        }
        
        // Validate physical properties
        if (car.mass <= 0) {
            throw new Error('PhysicsConfig: mass must be positive');
        }
        if (car.drag < 0 || car.drag > 1) {
            throw new Error('PhysicsConfig: drag must be between 0 and 1');
        }
        if (car.angularDrag < 0 || car.angularDrag > 1) {
            throw new Error('PhysicsConfig: angularDrag must be between 0 and 1');
        }
        
        // Validate quality scoring parameters
        if (quality.perfectAngleMin < 0 || quality.perfectAngleMax <= quality.perfectAngleMin) {
            throw new Error('PhysicsConfig: invalid perfect angle range');
        }
        if (quality.extremeAngle <= quality.perfectAngleMax) {
            throw new Error('PhysicsConfig: extremeAngle must be greater than perfectAngleMax');
        }
        
        // Validate speed thresholds
        if (quality.lowSpeedThreshold < 0 || 
            quality.mediumSpeedThreshold <= quality.lowSpeedThreshold ||
            quality.highSpeedThreshold <= quality.mediumSpeedThreshold) {
            throw new Error('PhysicsConfig: speed thresholds must be ascending');
        }
        
        // Validate proximity distances
        if (quality.veryCloseDistance < 0 ||
            quality.closeDistance <= quality.veryCloseDistance ||
            quality.safeDistance <= quality.closeDistance) {
            throw new Error('PhysicsConfig: proximity distances must be ascending');
        }
        
        // Validate combo parameters
        if (quality.comboDecayTime <= 0) {
            throw new Error('PhysicsConfig: comboDecayTime must be positive');
        }
        if (quality.minimumQualityForCombo < 0 || quality.minimumQualityForCombo > 100) {
            throw new Error('PhysicsConfig: minimumQualityForCombo must be 0-100');
        }
        
        // Validate quality tier boundaries (must be ascending)
        if (quality.poorMax >= quality.goodMax) {
            throw new Error('PhysicsConfig: poorMax must be less than goodMax');
        }
        if (quality.goodMax >= quality.perfectMin) {
            throw new Error('PhysicsConfig: goodMax must be less than perfectMin');
        }
        if (quality.perfectMin > 100) {
            throw new Error('PhysicsConfig: perfectMin must not exceed 100');
        }
    };
    
    // Run validation on module load
    validateConfig(PhysicsConfig);
}

/**
 * Freeze configuration in production to prevent accidental mutations
 */
if (process.env.NODE_ENV === 'production') {
    Object.freeze(PhysicsConfig);
    Object.freeze(PhysicsConfig.car);
    Object.freeze(PhysicsConfig.quality);
}
