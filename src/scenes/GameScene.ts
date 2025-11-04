import Phaser from 'phaser';
import type { GameSceneData, MenuSceneData } from '../types/SceneData';
import { isDevEnvironment } from '../utils/env';
import { Car } from '../gameObjects/Car';

/**
 * GameScene - Main gameplay scene
 *
 * This scene handles the core gameplay loop. In Phase 1, it displays
 * a placeholder with track and mode information and handles restart
 * and menu navigation. Phase 2 will add full gameplay implementation.
 */
export class GameScene extends Phaser.Scene {
  // Scene data received from MenuScene
  private currentMode!: 'practice' | 'score';
  private currentTrackId!: string;
  private currentTrackName!: string;

  // Game objects
  private car?: Car;

  // Text display objects
  private trackText?: Phaser.GameObjects.Text;
  private modeText?: Phaser.GameObjects.Text;
  private placeholderText?: Phaser.GameObjects.Text;
  private instructionText?: Phaser.GameObjects.Text;
  private fpsText?: Phaser.GameObjects.Text;

  // Scene start time for logging
  private sceneStartTime: number = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  /**
   * Initialize scene with data from MenuScene
   * @param data - Game configuration (mode, trackId, trackName)
   */
  init(data: GameSceneData): void {
    this.sceneStartTime = Date.now();

    // Validate and store scene data
    if (!data || !data.mode || !data.trackId || !data.trackName) {
      console.error('[GameScene] Invalid scene data received:', data);
      // Set defaults to prevent crashes
      this.currentMode = 'practice';
      this.currentTrackId = 'tutorial';
      this.currentTrackName = 'Tutorial Circuit';
    } else {
      this.currentMode = data.mode;
      this.currentTrackId = data.trackId;
      this.currentTrackName = data.trackName;
    }

    if (isDevEnvironment()) {
      console.log('[GameScene] Initialized with data:', {
        mode: this.currentMode,
        trackId: this.currentTrackId,
        trackName: this.currentTrackName,
      });
    }
  }

  /**
   * Create scene display elements and setup input handlers
   */
  create(): void {
    const { width, height } = this.cameras.main;

    // Create placeholder car sprite texture (32x48px red rectangle)
    this.createPlaceholderCarTexture();

    // Create car at center of screen
    this.car = new Car(this, width / 2, height / 2, 'car_placeholder');

    // Expose car in debug mode for manual testing
    if (isDevEnvironment()) {
      (window as any).debugCar = this.car;
    }

    // Display track name (top center)
    this.trackText = this.add
      .text(width / 2, 50, `Track: ${this.currentTrackName}`, {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
      })
      .setOrigin(0.5, 0);

    // Display game mode (below track name)
    this.modeText = this.add
      .text(width / 2, 90, `Mode: ${this.currentMode.toUpperCase()}`, {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
      })
      .setOrigin(0.5, 0);

    // Placeholder message (center)
    this.placeholderText = this.add
      .text(
        width / 2,
        height / 2,
        'GameScene\n(Placeholder - Gameplay Coming in Phase 2)',
        {
          fontSize: '32px',
          color: '#ffffff',
          fontFamily: 'Arial, sans-serif',
          align: 'center',
        }
      )
      .setOrigin(0.5, 0.5);

    // Control instructions (bottom)
    this.instructionText = this.add
      .text(width / 2, height - 50, '[R] Restart  |  [ESC] Back to Menu', {
        fontSize: '18px',
        color: '#aaaaaa',
        fontFamily: 'Arial, sans-serif',
      })
      .setOrigin(0.5, 0);

    // Optional FPS display (dev mode only, top right)
    if (isDevEnvironment()) {
      this.fpsText = this.add
        .text(width - 100, 20, 'FPS: 60', {
          fontSize: '16px',
          color: '#00ff00',
          fontFamily: 'Arial, sans-serif',
        })
        .setOrigin(0, 0);
    }

    // Register keyboard input handlers
    this.setupKeyboardInput();

    if (isDevEnvironment()) {
      const initTime = Date.now() - this.sceneStartTime;
      console.log(`[GameScene] Scene created in ${initTime}ms`);
    }
  }

  /**
   * Create a placeholder car texture (32x48px red rectangle)
   */
  private createPlaceholderCarTexture(): void {
    // Check if texture already exists (e.g., after scene restart)
    if (this.textures.exists('car_placeholder')) {
      return;
    }

    // Create graphics object
    const graphics = this.add.graphics();
    
    // Draw red rectangle
    graphics.fillStyle(0xff0000, 1); // Red color
    graphics.fillRect(0, 0, 32, 48);
    
    // Add white border for visibility
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRect(0, 0, 32, 48);
    
    // Generate texture from graphics
    graphics.generateTexture('car_placeholder', 32, 48);
    
    // Destroy graphics object (texture is now saved)
    graphics.destroy();
  }

  /**
   * Setup keyboard event listeners
   */
  private setupKeyboardInput(): void {
    // Register R key for instant restart
    this.input.keyboard?.on('keydown-R', this.handleRestart, this);

    // Register ESC key for return to menu
    this.input.keyboard?.on('keydown-ESC', this.handleReturnToMenu, this);

    if (isDevEnvironment()) {
      console.log('[GameScene] Keyboard input registered (R = Restart, ESC = Menu)');
    }
  }

  /**
   * Handle R key press - restart with quick fade effect for visual feedback
   */
  private handleRestart(): void {
    if (isDevEnvironment()) {
      console.log('[GameScene] Restart requested');
    }

    // Quick fade out (150ms) for visual feedback
    this.cameras.main.fadeOut(150, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Restart scene with same game data
      this.scene.restart({
        mode: this.currentMode,
        trackId: this.currentTrackId,
        trackName: this.currentTrackName,
      } as GameSceneData);

      // Quick fade in (150ms) after restart
      this.cameras.main.fadeIn(150, 0, 0, 0);
    });
  }

  /**
   * Handle ESC key press - return to MenuScene with fade transition
   */
  private handleReturnToMenu(): void {
    if (isDevEnvironment()) {
      console.log('[GameScene] Returning to MenuScene');
    }

    // Start fade out effect (300ms)
    this.cameras.main.fadeOut(300, 0, 0, 0);

    // Transition to MenuScene when fade completes
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MenuScene', {
        assetsLoaded: true,
      } as MenuSceneData);
    });
  }

  /**
   * Main game loop - currently empty placeholder for Phase 2
   * @param _time - Current timestamp
   * @param _delta - Time elapsed since last frame
   */
  update(_time: number, _delta: number): void {
    // Update car if it exists
    if (this.car) {
      this.car.update(_time, _delta);
    }

    // Empty game loop placeholder
    // Phase 2 will add:
    // - Input polling for car controls
    // - Physics updates
    // - Collision detection
    // - Score/time tracking
    // - Game state management

    // Optional: Update FPS display in dev mode
    if (isDevEnvironment() && this.fpsText) {
      const fps = Math.round(this.game.loop.actualFps);
      this.fpsText.setText(`FPS: ${fps}`);
    }
  }

  /**
   * Clean up scene resources before shutdown
   */
  shutdown(): void {
    if (isDevEnvironment()) {
      console.log('[GameScene] Shutdown initiated');
    }

    // Clean up car
    if (this.car) {
      this.car.destroy();
      this.car = undefined;
    }

    // Clear debug reference
    if (isDevEnvironment()) {
      delete (window as any).debugCar;
    }

    // Remove all keyboard event listeners
    this.input.keyboard?.off('keydown-R', this.handleRestart, this);
    this.input.keyboard?.off('keydown-ESC', this.handleReturnToMenu, this);

    // Clear all active tweens
    this.tweens.killAll();

    // Clear all timers
    this.time.removeAllEvents();

    // Clear stored scene data
    this.currentMode = undefined as unknown as 'practice' | 'score';
    this.currentTrackId = undefined as unknown as string;
    this.currentTrackName = undefined as unknown as string;

    // Clear text object references (Phaser destroys them automatically)
    // Note: We check these exist before clearing to satisfy TypeScript
    if (this.trackText) this.trackText = undefined;
    if (this.modeText) this.modeText = undefined;
    if (this.placeholderText) this.placeholderText = undefined;
    if (this.instructionText) this.instructionText = undefined;
    if (this.fpsText) this.fpsText = undefined;

    if (isDevEnvironment()) {
      console.log('[GameScene] Shutdown complete');
    }
  }
}
