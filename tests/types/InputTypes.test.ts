/**
 * Unit tests for InputTypes
 * Validates input type definitions and default key mappings
 */

import {
    InputAction,
    DEFAULT_KEY_MAPPING,
    type IInputState,
    type IKeyMapping
} from '../../src/types/InputTypes';

describe('InputTypes', () => {
    describe('InputAction Enum', () => {
        it('should define all input actions', () => {
            expect(InputAction.Accelerate).toBeDefined();
            expect(InputAction.Brake).toBeDefined();
            expect(InputAction.SteerLeft).toBeDefined();
            expect(InputAction.SteerRight).toBeDefined();
            expect(InputAction.Handbrake).toBeDefined();
            expect(InputAction.Restart).toBeDefined();
            expect(InputAction.Pause).toBeDefined();
        });

        it('should have correct string values', () => {
            expect(InputAction.Accelerate).toBe('ACCELERATE');
            expect(InputAction.Brake).toBe('BRAKE');
            expect(InputAction.SteerLeft).toBe('STEER_LEFT');
            expect(InputAction.SteerRight).toBe('STEER_RIGHT');
            expect(InputAction.Handbrake).toBe('HANDBRAKE');
            expect(InputAction.Restart).toBe('RESTART');
            expect(InputAction.Pause).toBe('PAUSE');
        });
    });

    describe('IInputState Interface', () => {
        it('should allow valid input state objects', () => {
            const inputState: IInputState = {
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

            expect(inputState).toBeDefined();
            expect(inputState.accelerate).toBe(false);
        });

        it('should track held and pressed states separately', () => {
            const inputState: IInputState = {
                accelerate: true,           // Held down
                brake: false,
                steerLeft: false,
                steerRight: false,
                handbrake: false,
                restart: false,
                pause: false,
                acceleratePressed: false,   // Not just pressed this frame
                brakePressed: false,
                handbrakePressed: true,     // Just pressed this frame
                restartPressed: false,
                pausePressed: false
            };

            expect(inputState.accelerate).toBe(true);
            expect(inputState.acceleratePressed).toBe(false);
            expect(inputState.handbrake).toBe(false);
            expect(inputState.handbrakePressed).toBe(true);
        });
    });

    describe('IKeyMapping Interface', () => {
        it('should allow valid key mapping', () => {
            const mapping: IKeyMapping = {
                [InputAction.Accelerate]: ['W'],
                [InputAction.Brake]: ['S'],
                [InputAction.SteerLeft]: ['A'],
                [InputAction.SteerRight]: ['D'],
                [InputAction.Handbrake]: ['SPACE'],
                [InputAction.Restart]: ['R'],
                [InputAction.Pause]: ['ESC']
            };

            expect(mapping).toBeDefined();
            expect(mapping[InputAction.Accelerate]).toContain('W');
        });

        it('should support multiple keys per action', () => {
            const mapping: IKeyMapping = {
                [InputAction.Accelerate]: ['W', 'UP'],
                [InputAction.Brake]: ['S', 'DOWN'],
                [InputAction.SteerLeft]: ['A', 'LEFT'],
                [InputAction.SteerRight]: ['D', 'RIGHT'],
                [InputAction.Handbrake]: ['SPACE'],
                [InputAction.Restart]: ['R'],
                [InputAction.Pause]: ['ESC']
            };

            expect(mapping[InputAction.Accelerate]).toHaveLength(2);
            expect(mapping[InputAction.Accelerate]).toContain('W');
            expect(mapping[InputAction.Accelerate]).toContain('UP');
        });
    });

    describe('DEFAULT_KEY_MAPPING', () => {
        it('should export default key mapping', () => {
            expect(DEFAULT_KEY_MAPPING).toBeDefined();
        });

        it('should map all input actions', () => {
            expect(DEFAULT_KEY_MAPPING[InputAction.Accelerate]).toBeDefined();
            expect(DEFAULT_KEY_MAPPING[InputAction.Brake]).toBeDefined();
            expect(DEFAULT_KEY_MAPPING[InputAction.SteerLeft]).toBeDefined();
            expect(DEFAULT_KEY_MAPPING[InputAction.SteerRight]).toBeDefined();
            expect(DEFAULT_KEY_MAPPING[InputAction.Handbrake]).toBeDefined();
            expect(DEFAULT_KEY_MAPPING[InputAction.Restart]).toBeDefined();
            expect(DEFAULT_KEY_MAPPING[InputAction.Pause]).toBeDefined();
        });

        it('should use WASD controls', () => {
            expect(DEFAULT_KEY_MAPPING[InputAction.Accelerate]).toContain('W');
            expect(DEFAULT_KEY_MAPPING[InputAction.Brake]).toContain('S');
            expect(DEFAULT_KEY_MAPPING[InputAction.SteerLeft]).toContain('A');
            expect(DEFAULT_KEY_MAPPING[InputAction.SteerRight]).toContain('D');
        });

        it('should use arrow key controls', () => {
            expect(DEFAULT_KEY_MAPPING[InputAction.Accelerate]).toContain('UP');
            expect(DEFAULT_KEY_MAPPING[InputAction.Brake]).toContain('DOWN');
            expect(DEFAULT_KEY_MAPPING[InputAction.SteerLeft]).toContain('LEFT');
            expect(DEFAULT_KEY_MAPPING[InputAction.SteerRight]).toContain('RIGHT');
        });

        it('should use spacebar for handbrake', () => {
            expect(DEFAULT_KEY_MAPPING[InputAction.Handbrake]).toContain('SPACE');
        });

        it('should use R for restart', () => {
            expect(DEFAULT_KEY_MAPPING[InputAction.Restart]).toContain('R');
        });

        it('should use ESC for pause', () => {
            expect(DEFAULT_KEY_MAPPING[InputAction.Pause]).toContain('ESC');
        });

        it('should have arrays for all actions', () => {
            Object.values(DEFAULT_KEY_MAPPING).forEach(keys => {
                expect(Array.isArray(keys)).toBe(true);
                expect(keys.length).toBeGreaterThan(0);
            });
        });
    });
});
