import Phaser from 'phaser';
import { gameConfig } from './config/GameConfig';

window.addEventListener('load', () => {
  const game = new Phaser.Game(gameConfig);

  // Development helper - expose game instance for debugging
  if (import.meta.env.DEV) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).game = game;
  }
});
