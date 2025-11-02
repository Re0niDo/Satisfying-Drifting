jest.mock('phaser');

import { BootScene } from '../../src/scenes/BootScene';

describe('BootScene', () => {
  let scene: BootScene;

  beforeEach(() => {
    scene = new BootScene();
  });

  describe('Initialization', () => {
    it('should initialize with correct scene key', () => {
      expect(scene.sys.settings.key).toBe('BootScene');
    });

    it('should expose core lifecycle methods', () => {
      expect(typeof scene.init).toBe('function');
      expect(typeof scene.preload).toBe('function');
      expect(typeof scene.create).toBe('function');
      expect(typeof scene.shutdown).toBe('function');
    });
  });

  describe('Scene Lifecycle', () => {
    it('should execute init without errors', () => {
      expect(() => scene.init({})).not.toThrow();
    });

    it('should execute preload without errors', () => {
      expect(() => scene.preload()).not.toThrow();
    });

    it('should execute create without errors', () => {
      expect(() => scene.create()).not.toThrow();
    });

    it('should execute shutdown without errors', () => {
      expect(() => scene.shutdown()).not.toThrow();
    });
  });

  describe('Scene Transition', () => {
    it('should have scene manager available', () => {
      expect(scene.scene).toBeDefined();
      expect(typeof scene.scene.start).toBe('function');
    });

    it('should transition to PreloadScene in create', () => {
      const startSpy = jest.spyOn(scene.scene, 'start');

      scene.create();

      expect(startSpy).toHaveBeenCalledWith('PreloadScene', expect.any(Object));
    });
  });

  describe('Registry Access', () => {
    it('should store and read values from registry', () => {
      const testValue = { test: 'data' };
      scene.registry.set('testManager', testValue);

      expect(scene.registry.get('testManager')).toEqual(testValue);
    });

    it('should persist registry values across lifecycle', () => {
      scene.init({});
      scene.registry.set('bootData', 'test');

      scene.create();
      expect(scene.registry.get('bootData')).toBe('test');
    });
  });

  describe('Performance Tracking', () => {
    it('should track boot start time in init', () => {
      const startTime = performance.now();
      scene.init({});
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should complete lifecycle quickly', () => {
      const startTime = performance.now();

      scene.init({});
      scene.preload();
      scene.create();

      const duration = performance.now() - startTime;
      expect(duration).toBeLessThan(500);
    });
  });

  describe('Cleanup', () => {
    it('should clean up tweens on shutdown', () => {
      scene.shutdown();

      expect(scene.tweens.killAll).toHaveBeenCalled();
    });

    it('should clean up timers on shutdown', () => {
      scene.shutdown();

      expect(scene.time.removeAllEvents).toHaveBeenCalled();
    });
  });

  describe('TypeScript Type Safety', () => {
    it('should accept BootSceneData in init', () => {
      expect(() => scene.init({})).not.toThrow();
    });

    it('should handle empty data object', () => {
      expect(() => scene.init({})).not.toThrow();
    });
  });
});
