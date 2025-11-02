import Phaser from 'phaser';
import type { PreloadSceneData, MenuSceneData } from '../types/SceneData';
import { ImageAssets, UIAssets, AudioAssets } from '../config/AssetConfig';
import { AssetManager } from '../systems/AssetManager';
import { isDevEnvironment } from '../utils/env';

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
  // Reuse loader listeners so shutdown can unregister without wiping shared listeners.
  private readonly handleLoadProgress = (progress: number): void => {
    this.updateProgressBar(progress);
  };
  private readonly handleFileComplete = (key: string): void => {
    this.updateAssetText(key);
  };
  private readonly handleLoadComplete = (): void => {
    if (isDevEnvironment()) {
      console.log('[PreloadScene] All assets loaded');
    }
  };
  private readonly handleLoadError = (file: Phaser.Loader.File): void => {
    if (isDevEnvironment()) {
      console.error(`[PreloadScene] Failed to load: ${file.key}`);
    }
  };

  constructor() {
    super({ key: 'PreloadScene' });
  }

  init(data: PreloadSceneData): void {
    this.sceneData = data || {};
    this.loadStartTime = Date.now();

    if (isDevEnvironment()) {
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

    if (isDevEnvironment()) {
      console.log('[PreloadScene] Loading assets...');
    }
  }

  create(): void {
    const loadTime = Date.now() - this.loadStartTime;
    const minimumDisplayTime = 500; // 500ms minimum display
    const remainingTime = Math.max(0, minimumDisplayTime - loadTime);

    if (isDevEnvironment()) {
      console.log(`[PreloadScene] Assets loaded in ${loadTime}ms`);
    }

    // Wait for minimum display time before transitioning
    this.time.delayedCall(remainingTime, () => {
      this.transitionToMenuScene();
    });
  }

  shutdown(): void {
    // Remove all load event listeners
    this.load.off('progress', this.handleLoadProgress);
    this.load.off('progress');
    this.load.off('complete', this.handleLoadComplete);
    this.load.off('complete');
    this.load.off('filecomplete', this.handleFileComplete);
    this.load.off('filecomplete');
    this.load.off('loaderror', this.handleLoadError);
    this.load.off('loaderror');

    // Clear any pending timers
    this.time.removeAllEvents();

    // Clear any active tweens
    this.tweens.killAll();

    // Unhook AssetManager listeners so they do not accumulate across reloads.
    AssetManager.getInstance().unregisterErrorHandlers(this);

    if (isDevEnvironment()) {
      console.log('[PreloadScene] Shutdown complete');
    }
  }

  private createProgressBar(width: number, height: number): void {
    const barWidth = 400;
    const barHeight = 30;
    const barX = (width - barWidth) / 2;
    const barY = height / 2 + 50;

    // Create title text
    this.add
      .text(width / 2, barY - 100, 'SATISFYING DRIFTING', {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Create loading text (static label)
    this.add
      .text(width / 2, barY - 50, 'Loading...', {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Arial',
      })
      .setOrigin(0.5);

    // Create progress bar background (outline)
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

    // Create asset loading text (will be updated with categories)
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
    this.load.on('progress', this.handleLoadProgress);

    // File complete event - fires when individual file loads
    this.load.on('filecomplete', this.handleFileComplete);

    // Complete event - fires when all assets loaded
    this.load.on('complete', this.handleLoadComplete);

    // Error event - fires if asset fails to load
    // Note: AssetManager also handles errors and creates placeholders
    this.load.on('loaderror', this.handleLoadError);
  }

  private loadAssets(): void {
    // Get AssetManager instance
    const assetManager = AssetManager.getInstance();
    
    // Register error handlers for placeholder generation
    assetManager.registerErrorHandlers(this);
    
    // Progressive loading strategy: Critical -> UI -> Audio
    // Track images loaded on-demand when selected in MenuScene
    this.queueCriticalAssets(assetManager);
    this.queueUIAssets(assetManager);
    this.queueAudioAssets(assetManager);

    if (isDevEnvironment()) {
      console.log('[PreloadScene] Progressive loading strategy initiated');
    }
  }

  /**
   * Queue critical assets needed for any scene (< 100KB total)
   * These load first to minimize time-to-interactive
   */
  private queueCriticalAssets(assetManager: AssetManager): void {
    assetManager.queueAssets(this, [
      ImageAssets.PARTICLE_SMOKE,    // 8x8 texture ~1KB
      ImageAssets.PARTICLE_SPARKLE,  // 8x8 texture ~1KB
      ImageAssets.CAR_SPRITE,        // 32x32 texture ~2KB
    ]);

    if (isDevEnvironment()) {
      console.log('[PreloadScene] Critical assets queued');
    }
  }

  /**
   * Queue UI assets (buttons, meters, icons)
   * These load second to enable menu interaction
   */
  private queueUIAssets(assetManager: AssetManager): void {
    assetManager.queueAssets(this, [
      UIAssets.BUTTON,
      UIAssets.METER_BAR
    ]);

    if (isDevEnvironment()) {
      console.log('[PreloadScene] UI assets queued');
    }
  }

  /**
   * Queue audio assets (music and SFX)
   * These load last as they can play while user navigates menu
   */
  private queueAudioAssets(assetManager: AssetManager): void {
    // Queue SFX
    assetManager.queueAssets(this, [
      AudioAssets.sfx.TIRE_SCREECH,
      AudioAssets.sfx.ENGINE,
      AudioAssets.sfx.UI_CLICK,
      AudioAssets.sfx.PERFECT_DRIFT
    ]);

    // Queue Music
    assetManager.queueAssets(this, [
      AudioAssets.music.MENU,
      AudioAssets.music.GAMEPLAY
    ]);

    if (isDevEnvironment()) {
      console.log('[PreloadScene] Audio assets queued');
    }
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
    this.progressBar.fillStyle(0xffffff, 1);
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
    // Categorize the asset being loaded for better user feedback
    let category = 'asset';
    
    if (key.includes('music') || key.includes('sfx') || key.includes('audio')) {
      category = 'audio';
    } else if (key.includes('particle') || key.includes('car') || key.includes('sprite')) {
      category = 'graphics';
    } else if (key.includes('ui') || key.includes('button') || key.includes('meter')) {
      category = 'interface';
    } else if (key.includes('track')) {
      category = 'track';
    }

    // Display current asset category being loaded
    this.assetText.setText(`Loading ${category}...`);

    if (isDevEnvironment()) {
      console.log(`[PreloadScene] Loaded: ${key} (${category})`);
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

      if (isDevEnvironment()) {
        console.log('[PreloadScene] Transitioning to MenuScene');
      }

      // Note: MenuScene will be implemented in Story 1.2.3
      // For now, this will fail gracefully as MenuScene doesn't exist yet
      this.scene.start('MenuScene', menuData);
    });
  }
}

