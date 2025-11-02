/**
 * Asset type definitions for the game's asset loading system.
 * These types ensure type-safe asset management across the application.
 */

/**
 * Base asset definition structure
 */
export interface AssetDefinition {
    /** Unique key for referencing this asset */
    key: string;
    /** Path relative to assets directory */
    path: string;
    /** Optional list of alternate source URLs (e.g., ogg + mp3) for loader audio selection */
    urls?: readonly string[];
    /** Optional format specifier (e.g., 'png', 'ogg') */
    format?: string;
    /** Optional fallback path for alternative format */
    fallback?: string;
}

/**
 * Audio-specific asset definition
 */
export interface AudioAssetDefinition extends AssetDefinition {
    /** Array of format URLs (OGG, MP3, M4A) for browser compatibility */
    urls?: string[];
    /** Audio sprite configuration if applicable */
    config?: Record<string, unknown>;
}

/**
 * Image asset definition with optional normal map
 */
export interface ImageAssetDefinition extends AssetDefinition {
    /** Optional normal map texture path */
    normalMap?: string;
}

/**
 * Asset loading status for debugging
 */
export interface AssetLoadStatus {
    key: string;
    loaded: boolean;
    error?: Error;
    timestamp: number;
}
