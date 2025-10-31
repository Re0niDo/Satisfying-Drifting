import Phaser from 'phaser';
import type { PreloadSceneData } from '../types/SceneData';

/**
 * PreloadScene - Loads all game assets
 *
 * This is a placeholder scene for Story 1.2.1.
 * Full implementation will be in Story 1.2.2.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  init(_data: PreloadSceneData): void {
    if (import.meta.env.DEV) {
      console.log('[PreloadScene] Initialized (placeholder)');
    }
  }

  preload(): void {
    if (import.meta.env.DEV) {
      console.log('[PreloadScene] Preload (placeholder)');
    }
  }

  create(): void {
    if (import.meta.env.DEV) {
      console.log('[PreloadScene] Create (placeholder)');
      console.log('[PreloadScene] Successfully transitioned from BootScene!');
    }

    // Display placeholder text
    this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        'PreloadScene\n(Placeholder for Story 1.2.2)',
        {
          fontSize: '32px',
          color: '#ffffff',
          align: 'center',
        }
      )
      .setOrigin(0.5);
  }
}
