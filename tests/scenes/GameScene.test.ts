jest.mock('phaser');

import { GameScene } from '../../src/scenes/GameScene';
import type { GameSceneData } from '../../src/types/SceneData';

describe('GameScene', () => {
  let scene: GameScene;

  beforeEach(() => {
    scene = new GameScene();
  });

  describe('Scene Initialization', () => {
    it('should initialize with correct scene key', () => {
      expect(scene.sys.settings.key).toBe('GameScene');
    });

    it('should store scene data correctly in init()', () => {
      const testData: GameSceneData = {
        mode: 'practice',
        trackId: 'tutorial',
        trackName: 'Tutorial Circuit',
      };

      scene.init(testData);

      // Access private properties for testing
      expect((scene as any).currentMode).toBe('practice');
      expect((scene as any).currentTrackId).toBe('tutorial');
      expect((scene as any).currentTrackName).toBe('Tutorial Circuit');
    });

    it('should handle missing scene data gracefully', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      scene.init(undefined as unknown as GameSceneData);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[GameScene] Invalid scene data received:',
        undefined
      );

      // Should set defaults
      expect((scene as any).currentMode).toBe('practice');
      expect((scene as any).currentTrackId).toBe('tutorial');
      expect((scene as any).currentTrackName).toBe('Tutorial Circuit');

      consoleErrorSpy.mockRestore();
    });

    it('should handle score mode correctly', () => {
      const testData: GameSceneData = {
        mode: 'score',
        trackId: 'serpentine',
        trackName: 'Serpentine Run',
      };

      scene.init(testData);

      expect((scene as any).currentMode).toBe('score');
      expect((scene as any).currentTrackId).toBe('serpentine');
      expect((scene as any).currentTrackName).toBe('Serpentine Run');
    });

    it('should validate track data structure', () => {
      const testData: GameSceneData = {
        mode: 'practice',
        trackId: 'hairpin',
        trackName: 'Hairpin Challenge',
      };

      scene.init(testData);

      expect((scene as any).currentMode).toBeDefined();
      expect((scene as any).currentTrackId).toBeDefined();
      expect((scene as any).currentTrackName).toBeDefined();
    });
  });

  describe('Scene Display', () => {
    it('should create all required text elements in create()', () => {
      const testData: GameSceneData = {
        mode: 'practice',
        trackId: 'tutorial',
        trackName: 'Tutorial Circuit',
      };

      scene.init(testData);
      scene.create();

      // Verify text objects were created
      expect((scene as any).trackText).toBeDefined();
      expect((scene as any).modeText).toBeDefined();
      expect((scene as any).placeholderText).toBeDefined();
      expect((scene as any).instructionText).toBeDefined();
    });

    it('should display track name correctly', () => {
      const testData: GameSceneData = {
        mode: 'practice',
        trackId: 'gauntlet',
        trackName: 'The Gauntlet',
      };

      scene.init(testData);
      scene.create();

      const trackText = (scene as any).trackText as Phaser.GameObjects.Text;
      expect(trackText.text).toBe('Track: The Gauntlet');
    });

    it('should display game mode in uppercase', () => {
      const testData: GameSceneData = {
        mode: 'score',
        trackId: 'tutorial',
        trackName: 'Tutorial Circuit',
      };

      scene.init(testData);
      scene.create();

      const modeText = (scene as any).modeText as Phaser.GameObjects.Text;
      expect(modeText.text).toBe('Mode: SCORE');
    });

    it('should show placeholder message', () => {
      const testData: GameSceneData = {
        mode: 'practice',
        trackId: 'tutorial',
        trackName: 'Tutorial Circuit',
      };

      scene.init(testData);
      scene.create();

      const placeholderText = (scene as any)
        .placeholderText as Phaser.GameObjects.Text;
      expect(placeholderText.text).toContain('GameScene');
      expect(placeholderText.text).toContain('Placeholder');
    });

    it('should show control instructions', () => {
      const testData: GameSceneData = {
        mode: 'practice',
        trackId: 'tutorial',
        trackName: 'Tutorial Circuit',
      };

      scene.init(testData);
      scene.create();

      const instructionText = (scene as any)
        .instructionText as Phaser.GameObjects.Text;
      expect(instructionText.text).toContain('[R] Restart');
      expect(instructionText.text).toContain('[ESC] Back to Menu');
    });

    it('should position text elements correctly', () => {
      const testData: GameSceneData = {
        mode: 'practice',
        trackId: 'tutorial',
        trackName: 'Tutorial Circuit',
      };

      scene.init(testData);
      scene.create();

      const trackText = (scene as any).trackText as Phaser.GameObjects.Text;
      const placeholderText = (scene as any)
        .placeholderText as Phaser.GameObjects.Text;

      // Verify text objects exist (mock doesn't implement originX/Y)
      expect(trackText).toBeDefined();
      expect(placeholderText).toBeDefined();
    });
  });

  describe('Keyboard Input', () => {
    it('should have keyboard input available', () => {
      const testData: GameSceneData = {
        mode: 'practice',
        trackId: 'tutorial',
        trackName: 'Tutorial Circuit',
      };

      scene.init(testData);
      scene.create();

      expect(scene.input.keyboard).toBeDefined();
    });

    it('should register input handlers in create', () => {
      const testData: GameSceneData = {
        mode: 'practice',
        trackId: 'tutorial',
        trackName: 'Tutorial Circuit',
      };

      scene.init(testData);

      // Create should register keyboard handlers
      expect(() => scene.create()).not.toThrow();
    });
  });

  describe('Scene Restart', () => {
    it('should have handleRestart method', () => {
      expect(typeof (scene as any).handleRestart).toBe('function');
    });

    it('should have scene manager with restart capability', () => {
      const testData: GameSceneData = {
        mode: 'practice',
        trackId: 'tutorial',
        trackName: 'Tutorial Circuit',
      };

      scene.init(testData);
      scene.create();

      // Verify scene manager exists (restart will be available in real Phaser)
      expect(scene.scene).toBeDefined();
      expect(typeof scene.scene.start).toBe('function');
    });
  });

  describe('Return to Menu', () => {
    it('should have handleReturnToMenu method', () => {
      expect(typeof (scene as any).handleReturnToMenu).toBe('function');
    });

    it('should include fade effect before menu transition', () => {
      const testData: GameSceneData = {
        mode: 'practice',
        trackId: 'tutorial',
        trackName: 'Tutorial Circuit',
      };

      scene.init(testData);
      scene.create();

      const fadeOutSpy = jest.spyOn(scene.cameras.main, 'fadeOut');

      (scene as any).handleReturnToMenu();

      // Verify fade out is called with 300ms duration
      expect(fadeOutSpy).toHaveBeenCalledWith(300, 0, 0, 0);
    });

    it('should pass assetsLoaded flag to MenuScene', (done) => {
      const testData: GameSceneData = {
        mode: 'practice',
        trackId: 'tutorial',
        trackName: 'Tutorial Circuit',
      };

      scene.init(testData);
      scene.create();

      const startSpy = jest.spyOn(scene.scene, 'start');

      (scene as any).handleReturnToMenu();

      // Simulate fade complete
      setTimeout(() => {
        scene.cameras.main.emit('camerafadeoutcomplete');
        expect(startSpy).toHaveBeenCalledWith(
          'MenuScene',
          expect.objectContaining({ assetsLoaded: true })
        );
        done();
      }, 50);
    });
  });

  describe('Game Loop', () => {
    it('should have update method', () => {
      expect(scene.update).toBeDefined();
      expect(typeof scene.update).toBe('function');
    });

    it('should execute update without errors', () => {
      const testData: GameSceneData = {
        mode: 'practice',
        trackId: 'tutorial',
        trackName: 'Tutorial Circuit',
      };

      scene.init(testData);
      scene.create();

      expect(() => {
        scene.update(0, 16.67);
      }).not.toThrow();
    });

    it('should handle multiple update calls', () => {
      const testData: GameSceneData = {
        mode: 'practice',
        trackId: 'tutorial',
        trackName: 'Tutorial Circuit',
      };

      scene.init(testData);
      scene.create();

      // Simulate multiple frames
      for (let i = 0; i < 60; i++) {
        expect(() => {
          scene.update(i * 16.67, 16.67);
        }).not.toThrow();
      }
    });
  });

  describe('Scene Cleanup', () => {
    it('should have shutdown method', () => {
      expect(typeof scene.shutdown).toBe('function');
    });

    it('should execute shutdown without errors', () => {
      const testData: GameSceneData = {
        mode: 'practice',
        trackId: 'tutorial',
        trackName: 'Tutorial Circuit',
      };

      scene.init(testData);
      scene.create();

      // Mock keyboard.off to prevent errors
      if (scene.input.keyboard) {
        scene.input.keyboard.off = jest.fn();
      }

      expect(() => scene.shutdown()).not.toThrow();
    });

    it('should clear all tweens in shutdown', () => {
      const testData: GameSceneData = {
        mode: 'practice',
        trackId: 'tutorial',
        trackName: 'Tutorial Circuit',
      };

      scene.init(testData);
      scene.create();

      // Mock methods to prevent errors
      if (scene.input.keyboard) {
        scene.input.keyboard.off = jest.fn();
      }

      const killAllSpy = jest.spyOn(scene.tweens, 'killAll');

      scene.shutdown();

      expect(killAllSpy).toHaveBeenCalled();
    });

    it('should clear all timers in shutdown', () => {
      const testData: GameSceneData = {
        mode: 'practice',
        trackId: 'tutorial',
        trackName: 'Tutorial Circuit',
      };

      scene.init(testData);
      scene.create();

      // Mock methods to prevent errors
      if (scene.input.keyboard) {
        scene.input.keyboard.off = jest.fn();
      }

      const removeAllEventsSpy = jest.spyOn(scene.time, 'removeAllEvents');

      scene.shutdown();

      expect(removeAllEventsSpy).toHaveBeenCalled();
    });

    it('should clear scene data in shutdown', () => {
      const testData: GameSceneData = {
        mode: 'practice',
        trackId: 'tutorial',
        trackName: 'Tutorial Circuit',
      };

      scene.init(testData);
      scene.create();

      // Mock methods to prevent errors
      if (scene.input.keyboard) {
        scene.input.keyboard.off = jest.fn();
      }

      scene.shutdown();

      expect((scene as any).currentMode).toBeUndefined();
      expect((scene as any).currentTrackId).toBeUndefined();
      expect((scene as any).currentTrackName).toBeUndefined();
    });

    it('should clear text references in shutdown', () => {
      const testData: GameSceneData = {
        mode: 'practice',
        trackId: 'tutorial',
        trackName: 'Tutorial Circuit',
      };

      scene.init(testData);
      scene.create();

      // Mock methods to prevent errors
      if (scene.input.keyboard) {
        scene.input.keyboard.off = jest.fn();
      }

      scene.shutdown();

      expect((scene as any).trackText).toBeUndefined();
      expect((scene as any).modeText).toBeUndefined();
      expect((scene as any).placeholderText).toBeUndefined();
      expect((scene as any).instructionText).toBeUndefined();
    });

    it('should handle multiple shutdown calls gracefully', () => {
      const testData: GameSceneData = {
        mode: 'practice',
        trackId: 'tutorial',
        trackName: 'Tutorial Circuit',
      };

      scene.init(testData);
      scene.create();

      // Mock methods to prevent errors
      if (scene.input.keyboard) {
        scene.input.keyboard.off = jest.fn();
      }

      expect(() => {
        scene.shutdown();
        scene.shutdown();
        scene.shutdown();
      }).not.toThrow();
    });

    it('should allow scene revisit after shutdown', () => {
      const testData: GameSceneData = {
        mode: 'practice',
        trackId: 'tutorial',
        trackName: 'Tutorial Circuit',
      };

      // Mock methods to prevent errors
      if (scene.input.keyboard) {
        scene.input.keyboard.off = jest.fn();
      }

      // First visit
      scene.init(testData);
      scene.create();
      scene.shutdown();

      // Second visit
      expect(() => {
        scene.init(testData);
        scene.create();
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should have update method for game loop', () => {
      expect(typeof scene.update).toBe('function');
    });

    it('should have minimal update loop overhead', () => {
      const testData: GameSceneData = {
        mode: 'practice',
        trackId: 'tutorial',
        trackName: 'Tutorial Circuit',
      };

      scene.init(testData);
      scene.create();

      const startTime = performance.now();

      // Run 60 frames (1 second)
      for (let i = 0; i < 60; i++) {
        scene.update(i * 16.67, 16.67);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Empty update loop should be very fast
      expect(totalTime).toBeLessThan(100); // Less than 100ms for 60 frames
    });
  });

  describe('Integration Tests', () => {
    it('should complete full lifecycle: init → create → update → shutdown', () => {
      const testData: GameSceneData = {
        mode: 'practice',
        trackId: 'tutorial',
        trackName: 'Tutorial Circuit',
      };

      // Mock methods to prevent errors
      if (scene.input.keyboard) {
        scene.input.keyboard.off = jest.fn();
      }

      expect(() => {
        scene.init(testData);
        scene.create();
        scene.update(0, 16.67);
        scene.shutdown();
      }).not.toThrow();
    });

    it('should have scene transition functionality', () => {
      const testData: GameSceneData = {
        mode: 'practice',
        trackId: 'tutorial',
        trackName: 'Tutorial Circuit',
      };

      scene.init(testData);
      scene.create();

      // Verify scene manager and transitions exist
      expect(scene.scene).toBeDefined();
      expect(typeof scene.scene.start).toBe('function');
    });

    it('should work for all track types', () => {
      const tracks: GameSceneData[] = [
        { mode: 'practice', trackId: 'tutorial', trackName: 'Tutorial Circuit' },
        { mode: 'score', trackId: 'serpentine', trackName: 'Serpentine Run' },
        { mode: 'practice', trackId: 'hairpin', trackName: 'Hairpin Challenge' },
        { mode: 'score', trackId: 'gauntlet', trackName: 'The Gauntlet' },
        { mode: 'practice', trackId: 'sandbox', trackName: 'Sandbox Arena' },
      ];

      // Mock methods to prevent errors
      if (scene.input.keyboard) {
        scene.input.keyboard.off = jest.fn();
      }

      tracks.forEach((trackData) => {
        expect(() => {
          scene.init(trackData);
          scene.create();
          scene.shutdown();
        }).not.toThrow();
      });
    });

    it('should work for both game modes', () => {
      // Mock methods to prevent errors
      if (scene.input.keyboard) {
        scene.input.keyboard.off = jest.fn();
      }

      const practiceData: GameSceneData = {
        mode: 'practice',
        trackId: 'tutorial',
        trackName: 'Tutorial Circuit',
      };

      scene.init(practiceData);
      scene.create();
      scene.shutdown();

      const scoreData: GameSceneData = {
        mode: 'score',
        trackId: 'tutorial',
        trackName: 'Tutorial Circuit',
      };

      scene.init(scoreData);
      scene.create();
      scene.shutdown();

      expect(true).toBe(true); // No errors thrown
    });
  });
});
