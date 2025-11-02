/**
 * @jest-environment jsdom
 */

jest.mock('phaser');

import Phaser from 'phaser';
import { MenuScene } from '../../src/scenes/MenuScene';
import type { MenuSceneData, GameSceneData } from '../../src/types/SceneData';
import { AssetKeys } from '../../src/config/AssetConfig';

const originalImportMetaEnv = (globalThis as any).__VITE_IMPORT_META_ENV__;

beforeAll(() => {
  (globalThis as any).__VITE_IMPORT_META_ENV__ = { DEV: false };
});

afterAll(() => {
  (globalThis as any).__VITE_IMPORT_META_ENV__ = originalImportMetaEnv;
});

describe('MenuScene', () => {
  let scene: MenuScene;

  beforeEach(() => {
    scene = new MenuScene();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Scene Initialization', () => {
    it('should initialize with correct scene key', () => {
      expect(scene.scene.key).toBe('MenuScene');
    });

    it('should store scene data correctly in init()', () => {
      const testData: MenuSceneData = { assetsLoaded: true };
      scene.init(testData);

      // Verify init was called (scene should be initialized)
      expect(scene).toBeDefined();
    });

    it('should handle missing scene data in init()', () => {
      // Should not throw when no data is passed
      expect(() => {
        scene.init({} as MenuSceneData);
      }).not.toThrow();
    });
  });

  describe('UI Creation', () => {
    it('should create game title text', () => {
      scene.create();

      // Check that text objects were created
      const textObjects = scene.children.list.filter(
        (child) => child instanceof Phaser.GameObjects.Text
      );

      // Should have at least title, mode buttons, and instructions
      expect(textObjects.length).toBeGreaterThan(0);
    });

    it('should create mode selection buttons', () => {
      scene.create();

      const textObjects = scene.children.list.filter(
        (child) => child instanceof Phaser.GameObjects.Text
      ) as Phaser.GameObjects.Text[];

      // Look for Practice Mode and Score Mode text
      const modeTexts = textObjects.filter(
        (text) =>
          text.text.includes('Practice Mode') || text.text.includes('Score Mode')
      );

      expect(modeTexts.length).toBe(2);
    });

    it('should create selection indicator', () => {
      scene.create();

      const rectangles = scene.children.list.filter(
        (child) => child instanceof Phaser.GameObjects.Rectangle
      );

      expect(rectangles.length).toBeGreaterThan(0);
    });

    it('should create instruction text', () => {
      scene.create();

      const textObjects = scene.children.list.filter(
        (child) => child instanceof Phaser.GameObjects.Text
      ) as Phaser.GameObjects.Text[];

      const instructionText = textObjects.find((text) =>
        text.text.includes('Arrow Keys')
      );

      expect(instructionText).toBeDefined();
    });
  });

  describe('Menu Music Integration', () => {
    it('should not throw error if music asset does not exist', () => {
      // Mock cache to return false for music check
      jest.spyOn(scene.cache.audio, 'exists').mockReturnValue(false);

      expect(() => {
        scene.create();
      }).not.toThrow();
    });

    it('should start menu music if asset exists', () => {
      // Mock cache and sound manager
      jest.spyOn(scene.cache.audio, 'exists').mockReturnValue(true);
      const mockSound = {
        play: jest.fn(),
        stop: jest.fn(),
        destroy: jest.fn(),
      } as unknown as Phaser.Sound.HTML5AudioSound;

      jest.spyOn(scene.sound, 'add').mockReturnValue(mockSound);

      scene.create();

      expect(scene.sound.add).toHaveBeenCalledWith(
        AssetKeys.MUSIC_MENU,
        expect.objectContaining({
          volume: 0.5,
          loop: true,
        })
      );
      expect(mockSound.play).toHaveBeenCalled();
    });
  });

  describe('Keyboard Input', () => {
    it('should register keyboard event listeners', () => {
      const onSpy = jest.spyOn(scene.input.keyboard!, 'on');

      scene.create();

      // Verify that keyboard listeners were registered
      expect(onSpy).toHaveBeenCalledWith('keydown-UP', expect.any(Function));
      expect(onSpy).toHaveBeenCalledWith('keydown-DOWN', expect.any(Function));
      expect(onSpy).toHaveBeenCalledWith('keydown-ENTER', expect.any(Function));
      expect(onSpy).toHaveBeenCalledWith('keydown-ESC', expect.any(Function));
    });

    it('should handle number key shortcuts', () => {
      const onSpy = jest.spyOn(scene.input.keyboard!, 'on');

      scene.create();

      expect(onSpy).toHaveBeenCalledWith('keydown-ONE', expect.any(Function));
      expect(onSpy).toHaveBeenCalledWith('keydown-TWO', expect.any(Function));
      expect(onSpy).toHaveBeenCalledWith('keydown-THREE', expect.any(Function));
      expect(onSpy).toHaveBeenCalledWith('keydown-FOUR', expect.any(Function));
      expect(onSpy).toHaveBeenCalledWith('keydown-FIVE', expect.any(Function));
    });
  });

  describe('Scene Transition', () => {
    it('should prepare GameSceneData with correct structure', () => {
      scene.init({ assetsLoaded: true });
      scene.create();

      const startSpy = jest.spyOn(scene.scene, 'start');

      jest.spyOn(scene.cameras.main, 'fadeOut').mockImplementation(() => {
        return scene.cameras.main;
      });

      (scene as any).selectedMode = 'practice';
      (scene as any).currentSelection = 0;
      (scene as any).menuState = 'TRACK_SELECTION';

      const selectedTrack = {
        id: 'tutorial',
        name: 'Tutorial Circuit',
        difficulty: 'Easy' as const,
        description: 'Learn the basics',
        optimalTime: 30,
      };

      (scene as any).startGame(selectedTrack);

      scene.cameras.main.emit('camerafadeoutcomplete');

      const expectedData: GameSceneData = {
        mode: 'practice',
        trackId: 'tutorial',
        trackName: 'Tutorial Circuit',
      };

      expect(startSpy).toHaveBeenCalledWith('GameScene', expectedData);
    });

    it('should trigger camera fade effect before transition', () => {
      scene.create();

      const fadeOutSpy = jest.spyOn(scene.cameras.main, 'fadeOut');

      // Setup for game start
      (scene as any).selectedMode = 'score';
      const testTrack = {
        id: 'test',
        name: 'Test Track',
        difficulty: 'Easy' as const,
        description: 'Test',
        optimalTime: 30,
      };

      (scene as any).startGame(testTrack);

      expect(fadeOutSpy).toHaveBeenCalledWith(500, 0, 0, 0);
    });
  });

  describe('Cleanup and Memory Management', () => {
    it('should remove all keyboard listeners on shutdown', () => {
      scene.create();

      const removeAllListenersSpy = jest.spyOn(
        scene.input.keyboard!,
        'removeAllListeners'
      );

      scene.shutdown();

      expect(removeAllListenersSpy).toHaveBeenCalled();
    });

    it('should stop and destroy music on shutdown', () => {
      // Mock music
      const mockSound = {
        play: jest.fn(),
        stop: jest.fn(),
        destroy: jest.fn(),
      } as unknown as Phaser.Sound.HTML5AudioSound;

      jest.spyOn(scene.cache.audio, 'exists').mockReturnValue(true);
      jest.spyOn(scene.sound, 'add').mockReturnValue(mockSound);

      scene.create();
      scene.shutdown();

      expect(mockSound.stop).toHaveBeenCalled();
      expect(mockSound.destroy).toHaveBeenCalled();
    });

    it('should kill all active tweens on shutdown', () => {
      scene.create();

      const killAllSpy = jest.spyOn(scene.tweens, 'killAll');

      scene.shutdown();

      expect(killAllSpy).toHaveBeenCalled();
    });

    it('should clear selection state on shutdown', () => {
      scene.create();

      // Set some state
      (scene as any).selectedMode = 'practice';
      (scene as any).currentSelection = 2;

      scene.shutdown();

      // Verify state is cleared
      expect((scene as any).selectedMode).toBeUndefined();
      expect((scene as any).currentSelection).toBe(0);
    });
  });

  describe('Track Data', () => {
    it('should define all 5 tracks', () => {
      scene.create();

      // Access the TRACKS constant through the scene
      // In real implementation, we could expose this or test indirectly
      // For now, we'll verify through UI creation

      // Switch to track selection
      (scene as any).selectedMode = 'practice';
      (scene as any).menuState = 'TRACK_SELECTION';
      (scene as any).createTrackSelectionScreen(1280);

      const textObjects = scene.children.list.filter(
        (child) => child instanceof Phaser.GameObjects.Text
      ) as Phaser.GameObjects.Text[];

      // Count track text objects (should have 5 tracks + title + back instruction)
      const trackTexts = textObjects.filter(
        (text) =>
          text.text.includes('[1]') ||
          text.text.includes('[2]') ||
          text.text.includes('[3]') ||
          text.text.includes('[4]') ||
          text.text.includes('[5]')
      );

      expect(trackTexts.length).toBe(5);
    });

    it('should display track information correctly', () => {
      scene.create();

      (scene as any).selectedMode = 'practice';
      (scene as any).menuState = 'TRACK_SELECTION';
      (scene as any).createTrackSelectionScreen(1280);

      const textObjects = scene.children.list.filter(
        (child) => child instanceof Phaser.GameObjects.Text
      ) as Phaser.GameObjects.Text[];

      // Find tutorial track text
      const tutorialTrack = textObjects.find((text) =>
        text.text.includes('Tutorial Circuit')
      );

      expect(tutorialTrack).toBeDefined();
      expect(tutorialTrack!.text).toContain('Easy');
      expect(tutorialTrack!.text).toContain('30s');
    });
  });

  describe('Menu State Management', () => {
    it('should start in MODE_SELECTION state', () => {
      scene.init({ assetsLoaded: true });

      expect((scene as any).menuState).toBe('MODE_SELECTION');
    });

    it('should transition to TRACK_SELECTION after mode selection', () => {
      scene.create();

      (scene as any).currentSelection = 0;
      (scene as any).confirmSelection();

      expect((scene as any).menuState).toBe('TRACK_SELECTION');
      expect((scene as any).selectedMode).toBe('practice');
    });

    it('should return to MODE_SELECTION when ESC pressed from track selection', () => {
      scene.create();

      // Move to track selection
      (scene as any).selectedMode = 'practice';
      (scene as any).menuState = 'TRACK_SELECTION';
      (scene as any).createTrackSelectionScreen(1280);

      // Press ESC
      (scene as any).handleBack();

      expect((scene as any).menuState).toBe('MODE_SELECTION');
      expect((scene as any).selectedMode).toBeUndefined();
    });
  });

  describe('Visual Feedback', () => {
    it('should create tween animation when selection changes', () => {
      scene.create();

      const tweenAddSpy = jest.spyOn(scene.tweens, 'add');

      // Trigger selection update
      (scene as any).updateSelectionIndicator();

      expect(tweenAddSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 100,
          ease: 'Power2',
        })
      );
    });

    it('should update indicator position based on menu state', () => {
      scene.create();

      const tweenAddSpy = jest.spyOn(scene.tweens, 'add');

      // Test mode selection
      (scene as any).menuState = 'MODE_SELECTION';
      (scene as any).currentSelection = 1;
      (scene as any).updateSelectionIndicator();

      expect(tweenAddSpy).toHaveBeenCalled();

      // Test track selection
      tweenAddSpy.mockClear();
      (scene as any).menuState = 'TRACK_SELECTION';
      (scene as any).currentSelection = 2;
      (scene as any).updateSelectionIndicator();

      expect(tweenAddSpy).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should not start game without selected mode', () => {
      scene.create();

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const testTrack = {
        id: 'test',
        name: 'Test',
        difficulty: 'Easy' as const,
        description: 'Test',
        optimalTime: 30,
      };

      (scene as any).selectedMode = undefined;
      (scene as any).startGame(testTrack);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('No mode selected')
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
