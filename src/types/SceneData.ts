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
  // Optional data passed from BootScene
  fastLoad?: boolean; // Skip minimum display time if true
}

/**
 * Data passed to the MenuScene.
 * Contains information about asset loading completion.
 */
export interface MenuSceneData {
  // Data passed to MenuScene after preload
  assetsLoaded: boolean;
}

/**
 * Base interface for all scene data types.
 * Extend this for additional scene data interfaces.
 */
export interface BaseSceneData {
  [key: string]: unknown;
}
