/**
 * InputManager singleton handles all player input.
 * Provides frame-accurate input polling for responsive controls.
 * 
 * Usage:
 *   const input = InputManager.getInstance();
 *   if (input.isAccelerating()) { ... }
 */

import Phaser from 'phaser';
import type { IInputState, IKeyMapping } from '../types/InputTypes';
import { InputAction, DEFAULT_KEY_MAPPING } from '../types/InputTypes';

export class InputManager {
    private static instance: InputManager | null = null;
    
    private scene: Phaser.Scene;
    private keyboard!: Phaser.Input.Keyboard.KeyboardPlugin;
    private keyMapping: IKeyMapping;
    private inputState: IInputState;
    
    // Input buffering
    private lastRestartTime: number = -1000; // Initialize to -1000 to allow first restart
    private restartCooldown: number = 300; // milliseconds
    
    // Key objects for fast polling
    private keys: {
        accelerate: Phaser.Input.Keyboard.Key[];
        brake: Phaser.Input.Keyboard.Key[];
        steerLeft: Phaser.Input.Keyboard.Key[];
        steerRight: Phaser.Input.Keyboard.Key[];
        handbrake: Phaser.Input.Keyboard.Key[];
        restart: Phaser.Input.Keyboard.Key[];
        pause: Phaser.Input.Keyboard.Key[];
    };
    
    /**
     * Private constructor (singleton pattern)
     */
    private constructor(scene: Phaser.Scene, keyMapping?: IKeyMapping) {
        this.scene = scene;
        this.keyboard = scene.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin;
        this.keyMapping = keyMapping || DEFAULT_KEY_MAPPING;
        
        this.inputState = this.createInitialState();
        this.keys = this.createKeyObjects();

        // Ensure singleton cleans itself up with the scene
        this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    }
    
    /**
     * Get or create singleton instance
     */
    public static getInstance(scene?: Phaser.Scene, keyMapping?: IKeyMapping): InputManager {
        if (!InputManager.instance) {
            if (!scene) {
                throw new Error('InputManager: First call to getInstance must provide a scene');
            }
            InputManager.instance = new InputManager(scene, keyMapping);
        }
        return InputManager.instance;
    }
    
    /**
     * Check if instance exists (for testing)
     */
    public static hasInstance(): boolean {
        return InputManager.instance !== null;
    }
    
    /**
     * Destroy singleton instance
     */
    public static destroyInstance(): void {
        if (InputManager.instance) {
            InputManager.instance.destroy();
            InputManager.instance = null;
        }
    }
    
    /**
     * Create initial input state
     */
    private createInitialState(): IInputState {
        return {
            accelerate: false,
            brake: false,
            steerLeft: false,
            steerRight: false,
            handbrake: false,
            restart: false,
            pause: false,
            acceleratePressed: false,
            brakePressed: false,
            handbrakePressed: false,
            restartPressed: false,
            pausePressed: false
        };
    }
    
    /**
     * Create Phaser key objects from key mapping
     */
    private createKeyObjects(): typeof this.keys {
        const addKeys = (keyCodes: string[]): Phaser.Input.Keyboard.Key[] => {
            return keyCodes.map(code => this.keyboard.addKey(code, true));
        };
        
        return {
            accelerate: addKeys(this.keyMapping[InputAction.Accelerate]),
            brake: addKeys(this.keyMapping[InputAction.Brake]),
            steerLeft: addKeys(this.keyMapping[InputAction.SteerLeft]),
            steerRight: addKeys(this.keyMapping[InputAction.SteerRight]),
            handbrake: addKeys(this.keyMapping[InputAction.Handbrake]),
            restart: addKeys(this.keyMapping[InputAction.Restart]),
            pause: addKeys(this.keyMapping[InputAction.Pause])
        };
    }
    
    /**
     * Update input state (call every frame before physics update)
     */
    public update(time?: number): void {
        const now = (time ?? this.scene.time.now) || 0;
        
        // Update held states
        this.inputState.accelerate = this.isAnyKeyDown(this.keys.accelerate);
        this.inputState.brake = this.isAnyKeyDown(this.keys.brake);
        this.inputState.steerLeft = this.isAnyKeyDown(this.keys.steerLeft);
        this.inputState.steerRight = this.isAnyKeyDown(this.keys.steerRight);
        this.inputState.handbrake = this.isAnyKeyDown(this.keys.handbrake);
        this.inputState.pause = this.isAnyKeyDown(this.keys.pause);
        
        // Update "pressed this frame" states via Phaser helpers
        this.inputState.acceleratePressed = this.wasAnyJustDown(this.keys.accelerate);
        this.inputState.brakePressed = this.wasAnyJustDown(this.keys.brake);
        this.inputState.handbrakePressed = this.wasAnyJustDown(this.keys.handbrake);
        this.inputState.pausePressed = this.wasAnyJustDown(this.keys.pause);
        
        // Restart with cooldown buffering
        const restartJustDown = this.wasAnyJustDown(this.keys.restart);
        const timeSinceLastRestart = now - this.lastRestartTime;
        
        if (restartJustDown && timeSinceLastRestart >= this.restartCooldown) {
            this.inputState.restart = true;
            this.inputState.restartPressed = true;
            this.lastRestartTime = now;
        } else {
            this.inputState.restart = false;
            this.inputState.restartPressed = false;
        }
    }
    
    /**
     * Check if any key in array is currently down
     */
    private isAnyKeyDown(keys: Phaser.Input.Keyboard.Key[]): boolean {
        return keys.some(key => key.isDown);
    }

    /**
     * Check if any key in array was just pressed this frame
     */
    private wasAnyJustDown(keys: Phaser.Input.Keyboard.Key[]): boolean {
        return keys.some(key => Phaser.Input.Keyboard.JustDown(key));
    }
    
    // Public getters for input state
    
    /**
     * Check if accelerate is currently held
     */
    public isAccelerating(): boolean {
        return this.inputState.accelerate;
    }
    
    /**
     * Check if brake is currently held
     */
    public isBraking(): boolean {
        return this.inputState.brake;
    }
    
    /**
     * Check if steer left is currently held
     */
    public isSteeringLeft(): boolean {
        return this.inputState.steerLeft;
    }
    
    /**
     * Check if steer right is currently held
     */
    public isSteeringRight(): boolean {
        return this.inputState.steerRight;
    }
    
    /**
     * Check if handbrake is currently held
     */
    public isHandbraking(): boolean {
        return this.inputState.handbrake;
    }
    
    /**
     * Check if restart was triggered (with cooldown)
     */
    public isRestarting(): boolean {
        return this.inputState.restart;
    }
    
    /**
     * Check if pause is currently held
     */
    public isPausing(): boolean {
        return this.inputState.pause;
    }
    
    /**
     * Get steering input as -1 (left), 0 (none), or 1 (right)
     */
    public getSteeringAxis(): number {
        if (this.inputState.steerLeft && this.inputState.steerRight) {
            return 0; // Both pressed, cancel out
        }
        if (this.inputState.steerLeft) return -1;
        if (this.inputState.steerRight) return 1;
        return 0;
    }
    
    /**
     * Get acceleration input as -1 (brake), 0 (coast), or 1 (accelerate)
     */
    public getAccelerationAxis(): number {
        if (this.inputState.accelerate && this.inputState.brake) {
            return 0; // Both pressed, cancel out
        }
        if (this.inputState.accelerate) return 1;
        if (this.inputState.brake) return -1;
        return 0;
    }
    
    /**
     * Check if action was pressed THIS FRAME
     */
    public wasPressed(action: InputAction): boolean {
        switch (action) {
            case InputAction.Accelerate: return this.inputState.acceleratePressed;
            case InputAction.Brake: return this.inputState.brakePressed;
            case InputAction.Handbrake: return this.inputState.handbrakePressed;
            case InputAction.Restart: return this.inputState.restartPressed;
            case InputAction.Pause: return this.inputState.pausePressed;
            default: return false;
        }
    }
    
    /**
     * Get full input state (read-only)
     */
    public getState(): Readonly<IInputState> {
        return { ...this.inputState };
    }
    
    /**
     * Reset all input to default state
     */
    public reset(): void {
        this.inputState = this.createInitialState();
        this.lastRestartTime = -1000; // Allow immediate restart after reset
    }
    
    /**
     * Clean up resources
     */
    public destroy(): void {
        // Prevent double-destroy
        if (!this.keyboard) {
            return;
        }
        
        // Remove all keyboard listeners
        Object.values(this.keys).flat().forEach(key => {
            this.keyboard.removeKey(key);
        });
        
        // Clear references
        this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
        this.scene = null as any;
        this.keyboard = null as any;
    }
}
