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
import type { AssetDefinition } from '../types/AssetTypes';
import { isDevEnvironment } from '../utils/env';

export class AssetManager {
    private static instance: AssetManager;
    
    /** Track successfully loaded assets */
    private loadedAssets: Set<string> = new Set();
    
    /** Track failed assets with error details */
    private failedAssets: Map<string, Error> = new Map();
    
    /** Track placeholder textures created */
    private placeholders: Map<string, boolean> = new Map();

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
                    scene.load.audio(key, path);
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
        // Handle individual file load errors
        scene.load.on('loaderror', (fileObj: Phaser.Loader.File) => {
            const key = fileObj.key;
            const url = fileObj.url;
            
            console.warn(`[AssetManager] Failed to load: ${key}`);
            console.warn(`[AssetManager] Attempted path: ${url}`);
            
            this.failedAssets.set(key, new Error(`Asset not found: ${url}`));
            
            // Create placeholder for failed asset
            this.createPlaceholder(scene, key, fileObj.type);
        });

        // Track successful loads
        scene.load.on('filecomplete', (key: string) => {
            this.loadedAssets.add(key);
            
            if (isDevEnvironment()) {
                console.log(`[AssetManager] Loaded: ${key}`);
            }
        });

        if (isDevEnvironment()) {
            console.log('[AssetManager] Error handlers registered');
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
        
        console.log(`[AssetManager] Created placeholder texture: ${key} (${width}x${height})`);
    }

    /**
     * Create audio placeholder: Silent (no actual placeholder needed)
     * Phaser handles missing audio gracefully, just log it
     * 
     * @param _scene - Scene context (unused)
     * @param key - Audio key
     */
    private createAudioPlaceholder(_scene: Phaser.Scene, key: string): void {
        console.log(`[AssetManager] Audio placeholder for: ${key} (will be silent)`);
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
