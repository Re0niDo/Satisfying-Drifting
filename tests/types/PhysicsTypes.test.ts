/**
 * Unit tests for PhysicsTypes
 * Validates type definitions and enums
 */

import {
    DriftState,
    type ICarPhysicsState,
    type IDriftData,
    type ICarConfig,
    type IQualityConfig,
    type IPhysicsConfig
} from '../../src/types/PhysicsTypes';

describe('PhysicsTypes', () => {
    describe('DriftState Enum', () => {
        it('should define all drift states', () => {
            expect(DriftState.Normal).toBeDefined();
            expect(DriftState.Drift).toBeDefined();
            expect(DriftState.Handbrake).toBeDefined();
        });

        it('should have correct string values', () => {
            expect(DriftState.Normal).toBe('NORMAL');
            expect(DriftState.Drift).toBe('DRIFT');
            expect(DriftState.Handbrake).toBe('HANDBRAKE');
        });

        it('should allow enum comparison', () => {
            let currentState: DriftState = DriftState.Normal;
            expect(currentState).toBe(DriftState.Normal);
            
            currentState = DriftState.Drift;
            expect(currentState).toBe(DriftState.Drift);
        });
    });

    describe('ICarPhysicsState Interface', () => {
        it('should allow valid car physics state objects', () => {
            const state: ICarPhysicsState = {
                position: { x: 100, y: 200 },
                velocity: { x: 50, y: 0 },
                rotation: 45,
                speed: 150,
                lateralVelocity: 20,
                driftAngle: 15,
                driftState: DriftState.Normal,
                isAccelerating: true,
                isBraking: false,
                isHandbraking: false
            };

            expect(state).toBeDefined();
            expect(state.position.x).toBe(100);
            expect(state.position.y).toBe(200);
            expect(state.driftState).toBe(DriftState.Normal);
        });

        it('should support all drift states', () => {
            const normalState: ICarPhysicsState = {
                position: { x: 0, y: 0 },
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

            const driftState: ICarPhysicsState = {
                ...normalState,
                driftState: DriftState.Drift
            };

            const handbrakeState: ICarPhysicsState = {
                ...normalState,
                driftState: DriftState.Handbrake
            };

            expect(normalState.driftState).toBe(DriftState.Normal);
            expect(driftState.driftState).toBe(DriftState.Drift);
            expect(handbrakeState.driftState).toBe(DriftState.Handbrake);
        });
    });

    describe('IDriftData Interface', () => {
        it('should allow valid drift data objects', () => {
            const driftData: IDriftData = {
                angle: 30,
                speed: 250,
                lateralVelocity: 80,
                state: DriftState.Drift,
                stateTransitionProgress: 0.5
            };

            expect(driftData).toBeDefined();
            expect(driftData.angle).toBe(30);
            expect(driftData.state).toBe(DriftState.Drift);
        });

        it('should track state transitions', () => {
            const transitioning: IDriftData = {
                angle: 20,
                speed: 200,
                lateralVelocity: 60,
                state: DriftState.Drift,
                stateTransitionProgress: 0.75
            };

            expect(transitioning.stateTransitionProgress).toBeGreaterThan(0);
            expect(transitioning.stateTransitionProgress).toBeLessThan(1);
        });
    });

    describe('ICarConfig Interface', () => {
        it('should allow valid car configuration', () => {
            const config: ICarConfig = {
                maxSpeed: 400,
                acceleration: 300,
                brakeForce: 400,
                reverseSpeed: 150,
                turnRateHigh: 180,
                turnRateLow: 360,
                speedThresholdTight: 100,
                driftThreshold: 100,
                normalFriction: 0.95,
                driftFriction: 0.7,
                handBrakeFriction: 0.5,
                transitionTime: 0.2,
                driftSpeedRetention: 0.95,
                handbrakeSpeedRetention: 0.98,
                mass: 100,
                drag: 0.99,
                angularDrag: 0.95
            };

            expect(config).toBeDefined();
            expect(config.maxSpeed).toBe(400);
        });
    });

    describe('IQualityConfig Interface', () => {
        it('should allow valid quality configuration', () => {
            const config: IQualityConfig = {
                perfectAngleMin: 15,
                perfectAngleMax: 45,
                extremeAngle: 60,
                highSpeedThreshold: 300,
                mediumSpeedThreshold: 200,
                lowSpeedThreshold: 100,
                veryCloseDistance: 50,
                closeDistance: 100,
                safeDistance: 200,
                smoothnessWindowFrames: 60,
                comboDecayTime: 1.0,
                minimumQualityForCombo: 31,
                poorMax: 30,
                goodMax: 70,
                perfectMin: 71
            };

            expect(config).toBeDefined();
            expect(config.perfectAngleMin).toBe(15);
        });
    });

    describe('IPhysicsConfig Interface', () => {
        it('should allow valid complete physics configuration', () => {
            const config: IPhysicsConfig = {
                car: {
                    maxSpeed: 400,
                    acceleration: 300,
                    brakeForce: 400,
                    reverseSpeed: 150,
                    turnRateHigh: 180,
                    turnRateLow: 360,
                    speedThresholdTight: 100,
                    driftThreshold: 100,
                    normalFriction: 0.95,
                    driftFriction: 0.7,
                    handBrakeFriction: 0.5,
                    transitionTime: 0.2,
                    driftSpeedRetention: 0.95,
                    handbrakeSpeedRetention: 0.98,
                    mass: 100,
                    drag: 0.99,
                    angularDrag: 0.95
                },
                quality: {
                    perfectAngleMin: 15,
                    perfectAngleMax: 45,
                    extremeAngle: 60,
                    highSpeedThreshold: 300,
                    mediumSpeedThreshold: 200,
                    lowSpeedThreshold: 100,
                    veryCloseDistance: 50,
                    closeDistance: 100,
                    safeDistance: 200,
                    smoothnessWindowFrames: 60,
                    comboDecayTime: 1.0,
                    minimumQualityForCombo: 31,
                    poorMax: 30,
                    goodMax: 70,
                    perfectMin: 71
                }
            };

            expect(config).toBeDefined();
            expect(config.car).toBeDefined();
            expect(config.quality).toBeDefined();
        });
    });
});
