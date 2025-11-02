/**
 * Unit tests for AssetManager
 * Tests singleton pattern, asset queuing, error handling, and placeholder creation
 */

import { AssetManager } from '../../src/systems/AssetManager';
import type { AssetDefinition } from '../../src/types/AssetTypes';

// Mock Phaser objects
const createMockScene = () => {
  const mockLoader = {
    image: jest.fn(),
    audio: jest.fn(),
    on: jest.fn(),
  };

  const mockMake = {
    graphics: jest.fn().mockReturnValue({
      fillStyle: jest.fn().mockReturnThis(),
      fillRect: jest.fn().mockReturnThis(),
      lineStyle: jest.fn().mockReturnThis(),
      strokeRect: jest.fn().mockReturnThis(),
      generateTexture: jest.fn(),
      destroy: jest.fn(),
    }),
  };

  return {
    load: mockLoader,
    make: mockMake,
    textures: {
      exists: jest.fn().mockReturnValue(false),
    },
  } as any;
};

describe('AssetManager', () => {
  let assetManager: AssetManager;
  let mockScene: any;
  let consoleWarnSpy: ReturnType<typeof jest.spyOn>;
  let consoleLogSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    // Get fresh instance
    assetManager = AssetManager.getInstance();
    assetManager.reset(); // Clear any previous state
    mockScene = createMockScene();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = AssetManager.getInstance();
      const instance2 = AssetManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should maintain state across getInstance calls', () => {
      const instance1 = AssetManager.getInstance();
      const testAsset: AssetDefinition = {
        key: 'test-asset',
        path: 'test.png',
        format: 'png',
      };

      instance1.queueAsset(mockScene, testAsset);

      const instance2 = AssetManager.getInstance();
      expect(instance2).toBe(instance1);
    });
  });

  describe('Asset Queuing', () => {
    it('should queue an image asset correctly', () => {
      const imageAsset: AssetDefinition = {
        key: 'test-image',
        path: 'assets/test.png',
        format: 'png',
      };

      assetManager.queueAsset(mockScene, imageAsset);

      expect(mockScene.load.image).toHaveBeenCalledWith('test-image', 'assets/test.png');
    });

    it('should queue an audio asset correctly', () => {
      const audioAsset: AssetDefinition = {
        key: 'test-audio',
        path: 'assets/test.mp3',
        format: 'mp3',
      };

      assetManager.queueAsset(mockScene, audioAsset);

      expect(mockScene.load.audio).toHaveBeenCalledWith('test-audio', 'assets/test.mp3');
    });

    it('should queue multiple assets in batch', () => {
      const assets: AssetDefinition[] = [
        { key: 'asset1', path: 'asset1.png', format: 'png' },
        { key: 'asset2', path: 'asset2.png', format: 'png' },
        { key: 'asset3', path: 'asset3.mp3', format: 'mp3' },
      ];

      assetManager.queueAssets(mockScene, assets);

      expect(mockScene.load.image).toHaveBeenCalledTimes(2);
      expect(mockScene.load.audio).toHaveBeenCalledTimes(1);
    });

    it('should determine asset type from file extension', () => {
      const pngAsset: AssetDefinition = {
        key: 'test1',
        path: 'test.png',
      };
      const mp3Asset: AssetDefinition = {
        key: 'test2',
        path: 'test.mp3',
      };

      assetManager.queueAsset(mockScene, pngAsset);
      assetManager.queueAsset(mockScene, mp3Asset);

      expect(mockScene.load.image).toHaveBeenCalledWith('test1', 'test.png');
      expect(mockScene.load.audio).toHaveBeenCalledWith('test2', 'test.mp3');
    });
  });

  describe('Error Handling', () => {
    it('should register error handlers on the scene loader', () => {
      assetManager.registerErrorHandlers(mockScene);

      expect(mockScene.load.on).toHaveBeenCalledWith('loaderror', expect.any(Function));
      expect(mockScene.load.on).toHaveBeenCalledWith('filecomplete', expect.any(Function));
    });

    it('should track failed assets', () => {
      assetManager.registerErrorHandlers(mockScene);

      // Simulate a load error
      const errorCallback = mockScene.load.on.mock.calls.find(
        (call: any[]) => call[0] === 'loaderror'
      )?.[1];

      if (errorCallback) {
        errorCallback({ key: 'failed-asset', url: 'failed.png', type: 'image' });
      }

      const failedAssets = assetManager.getFailedAssets();
      expect(failedAssets.has('failed-asset')).toBe(true);
      expect(consoleWarnSpy).toHaveBeenCalledWith('[AssetManager] Failed to load: failed-asset');
      expect(consoleWarnSpy).toHaveBeenCalledWith('[AssetManager] Attempted path: failed.png');
    });

    it('should create placeholder for failed image asset', () => {
      assetManager.registerErrorHandlers(mockScene);

      const errorCallback = mockScene.load.on.mock.calls.find(
        (call: any[]) => call[0] === 'loaderror'
      )?.[1];

      if (errorCallback) {
        errorCallback({ key: 'failed-image', url: 'failed.png', type: 'image' });
      }

      expect(mockScene.make.graphics).toHaveBeenCalled();
    });
  });

  describe('Asset Tracking', () => {
    it('should track successfully loaded assets', () => {
      assetManager.registerErrorHandlers(mockScene);

      // Simulate successful load
      const successCallback = mockScene.load.on.mock.calls.find(
        (call: any[]) => call[0] === 'filecomplete'
      )?.[1];

      if (successCallback) {
        successCallback('loaded-asset');
      }

      expect(assetManager.isLoaded('loaded-asset')).toBe(true);
    });

    it('should return correct loading statistics', () => {
      assetManager.registerErrorHandlers(mockScene);

      // Simulate loads
      const successCallback = mockScene.load.on.mock.calls.find(
        (call: any[]) => call[0] === 'filecomplete'
      )?.[1];
      const errorCallback = mockScene.load.on.mock.calls.find(
        (call: any[]) => call[0] === 'loaderror'
      )?.[1];

      if (successCallback) {
        successCallback('asset1');
        successCallback('asset2');
      }

      if (errorCallback) {
        errorCallback({ key: 'failed1', url: 'fail.png', type: 'image' });
      }

      const stats = assetManager.getStats();
      expect(stats.loaded).toBe(2);
      expect(stats.failed).toBe(1);
    });

    it('should clear all tracking data on reset', () => {
      assetManager.registerErrorHandlers(mockScene);

      const successCallback = mockScene.load.on.mock.calls.find(
        (call: any[]) => call[0] === 'filecomplete'
      )?.[1];

      if (successCallback) {
        successCallback('asset1');
      }

      assetManager.reset();

      const stats = assetManager.getStats();
      expect(stats.loaded).toBe(0);
      expect(stats.failed).toBe(0);
      expect(stats.placeholders).toBe(0);
    });
  });

  describe('Placeholder Generation', () => {
    it('should create magenta placeholder for regular images', () => {
      assetManager.registerErrorHandlers(mockScene);

      const errorCallback = mockScene.load.on.mock.calls.find(
        (call: any[]) => call[0] === 'loaderror'
      )?.[1];

      if (errorCallback) {
        errorCallback({ key: 'sprite', url: 'sprite.png', type: 'image' });
      }

      const graphics = mockScene.make.graphics();
      expect(graphics.fillStyle).toHaveBeenCalledWith(0xFF00FF, 1.0);
      expect(graphics.generateTexture).toHaveBeenCalledWith('sprite', 64, 64);
    });

    it('should create larger placeholder for track images', () => {
      assetManager.registerErrorHandlers(mockScene);

      const errorCallback = mockScene.load.on.mock.calls.find(
        (call: any[]) => call[0] === 'loaderror'
      )?.[1];

      if (errorCallback) {
        errorCallback({ key: 'track-tutorial', url: 'track.png', type: 'image' });
      }

      const graphics = mockScene.make.graphics();
      expect(graphics.generateTexture).toHaveBeenCalledWith('track-tutorial', 1280, 720);
    });

    it('should not create duplicate placeholders', () => {
      assetManager.registerErrorHandlers(mockScene);

      const errorCallback = mockScene.load.on.mock.calls.find(
        (call: any[]) => call[0] === 'loaderror'
      )?.[1];

      if (errorCallback) {
        errorCallback({ key: 'same-asset', url: 'same.png', type: 'image' });
        errorCallback({ key: 'same-asset', url: 'same.png', type: 'image' });
      }

      // Graphics should only be called once
      expect(mockScene.make.graphics).toHaveBeenCalledTimes(1);
    });
  });
});
