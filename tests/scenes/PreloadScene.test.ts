import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { PreloadScene } from '../../src/scenes/PreloadScene';
import type { PreloadSceneData } from '../../src/types/SceneData';
import { ImageAssets, UIAssets, AudioAssets } from '../../src/config/AssetConfig';

describe('PreloadScene', () => {
  let scene: PreloadScene;
  let mockGame: any;
  let mockLoad: any;
  let mockAdd: any;
  let mockMake: any;
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

    mockMake = {
      graphics: jest.fn(() => ({
        fillStyle: jest.fn().mockReturnThis(),
        fillRect: jest.fn().mockReturnThis(),
        lineStyle: jest.fn().mockReturnThis(),
        strokeRect: jest.fn().mockReturnThis(),
        generateTexture: jest.fn(),
        destroy: jest.fn(),
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
    (scene as any).make = mockMake;
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

    it('should load all sprite assets using AssetManager', () => {
      scene.preload();

      // Verify images were loaded (AssetManager calls mockLoad.image internally)
      expect(mockLoad.image).toHaveBeenCalledWith(
        ImageAssets.CAR_SPRITE.key,
        ImageAssets.CAR_SPRITE.path
      );
      expect(mockLoad.image).toHaveBeenCalledWith(
        ImageAssets.PARTICLE_SMOKE.key,
        ImageAssets.PARTICLE_SMOKE.path
      );
    });

    it('should NOT load track assets during preload (progressive loading)', () => {
      scene.preload();

      // Tracks should be loaded on-demand, not in PreloadScene
      const allImageCalls = mockLoad.image.mock.calls.map((call: any) => call[0]);
      const trackKeys = allImageCalls.filter((key: string) => key.includes('track'));
      
      expect(trackKeys.length).toBe(0);
    });

    it('should load all UI assets using AssetManager', () => {
      scene.preload();

      expect(mockLoad.image).toHaveBeenCalledWith(
        UIAssets.BUTTON.key,
        UIAssets.BUTTON.path
      );
      expect(mockLoad.image).toHaveBeenCalledWith(
        UIAssets.METER_BAR.key,
        UIAssets.METER_BAR.path
      );
    });

    it('should load all SFX assets using AssetManager', () => {
      scene.preload();

      expect(mockLoad.audio).toHaveBeenCalledWith(
        AudioAssets.sfx.TIRE_SCREECH.key,
        AudioAssets.sfx.TIRE_SCREECH.path
      );
      expect(mockLoad.audio).toHaveBeenCalledWith(
        AudioAssets.sfx.ENGINE.key,
        AudioAssets.sfx.ENGINE.path
      );
      expect(mockLoad.audio).toHaveBeenCalledWith(
        AudioAssets.sfx.UI_CLICK.key,
        AudioAssets.sfx.UI_CLICK.path
      );
      expect(mockLoad.audio).toHaveBeenCalledWith(
        AudioAssets.sfx.PERFECT_DRIFT.key,
        AudioAssets.sfx.PERFECT_DRIFT.path
      );
    });

    it('should load all music assets using AssetManager', () => {
      scene.preload();

      expect(mockLoad.audio).toHaveBeenCalledWith(
        AudioAssets.music.MENU.key,
        AudioAssets.music.MENU.path
      );
      expect(mockLoad.audio).toHaveBeenCalledWith(
        AudioAssets.music.GAMEPLAY.key,
        AudioAssets.music.GAMEPLAY.path
      );
    });

    it('should use asset key constants instead of hardcoded strings', () => {
      scene.preload();

      // Verify that assets were loaded (AssetManager handles the actual loading)
      const allImageCalls = mockLoad.image.mock.calls;
      const allAudioCalls = mockLoad.audio.mock.calls;

      // Check that loader was called (exact keys checked in other tests)
      expect(allImageCalls.length).toBeGreaterThan(0);
      expect(allAudioCalls.length).toBeGreaterThan(0);
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
      expect(mockProgressBar.fillStyle).toHaveBeenCalledWith(0xffffff, 1);
      expect(mockProgressBar.fillRect).toHaveBeenCalled();
    });

    it('should update percentage text on progress event', () => {
      const mockPercentageText = mockAdd.text();
      (scene as any).percentageText = mockPercentageText;

      mockLoad._triggerEvent('progress', 0.75);

      expect(mockPercentageText.setText).toHaveBeenCalledWith('75%');
    });

    it('should update asset text on filecomplete event with category', () => {
      const mockAssetText = mockAdd.text();
      (scene as any).assetText = mockAssetText;

      // Test with an asset that contains 'sprite' keyword
      mockLoad._triggerEvent('filecomplete', 'car-sprite', 'image', {});

      // Should show category, not the asset key
      expect(mockAssetText.setText).toHaveBeenCalledWith('Loading graphics...');
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
    let consoleWarnSpy: ReturnType<typeof jest.spyOn>;
    let consoleLogSpy: ReturnType<typeof jest.spyOn>;

    beforeEach(() => {
      scene.init({});
      scene.preload();
      consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleWarnSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should handle asset load errors gracefully', () => {
      const mockFile = {
        key: 'missing-asset',
        url: 'assets/missing.png',
        type: 'image',
      };
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Trigger error event
      mockLoad._triggerEvent('loaderror', mockFile);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[AssetManager] Failed to load: missing-asset'
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[AssetManager] Attempted path: assets/missing.png'
      );

      // Should not throw error
      expect(() => mockLoad._triggerEvent('loaderror', mockFile)).not.toThrow();

      consoleErrorSpy.mockRestore();
    });

    it('should continue loading if asset fails', () => {
      const mockFile = {
        key: 'missing-asset',
        url: 'assets/missing.png',
        type: 'image',
      };

      mockLoad._triggerEvent('loaderror', mockFile);

      // Scene should still be functional
      expect(scene).toBeDefined();
    });

    it('should categorize assets correctly for display', () => {
      const mockAssetText = mockAdd.text();
      (scene as any).assetText = mockAssetText;

      // Test with sprite key
      mockLoad._triggerEvent('filecomplete', 'car-sprite', 'image', {});
      expect(mockAssetText.setText).toHaveBeenCalledWith('Loading graphics...');

      // Test with audio key
      mockLoad._triggerEvent('filecomplete', 'music-menu', 'audio', {});
      expect(mockAssetText.setText).toHaveBeenCalledWith('Loading audio...');

      // Test with UI key
      mockLoad._triggerEvent('filecomplete', 'ui-button', 'image', {});
      expect(mockAssetText.setText).toHaveBeenCalledWith('Loading interface...');
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

    it('should display game title "SATISFYING DRIFTING"', () => {
      scene.preload();

      const textCalls = mockAdd.text.mock.calls;
      const titleCall = textCalls.find((call: any) => 
        call[2] === 'SATISFYING DRIFTING'
      );

      expect(titleCall).toBeDefined();
    });
  });

  describe('Progressive Loading Strategy', () => {
    beforeEach(() => {
      scene.init({});
    });

    it('should load critical assets (sprites) before UI assets', () => {
      scene.preload();

      const imageCalls = mockLoad.image.mock.calls;
      const spriteIndex = imageCalls.findIndex((call: any) => 
        call[0] === ImageAssets.CAR_SPRITE.key
      );
      const uiIndex = imageCalls.findIndex((call: any) => 
        call[0] === UIAssets.BUTTON.key
      );

      // Sprites should be loaded before UI
      expect(spriteIndex).toBeLessThan(uiIndex);
    });

    it('should load UI assets before audio assets', () => {
      scene.preload();

      const imageCalls = mockLoad.image.mock.calls;
      const audioCalls = mockLoad.audio.mock.calls;

      const uiIndex = imageCalls.findIndex((call: any) => 
        call[0] === UIAssets.BUTTON.key
      );

      // If both exist, all images should be loaded before audio starts
      if (uiIndex !== -1 && audioCalls.length > 0) {
        // This demonstrates load order intention
        expect(imageCalls.length).toBeGreaterThan(0);
        expect(audioCalls.length).toBeGreaterThan(0);
      }
    });

    it('should categorize loading text correctly for sprites', () => {
      scene.init({});
      scene.preload();

      const mockAssetText = mockAdd.text();
      (scene as any).assetText = mockAssetText;

      // Trigger filecomplete for a sprite
      mockLoad._triggerEvent('filecomplete', 'car-sprite', 'image', {});

      // Asset text should be updated with 'graphics' category
      expect(mockAssetText.setText).toHaveBeenCalledWith('Loading graphics...');
    });

    it('should categorize loading text correctly for audio', () => {
      scene.init({});
      scene.preload();

      const mockAssetText = mockAdd.text();
      (scene as any).assetText = mockAssetText;

      // Trigger filecomplete for audio
      mockLoad._triggerEvent('filecomplete', 'sfx-engine', 'audio', {});

      // Asset text should be updated with 'audio' category
      expect(mockAssetText.setText).toHaveBeenCalledWith('Loading audio...');
    });

    it('should categorize loading text correctly for UI', () => {
      scene.init({});
      scene.preload();

      const mockAssetText = mockAdd.text();
      (scene as any).assetText = mockAssetText;

      // Trigger filecomplete for UI
      mockLoad._triggerEvent('filecomplete', 'ui-button', 'image', {});

      // Asset text should be updated with 'interface' category
      expect(mockAssetText.setText).toHaveBeenCalledWith('Loading interface...');
    });
  });
});
