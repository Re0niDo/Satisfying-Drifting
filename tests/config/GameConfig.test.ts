// Mock Phaser to avoid canvas-related issues in Jest
jest.mock('phaser', () => {
    return {
        __esModule: true,
        default: {
            AUTO: 0,
            Scale: {
                FIT: 1,
                CENTER_BOTH: 1,
            },
        },
    };
});

import { gameConfig } from '../../src/config/GameConfig';

describe('GameConfig', () => {
    it('should export a valid Phaser configuration object', () => {
        expect(gameConfig).toBeDefined();
        expect(typeof gameConfig).toBe('object');
    });

    it('should specify correct canvas dimensions (1280x720)', () => {
        expect(gameConfig.width).toBe(1280);
        expect(gameConfig.height).toBe(720);
    });

    it('should disable gravity for top-down game (y: 0)', () => {
        expect(gameConfig.physics).toBeDefined();
        if (gameConfig.physics && typeof gameConfig.physics === 'object') {
            const physicsConfig = gameConfig.physics as any;
            expect(physicsConfig.arcade).toBeDefined();
            expect(physicsConfig.arcade.gravity.y).toBe(0);
        }
    });

    it('should set scale mode to FIT with proper constraints', () => {
        expect(gameConfig.scale).toBeDefined();
        if (gameConfig.scale && typeof gameConfig.scale === 'object') {
            const scaleConfig = gameConfig.scale as any;
            expect(scaleConfig.mode).toBeDefined();
            expect(scaleConfig.min).toEqual({ width: 800, height: 600 });
            expect(scaleConfig.max).toEqual({ width: 1920, height: 1080 });
        }
    });

    it('should target 60 FPS', () => {
        expect(gameConfig.fps).toBeDefined();
        if (gameConfig.fps && typeof gameConfig.fps === 'object') {
            const fpsConfig = gameConfig.fps as any;
            expect(fpsConfig.target).toBe(60);
        }
    });

    it('should have an empty scene array (scenes added in story 1.2)', () => {
        expect(gameConfig.scene).toBeDefined();
        expect(Array.isArray(gameConfig.scene)).toBe(true);
        expect(gameConfig.scene).toHaveLength(0);
    });

    it('should have the correct parent container', () => {
        expect(gameConfig.parent).toBe('game-container');
    });

    it('should have arcade physics with correct configuration', () => {
        expect(gameConfig.physics).toBeDefined();
        if (gameConfig.physics && typeof gameConfig.physics === 'object') {
            const physicsConfig = gameConfig.physics as any;
            expect(physicsConfig.default).toBe('arcade');
            expect(physicsConfig.arcade.fps).toBe(60);
            expect(physicsConfig.arcade.debug).toBe(false);
        }
    });
});
