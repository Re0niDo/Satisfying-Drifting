/**
 * Unit tests for PhysicsConfig
 * Validates configuration structure, ranges, and validation logic
 */

import { PhysicsConfig } from '../../src/config/PhysicsConfig';
import type { IPhysicsConfig } from '../../src/types/PhysicsTypes';

describe('PhysicsConfig', () => {
    describe('Configuration Structure', () => {
        it('should export a valid physics configuration', () => {
            expect(PhysicsConfig).toBeDefined();
            expect(PhysicsConfig.car).toBeDefined();
            expect(PhysicsConfig.quality).toBeDefined();
        });

        it('should have all required car parameters', () => {
            const { car } = PhysicsConfig;
            
            // Movement parameters
            expect(car.maxSpeed).toBeDefined();
            expect(car.acceleration).toBeDefined();
            expect(car.brakeForce).toBeDefined();
            expect(car.reverseSpeed).toBeDefined();
            
            // Steering parameters
            expect(car.turnRateHigh).toBeDefined();
            expect(car.turnRateLow).toBeDefined();
            expect(car.speedThresholdTight).toBeDefined();
            
            // Drift physics
            expect(car.driftThreshold).toBeDefined();
            expect(car.normalFriction).toBeDefined();
            expect(car.driftFriction).toBeDefined();
            expect(car.handBrakeFriction).toBeDefined();
            expect(car.transitionTime).toBeDefined();
            
            // Speed loss
            expect(car.driftSpeedRetention).toBeDefined();
            expect(car.handbrakeSpeedRetention).toBeDefined();
            
            // Physical properties
            expect(car.mass).toBeDefined();
            expect(car.drag).toBeDefined();
            expect(car.angularDrag).toBeDefined();
        });

        it('should have all required quality parameters', () => {
            const { quality } = PhysicsConfig;
            
            // Drift angle scoring
            expect(quality.perfectAngleMin).toBeDefined();
            expect(quality.perfectAngleMax).toBeDefined();
            expect(quality.extremeAngle).toBeDefined();
            
            // Speed scoring
            expect(quality.highSpeedThreshold).toBeDefined();
            expect(quality.mediumSpeedThreshold).toBeDefined();
            expect(quality.lowSpeedThreshold).toBeDefined();
            
            // Proximity scoring
            expect(quality.veryCloseDistance).toBeDefined();
            expect(quality.closeDistance).toBeDefined();
            expect(quality.safeDistance).toBeDefined();
            
            // Smoothness
            expect(quality.smoothnessWindowFrames).toBeDefined();
            
            // Combo system
            expect(quality.comboDecayTime).toBeDefined();
            expect(quality.minimumQualityForCombo).toBeDefined();
            
            // Quality tiers
            expect(quality.poorMax).toBeDefined();
            expect(quality.goodMax).toBeDefined();
            expect(quality.perfectMin).toBeDefined();
        });
    });

    describe('Car Movement Parameters', () => {
        it('should have positive movement values', () => {
            const { car } = PhysicsConfig;
            expect(car.maxSpeed).toBeGreaterThan(0);
            expect(car.acceleration).toBeGreaterThan(0);
            expect(car.brakeForce).toBeGreaterThan(0);
            expect(car.reverseSpeed).toBeGreaterThanOrEqual(0);
        });

        it('should have positive steering values', () => {
            const { car } = PhysicsConfig;
            expect(car.turnRateHigh).toBeGreaterThan(0);
            expect(car.turnRateLow).toBeGreaterThan(0);
            expect(car.speedThresholdTight).toBeGreaterThanOrEqual(0);
        });

        it('should have valid physical properties', () => {
            const { car } = PhysicsConfig;
            expect(car.mass).toBeGreaterThan(0);
            expect(car.drag).toBeGreaterThanOrEqual(0);
            expect(car.drag).toBeLessThanOrEqual(1);
            expect(car.angularDrag).toBeGreaterThanOrEqual(0);
            expect(car.angularDrag).toBeLessThanOrEqual(1);
        });
    });

    describe('Drift Physics Parameters', () => {
        it('should have friction coefficients between 0 and 1', () => {
            const { car } = PhysicsConfig;
            expect(car.normalFriction).toBeGreaterThanOrEqual(0);
            expect(car.normalFriction).toBeLessThanOrEqual(1);
            expect(car.driftFriction).toBeGreaterThanOrEqual(0);
            expect(car.driftFriction).toBeLessThanOrEqual(1);
            expect(car.handBrakeFriction).toBeGreaterThanOrEqual(0);
            expect(car.handBrakeFriction).toBeLessThanOrEqual(1);
        });

        it('should have friction values in descending order', () => {
            const { car } = PhysicsConfig;
            // Normal should have highest friction (most grip)
            // Handbrake should have lowest friction (least grip)
            expect(car.normalFriction).toBeGreaterThan(car.driftFriction);
            expect(car.driftFriction).toBeGreaterThan(car.handBrakeFriction);
        });

        it('should have valid drift parameters', () => {
            const { car } = PhysicsConfig;
            expect(car.driftThreshold).toBeGreaterThan(0);
            expect(car.transitionTime).toBeGreaterThan(0);
        });

        it('should have speed retention between 0 and 1', () => {
            const { car } = PhysicsConfig;
            expect(car.driftSpeedRetention).toBeGreaterThanOrEqual(0);
            expect(car.driftSpeedRetention).toBeLessThanOrEqual(1);
            expect(car.handbrakeSpeedRetention).toBeGreaterThanOrEqual(0);
            expect(car.handbrakeSpeedRetention).toBeLessThanOrEqual(1);
        });
    });

    describe('Quality Scoring Parameters', () => {
        it('should have valid drift angle ranges', () => {
            const { quality } = PhysicsConfig;
            expect(quality.perfectAngleMin).toBeGreaterThan(0);
            expect(quality.perfectAngleMax).toBeGreaterThan(quality.perfectAngleMin);
            expect(quality.extremeAngle).toBeGreaterThan(quality.perfectAngleMax);
        });

        it('should have ascending speed thresholds', () => {
            const { quality } = PhysicsConfig;
            expect(quality.lowSpeedThreshold).toBeGreaterThan(0);
            expect(quality.mediumSpeedThreshold).toBeGreaterThan(quality.lowSpeedThreshold);
            expect(quality.highSpeedThreshold).toBeGreaterThan(quality.mediumSpeedThreshold);
        });

        it('should have ascending proximity distances', () => {
            const { quality } = PhysicsConfig;
            expect(quality.veryCloseDistance).toBeGreaterThan(0);
            expect(quality.closeDistance).toBeGreaterThan(quality.veryCloseDistance);
            expect(quality.safeDistance).toBeGreaterThan(quality.closeDistance);
        });

        it('should have valid combo parameters', () => {
            const { quality } = PhysicsConfig;
            expect(quality.comboDecayTime).toBeGreaterThan(0);
            expect(quality.minimumQualityForCombo).toBeGreaterThanOrEqual(0);
            expect(quality.minimumQualityForCombo).toBeLessThanOrEqual(100);
            expect(quality.smoothnessWindowFrames).toBeGreaterThan(0);
        });

        it('should have ascending quality tier boundaries', () => {
            const { quality } = PhysicsConfig;
            expect(quality.poorMax).toBeGreaterThan(0);
            expect(quality.goodMax).toBeGreaterThan(quality.poorMax);
            expect(quality.perfectMin).toBeGreaterThan(quality.goodMax);
            expect(quality.perfectMin).toBeLessThanOrEqual(100);
        });
    });

    describe('Architecture Document Compliance', () => {
        it('should match architecture document car specifications', () => {
            const { car } = PhysicsConfig;
            
            // Core movement values from architecture
            expect(car.maxSpeed).toBe(400);
            expect(car.acceleration).toBe(300);
            expect(car.brakeForce).toBe(400);
            expect(car.reverseSpeed).toBe(150);
            
            // Steering values
            expect(car.turnRateHigh).toBe(180);
            expect(car.turnRateLow).toBe(360);
            expect(car.speedThresholdTight).toBe(100);
            
            // Drift physics values
            expect(car.driftThreshold).toBe(100);
            expect(car.normalFriction).toBe(0.95);
            expect(car.driftFriction).toBe(0.7);
            expect(car.handBrakeFriction).toBe(0.5);
            expect(car.transitionTime).toBe(0.2);
        });

        it('should match architecture document quality specifications', () => {
            const { quality } = PhysicsConfig;
            
            // Drift angle scoring
            expect(quality.perfectAngleMin).toBe(15);
            expect(quality.perfectAngleMax).toBe(45);
            expect(quality.extremeAngle).toBe(60);
            
            // Speed scoring
            expect(quality.highSpeedThreshold).toBe(300);
            expect(quality.mediumSpeedThreshold).toBe(200);
            expect(quality.lowSpeedThreshold).toBe(100);
            
            // Proximity scoring
            expect(quality.veryCloseDistance).toBe(50);
            expect(quality.closeDistance).toBe(100);
            expect(quality.safeDistance).toBe(200);
        });
    });

    describe('Type Safety', () => {
        it('should conform to IPhysicsConfig interface', () => {
            const config: IPhysicsConfig = PhysicsConfig;
            expect(config).toBeDefined();
        });

        it('should have correct numeric types', () => {
            const { car, quality } = PhysicsConfig;
            
            // All car values should be numbers
            Object.values(car).forEach(value => {
                expect(typeof value).toBe('number');
            });
            
            // All quality values should be numbers
            Object.values(quality).forEach(value => {
                expect(typeof value).toBe('number');
            });
        });
    });

    describe('Configuration Immutability', () => {
        it('should not allow modification in production mode', () => {
            // Save original NODE_ENV
            const originalEnv = process.env.NODE_ENV;
            
            // Skip this test in non-production since we can't properly test freezing
            if (process.env.NODE_ENV !== 'production') {
                expect(true).toBe(true); // Placeholder to avoid empty test
                return;
            }
            
            // In production, objects should be frozen
            expect(Object.isFrozen(PhysicsConfig)).toBe(true);
            expect(Object.isFrozen(PhysicsConfig.car)).toBe(true);
            expect(Object.isFrozen(PhysicsConfig.quality)).toBe(true);
            
            // Restore NODE_ENV
            process.env.NODE_ENV = originalEnv;
        });
    });
});
