/**
 * Input type definitions for keyboard controls and input state tracking.
 * These types define the input system's data structures.
 */

/**
 * Enum for input actions used throughout the game
 */
export enum InputAction {
    Accelerate = 'ACCELERATE',
    Brake = 'BRAKE',
    SteerLeft = 'STEER_LEFT',
    SteerRight = 'STEER_RIGHT',
    Handbrake = 'HANDBRAKE',
    Restart = 'RESTART',
    Pause = 'PAUSE'
}

/**
 * Interface for input state tracking
 * Tracks both held keys and frame-specific key presses
 */
export interface IInputState {
    /** Whether accelerate is currently held */
    accelerate: boolean;
    
    /** Whether brake is currently held */
    brake: boolean;
    
    /** Whether steer left is currently held */
    steerLeft: boolean;
    
    /** Whether steer right is currently held */
    steerRight: boolean;
    
    /** Whether handbrake is currently held */
    handbrake: boolean;
    
    /** Whether restart is currently held */
    restart: boolean;
    
    /** Whether pause is currently held */
    pause: boolean;
    
    // Frame-specific tracking (pressed this frame, not held)
    /** Whether accelerate was just pressed this frame */
    acceleratePressed: boolean;
    
    /** Whether brake was just pressed this frame */
    brakePressed: boolean;
    
    /** Whether handbrake was just pressed this frame */
    handbrakePressed: boolean;
    
    /** Whether restart was just pressed this frame */
    restartPressed: boolean;
    
    /** Whether pause was just pressed this frame */
    pausePressed: boolean;
}

/**
 * Interface for key mapping configuration
 * Maps input actions to keyboard keys (supports multiple keys per action)
 */
export interface IKeyMapping {
    /** Keys for acceleration (e.g., W, UP arrow) */
    [InputAction.Accelerate]: string[];
    
    /** Keys for braking (e.g., S, DOWN arrow) */
    [InputAction.Brake]: string[];
    
    /** Keys for steering left (e.g., A, LEFT arrow) */
    [InputAction.SteerLeft]: string[];
    
    /** Keys for steering right (e.g., D, RIGHT arrow) */
    [InputAction.SteerRight]: string[];
    
    /** Keys for handbrake (e.g., SPACE) */
    [InputAction.Handbrake]: string[];
    
    /** Keys for restart (e.g., R) */
    [InputAction.Restart]: string[];
    
    /** Keys for pause (e.g., ESC) */
    [InputAction.Pause]: string[];
}

/**
 * Default key mapping configuration
 * WASD + Arrow keys for movement, SPACE for handbrake
 */
export const DEFAULT_KEY_MAPPING: IKeyMapping = {
    [InputAction.Accelerate]: ['W', 'UP'],
    [InputAction.Brake]: ['S', 'DOWN'],
    [InputAction.SteerLeft]: ['A', 'LEFT'],
    [InputAction.SteerRight]: ['D', 'RIGHT'],
    [InputAction.Handbrake]: ['SPACE'],
    [InputAction.Restart]: ['R'],
    [InputAction.Pause]: ['ESC']
};
