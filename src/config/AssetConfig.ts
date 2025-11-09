/**
 * Centralized asset key constants and path mappings.
 * All asset loading should reference these constants instead of hardcoded strings.
 * 
 * This configuration uses structured AssetDefinition objects for type-safe asset management.
 * Each asset has a unique key and path, with optional format specifiers.
 * 
 * Expected formats:
 * - Images: PNG format, various sizes (sprites: 32x32, tracks: 1280x720)
 * - Audio: MP3 format (OGG preferred for web, MP3 as fallback)
 * - UI Elements: PNG format with transparency
 */

/**
 * Image assets (sprites, particles, UI elements)
 * Placeholder: Colored rectangles if missing (magenta for sprites)
 */
export const ImageAssets = {
    CAR_SPRITE: { 
        key: 'car-sprite', 
        path: 'assets/images/sprites/car.png',
        format: 'png'
    },
    PARTICLE_SMOKE: { 
        key: 'particle-smoke', 
        path: 'assets/images/sprites/smoke.png',
        format: 'png'
    },
    PARTICLE_SPARKLE: { 
        key: 'particle-sparkle', 
        path: 'assets/images/sprites/sparkle.png',
        format: 'png'
    }
} as const;

/**
 * Track background images (1280x720 recommended)
 * Placeholder: Gray rectangle with track name text
 */
export const TrackAssets = {
    TRACK_TUTORIAL: { 
        key: 'track_tutorial', 
        path: 'assets/images/tracks/tutorial.png',
        format: 'png'
    },
    TRACK_SERPENTINE: { 
        key: 'track-serpentine', 
        path: 'assets/images/tracks/serpentine.png',
        format: 'png'
    },
    TRACK_HAIRPIN: { 
        key: 'track-hairpin', 
        path: 'assets/images/tracks/hairpin.png',
        format: 'png'
    },
    TRACK_GAUNTLET: { 
        key: 'track-gauntlet', 
        path: 'assets/images/tracks/gauntlet.png',
        format: 'png'
    },
    TRACK_SANDBOX: { 
        key: 'track-sandbox', 
        path: 'assets/images/tracks/sandbox.png',
        format: 'png'
    }
} as const;

/**
 * UI element assets (buttons, meters, icons)
 * Placeholder: Colored rectangles with appropriate dimensions
 */
export const UIAssets = {
    BUTTON: { 
        key: 'ui-button', 
        path: 'assets/images/ui/button.png',
        format: 'png'
    },
    METER_BAR: { 
        key: 'ui-meter-bar', 
        path: 'assets/images/ui/meter-bar.png',
        format: 'png'
    }
} as const;

/**
 * Audio assets (music and sound effects)
 * Placeholder: Silent audio (no sound played)
 */
export const AudioAssets = {
    music: {
        MENU: { 
            key: 'music-menu', 
            path: 'assets/audio/music/menu.mp3',
            // Keep multiple slots ready so browsers without MP3 support can add an ogg without touching code.
            urls: ['assets/audio/music/menu.mp3'],
            format: 'mp3'
        },
        GAMEPLAY: { 
            key: 'music-gameplay', 
            path: 'assets/audio/music/gameplay.mp3',
            // Same approach as MENU - update urls with ogg once the asset lands.
            urls: ['assets/audio/music/gameplay.mp3'],
            format: 'mp3'
        }
    },
    sfx: {
        TIRE_SCREECH: { 
            key: 'sfx-tire-screech', 
            path: 'assets/audio/sfx/tire-screech.mp3',
            // Allow drop-in ogg alongside the existing MP3 for better coverage.
            urls: ['assets/audio/sfx/tire-screech.mp3'],
            format: 'mp3'
        },
        ENGINE: { 
            key: 'sfx-engine', 
            path: 'assets/audio/sfx/engine.mp3',
            urls: ['assets/audio/sfx/engine.mp3'],
            format: 'mp3'
        },
        UI_CLICK: { 
            key: 'sfx-ui-click', 
            path: 'assets/audio/sfx/ui-click.mp3',
            urls: ['assets/audio/sfx/ui-click.mp3'],
            format: 'mp3'
        },
        PERFECT_DRIFT: { 
            key: 'sfx-perfect-drift', 
            path: 'assets/audio/sfx/perfect-drift.mp3',
            urls: ['assets/audio/sfx/perfect-drift.mp3'],
            format: 'mp3'
        }
    }
} as const;

/**
 * Type helper: Extract image asset keys
 */
export type ImageAssetKey = typeof ImageAssets[keyof typeof ImageAssets]['key'];

/**
 * Type helper: Extract track asset keys
 */
export type TrackAssetKey = typeof TrackAssets[keyof typeof TrackAssets]['key'];

/**
 * Type helper: Extract UI asset keys
 */
export type UIAssetKey = typeof UIAssets[keyof typeof UIAssets]['key'];

/**
 * Type helper: Extract audio asset keys (music)
 */
export type MusicAssetKey = typeof AudioAssets.music[keyof typeof AudioAssets.music]['key'];

/**
 * Type helper: Extract audio asset keys (SFX)
 */
export type SFXAssetKey = typeof AudioAssets.sfx[keyof typeof AudioAssets.sfx]['key'];

/**
 * Type helper: All audio asset keys
 */
export type AudioAssetKey = MusicAssetKey | SFXAssetKey;
