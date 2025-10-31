import Phaser from 'phaser';
import type { PreloadSceneData, MenuSceneData } from '../types/SceneData';
import { AssetKeys, AssetPaths } from '../config/AssetConfig';

/**
 * PreloadScene - Loads all game assets with visual progress feedback
 *
 * This scene loads all game assets (images, audio, data) with a visual progress
 * indicator. It executes after BootScene and prepares all resources needed for gameplay.
 */
export class PreloadScene extends Phaser.Scene {
  private loadStartTime: number = 0;
  private sceneData: PreloadSceneData = {};
  
  // UI elements that need to be updated during loading
  private progressBar!: Phaser.GameObjects.Graphics;
  private percentageText!: Phaser.GameObjects.Text;
  private assetText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'PreloadScene' });
  }

  init(data: PreloadSceneData): void {
    this.sceneData = data || {};
    this.loadStartTime = Date.now();

    if (import.meta.env.DEV) {
      console.log('[PreloadScene] Initialized', this.sceneData);
    }
  }

  preload(): void {
    const { width, height } = this.cameras.main;

    // Create progress bar visuals
    this.createProgressBar(width, height);

    // Register load event listeners
    this.registerLoadEvents();

    // Load all game assets
    this.loadAssets();

    if (import.meta.env.DEV) {
      console.log('[PreloadScene] Loading assets...');
    }
  }

  create(): void {
    const loadTime = Date.now() - this.loadStartTime;
    const minimumDisplayTime = 500; // 500ms minimum display
    const remainingTime = Math.max(0, minimumDisplayTime - loadTime);

    if (import.meta.env.DEV) {
      console.log(`[PreloadScene] Assets loaded in ${loadTime}ms`);
    }

    // Wait for minimum display time before transitioning
    this.time.delayedCall(remainingTime, () => {
      this.transitionToMenuScene();
    });
  }

  shutdown(): void {
    // Remove all load event listeners
    this.load.off('progress');
    this.load.off('complete');
    this.load.off('filecomplete');
    this.load.off('loaderror');

    // Clear any pending timers
    this.time.removeAllEvents();

    // Clear any active tweens
    this.tweens.killAll();

    if (import.meta.env.DEV) {
      console.log('[PreloadScene] Shutdown complete');
    }
  }

  private createProgressBar(width: number, height: number): void {
    const barWidth = 400;
    const barHeight = 30;
    const barX = (width - barWidth) / 2;
    const barY = height / 2 + 50;

    // Create loading text (static, no updates needed)
    this.add
      .text(width / 2, barY - 50, 'Loading...', {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Arial',
      })
      .setOrigin(0.5);

    // Create progress bar background (outline) - static, no updates needed
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(barX, barY, barWidth, barHeight);
    progressBox.lineStyle(2, 0xffffff, 1);
    progressBox.strokeRect(barX, barY, barWidth, barHeight);

    // Create progress bar fill (will be updated)
    this.progressBar = this.add.graphics();

    // Create percentage text (will be updated)
    this.percentageText = this.add
      .text(width / 2, barY + 50, '0%', {
        fontSize: '18px',
        color: '#ffffff',
        fontFamily: 'Arial',
      })
      .setOrigin(0.5);

    // Create asset loading text (will be updated)
    this.assetText = this.add
      .text(width / 2, barY + 80, '', {
        fontSize: '14px',
        color: '#aaaaaa',
        fontFamily: 'Arial',
      })
      .setOrigin(0.5);
  }

  private registerLoadEvents(): void {
    // Progress event - fires when overall progress updates
    this.load.on('progress', (progress: number) => {
      this.updateProgressBar(progress);
    });

    // File complete event - fires when individual file loads
    this.load.on(
      'filecomplete',
      (key: string, _type: string, _data: unknown) => {
        this.updateAssetText(key);
      }
    );

    // Complete event - fires when all assets loaded
    this.load.on('complete', () => {
      if (import.meta.env.DEV) {
        console.log('[PreloadScene] All assets loaded');
      }
    });

    // Error event - fires if asset fails to load
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      if (import.meta.env.DEV) {
        console.error(`[PreloadScene] Failed to load: ${file.key}`);
      }
    });
  }

  private loadAssets(): void {
    // Load all images - sprites
    this.load.image(AssetKeys.CAR, AssetPaths[AssetKeys.CAR]);
    this.load.image(AssetKeys.PARTICLE, AssetPaths[AssetKeys.PARTICLE]);

    // Load all images - tracks
    this.load.image(
      AssetKeys.TRACK_TUTORIAL,
      AssetPaths[AssetKeys.TRACK_TUTORIAL]
    );
    this.load.image(
      AssetKeys.TRACK_SERPENTINE,
      AssetPaths[AssetKeys.TRACK_SERPENTINE]
    );
    this.load.image(
      AssetKeys.TRACK_HAIRPIN,
      AssetPaths[AssetKeys.TRACK_HAIRPIN]
    );
    this.load.image(
      AssetKeys.TRACK_GAUNTLET,
      AssetPaths[AssetKeys.TRACK_GAUNTLET]
    );
    this.load.image(
      AssetKeys.TRACK_SANDBOX,
      AssetPaths[AssetKeys.TRACK_SANDBOX]
    );

    // Load all images - UI
    this.load.image(AssetKeys.BUTTON, AssetPaths[AssetKeys.BUTTON]);
    this.load.image(AssetKeys.METER_BAR, AssetPaths[AssetKeys.METER_BAR]);

    // Load all audio - SFX
    this.load.audio(
      AssetKeys.SFX_TIRE_SCREECH,
      AssetPaths[AssetKeys.SFX_TIRE_SCREECH]
    );
    this.load.audio(AssetKeys.SFX_ENGINE, AssetPaths[AssetKeys.SFX_ENGINE]);
    this.load.audio(
      AssetKeys.SFX_UI_CLICK,
      AssetPaths[AssetKeys.SFX_UI_CLICK]
    );
    this.load.audio(
      AssetKeys.SFX_PERFECT_DRIFT,
      AssetPaths[AssetKeys.SFX_PERFECT_DRIFT]
    );

    // Load all audio - Music
    this.load.audio(AssetKeys.MUSIC_MENU, AssetPaths[AssetKeys.MUSIC_MENU]);
    this.load.audio(
      AssetKeys.MUSIC_GAMEPLAY,
      AssetPaths[AssetKeys.MUSIC_GAMEPLAY]
    );
  }

  private updateProgressBar(progress: number): void {
    const { width, height } = this.cameras.main;
    const barWidth = 400;
    const barHeight = 30;
    const barX = (width - barWidth) / 2;
    const barY = height / 2 + 50;
    const fillPadding = 4;

    // Clear and redraw progress bar
    this.progressBar.clear();
    this.progressBar.fillStyle(0x00ff00, 1);
    this.progressBar.fillRect(
      barX + fillPadding,
      barY + fillPadding,
      (barWidth - fillPadding * 2) * progress,
      barHeight - fillPadding * 2
    );

    // Update percentage text
    const percentage = Math.round(progress * 100);
    this.percentageText.setText(`${percentage}%`);
  }

  private updateAssetText(key: string): void {
    // Display current asset being loaded
    const displayKey = key || 'Loading...';
    this.assetText.setText(displayKey);

    if (import.meta.env.DEV) {
      console.log(`[PreloadScene] Loaded: ${displayKey}`);
    }
  }

  private transitionToMenuScene(): void {
    // Create fade-out effect
    this.cameras.main.fadeOut(500, 0, 0, 0);

    // Wait for fade to complete, then start MenuScene
    this.cameras.main.once('camerafadeoutcomplete', () => {
      const menuData: MenuSceneData = {
        assetsLoaded: true,
      };

      if (import.meta.env.DEV) {
        console.log('[PreloadScene] Transitioning to MenuScene');
      }

      // Note: MenuScene will be implemented in Story 1.2.3
      // For now, this will fail gracefully as MenuScene doesn't exist yet
      this.scene.start('MenuScene', menuData);
    });
  }
}
