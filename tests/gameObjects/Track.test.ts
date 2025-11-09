/**
 * Unit tests for Track game object
 */

import Phaser from 'phaser';
import { Track } from '../../src/gameObjects/Track';
import { ITrackConfig, TrackDifficulty } from '../../src/types/TrackTypes';
import * as envUtils from '../../src/utils/env';

// Mock the isDevEnvironment function
jest.mock('../../src/utils/env', () => ({
  ...jest.requireActual('../../src/utils/env'),
  isDevEnvironment: jest.fn()
}));

describe('Track', () => {
  let scene: Phaser.Scene;
  let mockTrackConfig: ITrackConfig;

  beforeEach(() => {
    // Create a minimal mock scene
    scene = {
      cameras: {
        main: {
          width: 1280,
          height: 720
        }
      },
      add: {
        existing: jest.fn().mockReturnThis()
      },
      textures: {
        exists: jest.fn().mockReturnValue(true)
      }
    } as any;

    // Mock track configuration
    mockTrackConfig = {
      id: 'test-track',
      name: 'Test Track',
      description: 'A test track',
      difficulty: TrackDifficulty.Tutorial,
      imageKey: 'track_test',
      thumbnailKey: 'track_test_thumb',
      width: 150,
      spawnPoint: {
        x: 640,
        y: 600,
        angle: 270
      },
      driveArea: {
        outerBoundary: [
          { x: 200, y: 150 },
          { x: 1080, y: 150 },
          { x: 1080, y: 570 },
          { x: 200, y: 570 },
          { x: 200, y: 150 }
        ],
        innerBoundaries: [
          [
            { x: 350, y: 270 },
            { x: 930, y: 270 },
            { x: 930, y: 450 },
            { x: 350, y: 450 },
            { x: 350, y: 270 }
          ]
        ]
      },
      optimalTime: 30,
      minimumQuality: 0,
      unlockRequirement: undefined
    };
  });

  describe('Constructor', () => {
    it('should create a Track instance', () => {
      const track = new Track(scene, mockTrackConfig);
      expect(track).toBeInstanceOf(Track);
      expect(track).toBeInstanceOf(Phaser.GameObjects.Image);
    });

    it('should position track at scene center', () => {
      const track = new Track(scene, mockTrackConfig);
      expect(track.x).toBe(640); // 1280 / 2
      expect(track.y).toBe(360); // 720 / 2
    });

    it('should set texture from track config imageKey', () => {
      const track = new Track(scene, mockTrackConfig);
      expect(track.texture.key).toBe('track_test');
    });

    it('should set depth to 0 (background layer)', () => {
      const track = new Track(scene, mockTrackConfig);
      expect(track.depth).toBe(0);
    });

    it('should set origin to center (0.5, 0.5)', () => {
      const track = new Track(scene, mockTrackConfig);
      expect(track.originX).toBe(0.5);
      expect(track.originY).toBe(0.5);
    });

    it('should add itself to the scene', () => {
      new Track(scene, mockTrackConfig);
      expect(scene.add.existing).toHaveBeenCalled();
    });

    it('should be configured as static object', () => {
      const track = new Track(scene, mockTrackConfig);
      // Track should be a static background - verify it's an Image
      expect(track).toBeInstanceOf(Phaser.GameObjects.Image);
      expect(track.depth).toBe(0); // Background depth
    });
  });

  describe('getConfig()', () => {
    it('should return the track configuration', () => {
      const track = new Track(scene, mockTrackConfig);
      const config = track.getConfig();
      
      expect(config).toBe(mockTrackConfig);
      expect(config.id).toBe('test-track');
      expect(config.name).toBe('Test Track');
    });

    it('should return config with correct drive area', () => {
      const track = new Track(scene, mockTrackConfig);
      const config = track.getConfig();
      
      expect(config.driveArea.outerBoundary).toHaveLength(5);
      expect(config.driveArea.innerBoundaries).toHaveLength(1);
      expect(config.driveArea.innerBoundaries![0]).toHaveLength(5);
    });

    it('should return config with correct spawn point', () => {
      const track = new Track(scene, mockTrackConfig);
      const config = track.getConfig();
      
      expect(config.spawnPoint.x).toBe(640);
      expect(config.spawnPoint.y).toBe(600);
      expect(config.spawnPoint.angle).toBe(270);
    });
  });

  describe('debugDrawBoundary()', () => {
    let mockGraphics: Phaser.GameObjects.Graphics;

    beforeEach(() => {
      mockGraphics = {
        lineStyle: jest.fn().mockReturnThis(),
        fillStyle: jest.fn().mockReturnThis(),
        beginPath: jest.fn().mockReturnThis(),
        moveTo: jest.fn().mockReturnThis(),
        lineTo: jest.fn().mockReturnThis(),
        closePath: jest.fn().mockReturnThis(),
        strokePath: jest.fn().mockReturnThis(),
        fillCircle: jest.fn().mockReturnThis()
      } as any;
    });

    it('should not draw in production environment', () => {
      // Mock production environment
      (envUtils.isDevEnvironment as jest.Mock).mockReturnValue(false);

      const track = new Track(scene, mockTrackConfig);
      track.debugDrawBoundary(mockGraphics);

      expect(mockGraphics.lineStyle).not.toHaveBeenCalled();
      expect(mockGraphics.fillCircle).not.toHaveBeenCalled();
    });

    it('should draw boundaries in development environment', () => {
      // Mock development environment
      (envUtils.isDevEnvironment as jest.Mock).mockReturnValue(true);

      const track = new Track(scene, mockTrackConfig);
      track.debugDrawBoundary(mockGraphics);

      // Should set red line style for boundaries
      expect(mockGraphics.lineStyle).toHaveBeenCalledWith(2, 0xff0000, 1);
      
      // Should draw paths
      expect(mockGraphics.beginPath).toHaveBeenCalled();
      expect(mockGraphics.moveTo).toHaveBeenCalled();
      expect(mockGraphics.lineTo).toHaveBeenCalled();
      expect(mockGraphics.closePath).toHaveBeenCalled();
      expect(mockGraphics.strokePath).toHaveBeenCalled();
    });

    it('should draw spawn point in development environment', () => {
      (envUtils.isDevEnvironment as jest.Mock).mockReturnValue(true);

      const track = new Track(scene, mockTrackConfig);
      track.debugDrawBoundary(mockGraphics);

      // Should draw green circle at spawn point
      expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0x00ff00, 1);
      expect(mockGraphics.fillCircle).toHaveBeenCalledWith(640, 600, 10);
    });

    it('should draw spawn direction arrow in development environment', () => {
      (envUtils.isDevEnvironment as jest.Mock).mockReturnValue(true);

      const track = new Track(scene, mockTrackConfig);
      track.debugDrawBoundary(mockGraphics);

      // Should draw green line style for direction arrow
      expect(mockGraphics.lineStyle).toHaveBeenCalledWith(3, 0x00ff00, 1);
      
      // Should draw line from spawn point
      expect(mockGraphics.moveTo).toHaveBeenCalledWith(640, 600);
    });

    it('should handle track with no inner boundaries', () => {
      (envUtils.isDevEnvironment as jest.Mock).mockReturnValue(true);

      const configWithoutInner = {
        ...mockTrackConfig,
        driveArea: {
          outerBoundary: mockTrackConfig.driveArea.outerBoundary,
          innerBoundaries: undefined
        }
      };

      const track = new Track(scene, configWithoutInner);
      
      // Should not throw error
      expect(() => {
        track.debugDrawBoundary(mockGraphics);
      }).not.toThrow();
    });

    it('should warn about invalid polygons with fewer than 3 points', () => {
      (envUtils.isDevEnvironment as jest.Mock).mockReturnValue(true);
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const invalidConfig = {
        ...mockTrackConfig,
        driveArea: {
          outerBoundary: [
            { x: 200, y: 150 },
            { x: 1080, y: 150 }
          ],
          innerBoundaries: []
        }
      };

      const track = new Track(scene, invalidConfig);
      track.debugDrawBoundary(mockGraphics);

      expect(consoleWarnSpy).toHaveBeenCalledWith('Track boundary has fewer than 3 points');

      consoleWarnSpy.mockRestore();
    });
  });

  describe('preDestroy()', () => {
    it('should clear track config reference', () => {
      const track = new Track(scene, mockTrackConfig);
      
      // Access private property for testing
      expect((track as any).trackConfig).toBe(mockTrackConfig);
      
      // Call preDestroy
      track.preDestroy();
      
      // Config should be nulled
      expect((track as any).trackConfig).toBeNull();
    });

    it('should not throw when called', () => {
      const track = new Track(scene, mockTrackConfig);
      
      expect(() => {
        track.preDestroy();
      }).not.toThrow();
    });
  });

  describe('Integration', () => {
    it('should be a static background image', () => {
      const track = new Track(scene, mockTrackConfig);
      
      // Track should be a Phaser Image
      expect(track).toBeInstanceOf(Phaser.GameObjects.Image);
      // Track should be at background depth
      expect(track.depth).toBe(0);
    });

    it('should maintain correct configuration throughout lifecycle', () => {
      const track = new Track(scene, mockTrackConfig);
      
      // Config should be accessible immediately
      expect(track.getConfig()).toBe(mockTrackConfig);
      
      // Config should still be accessible after any operations
      const config1 = track.getConfig();
      const config2 = track.getConfig();
      expect(config1).toBe(config2);
      expect(config1).toBe(mockTrackConfig);
    });
  });
});
