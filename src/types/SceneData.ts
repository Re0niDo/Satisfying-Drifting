/**
 * Type definitions for data passed between scenes in the game.
 * These interfaces ensure type safety when transitioning between scenes.
 */

/**
 * Data passed to the BootScene.
 * BootScene is the first scene and typically doesn't receive data.
 */
export interface BootSceneData {
  // BootScene is the entry point - no data expected
}

/**
 * Data passed to the PreloadScene.
 * Can be extended to pass configuration or state from BootScene.
 */
export interface PreloadSceneData {
  // Optional: Add properties here if BootScene needs to pass data to PreloadScene
  // For example: skipIntro?: boolean;
}

/**
 * Base interface for all scene data types.
 * Extend this for additional scene data interfaces.
 */
export interface BaseSceneData {
  [key: string]: unknown;
}
