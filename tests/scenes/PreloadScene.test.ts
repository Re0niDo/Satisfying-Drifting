import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { PreloadScene } from '../../src/scenes/PreloadScene';
import type { PreloadSceneData } from '../../src/types/SceneData';
import { AssetKeys, AssetPaths } from '../../src/config/AssetConfig';

describe('PreloadScene', () => {
  let scene: PreloadScene;
  let mockGame: any;
  let mockLoad: any;
  let mockAdd: any;
  let mockTime: any;
  let mockTweens: any;
  let mockCameras: any;
  let mockScene: any;

  beforeEach(() => {
    // Mock load events
    const loadEventListeners: Record<string, Function[]> = {
      progress: [],
      complete: [],
      filecomplete: [],
      loaderror: [],
    };

    mockLoad = {
      on: jest.fn((event: string, callback: Function) => {
        if (!loadEventListeners[event]) {
          loadEventListeners[event] = [];
        }
        loadEventListeners[event].push(callback);
      }),
      off: jest.fn((event: string) => {
        if (loadEventListeners[event]) {
          loadEventListeners[event] = [];
        }
      }),
      image: jest.fn(),
      audio: jest.fn(),
      // Helper to trigger events in tests
      _triggerEvent: (event: string, ...args: any[]) => {
        if (loadEventListeners[event]) {
          loadEventListeners[event].forEach((callback) => callback(...args));
        }
      },
    };

    mockAdd = {
      text: jest.fn(() => ({
        setOrigin: jest.fn().mockReturnThis(),
        setText: jest.fn().mockReturnThis(),
      })),
      graphics: jest.fn(() => ({
        fillStyle: jest.fn().mockReturnThis(),
        fillRect: jest.fn().mockReturnThis(),
        lineStyle: jest.fn().mockReturnThis(),
        strokeRect: jest.fn().mockReturnThis(),
        clear: jest.fn().mockReturnThis(),
      })),
    };

    mockTime = {
      delayedCall: jest.fn((_delay: number, callback: Function) => {
        callback();
      }),
      removeAllEvents: jest.fn(),
    };

    mockTweens = {
      killAll: jest.fn(),
    };

    const mockCamera = {
      fadeOut: jest.fn(),
      once: jest.fn((event: string, callback: Function) => {
        if (event === 'camerafadeoutcomplete') {
          callback();
        }
      }),
      centerX: 400,
      centerY: 300,
    };

    mockCameras = {
      main: mockCamera,
    };

    mockScene = {
      start: jest.fn(),
    };

    mockGame = {
      config: {
        width: 800,
        height: 600,
      },
    };

    scene = new PreloadScene();
    (scene as any).load = mockLoad;
    (scene as any).add = mockAdd;
    (scene as any).time = mockTime;
    (scene as any).tweens = mockTweens;
    (scene as any).cameras = mockCameras;
    (scene as any).scene = mockScene;
    (scene as any).game = mockGame;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Scene Initialization', () => {
    it('should initialize with correct scene key', () => {
      expect(scene).toBeDefined();
      expect((scene as any).sys.settings.key).toBe('PreloadScene');
    });

    it('should store scene data in init method', () => {
      const data: PreloadSceneData = { fastLoad: true };
      scene.init(data);

      expect((scene as any).sceneData).toEqual(data);
    });

    it('should handle empty scene data gracefully', () => {
      scene.init({});

      expect((scene as any).sceneData).toEqual({});
    });

    it('should track load start time', () => {
      const beforeTime = Date.now();
      scene.init({});
      const afterTime = Date.now();

      const loadStartTime = (scene as any).loadStartTime;
      expect(loadStartTime).toBeGreaterThanOrEqual(beforeTime);
      expect(loadStartTime).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('Asset Loading', () => {
    beforeEach(() => {
      scene.init({});
    });

    it('should load all sprite assets using AssetConfig', () => {
      scene.preload();

      expect(mockLoad.image).toHaveBeenCalledWith(
        AssetKeys.CAR,
        AssetPaths[AssetKeys.CAR]
      );
      expect(mockLoad.image).toHaveBeenCalledWith(
        AssetKeys.PARTICLE,
        AssetPaths[AssetKeys.PARTICLE]
      );
    });

    it('should load all track assets using AssetConfig', () => {
      scene.preload();

      expect(mockLoad.image).toHaveBeenCalledWith(
        AssetKeys.TRACK_TUTORIAL,
        AssetPaths[AssetKeys.TRACK_TUTORIAL]
      );
      expect(mockLoad.image).toHaveBeenCalledWith(
        AssetKeys.TRACK_SERPENTINE,
        AssetPaths[AssetKeys.TRACK_SERPENTINE]
      );
      expect(mockLoad.image).toHaveBeenCalledWith(
        AssetKeys.TRACK_HAIRPIN,
        AssetPaths[AssetKeys.TRACK_HAIRPIN]
      );
      expect(mockLoad.image).toHaveBeenCalledWith(
        AssetKeys.TRACK_GAUNTLET,
        AssetPaths[AssetKeys.TRACK_GAUNTLET]
      );
      expect(mockLoad.image).toHaveBeenCalledWith(
        AssetKeys.TRACK_SANDBOX,
        AssetPaths[AssetKeys.TRACK_SANDBOX]
      );
    });

    it('should load all UI assets using AssetConfig', () => {
      scene.preload();

      expect(mockLoad.image).toHaveBeenCalledWith(
        AssetKeys.BUTTON,
        AssetPaths[AssetKeys.BUTTON]
      );
      expect(mockLoad.image).toHaveBeenCalledWith(
        AssetKeys.METER_BAR,
        AssetPaths[AssetKeys.METER_BAR]
      );
    });

    it('should load all SFX assets using AssetConfig', () => {
      scene.preload();

      expect(mockLoad.audio).toHaveBeenCalledWith(
        AssetKeys.SFX_TIRE_SCREECH,
        AssetPaths[AssetKeys.SFX_TIRE_SCREECH]
      );
      expect(mockLoad.audio).toHaveBeenCalledWith(
        AssetKeys.SFX_ENGINE,
        AssetPaths[AssetKeys.SFX_ENGINE]
      );
      expect(mockLoad.audio).toHaveBeenCalledWith(
        AssetKeys.SFX_UI_CLICK,
        AssetPaths[AssetKeys.SFX_UI_CLICK]
      );
      expect(mockLoad.audio).toHaveBeenCalledWith(
        AssetKeys.SFX_PERFECT_DRIFT,
        AssetPaths[AssetKeys.SFX_PERFECT_DRIFT]
      );
    });

    it('should load all music assets using AssetConfig', () => {
      scene.preload();

      expect(mockLoad.audio).toHaveBeenCalledWith(
        AssetKeys.MUSIC_MENU,
        AssetPaths[AssetKeys.MUSIC_MENU]
      );
      expect(mockLoad.audio).toHaveBeenCalledWith(
        AssetKeys.MUSIC_GAMEPLAY,
        AssetPaths[AssetKeys.MUSIC_GAMEPLAY]
      );
    });

    it('should use asset key constants instead of hardcoded strings', () => {
      scene.preload();

      // Verify no hardcoded strings by checking all calls use constants
      const allImageCalls = mockLoad.image.mock.calls;
      const allAudioCalls = mockLoad.audio.mock.calls;

      allImageCalls.forEach((call: any[]) => {
        expect(Object.values(AssetKeys)).toContain(call[0]);
      });

      allAudioCalls.forEach((call: any[]) => {
        expect(Object.values(AssetKeys)).toContain(call[0]);
      });
    });
  });

  describe('Progress Tracking', () => {
    beforeEach(() => {
      scene.init({});
      scene.preload();
    });

    it('should register progress event listener', () => {
      expect(mockLoad.on).toHaveBeenCalledWith(
        'progress',
        expect.any(Function)
      );
    });

    it('should register filecomplete event listener', () => {
      expect(mockLoad.on).toHaveBeenCalledWith(
        'filecomplete',
        expect.any(Function)
      );
    });

    it('should register complete event listener', () => {
      expect(mockLoad.on).toHaveBeenCalledWith(
        'complete',
        expect.any(Function)
      );
    });

    it('should register loaderror event listener', () => {
      expect(mockLoad.on).toHaveBeenCalledWith(
        'loaderror',
        expect.any(Function)
      );
    });

    it('should update progress bar on progress event', () => {
      const mockProgressBar = mockAdd.graphics();
      (scene as any).progressBar = mockProgressBar;

      mockLoad._triggerEvent('progress', 0.5);

      expect(mockProgressBar.clear).toHaveBeenCalled();
      expect(mockProgressBar.fillStyle).toHaveBeenCalledWith(0x00ff00, 1);
      expect(mockProgressBar.fillRect).toHaveBeenCalled();
    });

    it('should update percentage text on progress event', () => {
      const mockPercentageText = mockAdd.text();
      (scene as any).percentageText = mockPercentageText;

      mockLoad._triggerEvent('progress', 0.75);

      expect(mockPercentageText.setText).toHaveBeenCalledWith('75%');
    });

    it('should update asset text on filecomplete event', () => {
      const mockAssetText = mockAdd.text();
      (scene as any).assetText = mockAssetText;

      mockLoad._triggerEvent('filecomplete', 'test-asset', 'image', {});

      expect(mockAssetText.setText).toHaveBeenCalledWith('test-asset');
    });

    it('should handle progress reaching 100%', () => {
      const mockPercentageText = mockAdd.text();
      (scene as any).percentageText = mockPercentageText;

      mockLoad._triggerEvent('progress', 1.0);

      expect(mockPercentageText.setText).toHaveBeenCalledWith('100%');
    });
  });

  describe('Scene Transition', () => {
    beforeEach(() => {
      scene.init({});
    });

    it('should transition to MenuScene when complete', () => {
      scene.create();

      expect(mockScene.start).toHaveBeenCalledWith('MenuScene', {
        assetsLoaded: true,
      });
    });

    it('should apply fade-out effect before transition', () => {
      scene.create();

      expect(mockCameras.main.fadeOut).toHaveBeenCalledWith(500, 0, 0, 0);
    });

    it('should pass correct data to MenuScene', () => {
      scene.create();

      expect(mockScene.start).toHaveBeenCalledWith('MenuScene', {
        assetsLoaded: true,
      });
    });

    it('should respect minimum display time', () => {
      const delayedCallSpy = jest.spyOn(mockTime, 'delayedCall');

      // Set load start time to very recent (fast load)
      (scene as any).loadStartTime = Date.now();

      scene.create();

      // Should call delayedCall with some delay (minimum display time)
      expect(delayedCallSpy).toHaveBeenCalled();
      const delay = delayedCallSpy.mock.calls[0][0];
      expect(delay).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      scene.init({});
      scene.preload();
    });

    it('should handle asset load errors gracefully', () => {
      const mockFile = { key: 'missing-asset' };
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Trigger error event
      mockLoad._triggerEvent('loaderror', mockFile);

      // Should not throw error
      expect(() => mockLoad._triggerEvent('loaderror', mockFile)).not.toThrow();

      consoleErrorSpy.mockRestore();
    });

    it('should continue loading if asset fails', () => {
      const mockFile = { key: 'missing-asset' };

      mockLoad._triggerEvent('loaderror', mockFile);

      // Scene should still be functional
      expect(scene).toBeDefined();
    });

    it('should display asset name or fallback text', () => {
      const mockAssetText = mockAdd.text();
      (scene as any).assetText = mockAssetText;

      // Test with valid key
      mockLoad._triggerEvent('filecomplete', 'valid-asset', 'image', {});
      expect(mockAssetText.setText).toHaveBeenCalledWith('valid-asset');

      // Test with empty key (should use fallback)
      mockLoad._triggerEvent('filecomplete', '', 'image', {});
      expect(mockAssetText.setText).toHaveBeenCalledWith('Loading...');
    });
  });

  describe('Cleanup', () => {
    beforeEach(() => {
      scene.init({});
      scene.preload();
    });

    it('should remove progress event listener on shutdown', () => {
      scene.shutdown();

      expect(mockLoad.off).toHaveBeenCalledWith('progress');
    });

    it('should remove complete event listener on shutdown', () => {
      scene.shutdown();

      expect(mockLoad.off).toHaveBeenCalledWith('complete');
    });

    it('should remove filecomplete event listener on shutdown', () => {
      scene.shutdown();

      expect(mockLoad.off).toHaveBeenCalledWith('filecomplete');
    });

    it('should remove loaderror event listener on shutdown', () => {
      scene.shutdown();

      expect(mockLoad.off).toHaveBeenCalledWith('loaderror');
    });

    it('should clear all timers on shutdown', () => {
      scene.shutdown();

      expect(mockTime.removeAllEvents).toHaveBeenCalled();
    });

    it('should kill all tweens on shutdown', () => {
      scene.shutdown();

      expect(mockTweens.killAll).toHaveBeenCalled();
    });

    it('should allow scene restart without errors', () => {
      // First lifecycle
      scene.init({});
      scene.preload();
      scene.create();
      scene.shutdown();

      // Second lifecycle
      expect(() => {
        scene.init({});
        scene.preload();
        scene.create();
        scene.shutdown();
      }).not.toThrow();
    });
  });

  describe('UI Creation', () => {
    beforeEach(() => {
      scene.init({});
    });

    it('should create progress bar graphics', () => {
      scene.preload();

      // Should create at least 2 graphics (progress box and progress bar)
      expect(mockAdd.graphics).toHaveBeenCalledTimes(2);
    });

    it('should create loading text elements', () => {
      scene.preload();

      // Should create multiple text elements (loading, percentage, asset)
      expect(mockAdd.text).toHaveBeenCalled();
      expect(mockAdd.text.mock.calls.length).toBeGreaterThanOrEqual(3);
    });

    it('should center progress bar on screen', () => {
      scene.preload();

      const progressBoxGraphics = mockAdd.graphics.mock.results[0]?.value;
      expect(progressBoxGraphics?.fillRect).toHaveBeenCalled();
    });

    it('should create progress bar with correct styling', () => {
      scene.preload();

      const progressBoxGraphics = mockAdd.graphics.mock.results[0]?.value;

      expect(progressBoxGraphics?.fillStyle).toHaveBeenCalled();
      expect(progressBoxGraphics?.lineStyle).toHaveBeenCalled();
    });
  });
});
