/**
 * Physics type definitions for car movement and drift mechanics.
 * These types define the data structures used throughout the physics system.
 */

/**
 * Enum representing the current drift state of the car
 */
export enum DriftState {
    Normal = 'NORMAL',       // Normal driving with high friction
    Drift = 'DRIFT',         // Controlled drift with reduced friction
    Handbrake = 'HANDBRAKE'  // Handbrake drift with lowest friction
}

/**
 * Interface for car physics state data
 * Tracks all physical properties of the car at any given moment
 */
export interface ICarPhysicsState {
    /** Car position in world coordinates (pixels) */
    position: { x: number; y: number };
    
    /** Car velocity vector (pixels/second) */
    velocity: { x: number; y: number };
    
    /** Car rotation angle (degrees, 0 = facing right) */
    rotation: number;
    
    /** Current speed magnitude (pixels/second) */
    speed: number;
    
    /** Lateral velocity component perpendicular to heading (pixels/second) */
    lateralVelocity: number;
    
    /** Angle between car heading and velocity direction (degrees) */
    driftAngle: number;
    
    /** Current drift state */
    driftState: DriftState;
    
    /** Whether accelerator is pressed this frame */
    isAccelerating: boolean;
    
    /** Whether brake is pressed this frame */
    isBraking: boolean;
    
    /** Whether handbrake is pressed this frame */
    isHandbraking: boolean;
}

/**
 * Interface for drift physics calculations
 * Contains all data needed for drift quality scoring and visual feedback
 */
export interface IDriftData {
    /** Drift angle in degrees (0-90, measured from velocity direction) */
    angle: number;
    
    /** Current speed in pixels/second */
    speed: number;
    
    /** Lateral velocity component (pixels/second) */
    lateralVelocity: number;
    
    /** Current drift state */
    state: DriftState;
    
    /** Progress of lerp transition between states (0-1) */
    stateTransitionProgress: number;
}

/**
 * Configuration interface for car physics parameters
 */
export interface ICarConfig {
    // Movement parameters
    /** Maximum forward speed (pixels/second) */
    maxSpeed: number;
    
    /** Rate of speed increase (pixels/second²) */
    acceleration: number;
    
    /** Deceleration when braking (pixels/second²) */
    brakeForce: number;
    
    /** Maximum reverse speed (pixels/second) */
    reverseSpeed: number;
    
    // Steering parameters
    /** Turn rate at high speed - tighter turns (degrees/second) */
    turnRateHigh: number;
    
    /** Turn rate at low speed - sharper turns (degrees/second) */
    turnRateLow: number;
    
    /** Speed threshold below which tight turns are enabled (pixels/second) */
    speedThresholdTight: number;
    
    // Drift physics
    /** Lateral velocity threshold to enter drift state (pixels/second) */
    driftThreshold: number;
    
    /** Friction coefficient in normal driving mode (0-1) */
    normalFriction: number;
    
    /** Friction coefficient during controlled drift (0-1) */
    driftFriction: number;
    
    /** Friction coefficient during handbrake drift (0-1) */
    handBrakeFriction: number;
    
    /** Time to lerp between normal/drift states (seconds) */
    transitionTime: number;
    
    // Speed loss during drift
    /** Speed retention multiplier per second during drift (0-1, 0.95 = 5% loss) */
    driftSpeedRetention: number;
    
    /** Speed retention multiplier per second during handbrake (0-1, 0.98 = 2% loss) */
    handbrakeSpeedRetention: number;
    
    // Physical properties
    /** Mass for collision calculations (arbitrary units) */
    mass: number;
    
    /** Air resistance multiplier per frame (0-1) */
    drag: number;
    
    /** Rotation dampening per frame (0-1) */
    angularDrag: number;
}

/**
 * Configuration interface for drift quality scoring parameters
 */
export interface IQualityConfig {
    // Drift angle scoring (40% weight)
    /** Minimum drift angle for perfect score (degrees) */
    perfectAngleMin: number;
    
    /** Maximum drift angle for perfect score (degrees) */
    perfectAngleMax: number;
    
    /** Drift angle beyond which no points are awarded (degrees) */
    extremeAngle: number;
    
    // Speed scoring (30% weight)
    /** Speed threshold for maximum multiplier (pixels/second) */
    highSpeedThreshold: number;
    
    /** Speed threshold for good multiplier (pixels/second) */
    mediumSpeedThreshold: number;
    
    /** Speed threshold for reduced multiplier (pixels/second) */
    lowSpeedThreshold: number;
    
    // Proximity scoring (20% weight)
    /** Distance from edge for 2x bonus (pixels) */
    veryCloseDistance: number;
    
    /** Distance from edge for 1.5x bonus (pixels) */
    closeDistance: number;
    
    /** Distance from edge for 1x normal scoring (pixels) */
    safeDistance: number;
    
    // Smoothness (10% weight)
    /** Number of frames to average for steering smoothness calculation */
    smoothnessWindowFrames: number;
    
    // Combo system
    /** Time before combo starts decaying (seconds) */
    comboDecayTime: number;
    
    /** Minimum quality score to maintain combo (0-100 scale) */
    minimumQualityForCombo: number;
    
    // Quality tiers
    /** Maximum score for "Poor" tier (0-30) */
    poorMax: number;
    
    /** Maximum score for "Good" tier (31-70) */
    goodMax: number;
    
    /** Minimum score for "Perfect" tier (71-100) */
    perfectMin: number;
}

/**
 * Root configuration interface for all physics parameters
 */
export interface IPhysicsConfig {
    /** Car movement and drift physics configuration */
    car: ICarConfig;
    
    /** Drift quality scoring configuration */
    quality: IQualityConfig;
}
