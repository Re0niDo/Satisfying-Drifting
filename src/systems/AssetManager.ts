/**
 * AssetManager - Centralized asset loading with error handling and placeholder generation
 * 
 * This singleton class manages all game asset loading operations, providing:
 * - Centralized asset queuing via Phaser's LoaderPlugin
 * - Graceful error handling with development placeholders
 * - Asset loading status tracking for debugging
 * - Automatic placeholder creation for missing assets
 * 
 * Usage:
 * ```typescript
 * const assetManager = AssetManager.getInstance();
 * assetManager.queueAsset(this, ImageAssets.CAR_SPRITE);
 * ```
 */

import Phaser from 'phaser';
import type { AssetDefinition, AudioAssetDefinition } from '../types/AssetTypes';
import { isDevEnvironment } from '../utils/env';

export class AssetManager {
    private static instance: AssetManager;
    
    /** Track successfully loaded assets */
    private loadedAssets: Set<string> = new Set();
    
    /** Track failed assets with error details */
    private failedAssets: Map<string, Error> = new Map();
    
    /** Track placeholder textures created */
    private placeholders: Map<string, boolean> = new Map();

    /** Track loader handlers per scene so we can unregister without nuking global listeners */
    private loaderHandlers = new WeakMap<
        Phaser.Scene,
        {
            loadError: (fileObj: Phaser.Loader.File) => void;
            fileComplete: (key: string) => void;
        }
    >();

    /**
     * Private constructor enforces singleton pattern
     */
    private constructor() {
        // Singleton - no direct instantiation
    }

    /**
     * Get singleton instance of AssetManager
     * @returns The singleton AssetManager instance
     */
    public static getInstance(): AssetManager {
        if (!AssetManager.instance) {
            AssetManager.instance = new AssetManager();
        }
        return AssetManager.instance;
    }

    /**
     * Queue a single asset for loading via Phaser's loader
     * Automatically handles errors and creates placeholders for missing assets
     * 
     * @param scene - Scene containing loader instance
     * @param assetDef - Asset definition from AssetConfig
     */
    public queueAsset(scene: Phaser.Scene, assetDef: AssetDefinition): void {
        const { key, path, format } = assetDef;

        try {
            // Determine asset type from format or path
            const assetType = this.determineAssetType(format || path);

            // Queue asset based on type
            switch (assetType) {
                case 'image':
                    scene.load.image(key, path);
                    break;
                case 'audio':
                    {
                        const audioDef = assetDef as AudioAssetDefinition;
                        const urls = Array.isArray(audioDef.urls) ? audioDef.urls.filter(Boolean) : [];
                        const source =
                            urls.length > 1 ? urls : path;
                        // Feed Phaser the full source list when multiple codecs exist; otherwise keep single string for compatibility.
                        scene.load.audio(key, source);
                    }
                    break;
                default:
                    console.warn(`[AssetManager] Unknown asset type for: ${key}`);
                    scene.load.image(key, path); // Default to image
            }

            if (isDevEnvironment()) {
                console.log(`[AssetManager] Queued ${assetType}: ${key} from ${path}`);
            }

        } catch (error) {
            console.error(`[AssetManager] Error queuing asset: ${key}`, error);
            this.failedAssets.set(key, error as Error);
        }
    }

    /**
     * Batch queue multiple assets for loading
     * More efficient than calling queueAsset repeatedly
     * 
     * @param scene - Scene containing loader instance  
     * @param assets - Array of asset definitions
     */
    public queueAssets(scene: Phaser.Scene, assets: AssetDefinition[]): void {
        if (isDevEnvironment()) {
            console.log(`[AssetManager] Queuing ${assets.length} assets...`);
        }

        assets.forEach(asset => this.queueAsset(scene, asset));
    }

    /**
     * Register error handling for asset loading failures
     * Call this in scene.preload() after queuing assets
     * 
     * @param scene - Scene to register error handlers for
     */
    public registerErrorHandlers(scene: Phaser.Scene): void {
        if (this.loaderHandlers.has(scene)) {
            return;
        }

        const loadError = (fileObj: Phaser.Loader.File): void => {
            const key = fileObj.key;
            const url = fileObj.url;
            
            console.warn(`[AssetManager] Failed to load: ${key}`);
            console.warn(`[AssetManager] Attempted path: ${url}`);
            
            this.failedAssets.set(key, new Error(`Asset not found: ${url}`));
            
            // Create placeholder for failed asset so the scene keeps moving even in dev.
            this.createPlaceholder(scene, key, fileObj.type);
        };

        const fileComplete = (key: string): void => {
            this.loadedAssets.add(key);
            
            if (isDevEnvironment()) {
                console.log(`[AssetManager] Loaded: ${key}`);
            }
        };

        scene.load.on('loaderror', loadError);
        scene.load.on('filecomplete', fileComplete);

        this.loaderHandlers.set(scene, { loadError, fileComplete });

        // Handle individual file load errors
        if (isDevEnvironment()) {
            console.log('[AssetManager] Error handlers registered');
        }
    }

    /**
     * Remove previously registered loader handlers so repeated scene inits do not stack listeners.
     * @param scene - Scene to remove handlers from
     */
    public unregisterErrorHandlers(scene: Phaser.Scene): void {
        const handlers = this.loaderHandlers.get(scene);
        if (!handlers) {
            return;
        }

        scene.load.off('loaderror', handlers.loadError);
        scene.load.off('filecomplete', handlers.fileComplete);
        this.loaderHandlers.delete(scene);

        if (isDevEnvironment()) {
            console.log('[AssetManager] Error handlers unregistered');
        }
    }

    /**
     * Create placeholder for failed/missing asset
     * Placeholders are visually distinct (magenta) for easy identification
     * 
     * @param scene - Scene to create placeholder in
     * @param assetKey - Key of failed asset
     * @param assetType - Type ('image', 'audio', etc.)
     */
    private createPlaceholder(
        scene: Phaser.Scene, 
        assetKey: string, 
        assetType: string
    ): void {
        // Prevent duplicate placeholder creation
        if (this.placeholders.has(assetKey)) {
            return;
        }

        switch (assetType) {
            case 'image':
            case 'spritesheet':
                this.createImagePlaceholder(scene, assetKey);
                break;
            case 'audio':
                this.createAudioPlaceholder(scene, assetKey);
                break;
            default:
                console.warn(`[AssetManager] No placeholder for type: ${assetType}`);
        }

        this.placeholders.set(assetKey, true);
    }

    /**
     * Create image placeholder: Magenta rectangle with black border
     * Highly visible to indicate missing asset during development
     * 
     * @param scene - Scene to create texture in
     * @param key - Texture key
     */
    private createImagePlaceholder(scene: Phaser.Scene, key: string): void {
        // Determine size based on key
        let width = 64;
        let height = 64;

        // Track images are larger
        if (key.includes('track')) {
            width = 1280;
            height = 720;
        }

        // Create graphics object (not added to display list)
        const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
        
        // Magenta fill (highly visible)
        graphics.fillStyle(0xFF00FF, 1.0);
        graphics.fillRect(0, 0, width, height);
        
        // Black border
        graphics.lineStyle(2, 0x000000, 1.0);
        graphics.strokeRect(0, 0, width, height);
        
        // Generate texture from graphics
        graphics.generateTexture(key, width, height);
        
        // Clean up graphics object (prevent memory leak)
        graphics.destroy();

        if (isDevEnvironment()) {
            console.log(`[AssetManager] Created placeholder texture: ${key} (${width}x${height})`);
        }
    }

    /**
     * Create audio placeholder: Silent (no actual placeholder needed)
     * Phaser handles missing audio gracefully, just log it
     * 
     * @param _scene - Scene context (unused)
     * @param key - Audio key
     */
    private createAudioPlaceholder(_scene: Phaser.Scene, key: string): void {
        if (isDevEnvironment()) {
            console.log(`[AssetManager] Audio placeholder for: ${key} (will be silent)`);
        }
        // Phaser's audio system handles missing audio gracefully
        // No actual placeholder creation needed
    }

    /**
     * Check if asset loaded successfully
     * @param assetKey - Key to check
     * @returns True if asset loaded, false otherwise
     */
    public isLoaded(assetKey: string): boolean {
        return this.loadedAssets.has(assetKey);
    }

    /**
     * Get list of failed assets for debugging
     * @returns Map of failed asset keys to error objects
     */
    public getFailedAssets(): Map<string, Error> {
        return new Map(this.failedAssets);
    }

    /**
     * Get loading statistics for debugging
     * @returns Object with loading stats
     */
    public getStats(): { loaded: number; failed: number; placeholders: number } {
        return {
            loaded: this.loadedAssets.size,
            failed: this.failedAssets.size,
            placeholders: this.placeholders.size
        };
    }

    /**
     * Clear all tracking data (for scene transitions or resets)
     * Note: This doesn't unload assets from Phaser's cache
     */
    public reset(): void {
        this.loadedAssets.clear();
        this.failedAssets.clear();
        this.placeholders.clear();
        
        if (isDevEnvironment()) {
            console.log('[AssetManager] Reset complete');
        }
    }

    /**
     * Load a track image on-demand (called from MenuScene when track is selected)
     * This prevents loading all 5 tracks during initial PreloadScene (~2.5MB saved)
     * 
     * @param scene - Scene to load track in (typically MenuScene)
     * @param trackAsset - Track asset definition from TrackAssets config
     * @param onComplete - Callback when track finishes loading
     */
    public static loadTrackOnDemand(
        scene: Phaser.Scene,
        trackAsset: AssetDefinition,
        onComplete?: () => void
    ): void {
        const { key, path } = trackAsset;

        // Check if already loaded
        if (scene.textures.exists(key)) {
            if (isDevEnvironment()) {
                console.log(`[AssetManager] Track already loaded: ${key}`);
            }
            if (onComplete) {
                onComplete();
            }
            return;
        }

        if (isDevEnvironment()) {
            console.log(`[AssetManager] Loading track on-demand: ${key}`);
        }

        // Load track image
        scene.load.image(key, path);

        // Set up one-time completion handler
        scene.load.once('complete', () => {
            if (isDevEnvironment()) {
                console.log(`[AssetManager] Track loaded: ${key}`);
            }
            if (onComplete) {
                onComplete();
            }
        });

        // Handle load errors gracefully
        scene.load.once('loaderror', (file: Phaser.Loader.File) => {
            if (file.key === key) {
                console.warn(`[AssetManager] Failed to load track: ${key}, creating placeholder`);
                // Create placeholder for missing track using existing method
                const assetManager = AssetManager.getInstance();
                assetManager.createPlaceholder(scene, key, 'image');
                if (onComplete) {
                    onComplete();
                }
            }
        });

        // Start loading
        scene.load.start();
    }

    /**
     * Determine asset type from format or file extension
     * @param formatOrPath - Format string or file path
     * @returns Asset type ('image', 'audio', etc.)
     */
    private determineAssetType(formatOrPath: string): string {
        const lowerFormat = formatOrPath.toLowerCase();
        
        // Image formats
        if (lowerFormat.includes('png') || lowerFormat.includes('jpg') || 
            lowerFormat.includes('jpeg') || lowerFormat.includes('webp')) {
            return 'image';
        }
        
        // Audio formats
        if (lowerFormat.includes('mp3') || lowerFormat.includes('ogg') || 
            lowerFormat.includes('wav') || lowerFormat.includes('m4a')) {
            return 'audio';
        }
        
        // Default to image
        return 'image';
    }
}
