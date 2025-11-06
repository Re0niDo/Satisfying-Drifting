import Phaser from 'phaser';
import type { BootSceneData, PreloadSceneData } from '../types/SceneData';
import { isDevEnvironment } from '../utils/env';
import { InputManager } from '../systems/InputManager';

/**
 * BootScene - First scene in the game lifecycle
 *
 * Responsibilities:
 * - System initialization
 * - Load critical assets (< 100KB)
 * - Set up global managers (if needed)
 * - Transition to PreloadScene
 *
 * Performance Target: < 500ms execution time
 * GDD Reference: Scene Management System (Architecture Document)
 */
export class BootScene extends Phaser.Scene {
  private bootStartTime: number = 0;

  constructor() {
    super({ key: 'BootScene' });
  }

  /**
   * Initialize scene-level configurations.
   * Called first in the scene lifecycle.
   *
   * @param _data - Optional data passed from previous scene (none for BootScene)
   */
  init(_data: BootSceneData): void {
    this.bootStartTime = performance.now();

    // Log initialization in development mode
    if (isDevEnvironment()) {
      console.log('[BootScene] Initializing...');
    }

    // Initialize any scene-level configurations here
    // Example: Set up input configurations, physics defaults, etc.
  }

  /**
   * Preload critical assets only (< 100KB total).
   * This should be minimal - defer most loading to PreloadScene.
   *
   * Examples:
   * - Small logo image (< 50KB)
   * - Minimal UI elements needed for loading screen
   */
  preload(): void {
    if (isDevEnvironment()) {
      console.log('[BootScene] Preloading critical assets...');
    }

    // Example: Load a small logo for boot splash
    // Uncomment when asset is available:
    // this.load.image('logo', 'assets/images/logo.png');

    // Set loading progress callbacks for debugging
    if (isDevEnvironment()) {
      this.load.on('progress', (value: number) => {
        console.log(`[BootScene] Loading progress: ${Math.round(value * 100)}%`);
      });

      this.load.on('complete', () => {
        console.log('[BootScene] Asset loading complete');
      });
    }
  }

  /**
   * Create and initialize game systems.
   * Called after preload completes.
   */
  create(): void {
    if (isDevEnvironment()) {
      console.log('[BootScene] Creating scene...');
    }

    // Initialize global managers here and store in registry
    // Example:
    // const audioManager = new AudioManager(this);
    // this.registry.set('audioManager', audioManager);

    // Initialize InputManager singleton and register in scene registry
    const inputManager = InputManager.getInstance(this);
    this.registry.set('inputManager', inputManager);
    
    if (isDevEnvironment()) {
      console.log('[BootScene] InputManager initialized and registered');
    }

    // Optional: Display logo with quick fade effect (configurable)
    const showLogo = false; // Set to true when logo asset is available

    if (showLogo) {
      this.displayBootLogo();
    } else {
      // Immediate transition to PreloadScene
      this.transitionToPreloadScene();
    }
  }

  /**
   * Display optional boot logo with fade effect.
   * Total duration: ~400ms (200ms fade in + 200ms fade out)
   */
  private displayBootLogo(): void {
    // Example implementation when logo is available:
    // const logo = this.add.image(
    //   this.cameras.main.centerX,
    //   this.cameras.main.centerY,
    //   'logo'
    // );
    // logo.setAlpha(0);

    // this.tweens.add({
    //   targets: logo,
    //   alpha: 1,
    //   duration: 200,
    //   ease: 'Power2',
    //   onComplete: () => {
    //     this.time.delayedCall(0, () => {
    //       this.tweens.add({
    //         targets: logo,
    //         alpha: 0,
    //         duration: 200,
    //         ease: 'Power2',
    //         onComplete: () => {
    //           this.transitionToPreloadScene();
    //         },
    //       });
    //     });
    //   },
    // });

    // For now, just transition immediately
    this.transitionToPreloadScene();
  }

  /**
   * Transition to PreloadScene with optional data.
   */
  private transitionToPreloadScene(): void {
    const bootEndTime = performance.now();
    const bootDuration = bootEndTime - this.bootStartTime;

    if (isDevEnvironment()) {
      console.log(`[BootScene] Boot completed in ${bootDuration.toFixed(2)}ms`);

      // Warn if boot time exceeds target
      if (bootDuration > 500) {
        console.warn(
          `[BootScene] Boot time (${bootDuration.toFixed(2)}ms) exceeds target (500ms)`
        );
      }
    }

    // Prepare data to pass to PreloadScene (if any)
    const preloadData: PreloadSceneData = {};

    // Transition to PreloadScene
    this.scene.start('PreloadScene', preloadData);
  }

  /**
   * Clean up when scene is shutdown.
   * Called automatically by Phaser when scene ends.
   *
   * Note: Managers stored in registry persist across scenes,
   * so they should NOT be cleaned up here.
   */
  shutdown(): void {
    if (isDevEnvironment()) {
      console.log('[BootScene] Shutting down...');
    }

    // Clean up any event listeners created in this scene
    // Example:
    // this.events.off('some-event');

    // Remove any temporary timers or tweens
    this.tweens.killAll();
    this.time.removeAllEvents();
  }
}
