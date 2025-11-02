import Phaser from 'phaser';
import type {
  MenuSceneData,
  GameSceneData,
  TrackInfo,
} from '../types/SceneData';
import { AudioAssets } from '../config/AssetConfig';
import { isDevEnvironment } from '../utils/env';

/**
 * MenuScene - Main menu for game mode and track selection
 *
 * This scene provides a keyboard-navigable interface for selecting game modes
 * (Practice/Score) and tracks. It maintains 60 FPS performance and provides
 * clear visual feedback for all interactions.
 */

// Track data constant
const TRACKS: TrackInfo[] = [
  {
    id: 'tutorial',
    name: 'Tutorial Circuit',
    difficulty: 'Easy',
    description: 'Learn the basics',
    optimalTime: 30,
  },
  {
    id: 'serpentine',
    name: 'Serpentine Run',
    difficulty: 'Medium',
    description: 'Link your drifts',
    optimalTime: 35,
  },
  {
    id: 'hairpin',
    name: 'Hairpin Challenge',
    difficulty: 'Hard',
    description: 'Master tight turns',
    optimalTime: 40,
  },
  {
    id: 'gauntlet',
    name: 'The Gauntlet',
    difficulty: 'Expert',
    description: 'Speed and precision',
    optimalTime: 45,
  },
  {
    id: 'sandbox',
    name: 'Sandbox Arena',
    difficulty: 'Sandbox',
    description: 'Free practice',
    optimalTime: 0, // No time limit
  },
];

// Menu state type
type MenuState = 'MODE_SELECTION' | 'TRACK_SELECTION';

export class MenuScene extends Phaser.Scene {
  private sceneData: MenuSceneData = { assetsLoaded: false };
  private menuState: MenuState = 'MODE_SELECTION';
  private currentSelection: number = 0;
  private selectedMode: 'practice' | 'score' | undefined;

  // UI elements
  private menuMusic?: Phaser.Sound.BaseSound;
  private selectionIndicator?: Phaser.GameObjects.Rectangle;
  private modeTexts: Phaser.GameObjects.Text[] = [];
  private trackTexts: Phaser.GameObjects.Text[] = [];
  private titleText?: Phaser.GameObjects.Text;
  private instructionText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MenuScene' });
  }

  init(data: MenuSceneData): void {
    this.sceneData = data || { assetsLoaded: false };
    this.menuState = 'MODE_SELECTION';
    this.currentSelection = 0;
    this.selectedMode = undefined;

    if (isDevEnvironment()) {
      console.log('[MenuScene] Initialized', this.sceneData);
    }
  }

  create(): void {
    const { width } = this.cameras.main;

    // Start menu music if available
    if (this.cache.audio.exists(AudioAssets.music.MENU.key)) {
      this.menuMusic = this.sound.add(AudioAssets.music.MENU.key, {
        volume: 0.5,
        loop: true,
      });
      this.menuMusic.play();

      if (isDevEnvironment()) {
        console.log('[MenuScene] Menu music started');
      }
    }

    // Create mode selection screen
    this.createModeSelectionScreen(width);

    // Set up keyboard input
    this.setupKeyboardInput();

    if (isDevEnvironment()) {
      console.log('[MenuScene] Created - Mode Selection');
    }
  }

  shutdown(): void {
    // Stop and destroy menu music
    if (this.menuMusic) {
      this.menuMusic.stop();
      this.menuMusic.destroy();
      this.menuMusic = undefined;
    }

    // Remove all keyboard event listeners
    this.input.keyboard?.removeAllListeners();

    // Clear any active tweens
    this.tweens.killAll();

    // Clear selection state
    this.selectedMode = undefined;
    this.currentSelection = 0;
    this.menuState = 'MODE_SELECTION';

    if (isDevEnvironment()) {
      console.log('[MenuScene] Shutdown complete');
    }
  }

  private createModeSelectionScreen(width: number): void {
    // Game Title
    this.titleText = this.add
      .text(width / 2, 150, 'SATISFYING DRIFTING', {
        fontSize: '48px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Mode Selection Buttons
    const modes: Array<{ text: string; mode: 'practice' | 'score' }> = [
      { text: 'Practice Mode', mode: 'practice' },
      { text: 'Score Mode', mode: 'score' },
    ];

    const startY = 300;
    const buttonHeight = 50;
    const buttonSpacing = 10;

    this.modeTexts = modes.map((modeInfo, index) => {
      const y = startY + index * (buttonHeight + buttonSpacing);

      const text = this.add
        .text(width / 2, y, modeInfo.text, {
          fontSize: '24px',
          color: '#ffffff',
          fontFamily: 'Arial',
        })
        .setOrigin(0.5);

      return text;
    });

    // Create selection indicator with white border and no fill
    const firstButtonY = startY;
    this.selectionIndicator = this.add.rectangle(
      width / 2,
      firstButtonY,
      300,
      buttonHeight,
      0x000000,
      0
    );
    this.selectionIndicator.setStrokeStyle(2, 0xffffff);

    // Instructions
    this.instructionText = this.add
      .text(
        width / 2,
        500,
        'Use ↑↓ Arrow Keys, or W/S, or 1/2, then ENTER',
        {
          fontSize: '18px',
          color: '#888888',
          fontFamily: 'Arial',
        }
      )
      .setOrigin(0.5);
  }

  private createTrackSelectionScreen(width: number): void {
    // Clear mode selection UI
    this.titleText?.destroy();
    this.modeTexts.forEach((text) => text.destroy());
    this.instructionText?.destroy();
    this.selectionIndicator?.destroy();
    this.modeTexts = [];

    // Track Selection Title
    const modeText =
      this.selectedMode === 'practice' ? 'PRACTICE MODE' : 'SCORE MODE';
    this.titleText = this.add
      .text(width / 2, 100, `${modeText} - Select Track`, {
        fontSize: '36px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Track List
    const startY = 200;
    const itemHeight = 60;
    const itemSpacing = 10;

    this.trackTexts = TRACKS.map((track, index) => {
      const y = startY + index * (itemHeight + itemSpacing);

      const timeText =
        track.optimalTime > 0 ? `${track.optimalTime}s` : 'Free';
      const displayText = `[${index + 1}] ${track.name} (${track.difficulty}) - ${timeText}`;

      const text = this.add
        .text(width / 2, y, displayText, {
          fontSize: '20px',
          color: '#ffffff',
          fontFamily: 'Arial',
        })
        .setOrigin(0.5);

      return text;
    });

    // Create selection indicator for track selection with white border and no fill
    const firstTrackY = startY;
    this.selectionIndicator = this.add.rectangle(
      width / 2,
      firstTrackY,
      600,
      itemHeight,
      0x000000,
      0
    );
    this.selectionIndicator.setStrokeStyle(2, 0xffffff);

    // Back instruction
    this.instructionText = this.add
      .text(width / 2, 600, '[ESC] Back to mode selection', {
        fontSize: '18px',
        color: '#888888',
        fontFamily: 'Arial',
      })
      .setOrigin(0.5);

    // Reset selection to first track
    this.currentSelection = 0;
  }

  private setupKeyboardInput(): void {
    // Arrow keys and WASD for navigation
    this.input.keyboard?.on('keydown-UP', () => this.moveSelection(-1));
    this.input.keyboard?.on('keydown-DOWN', () => this.moveSelection(1));
    this.input.keyboard?.on('keydown-W', () => this.moveSelection(-1));
    this.input.keyboard?.on('keydown-S', () => this.moveSelection(1));

    // Enter and Space for confirmation
    this.input.keyboard?.on('keydown-ENTER', () => this.confirmSelection());
    this.input.keyboard?.on('keydown-SPACE', () => this.confirmSelection());

    // ESC for back navigation
    this.input.keyboard?.on('keydown-ESC', () => this.handleBack());

    // Number key shortcuts
    this.input.keyboard?.on('keydown-ONE', () => this.selectByNumber(0));
    this.input.keyboard?.on('keydown-TWO', () => this.selectByNumber(1));
    this.input.keyboard?.on('keydown-THREE', () => this.selectByNumber(2));
    this.input.keyboard?.on('keydown-FOUR', () => this.selectByNumber(3));
    this.input.keyboard?.on('keydown-FIVE', () => this.selectByNumber(4));
  }

  private moveSelection(delta: number): void {
    const maxSelection =
      this.menuState === 'MODE_SELECTION' ? 1 : TRACKS.length - 1;

    // Update selection with wrapping
    this.currentSelection =
      (this.currentSelection + delta + maxSelection + 1) % (maxSelection + 1);

    // Update visual indicator
    this.updateSelectionIndicator();

    if (isDevEnvironment()) {
      console.log(
        `[MenuScene] Selection moved to: ${this.currentSelection}`
      );
    }
  }

  private selectByNumber(index: number): void {
    if (this.menuState === 'MODE_SELECTION') {
      // Mode selection: 0 = Practice, 1 = Score
      if (index <= 1) {
        this.currentSelection = index;
        this.updateSelectionIndicator();
        // Auto-confirm when using number shortcuts
        this.confirmSelection();
      }
    } else {
      // Track selection: 0-4
      if (index < TRACKS.length) {
        this.currentSelection = index;
        this.updateSelectionIndicator();
        // Auto-confirm when using number shortcuts
        this.confirmSelection();
      }
    }
  }

  private confirmSelection(): void {
    if (this.menuState === 'MODE_SELECTION') {
      // Store selected mode
      this.selectedMode = this.currentSelection === 0 ? 'practice' : 'score';

      if (isDevEnvironment()) {
        console.log(`[MenuScene] Mode selected: ${this.selectedMode}`);
      }

      // Transition to track selection
      this.menuState = 'TRACK_SELECTION';
      const { width } = this.cameras.main;
      this.createTrackSelectionScreen(width);
    } else {
      // Start game with selected track
      const selectedTrack = TRACKS[this.currentSelection];

      if (isDevEnvironment()) {
        console.log(
          `[MenuScene] Track selected: ${selectedTrack.name}`
        );
      }

      this.startGame(selectedTrack);
    }
  }

  private handleBack(): void {
    if (this.menuState === 'TRACK_SELECTION') {
      // Return to mode selection
      this.menuState = 'MODE_SELECTION';
      this.currentSelection = 0;
      this.selectedMode = undefined;

      const { width } = this.cameras.main;

      // Clear track selection UI
      this.titleText?.destroy();
      this.trackTexts.forEach((text) => text.destroy());
      this.instructionText?.destroy();
      this.selectionIndicator?.destroy();
      this.trackTexts = [];

      // Recreate mode selection screen
      this.createModeSelectionScreen(width);

      if (isDevEnvironment()) {
        console.log('[MenuScene] Returned to mode selection');
      }
    }
  }

  private updateSelectionIndicator(): void {
    if (!this.selectionIndicator) return;

    let targetY: number;

    if (this.menuState === 'MODE_SELECTION') {
      const startY = 300;
      const buttonHeight = 50;
      const buttonSpacing = 10;
      targetY = startY + this.currentSelection * (buttonHeight + buttonSpacing);
    } else {
      const startY = 200;
      const itemHeight = 60;
      const itemSpacing = 10;
      targetY = startY + this.currentSelection * (itemHeight + itemSpacing);
    }

    // Smooth tween to new position
    this.tweens.add({
      targets: this.selectionIndicator,
      y: targetY,
      duration: 100,
      ease: 'Power2',
    });
  }

  private startGame(selectedTrack: TrackInfo): void {
    if (!this.selectedMode) {
      console.error('[MenuScene] No mode selected');
      return;
    }

    const gameData: GameSceneData = {
      mode: this.selectedMode,
      trackId: selectedTrack.id,
      trackName: selectedTrack.name,
    };

    if (isDevEnvironment()) {
      console.log('[MenuScene] Starting game with data:', gameData);
    }

    // Fade out effect
    this.cameras.main.fadeOut(500, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Note: GameScene will be implemented in a future story
      // This will show an error temporarily until GameScene exists
      this.scene.start('GameScene', gameData);
    });
  }
}
